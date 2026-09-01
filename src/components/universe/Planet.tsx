"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

import type { PlanetConfig, MoonConfig } from "@/data/solarSystem";
import type { SelectedObject } from "@/engine/camera/types";
import { solarSystemData } from "@/data/solarSystem";
import { SaturnRings } from "./SaturnRings";
import { sceneRegistry } from "@/engine/registry/SceneRegistry";
import { DistanceFadedLabel } from "./DistanceFadedLabel";
import {
    advanceAngle,
    getOrbitalAngularVelocity,
    getRotationAngularVelocity,
    getTidallyLockedRotationY,
} from "@/engine/astronomy/OrbitalMotion";

// ─── Moon sub-component (orbits its parent group, not the Sun) ───────────

interface MoonProps {
    config: MoonConfig;
    onSelect?: (object: SelectedObject) => void;
    onFocus?: (object: SelectedObject) => void;
}

function Moon({ config, onSelect, onFocus }: MoonProps) {
    const orbitingRef = useRef<THREE.Group>(null);
    const meshRef = useRef<THREE.Mesh>(null);
    const orbitAngleRef = useRef(config.initialAngle);
    const [hovered, setHovered] = useState(false);
    const orbitalAngularVelocity = getOrbitalAngularVelocity(
        config.orbitalPeriodDays
    );

    const [moonMap] = useTexture([config.texturePath]);

    useEffect(() => {
        const moonObject = orbitingRef.current;
        if (!moonObject) return;
        sceneRegistry.registerObject(config.name, moonObject);
        return () => sceneRegistry.unregisterObject(config.name, moonObject);
    }, [config.name]);

    useFrame((_, delta) => {
        const orbiting = orbitingRef.current;
        const mesh = meshRef.current;
        if (!orbiting || !mesh) return;
        const angle = advanceAngle(
            orbitAngleRef.current,
            orbitalAngularVelocity,
            delta
        );
        orbitAngleRef.current = angle;
        orbiting.position.x = Math.cos(angle) * config.orbitRadius;
        orbiting.position.z = Math.sin(angle) * config.orbitRadius;
        mesh.rotation.y = getTidallyLockedRotationY(angle);
    });

    const selection: SelectedObject = {
        id: "moon",
        name: config.name,
        type: "moon",
    };

    return (
        <group rotation-x={THREE.MathUtils.degToRad(config.inclinationDeg)}>
            <group ref={orbitingRef}>
                <mesh
                    ref={meshRef}
                    scale={hovered ? 1.12 : 1}
                    onPointerOver={(event) => {
                        event.stopPropagation();
                        setHovered(true);
                        document.body.style.cursor = "pointer";
                    }}
                    onPointerOut={() => {
                        setHovered(false);
                        document.body.style.cursor = "auto";
                    }}
                    onClick={(event) => {
                        event.stopPropagation();
                        onSelect?.(selection);
                    }}
                    onDoubleClick={(event) => {
                        event.stopPropagation();
                        onFocus?.(selection);
                    }}
                >
                    <sphereGeometry args={[config.radius, 32, 32]} />
                    <meshStandardMaterial
                        map={moonMap}
                        metalness={0.05}
                        roughness={0.85}
                        emissive={hovered ? "#334455" : "#000000"}
                        emissiveIntensity={hovered ? 0.25 : 0}
                    />
                </mesh>
                <DistanceFadedLabel
                    targetName={config.name}
                    position={[0, config.radius + 0.2, 0]}
                    distanceFactor={10}
                >
                    <span
                        style={{
                            color: "#e5e7eb",
                            fontSize: "10px",
                            fontFamily: "Inter, system-ui, sans-serif",
                            fontWeight: 600,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            textShadow: "0 0 6px rgba(0,0,0,0.95)",
                            userSelect: "none",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {config.name}
                    </span>
                </DistanceFadedLabel>
            </group>
        </group>
    );
}

// ─── Reusable Planet component ───────────────────────────────────────────

interface PlanetProps {
    config: PlanetConfig;
    onSelect?: (name: string) => void;
    onFocus?: (name: string) => void;
    onSelectMoon?: (object: SelectedObject) => void;
    onFocusMoon?: (object: SelectedObject) => void;
}

export function Planet({
    config,
    onSelect,
    onFocus,
    onSelectMoon,
    onFocusMoon,
}: PlanetProps) {
    const groupRef = useRef<THREE.Group>(null);
    const meshRef = useRef<THREE.Mesh>(null);
    const orbitAngleRef = useRef(config.initialAngle);
    const rotationAngleRef = useRef(0);
    const [hovered, setHovered] = useState(false);

    const {
        name,
        radius,
        orbitRadius,
        orbitalPeriodDays,
        rotationPeriodHours,
        texturePath,
        axialTiltDeg,
        hasRings,
        ringTexturePath,
        ringInnerRadius,
        ringOuterRadius,
    } = config;

    const [map] = useTexture([texturePath]);
    const orbitalAngularVelocity =
        getOrbitalAngularVelocity(orbitalPeriodDays);
    const rotationAngularVelocity =
        getRotationAngularVelocity(rotationPeriodHours);

    // Register planet object in sceneRegistry for camera targeting
    useEffect(() => {
        const planetObject = groupRef.current;
        if (!planetObject) return;

        sceneRegistry.registerObject(name, planetObject);
        return () => {
            sceneRegistry.unregisterObject(name, planetObject);
        };
    }, [name]);

    // Moons for this planet
    const moons = solarSystemData.moons[name] ?? [];

    // Orbital + axial rotation in a single useFrame
    useFrame((_, delta) => {
        if (!groupRef.current || !meshRef.current) return;
        const orbitAngle = advanceAngle(
            orbitAngleRef.current,
            orbitalAngularVelocity,
            delta
        );
        orbitAngleRef.current = orbitAngle;

        // Orbit around the Sun
        groupRef.current.position.x = Math.cos(orbitAngle) * orbitRadius;
        groupRef.current.position.z = Math.sin(orbitAngle) * orbitRadius;

        // Axial self-rotation
        rotationAngleRef.current = advanceAngle(
            rotationAngleRef.current,
            rotationAngularVelocity,
            delta
        );
        meshRef.current.rotation.y = rotationAngleRef.current;
    });

    const tiltRad = THREE.MathUtils.degToRad(axialTiltDeg);
    // Earth uses a Z tilt so its local-Y longitude spin is presented side-on
    // from ASTRA's established focus approach. Other planet orientations stay
    // unchanged, including Saturn's equatorial ring group.
    const tiltRotation: [number, number, number] =
        name === "Earth" ? [0, 0, tiltRad] : [tiltRad, 0, 0];

    const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
    }, []);

    const handlePointerOut = useCallback(() => {
        setHovered(false);
        document.body.style.cursor = "auto";
    }, []);

    const handleClick = useCallback(
        (e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation();
            onSelect?.(name);
        },
        [name, onSelect]
    );

    const handleDoubleClick = useCallback(
        (e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation();
            onFocus?.(name);
        },
        [name, onFocus]
    );

    // Subtle scale bump on hover
    const scale = hovered ? 1.12 : 1;

    return (
        <group ref={groupRef}>
            {/* Tilt wrapper */}
            <group rotation={tiltRotation}>
                <mesh
                    ref={meshRef}
                    scale={scale}
                    onPointerOver={handlePointerOver}
                    onPointerOut={handlePointerOut}
                    onClick={handleClick}
                    onDoubleClick={handleDoubleClick}
                >
                    <sphereGeometry args={[radius, 64, 64]} />
                    <meshStandardMaterial
                        map={map}
                        metalness={0.1}
                        roughness={0.7}
                        emissive={hovered ? "#334455" : "#000000"}
                        emissiveIntensity={hovered ? 0.4 : 0}
                    />
                </mesh>

                {/* Saturn rings */}
                {hasRings && ringTexturePath && ringInnerRadius && ringOuterRadius && (
                    <SaturnRings
                        innerRadius={radius * ringInnerRadius}
                        outerRadius={radius * ringOuterRadius}
                        texturePath={ringTexturePath}
                    />
                )}
            </group>

            {/* Label */}
            <DistanceFadedLabel
                targetName={name}
                position={[0, radius + 0.4, 0]}
                distanceFactor={12}
            >
                <span
                    style={{
                        color: "white",
                        fontSize: "12px",
                        fontFamily: "Inter, system-ui, sans-serif",
                        fontWeight: 500,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        opacity: 0.85,
                        textShadow: "0 0 6px rgba(0,0,0,0.9)",
                        userSelect: "none",
                        whiteSpace: "nowrap",
                    }}
                >
                    {name}
                </span>
            </DistanceFadedLabel>

            {/* Moons (placed inside the planet's group so they orbit the planet) */}
            {moons.map((moon) => (
                <Moon
                    key={moon.name}
                    config={moon}
                    onSelect={onSelectMoon}
                    onFocus={onFocusMoon}
                />
            ))}
        </group>
    );
}
