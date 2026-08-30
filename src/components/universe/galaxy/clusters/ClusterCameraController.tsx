"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import type { StarClusterConfig } from "@/data/starClusters";

interface ClusterCameraControllerProps {
    config: StarClusterConfig;
    focusRequestId: number;
    controlsRef: React.RefObject<OrbitControlsImpl | null>;
}

const desiredPosition = new THREE.Vector3();
const desiredTarget = new THREE.Vector3();

export function ClusterCameraController({
    config,
    focusRequestId,
    controlsRef,
}: ClusterCameraControllerProps) {
    const { camera, size } = useThree();
    const transitioningRef = useRef(true);

    useEffect(() => {
        const portraitScale = size.width / size.height < 0.8 ? 1.28 : 1;
        desiredPosition.set(
            config.closeUpCameraDistance * 0.34,
            config.closeUpCameraDistance * 0.2,
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
