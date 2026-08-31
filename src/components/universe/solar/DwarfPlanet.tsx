"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type ThreeEvent, useFrame } from "@react-three/fiber";
import * as THREE from "three";

import type { DwarfPlanetConfig } from "@/data/dwarfPlanets";
import type { SelectedObject } from "@/engine/camera/types";
import { sceneRegistry } from "@/engine/registry/SceneRegistry";
import { DistanceFadedLabel } from "../DistanceFadedLabel";

interface DwarfPlanetProps {
    config: DwarfPlanetConfig;
    onSelect?: (object: SelectedObject) => void;
    onFocus?: (object: SelectedObject) => void;
}

export function DwarfPlanet({
    config,
    onSelect,
    onFocus,
}: DwarfPlanetProps) {
    const orbitingGroupRef = useRef<THREE.Group>(null);
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);
    const inclination = THREE.MathUtils.degToRad(config.inclination);
    const ascendingNode = THREE.MathUtils.degToRad(
        config.longitudeOfAscendingNode
    );
    const axialTilt = THREE.MathUtils.degToRad(config.axialTilt);
    const semiMinorAxis =
        config.orbitRadius * Math.sqrt(1 - config.eccentricity ** 2);

    useEffect(() => {
        const dwarfPlanetObject = orbitingGroupRef.current;
        if (!dwarfPlanetObject) return;

        sceneRegistry.registerObject(config.name, dwarfPlanetObject);
        return () => {
            sceneRegistry.unregisterObject(config.name, dwarfPlanetObject);
        };
    }, [config.name]);

    useFrame(({ clock }, delta) => {
        const orbitingGroup = orbitingGroupRef.current;
        const mesh = meshRef.current;
        if (!orbitingGroup || !mesh) return;

        const angle =
            config.initialAngle + clock.getElapsedTime() * config.orbitSpeed;
        orbitingGroup.position.x =
            (Math.cos(angle) - config.eccentricity) * config.orbitRadius;
        orbitingGroup.position.z = Math.sin(angle) * semiMinorAxis;
        // Preserve the established visual rate while making it frame independent.
        mesh.rotation.y += config.rotationSpeed * delta * 0.6;
    });

    const handlePointerOver = useCallback((event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
    }, []);

    const handlePointerOut = useCallback(() => {
        setHovered(false);
        document.body.style.cursor = "auto";
    }, []);

    const selection = useMemo<SelectedObject>(
        () => ({
            id: config.id,
            name: config.name,
            type: "dwarfPlanet",
        }),
        [config.id, config.name]
    );

    const handleClick = useCallback(
        (event: ThreeEvent<MouseEvent>) => {
            event.stopPropagation();
            onSelect?.(selection);
        },
        [onSelect, selection]
    );

    const handleDoubleClick = useCallback(
        (event: ThreeEvent<MouseEvent>) => {
            event.stopPropagation();
            onFocus?.(selection);
        },
        [onFocus, selection]
    );

    return (
        <group rotation-y={ascendingNode}>
            <group rotation-x={inclination}>
                <group ref={orbitingGroupRef}>
                    <group rotation-x={axialTilt}>
                        <mesh
                            ref={meshRef}
                            scale={config.shapeScale}
                            onPointerOver={handlePointerOver}
                            onPointerOut={handlePointerOut}
                            onClick={handleClick}
                            onDoubleClick={handleDoubleClick}
                        >
                            <sphereGeometry args={[config.visualRadius, 36, 28]} />
                            <meshStandardMaterial
                                color={config.color}
                                roughness={config.roughness}
                                metalness={0.04}
                                emissive={hovered ? config.color : "#000000"}
                                emissiveIntensity={hovered ? 0.34 : 0}
                            />
                        </mesh>
                    </group>

                    <DistanceFadedLabel
                        targetName={config.name}
                        position={[0, config.visualRadius + 0.42, 0]}
                        distanceFactor={12}
                    >
                        <span
                            style={{
                                color: "#d8dee7",
                                fontSize: "11px",
                                fontFamily: "Inter, system-ui, sans-serif",
                                fontWeight: 550,
                                letterSpacing: "0.06em",
                                textTransform: "uppercase",
                                opacity: 0.88,
                                textShadow: "0 0 7px rgba(0,0,0,0.95)",
                                userSelect: "none",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {config.name}
                        </span>
                    </DistanceFadedLabel>
                </group>
            </group>
        </group>
    );
}
