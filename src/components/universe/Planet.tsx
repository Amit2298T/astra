"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

import type { PlanetConfig, MoonConfig } from "@/data/solarSystem";
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
}

function Moon({ config }: MoonProps) {
    const ref = useRef<THREE.Mesh>(null);
    const orbitAngleRef = useRef(config.initialAngle);
    const orbitalAngularVelocity = getOrbitalAngularVelocity(
        config.orbitalPeriodDays
    );

    const [moonMap] = useTexture([config.texturePath]);

    useFrame((_, delta) => {
        if (!ref.current) return;
        const angle = advanceAngle(
            orbitAngleRef.current,
            orbitalAngularVelocity,
            delta
        );
        orbitAngleRef.current = angle;
        ref.current.position.x = Math.cos(angle) * config.orbitRadius;
        ref.current.position.z = Math.sin(angle) * config.orbitRadius;
        ref.current.rotation.y = getTidallyLockedRotationY(angle);
    });

    return (
        <group rotation-x={THREE.MathUtils.degToRad(config.inclinationDeg)}>
            <mesh ref={ref}>
                <sphereGeometry args={[config.radius, 32, 32]} />
                <meshStandardMaterial
                    map={moonMap}
                    metalness={0.05}
                    roughness={0.85}
                />
            </mesh>
        </group>
    );
}

// ─── Reusable Planet component ───────────────────────────────────────────

interface PlanetProps {
    config: PlanetConfig;
    onSelect?: (name: string) => void;
    onFocus?: (name: string) => void;
}

export function Planet({ config, onSelect, onFocus }: PlanetProps) {
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
                <Moon key={moon.name} config={moon} />
            ))}
        </group>
    );
}
