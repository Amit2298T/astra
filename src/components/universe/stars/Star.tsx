"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

import type { StarConfig } from "@/data/starSystems";
import type { SelectedObject } from "@/engine/camera/types";
import { sceneRegistry } from "@/engine/registry/SceneRegistry";
import { DistanceFadedLabel } from "../DistanceFadedLabel";

interface StarProps {
    config: StarConfig;
    showLabel?: boolean;
    registerNavigationTarget?: boolean;
    onSelect?: (object: SelectedObject) => void;
    onFocus?: (object: SelectedObject) => void;
}

export function Star({
    config,
    showLabel = true,
    registerNavigationTarget = true,
    onSelect,
    onFocus,
}: StarProps) {
    const groupRef = useRef<THREE.Group>(null);
    const glowRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    const {
        id,
        name,
        visualRadius,
        coreColor,
        glowColor,
        outerGlowColor,
        registryName,
        relativePosition,
    } = config;

    // Register with SceneRegistry on mount
    useEffect(() => {
        if (!registerNavigationTarget) return;

        const starObject = groupRef.current;
        if (!starObject) return;

        sceneRegistry.registerObject(registryName, starObject);
        return () => {
            sceneRegistry.unregisterObject(registryName, starObject);
        };
    }, [registryName, registerNavigationTarget]);

    // Corona pulsation
    useFrame(({ clock }) => {
        if (glowRef.current) {
            const s = 1 + Math.sin(clock.getElapsedTime() * 2.0 + visualRadius) * 0.04;
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
                id,
                name,
                type: "star",
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
                type: "star",
            });
        },
        [id, name, onFocus]
    );

    const scaleFactor = hovered ? 1.1 : 1.0;

    return (
        <group ref={groupRef} position={relativePosition}>
            {/* Core Star Sphere */}
            <mesh
                scale={scaleFactor}
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
                onClick={handleClick}
                onDoubleClick={handleDoubleClick}
            >
                <sphereGeometry args={[visualRadius, 48, 48]} />
                <meshStandardMaterial
                    color={coreColor}
                    emissive={glowColor}
                    emissiveIntensity={hovered ? 3.0 : 2.2}
                    roughness={0.2}
                    metalness={0.1}
                    toneMapped={false}
                />
            </mesh>

            {/* Inner Corona Halo */}
            <mesh ref={glowRef}>
                <sphereGeometry args={[visualRadius * 1.32, 32, 32]} />
                <meshBasicMaterial
                    color={glowColor}
                    transparent
                    opacity={hovered ? 0.32 : 0.22}
                    side={THREE.BackSide}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    toneMapped={false}
                />
            </mesh>

            {/* Outer Soft Stellar Glow */}
            <mesh>
                <sphereGeometry args={[visualRadius * 1.85, 32, 32]} />
                <meshBasicMaterial
                    color={outerGlowColor}
                    transparent
                    opacity={0.08}
                    side={THREE.BackSide}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    toneMapped={false}
                />
            </mesh>

            {/* Star Label */}
            {showLabel && (
                <DistanceFadedLabel
                    targetName={name}
                    position={[0, visualRadius + 0.55, 0]}
                    distanceFactor={14}
                >
                    <span
                        style={{
                            color: coreColor,
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
                        {name}
                    </span>
                </DistanceFadedLabel>
            )}
        </group>
    );
}
