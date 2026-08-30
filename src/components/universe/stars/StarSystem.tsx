"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

import type { StarSystemConfig } from "@/data/starSystems";
import type { SelectedObject } from "@/engine/camera/types";
import { Star } from "./Star";
import { Exoplanet } from "./Exoplanet";
import { sceneRegistry } from "@/engine/registry/SceneRegistry";
import { useSceneLayerOpacity } from "../scale/FadingSceneGroup";

interface StarSystemProps {
    config: StarSystemConfig;
    onSelect?: (object: SelectedObject) => void;
    onFocus?: (object: SelectedObject) => void;
}

// Module-level reused vector for LOD distance checks
const tempSystemPos = new THREE.Vector3();

export function StarSystem({ config, onSelect, onFocus }: StarSystemProps) {
    const systemGroupRef = useRef<THREE.Group>(null);
    const binaryBarycenterRef = useRef<THREE.Group>(null);
    const starAAnchorRef = useRef<THREE.Group>(null);
    const starBAnchorRef = useRef<THREE.Group>(null);
    const proximaAnchorRef = useRef<THREE.Group>(null);
    const proximaBAnchorRef = useRef<THREE.Group>(null);
    const [isNear, setIsNear] = useState(false);
    const { camera } = useThree();
    const layerOpacity = useSceneLayerOpacity();

    const { position, label, distanceLightYears, stars, exoplanets } = config;

    const starA = stars.find((star) => star.id === "alpha-centauri-a");
    const starB = stars.find((star) => star.id === "alpha-centauri-b");
    const proxima = stars.find((star) => star.id === "proxima-centauri");
    const proximaB = exoplanets.find(
        (planet) => planet.id === "proxima-centauri-b"
    );

    // Binary orbital animation around barycenter for Alpha Centauri A & B
    useFrame(({ clock }) => {
        if (binaryBarycenterRef.current) {
            // Simplified slow educational binary orbit
            const t = clock.getElapsedTime();
            const binaryAngle = t * 0.04;
            binaryBarycenterRef.current.rotation.y = binaryAngle;
        }

        if (proximaBAnchorRef.current && proxima && proximaB) {
            const t = clock.getElapsedTime();
            const orbitAngle =
                proximaB.initialAngle + t * proximaB.orbitSpeed;
            proximaBAnchorRef.current.position.set(
                proxima.relativePosition[0] +
                    Math.cos(orbitAngle) * proximaB.orbitRadius,
                proxima.relativePosition[1],
                proxima.relativePosition[2] +
                    Math.sin(orbitAngle) * proximaB.orbitRadius
            );
        }

        if (systemGroupRef.current) {
            systemGroupRef.current.getWorldPosition(tempSystemPos);
            const distToCam = camera.position.distanceTo(tempSystemPos);

            // LOD threshold: 140 scene units
            const near = distToCam < 140;
            if (near !== isNear) {
                setIsNear(near);
            }
        }
    });

    // Navigation anchors remain mounted and registered independently of visual LOD.
    useEffect(() => {
        const registrations: Array<{
            name: string;
            object: THREE.Object3D;
        }> = [];

        const registerAnchor = (
            name: string | undefined,
            object: THREE.Object3D | null
        ) => {
            if (!name || !object) return;
            sceneRegistry.registerObject(name, object);
            registrations.push({ name, object });
        };

        registerAnchor(starA?.registryName, starAAnchorRef.current);
        registerAnchor(starB?.registryName, starBAnchorRef.current);
        registerAnchor(proxima?.registryName, proximaAnchorRef.current);
        registerAnchor(proximaB?.registryName, proximaBAnchorRef.current);

        return () => {
            registrations.forEach(({ name, object }) => {
                sceneRegistry.unregisterObject(name, object);
            });
        };
    }, [starA, starB, proxima, proximaB]);

    return (
        <group ref={systemGroupRef} position={position}>
            {/* Binary Pair Sub-System (Alpha Centauri A & B orbiting barycenter) */}
            <group ref={binaryBarycenterRef}>
                {starA && (
                    <group
                        ref={starAAnchorRef}
                        position={starA.relativePosition}
                    />
                )}
                {starB && (
                    <group
                        ref={starBAnchorRef}
                        position={starB.relativePosition}
                    />
                )}
                {starA && (
                    <Star
                        config={starA}
                        showLabel={isNear}
                        registerNavigationTarget={false}
                        onSelect={onSelect}
                        onFocus={onFocus}
                    />
                )}
                {starB && (
                    <Star
                        config={starB}
                        showLabel={isNear}
                        registerNavigationTarget={false}
                        onSelect={onSelect}
                        onFocus={onFocus}
                    />
                )}
            </group>

            {/* Proxima Centauri (Visually separated red dwarf) */}
            {proxima && (
                <>
                    <group
                        ref={proximaAnchorRef}
                        position={proxima.relativePosition}
                    />
                    <Star
                        config={proxima}
                        showLabel={isNear}
                        registerNavigationTarget={false}
                        onSelect={onSelect}
                        onFocus={onFocus}
                    />
                </>
            )}

            {/* Proxima Centauri b (Exoplanet orbiting Proxima Centauri) */}
            {proxima && proximaB && (
                <>
                    <group
                        ref={proximaBAnchorRef}
                        position={[
                            proxima.relativePosition[0] +
                                Math.cos(proximaB.initialAngle) *
                                    proximaB.orbitRadius,
                            proxima.relativePosition[1],
                            proxima.relativePosition[2] +
                                Math.sin(proximaB.initialAngle) *
                                    proximaB.orbitRadius,
                        ]}
                    />
                    <Exoplanet
                        config={proximaB}
                        parentOffset={proxima.relativePosition}
                        showLabel={isNear}
                        registerNavigationTarget={false}
                        onSelect={onSelect}
                        onFocus={onFocus}
                    />
                </>
            )}

            {/* Distant Scale Cue / LOD System Beacon (visible only when far away) */}
            {!isNear && (
                <>
                    {/* Subtle distant beacon star point */}
                    <mesh position={[0, 0, 0]}>
                        <sphereGeometry args={[2.5, 16, 16]} />
                        <meshBasicMaterial
                            color="#ffe082"
                            transparent
                            opacity={0.8}
                            toneMapped={false}
                        />
                    </mesh>

                    <Html
                        position={[0, 4.0, 0]}
                        center
                        distanceFactor={60}
                        style={{ pointerEvents: "none" }}
                    >
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                pointerEvents: "none",
                                userSelect: "none",
                                opacity: layerOpacity,
                            }}
                        >
                            <span
                                style={{
                                    color: "#ffd54f",
                                    fontSize: "13px",
                                    fontFamily: "Inter, system-ui, sans-serif",
                                    fontWeight: 700,
                                    letterSpacing: "0.08em",
                                    textTransform: "uppercase",
                                    textShadow: "0 0 10px rgba(0,0,0,0.95)",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                ✦ {label}
                            </span>
                            <span
                                style={{
                                    color: "rgba(255, 255, 255, 0.65)",
                                    fontSize: "10px",
                                    fontFamily: "Inter, system-ui, sans-serif",
                                    letterSpacing: "0.05em",
                                    marginTop: 2,
                                    textShadow: "0 0 6px rgba(0,0,0,0.9)",
                                }}
                            >
                                {distanceLightYears}
                            </span>
                        </div>
                    </Html>
                </>
            )}
        </group>
    );
}
