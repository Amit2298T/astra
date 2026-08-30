"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { getFocusRadius } from "@/engine/navigation/NavigationRadius";
import { useSceneLayerOpacity } from "./scale/FadingSceneGroup";

interface DistanceFadedLabelProps {
    targetName: string;
    position: [number, number, number];
    distanceFactor: number;
    children: ReactNode;
}

const labelWorldPosition = new THREE.Vector3();

export function DistanceFadedLabel({
    targetName,
    position,
    distanceFactor,
    children,
}: DistanceFadedLabelProps) {
    const anchorRef = useRef<THREE.Group>(null);
    const elementRef = useRef<HTMLDivElement>(null);
    const previousOpacityRef = useRef(-1);
    const layerOpacity = useSceneLayerOpacity();
    const focusRadius = getFocusRadius(targetName);
    const hideWithin = focusRadius * 1.3;
    const fullyVisibleBeyond = focusRadius * 2.1;

    useFrame(({ camera }) => {
        const anchor = anchorRef.current;
        const element = elementRef.current;
        if (!anchor || !element) return;

        anchor.getWorldPosition(labelWorldPosition);
        const distance = camera.position.distanceTo(labelWorldPosition);
        const opacity =
            THREE.MathUtils.smoothstep(
                distance,
                hideWithin,
                fullyVisibleBeyond
            ) * layerOpacity;

        if (Math.abs(opacity - previousOpacityRef.current) > 0.01) {
            element.style.opacity = opacity.toFixed(2);
            element.style.visibility = opacity < 0.02 ? "hidden" : "visible";
            previousOpacityRef.current = opacity;
        }
    });

    return (
        <group ref={anchorRef} position={position}>
            <Html
                ref={elementRef}
                center
                distanceFactor={distanceFactor}
                style={{
                    pointerEvents: "none",
                    transition: "opacity 120ms linear",
                }}
            >
                {children}
            </Html>
        </group>
    );
}
