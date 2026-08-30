"use client";

import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const SceneLayerOpacityContext = createContext(1);

export function useSceneLayerOpacity(): number {
    return useContext(SceneLayerOpacityContext);
}

interface FadingSceneGroupProps {
    opacity: number;
    labelOpacity?: number;
    children: ReactNode;
}

interface MaterialSnapshot {
    opacity: number;
    transparent: boolean;
}

export function FadingSceneGroup({
    opacity,
    labelOpacity = opacity,
    children,
}: FadingSceneGroupProps) {
    const groupRef = useRef<THREE.Group>(null);
    const materialsRef = useRef(new Map<THREE.Material, MaterialSnapshot>());
    const lightsRef = useRef(new Map<THREE.Light, number>());

    useFrame(() => {
        const group = groupRef.current;
        if (!group) return;

        const layerOpacity = THREE.MathUtils.clamp(opacity, 0, 1);
        group.visible = layerOpacity > 0.002;
        group.traverse((object) => {
            if (object instanceof THREE.Light) {
                if (!lightsRef.current.has(object)) {
                    lightsRef.current.set(object, object.intensity);
                }
                object.intensity = (lightsRef.current.get(object) ?? 0) * layerOpacity;
            }

            const renderable = object as THREE.Mesh | THREE.Line | THREE.Points;
            if (!renderable.material) return;
            const materials = Array.isArray(renderable.material)
                ? renderable.material
                : [renderable.material];
            materials.forEach((material) => {
                if (!materialsRef.current.has(material)) {
                    materialsRef.current.set(material, {
                        opacity: material.opacity,
                        transparent: material.transparent,
                    });
                }
                const snapshot = materialsRef.current.get(material);
                if (!snapshot) return;
                material.transparent = layerOpacity < 0.999 || snapshot.transparent;
                material.opacity = snapshot.opacity * layerOpacity;
            });
        });
    });

    useEffect(() => {
        const materials = materialsRef.current;
        const lights = lightsRef.current;
        return () => {
            materials.forEach((snapshot, material) => {
                material.opacity = snapshot.opacity;
                material.transparent = snapshot.transparent;
            });
            lights.forEach((intensity, light) => {
                light.intensity = intensity;
            });
        };
    }, []);

    return (
        <SceneLayerOpacityContext.Provider value={labelOpacity}>
            <group ref={groupRef}>{children}</group>
        </SceneLayerOpacityContext.Provider>
    );
}
