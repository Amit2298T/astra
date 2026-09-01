"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import { freeFlightInput } from "@/engine/input/FreeFlightInput";
import { sceneRegistry } from "@/engine/registry/SceneRegistry";
import type { SurfaceModePhase } from "@/engine/surface/SurfaceDestination";
import {
    getMoonTerrainHeight,
    MOON_EXPLORE_RADIUS,
    MOON_SURFACE_EYE_HEIGHT,
} from "@/engine/surface/SurfaceTerrain";

interface SurfaceCameraControllerProps {
    phase: SurfaceModePhase;
    prefersReducedMotion: boolean;
    controlsRef: React.RefObject<OrbitControlsImpl | null>;
    onProgress: (progress: number) => void;
    onLandingComplete: () => void;
    onReturnComplete: () => void;
}

const startPosition = new THREE.Vector3();
const destinationPosition = new THREE.Vector3();
const lookTarget = new THREE.Vector3();
const moonWorldPosition = new THREE.Vector3();
const startQuaternion = new THREE.Quaternion();
const destinationQuaternion = new THREE.Quaternion();
const lookMatrix = new THREE.Matrix4();
const returnCameraOffset = new THREE.Vector3(0.35, 0.24, 1.15);

export function SurfaceCameraController({
    phase,
    prefersReducedMotion,
    controlsRef,
    onProgress,
    onLandingComplete,
    onReturnComplete,
}: SurfaceCameraControllerProps) {
    const { camera, gl } = useThree();
    const cameraRef = useRef(camera);
    const capturedPhaseRef = useRef<SurfaceModePhase | null>(null);
    const elapsedRef = useRef(0);
    const completedRef = useRef(false);
    const reportedProgressRef = useRef(-1);

    useEffect(() => {
        cameraRef.current = camera;
    }, [camera]);

    useEffect(() => {
        if (phase !== "surface") return;

        freeFlightInput.activate(gl.domElement, camera);
        return () => freeFlightInput.deactivate();
    }, [camera, gl.domElement, phase]);

    useFrame((_, delta) => {
        const surfaceCamera = cameraRef.current;
        if (phase === "landing" || phase === "returning") {
            if (capturedPhaseRef.current !== phase) {
                capturedPhaseRef.current = phase;
                elapsedRef.current = 0;
                completedRef.current = false;
                reportedProgressRef.current = -1;
                startPosition.copy(surfaceCamera.position);
                startQuaternion.copy(surfaceCamera.quaternion);
            }

            const duration = prefersReducedMotion ? 0.7 : 3;
            elapsedRef.current = Math.min(duration, elapsedRef.current + delta);
            const progress = elapsedRef.current / duration;
            const eased = progress * progress * (3 - 2 * progress);

            if (phase === "landing") {
                destinationPosition.set(
                    0,
                    getMoonTerrainHeight(0, 18) + MOON_SURFACE_EYE_HEIGHT,
                    18
                );
                lookTarget.set(66, getMoonTerrainHeight(66, -42) + 1.4, -42);
            } else {
                const moon = sceneRegistry.getObject("Moon");
                if (moon) moon.getWorldPosition(moonWorldPosition);
                destinationPosition
                    .copy(moonWorldPosition)
                    .add(returnCameraOffset);
                lookTarget.copy(moonWorldPosition);
            }

            lookMatrix.lookAt(destinationPosition, lookTarget, surfaceCamera.up);
            destinationQuaternion.setFromRotationMatrix(lookMatrix);
            surfaceCamera.position.lerpVectors(
                startPosition,
                destinationPosition,
                eased
            );
            surfaceCamera.quaternion.slerpQuaternions(
                startQuaternion,
                destinationQuaternion,
                eased
            );
            surfaceCamera.updateMatrixWorld();

            const controls = controlsRef.current;
            if (controls) {
                controls.target.copy(lookTarget);
            }

            if (
                Math.abs(progress - reportedProgressRef.current) >= 0.01 ||
                progress === 1
            ) {
                reportedProgressRef.current = progress;
                onProgress(progress);
            }

            if (progress >= 1 && !completedRef.current) {
                completedRef.current = true;
                if (phase === "landing") onLandingComplete();
                else onReturnComplete();
            }
            return;
        }

        if (phase !== "surface") return;

        const speed = freeFlightInput.isShiftPressed() ? 15 : 5;
        freeFlightInput.update(surfaceCamera, delta, speed);
        const radialDistance = Math.hypot(
            surfaceCamera.position.x,
            surfaceCamera.position.z
        );
        if (radialDistance > MOON_EXPLORE_RADIUS) {
            const boundaryScale = MOON_EXPLORE_RADIUS / radialDistance;
            surfaceCamera.position.x *= boundaryScale;
            surfaceCamera.position.z *= boundaryScale;
        }
        surfaceCamera.position.y =
            getMoonTerrainHeight(
                surfaceCamera.position.x,
                surfaceCamera.position.z
            ) +
            MOON_SURFACE_EYE_HEIGHT;
    });

    return null;
}
