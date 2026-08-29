"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { solarSystemData } from "@/data/solarSystem";
import { sceneRegistry } from "@/engine/registry/SceneRegistry";
import type { SelectedObject } from "@/engine/camera/types";

interface SunProps {
    onSelect?: (object: SelectedObject) => void;
    onFocus?: (object: SelectedObject) => void;
}

export function Sun({ onSelect, onFocus }: SunProps) {
    const groupRef = useRef<THREE.Group>(null);
    const glowRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    // Register Sun in SceneRegistry for navigation reference
    useEffect(() => {
        const sunObject = groupRef.current;
        if (!sunObject) return;

        sceneRegistry.registerObject("Sun", sunObject);
        return () => {
            sceneRegistry.unregisterObject("Sun", sunObject);
        };
    }, []);

    // Subtle pulsing on the halo
    useFrame(({ clock }) => {
        if (glowRef.current) {
            const s = 1 + Math.sin(clock.getElapsedTime() * 1.5) * 0.04;
            glowRef.current.scale.setScalar(s);
        }
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
                id: "sun",
                name: "Sun",
                type: "star",
            });
        },
        [onSelect]
    );

    const handleDoubleClick = useCallback(
        (e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation();
            onFocus?.({
                id: "sun",
                name: "Sun",
                type: "star",
            });
        },
        [onFocus]
    );

    const { radius } = solarSystemData.sun;
    const scale = hovered ? 1.05 : 1.0;

    return (
        <group ref={groupRef}>
            {/* Point light so the Sun illuminates Earth */}
            <pointLight
                position={[0, 0, 0]}
                intensity={80}
                distance={200}
                color="#fff5e0"
                decay={2}
            />

            {/* Core Sun sphere */}
            <mesh
                scale={scale}
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
                onClick={handleClick}
                onDoubleClick={handleDoubleClick}
            >
                <sphereGeometry args={[radius, 64, 64]} />
                <meshStandardMaterial
                    color="#fff5c0"
                    emissive="#ffb347"
                    emissiveIntensity={hovered ? 3.0 : 2.5}
                    toneMapped={false}
                />
            </mesh>

            {/* Halo glow — a slightly larger transparent additive sphere */}
            <mesh ref={glowRef}>
                <sphereGeometry args={[radius * 1.35, 32, 32]} />
                <meshBasicMaterial
                    color="#ff9933"
                    transparent
                    opacity={hovered ? 0.25 : 0.18}
                    side={THREE.BackSide}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    toneMapped={false}
                />
            </mesh>

            {/* Outer soft glow */}
            <mesh>
                <sphereGeometry args={[radius * 1.8, 32, 32]} />
                <meshBasicMaterial
                    color="#ff6600"
                    transparent
                    opacity={0.06}
                    side={THREE.BackSide}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    toneMapped={false}
                />
            </mesh>
        </group>
    );
}
