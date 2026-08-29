"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import type { NebulaConfig } from "@/data/nebulae";

interface NebulaCameraControllerProps {
    config: NebulaConfig;
    focusRequestId: number;
    controlsRef: React.RefObject<OrbitControlsImpl | null>;
}

const desiredPosition = new THREE.Vector3();
const desiredTarget = new THREE.Vector3();

export function NebulaCameraController({
    config,
    focusRequestId,
    controlsRef,
}: NebulaCameraControllerProps) {
    const { camera, size } = useThree();
    const transitioningRef = useRef(true);

    useEffect(() => {
        const portraitScale = size.width / size.height < 0.8 ? 1.24 : 1;
        desiredPosition.set(
            25,
            12,
            config.closeUpCameraDistance * portraitScale
        );
        desiredTarget.set(0, 0, 0);
        transitioningRef.current = true;
    }, [config.closeUpCameraDistance, focusRequestId, size.height, size.width]);

    useFrame((_, delta) => {
        const controls = controlsRef.current;
        if (!controls || !transitioningRef.current) return;

        const damping = 1 - Math.exp(-2.65 * delta);
        camera.position.lerp(desiredPosition, damping);
        controls.target.lerp(desiredTarget, damping);
        controls.update();

        if (
            camera.position.distanceTo(desiredPosition) < 0.05 &&
            controls.target.distanceTo(desiredTarget) < 0.025
        ) {
            camera.position.copy(desiredPosition);
            controls.target.copy(desiredTarget);
            controls.update();
            transitioningRef.current = false;
        }
    });

    return null;
}
