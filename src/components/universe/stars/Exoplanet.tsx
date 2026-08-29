"use client";

import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

import type { ExoplanetConfig } from "@/data/starSystems";
import type { SelectedObject } from "@/engine/camera/types";
import { sceneRegistry } from "@/engine/registry/SceneRegistry";
import { DistanceFadedLabel } from "../DistanceFadedLabel";

interface ExoplanetProps {
    config: ExoplanetConfig;
    parentOffset?: [number, number, number];
    showLabel?: boolean;
    registerNavigationTarget?: boolean;
    onSelect?: (object: SelectedObject) => void;
    onFocus?: (object: SelectedObject) => void;
}

export function Exoplanet({
    config,
    parentOffset = [0, 0, 0],
    showLabel = true,
    registerNavigationTarget = true,
    onSelect,
    onFocus,
}: ExoplanetProps) {
    const groupRef = useRef<THREE.Group>(null);
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    const {
        id,
        name,
        radius,
        orbitRadius,
        orbitSpeed,
        rotationSpeed,
        color,
        initialAngle,
        registryName,
    } = config;

    // Register exoplanet in sceneRegistry for camera targeting
    useEffect(() => {
        if (!registerNavigationTarget) return;

        const exoplanetObject = groupRef.current;
        if (!exoplanetObject) return;

        sceneRegistry.registerObject(registryName, exoplanetObject);
        return () => {
            sceneRegistry.unregisterObject(registryName, exoplanetObject);
        };
    }, [registryName, registerNavigationTarget]);

    // Orbit motion around parent star
    useFrame(({ clock }) => {
        if (!groupRef.current || !meshRef.current) return;
        const t = clock.getElapsedTime();
        const angle = initialAngle + t * orbitSpeed;

        groupRef.current.position.x =
            parentOffset[0] + Math.cos(angle) * orbitRadius;
        groupRef.current.position.y = parentOffset[1];
        groupRef.current.position.z =
            parentOffset[2] + Math.sin(angle) * orbitRadius;

        // Axial self-rotation
        meshRef.current.rotation.y += rotationSpeed * 0.01;
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
                type: "exoplanet",
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
                type: "exoplanet",
            });
        },
        [id, name, onFocus]
    );

    const orbitRing = useMemo(() => {
        const segments = 64;
        const points: THREE.Vector3[] = [];
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            points.push(
                new THREE.Vector3(
                    parentOffset[0] + Math.cos(theta) * orbitRadius,
                    parentOffset[1],
                    parentOffset[2] + Math.sin(theta) * orbitRadius
                )
            );
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: "#94a3b8",
            transparent: true,
            opacity: 0.2,
            depthWrite: false,
        });
        return new THREE.Line(geometry, material);
    }, [orbitRadius, parentOffset]);

    useEffect(() => {
        return () => {
            orbitRing.geometry.dispose();
            orbitRing.material.dispose();
        };
    }, [orbitRing]);

    const scale = hovered ? 1.15 : 1.0;

    return (
        <>
            {/* Orbit Path Ring */}
            <primitive object={orbitRing} />

            {/* Orbiting Exoplanet Group */}
            <group ref={groupRef}>
                <mesh
                    ref={meshRef}
                    scale={scale}
                    onPointerOver={handlePointerOver}
                    onPointerOut={handlePointerOut}
                    onClick={handleClick}
                    onDoubleClick={handleDoubleClick}
                >
                    <sphereGeometry args={[radius, 32, 32]} />
                    <meshStandardMaterial
                        color={color}
                        roughness={0.75}
                        metalness={0.1}
                        emissive={hovered ? "#475569" : "#000000"}
                        emissiveIntensity={hovered ? 0.4 : 0}
                    />
                </mesh>

                {/* Exoplanet Label */}
                {showLabel && (
                    <DistanceFadedLabel
                        targetName={name}
                        position={[0, radius + 0.35, 0]}
                        distanceFactor={12}
                    >
                        <span
                            style={{
                                color: "#cbd5e1",
                                fontSize: "11px",
                                fontFamily: "Inter, system-ui, sans-serif",
                                fontWeight: 500,
                                letterSpacing: "0.05em",
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
                )}
            </group>
        </>
    );
}
