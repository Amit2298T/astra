"use client";

import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

import {
    getStarSystemEntryId,
    getStarSystemRegistryName,
    type ExoplanetConfig,
    type StarSystemConfig,
} from "@/data/starSystems";
import type { SelectedObject } from "@/engine/camera/types";
import { sceneRegistry } from "@/engine/registry/SceneRegistry";
import { useSceneLayerOpacity } from "../scale/FadingSceneGroup";
import { Exoplanet } from "./Exoplanet";
import { Star } from "./Star";

interface StarSystemProps {
    config: StarSystemConfig;
    positionOverride?: [number, number, number];
    selectedObjectId?: string;
    onSelect?: (object: SelectedObject) => void;
    onFocus?: (object: SelectedObject) => void;
}

interface PlanetLabelPresentation {
    offset: [number, number, number];
    maxDistance: number;
}

const systemWorldPosition = new THREE.Vector3();
const TRAPPIST_LABEL_PRESENTATION: Record<
    string,
    PlanetLabelPresentation
> = {
    "trappist-1-b": { offset: [0.45, 0.72, 0], maxDistance: 24 },
    "trappist-1-c": { offset: [-0.5, -0.74, 0], maxDistance: 27 },
    "trappist-1-d": { offset: [-0.58, 0.82, 0], maxDistance: 30 },
    "trappist-1-e": { offset: [0.64, -0.86, 0], maxDistance: 72 },
    "trappist-1-f": { offset: [0.76, 0.96, 0], maxDistance: 34 },
    "trappist-1-g": { offset: [-0.88, -1.04, 0], maxDistance: 38 },
    "trappist-1-h": { offset: [1, 1.14, 0], maxDistance: 42 },
};

export function StarSystem({
    config,
    positionOverride,
    selectedObjectId,
    onSelect,
    onFocus,
}: StarSystemProps) {
    const rootRef = useRef<THREE.Group>(null);
    const binaryRef = useRef<THREE.Group>(null);
    const lodFrameRef = useRef(0);
    const [near, setNear] = useState(false);
    const { camera } = useThree();
    const opacity = useSceneLayerOpacity();
    const binaryIds = new Set(config.binaryStarIds ?? []);
    const binaryStars = config.stars.filter((star) => binaryIds.has(star.id));
    const otherStars = config.stars.filter((star) => !binaryIds.has(star.id));
    const systemRegistryName = getStarSystemRegistryName(
        getStarSystemEntryId(config)
    );

    useEffect(() => {
        const object = rootRef.current;
        if (!object) return;

        sceneRegistry.registerObject(systemRegistryName, object);
        return () => sceneRegistry.unregisterObject(systemRegistryName, object);
    }, [systemRegistryName]);

    useFrame(({ clock }) => {
        if (binaryRef.current) {
            binaryRef.current.rotation.y =
                clock.elapsedTime * (config.binaryOrbitSpeed ?? 0);
        }

        lodFrameRef.current = (lodFrameRef.current + 1) % 12;
        if (lodFrameRef.current !== 0 || !rootRef.current) return;

        rootRef.current.getWorldPosition(systemWorldPosition);
        const nextNear = camera.position.distanceTo(systemWorldPosition) < 140;
        if (nextNear !== near) setNear(nextNear);
    });

    const renderStar = (star: (typeof config.stars)[number]) => (
        <Star
            key={star.id}
            config={star}
            showLabel={near}
            onSelect={onSelect}
            onFocus={onFocus}
        />
    );

    const renderPlanet = (planet: ExoplanetConfig) => {
        const host = config.stars.find(
            (star) => star.name === planet.parentStarName
        );
        const labelPresentation = TRAPPIST_LABEL_PRESENTATION[planet.id];
        const isSelected = selectedObjectId === planet.id;

        return (
            <Exoplanet
                key={planet.id}
                config={planet}
                parentOffset={host?.relativePosition ?? [0, 0, 0]}
                showLabel={near}
                labelOffset={labelPresentation?.offset}
                labelMaxDistance={
                    isSelected ? undefined : labelPresentation?.maxDistance
                }
                labelPriority={
                    labelPresentation
                        ? isSelected
                            ? "selected"
                            : "secondary"
                        : undefined
                }
                onSelect={onSelect}
                onFocus={onFocus}
            />
        );
    };

    return (
        <group ref={rootRef} position={positionOverride ?? config.position}>
            {binaryStars.length > 0 && (
                <group ref={binaryRef}>{binaryStars.map(renderStar)}</group>
            )}
            {otherStars.map(renderStar)}
            {(positionOverride || near) &&
                config.knownPlanets.map(renderPlanet)}
            {!near && config.showLocalBeacon && (
                <>
                    <mesh>
                        <sphereGeometry args={[2.5, 16, 16]} />
                        <meshBasicMaterial
                            color="#ffe082"
                            transparent
                            opacity={0.8}
                            toneMapped={false}
                        />
                    </mesh>
                    <Html
                        position={[0, 4, 0]}
                        center
                        distanceFactor={60}
                        style={{ pointerEvents: "none" }}
                    >
                        <div
                            style={{
                                opacity,
                                color: "#ffd54f",
                                fontSize: 12,
                                fontWeight: 700,
                                whiteSpace: "nowrap",
                                textShadow: "0 0 10px #000",
                            }}
                        >
                            ✦ {config.label} · {config.distanceLightYears}
                        </div>
                    </Html>
                </>
            )}
            {near && config.knownPlanets.length > 0 && (
                <Html
                    position={[0, -2.2, 0]}
                    center
                    distanceFactor={18}
                    style={{ pointerEvents: "none" }}
                >
                    <span
                        style={{
                            opacity: 0.65,
                            color: "#cbd5e1",
                            fontSize: 9,
                            whiteSpace: "nowrap",
                        }}
                    >
                        Orbital distances and body sizes are compressed for
                        readability.
                    </span>
                </Html>
            )}
        </group>
    );
}
