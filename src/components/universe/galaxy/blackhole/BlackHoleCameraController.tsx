"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import type { BlackHoleConfig } from "@/data/blackHoles";

interface BlackHoleCameraControllerProps {
    config: BlackHoleConfig;
    focusRequestId: number;
    controlsRef: React.RefObject<OrbitControlsImpl | null>;
}

const desiredPosition = new THREE.Vector3();
const desiredTarget = new THREE.Vector3(0, 0, 0);

export function BlackHoleCameraController({
    config,
    focusRequestId,
    controlsRef,
}: BlackHoleCameraControllerProps) {
    const { camera, size } = useThree();
    const transitioningRef = useRef(true);

    useEffect(() => {
        const portraitAdjustment = size.width / size.height < 0.8 ? 1.2 : 1;
        desiredPosition.set(30, 15, config.navigationRadius * portraitAdjustment);
        transitioningRef.current = true;
    }, [config.navigationRadius, focusRequestId, size.height, size.width]);

    useFrame((_, delta) => {
        const controls = controlsRef.current;
        if (!controls || !transitioningRef.current) return;

        const damping = 1 - Math.exp(-2.65 * delta);
        camera.position.lerp(desiredPosition, damping);
        controls.target.lerp(desiredTarget, damping);
        controls.update();

        if (
            camera.position.distanceTo(desiredPosition) < 0.04 &&
            controls.target.distanceTo(desiredTarget) < 0.02
        ) {
            camera.position.copy(desiredPosition);
            controls.target.copy(desiredTarget);
            controls.update();
            transitioningRef.current = false;
        }
    });

    return null;
}
