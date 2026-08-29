"use client";

import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

import type { SpacecraftConfig } from "@/data/spacecraft";
import type { SelectedObject } from "@/engine/camera/types";
import { sceneRegistry } from "@/engine/registry/SceneRegistry";
import { DistanceFadedLabel } from "../DistanceFadedLabel";

interface SpacecraftProps {
    config: SpacecraftConfig;
    onSelect?: (object: SelectedObject) => void;
    onFocus?: (object: SelectedObject) => void;
}

// Module-level reused Vectors for trajectory calculation
const dirVec = new THREE.Vector3();

export function Spacecraft({ config, onSelect, onFocus }: SpacecraftProps) {
    const groupRef = useRef<THREE.Group>(null);
    const [hovered, setHovered] = useState(false);

    const {
        id,
        name,
        modelScale,
        initialPosition,
        direction,
        speed,
        label,
        registryName,
    } = config;

    // Normalize direction vector once
    const directionVector = useMemo(() => {
        return new THREE.Vector3(...direction).normalize();
    }, [direction]);

    // Register with SceneRegistry on mount
    useEffect(() => {
        const spacecraftObject = groupRef.current;
        if (!spacecraftObject) return;

        // Set initial position
        spacecraftObject.position.set(...initialPosition);

        // Orient spacecraft body along flight direction
        const lookTarget = new THREE.Vector3(...initialPosition).add(
            directionVector
        );
        spacecraftObject.lookAt(lookTarget);

        sceneRegistry.registerObject(registryName, spacecraftObject);
        return () => {
            sceneRegistry.unregisterObject(registryName, spacecraftObject);
        };
    }, [registryName, initialPosition, directionVector]);

    // Frame update for delta-time outbound trajectory movement
    useFrame((_, delta) => {
        if (!groupRef.current) return;
        dirVec.copy(directionVector);
        groupRef.current.position.addScaledVector(dirVec, speed * delta);
    });

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
            onSelect?.({
                id,
                name,
                type: "spacecraft",
            });
        },
        [id, name, onSelect]
    );

    const handleDoubleClick = useCallback(
        (e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation();
            onFocus?.({
                id,
                name,
                type: "spacecraft",
            });
        },
        [id, name, onFocus]
    );

    // Subtle scale response on hover
    const scaleFactor = (hovered ? 1.2 : 1.0) * modelScale;

    // Trajectory path line: 30 units behind to 10 units ahead
    const trailLine = useMemo(() => {
        const points = [
            directionVector.clone().multiplyScalar(-30),
            directionVector.clone().multiplyScalar(10),
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineDashedMaterial({
            color: "#60a5fa",
            dashSize: 1.5,
            gapSize: 1.0,
            transparent: true,
            opacity: 0.25,
            depthWrite: false,
        });
        const line = new THREE.Line(geometry, material);
        line.computeLineDistances();
        return line;
    }, [directionVector]);

    useEffect(() => {
        return () => {
            trailLine.geometry.dispose();
            trailLine.material.dispose();
        };
    }, [trailLine]);

    return (
        <group ref={groupRef}>
            {/* Trajectory Trail (subtle dashed/faded flight path) */}
            <primitive object={trailLine} />

            {/* Stylized 3D Spacecraft Model */}
            <group
                scale={scaleFactor}
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
                onClick={handleClick}
                onDoubleClick={handleDoubleClick}
            >
                {/* Main Instrument / Electronics Bus (Hexagonal / Golden-Aluminum Foil) */}
                <mesh position={[0, 0, 0]}>
                    <cylinderGeometry args={[0.55, 0.55, 0.45, 10]} />
                    <meshStandardMaterial
                        color="#d4af37" // gold foil
                        metalness={0.85}
                        roughness={0.25}
                        emissive={hovered ? "#ffe066" : "#000000"}
                        emissiveIntensity={hovered ? 0.35 : 0}
                    />
                </mesh>

                {/* Golden Record (Mounted on the side of the bus) */}
                <mesh position={[0.56, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.22, 0.22, 0.02, 32]} />
                    <meshStandardMaterial
                        color="#ffd700"
                        metalness={0.95}
                        roughness={0.15}
                        emissive={hovered ? "#fff275" : "#443300"}
                        emissiveIntensity={0.2}
                    />
                </mesh>

                {/* High-Gain Antenna (HGA) Parabolic Dish */}
                <group position={[0, 0.35, 0]} rotation={[0, 0, 0]}>
                    {/* Main Dish */}
                    <mesh rotation={[Math.PI, 0, 0]}>
                        <cylinderGeometry
                            args={[1.1, 0.2, 0.25, 32, 1, true]}
                        />
                        <meshStandardMaterial
                            color="#f8fafc"
                            metalness={0.2}
                            roughness={0.4}
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                    {/* Inner Center Dome */}
                    <mesh position={[0, -0.1, 0]}>
                        <sphereGeometry args={[0.22, 16, 16]} />
                        <meshStandardMaterial
                            color="#e2e8f0"
                            metalness={0.5}
                            roughness={0.3}
                        />
                    </mesh>
                    {/* Subreflector Feed Horn (Tripod tip) */}
                    <mesh position={[0, -0.45, 0]}>
                        <cylinderGeometry args={[0.06, 0.02, 0.25, 8]} />
                        <meshStandardMaterial
                            color="#334155"
                            metalness={0.7}
                            roughness={0.4}
                        />
                    </mesh>
                </group>

                {/* Magnetometer Boom (Long thin boom extending outward) */}
                <mesh
                    position={[-1.6, -0.1, 0]}
                    rotation={[0, 0, Math.PI / 2]}
                >
                    <cylinderGeometry args={[0.02, 0.02, 2.6, 6]} />
                    <meshStandardMaterial color="#64748b" metalness={0.7} />
                </mesh>
                {/* MAG sensor canister at the tip */}
                <mesh position={[-2.9, -0.1, 0]}>
                    <boxGeometry args={[0.12, 0.12, 0.12]} />
                    <meshStandardMaterial color="#cbd5e1" metalness={0.8} />
                </mesh>

                {/* RTG Power Boom (Opposite boom with 3 radioisotope canisters) */}
                <group
                    position={[1.1, -0.15, 0]}
                    rotation={[0, 0, -Math.PI / 6]}
                >
                    <mesh position={[0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[0.025, 0.025, 1.2, 6]} />
                        <meshStandardMaterial color="#475569" metalness={0.8} />
                    </mesh>
                    {/* 3 RTG Cylinders */}
                    <mesh position={[0.7, 0, 0]}>
                        <cylinderGeometry args={[0.1, 0.1, 0.35, 12]} />
                        <meshStandardMaterial color="#334155" metalness={0.9} />
                    </mesh>
                    <mesh position={[1.0, 0, 0]}>
                        <cylinderGeometry args={[0.1, 0.1, 0.35, 12]} />
                        <meshStandardMaterial color="#334155" metalness={0.9} />
                    </mesh>
                </group>

                {/* Science Scan Platform Boom */}
                <group position={[0, -0.4, 0.6]}>
                    <mesh
                        position={[0, 0, 0.3]}
                        rotation={[Math.PI / 4, 0, 0]}
                    >
                        <cylinderGeometry args={[0.02, 0.02, 0.7, 6]} />
                        <meshStandardMaterial color="#64748b" metalness={0.7} />
                    </mesh>
                    {/* Camera / Spectrometer sensors */}
                    <mesh position={[0, 0.15, 0.6]}>
                        <boxGeometry args={[0.25, 0.18, 0.25]} />
                        <meshStandardMaterial color="#1e293b" metalness={0.8} />
                    </mesh>
                </group>
            </group>

            {/* Spacecraft Label (lightweight Drei Html) */}
            <DistanceFadedLabel
                targetName={name}
                position={[0, 0.9, 0]}
                distanceFactor={12}
            >
                <span
                    style={{
                        color: "#93c5fd",
                        fontSize: "12px",
                        fontFamily: "Inter, system-ui, sans-serif",
                        fontWeight: 600,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        opacity: 0.9,
                        textShadow: "0 0 8px rgba(0,0,0,0.95)",
                        userSelect: "none",
                        whiteSpace: "nowrap",
                    }}
                >
                    {label}
                </span>
            </DistanceFadedLabel>
        </group>
    );
}
