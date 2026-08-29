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

// ─── Moon sub-component (orbits its parent group, not the Sun) ───────────

interface MoonProps {
    config: MoonConfig;
}

function Moon({ config }: MoonProps) {
    const ref = useRef<THREE.Mesh>(null);

    const [moonMap] = useTexture([config.texturePath]);

    useFrame(({ clock }) => {
        if (!ref.current) return;
        const t = clock.getElapsedTime();
        const angle = config.initialAngle + t * config.orbitSpeed;
        ref.current.position.x = Math.cos(angle) * config.orbitRadius;
        ref.current.position.z = Math.sin(angle) * config.orbitRadius;
        ref.current.rotation.y += config.rotationSpeed * 0.01;
    });

    return (
        <mesh ref={ref}>
            <sphereGeometry args={[config.radius, 32, 32]} />
            <meshStandardMaterial
                map={moonMap}
                metalness={0.05}
                roughness={0.85}
            />
        </mesh>
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
    const [hovered, setHovered] = useState(false);

    const {
        name,
        radius,
        orbitRadius,
        orbitSpeed,
        rotationSpeed,
        texturePath,
        initialAngle,
        axialTilt,
        hasRings,
        ringTexturePath,
        ringInnerRadius,
        ringOuterRadius,
    } = config;

    const [map] = useTexture([texturePath]);

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
    useFrame(({ clock }) => {
        if (!groupRef.current || !meshRef.current) return;
        const t = clock.getElapsedTime();
        const angle = initialAngle + t * orbitSpeed;

        // Orbit around the Sun
        groupRef.current.position.x = Math.cos(angle) * orbitRadius;
        groupRef.current.position.z = Math.sin(angle) * orbitRadius;

        // Axial self-rotation
        meshRef.current.rotation.y += rotationSpeed * 0.01;
    });

    const tiltRad = axialTilt ? THREE.MathUtils.degToRad(axialTilt) : 0;

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
            <group rotation={[tiltRad, 0, 0]}>
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
