"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import type { ScenePosition } from "@/engine/scale/CoordinateTransformer";
import {
    GALAXY_LOCAL_ENTRY_ARM_DISTANCE,
    GALAXY_LOCAL_ENTRY_DISTANCE,
    LOCAL_EXIT_DISTANCE,
    LOCAL_SIMPLIFY_START_DISTANCE,
    SCALE_TRANSITION_DURATION_SECONDS,
    smoothRange,
    type ScaleTransitionPace,
    type ScaleTransitionPhase,
} from "@/engine/scale/ScaleTransition";

interface ScaleTransitionControllerProps {
    phase: ScaleTransitionPhase;
    pace: ScaleTransitionPace;
    controlsRef: React.RefObject<OrbitControlsImpl | null>;
    canExitLocal: boolean;
    canEnterLocal: boolean;
    prefersReducedMotion: boolean;
    preserveCameraLookDirection: boolean;
    onRequestOut: () => void;
    onRequestIn: () => void;
    onProgress: (progress: number) => void;
    onLocalZoomProgress: (progress: number) => void;
    onCompleteOut: () => void;
    onCompleteIn: () => void;
    localGalacticAnchor: ScenePosition;
}

const startCameraPosition = new THREE.Vector3();
const startTarget = new THREE.Vector3();
const destinationCameraPosition = new THREE.Vector3();
const cameraLookDirection = new THREE.Vector3();
const cameraPathControlOne = new THREE.Vector3();
const cameraPathControlTwo = new THREE.Vector3();
const cameraPathPosition = new THREE.Vector3();
const transitionAnchorTarget = new THREE.Vector3();
const radialDirection = new THREE.Vector3();

function cubicBezierVector(
    destination: THREE.Vector3,
    start: THREE.Vector3,
    controlOne: THREE.Vector3,
    controlTwo: THREE.Vector3,
    end: THREE.Vector3,
    progress: number
): THREE.Vector3 {
    const inverse = 1 - progress;
    return destination
        .copy(start)
        .multiplyScalar(inverse * inverse * inverse)
        .addScaledVector(controlOne, 3 * inverse * inverse * progress)
        .addScaledVector(controlTwo, 3 * inverse * progress * progress)
        .addScaledVector(end, progress * progress * progress);
}

function setGalaxyOverviewPosition(aspectRatio: number): void {
    if (aspectRatio < 0.75) {
        destinationCameraPosition.set(4800, 2800, 5100);
    } else if (aspectRatio < 1.3) {
        destinationCameraPosition.set(3650, 2150, 3900);
    } else {
        destinationCameraPosition.set(2250, 1300, 2400);
    }
}

export function ScaleTransitionController({
    phase,
    pace,
    controlsRef,
    canExitLocal,
    canEnterLocal,
    prefersReducedMotion,
    preserveCameraLookDirection,
    onRequestOut,
    onRequestIn,
    onProgress,
    onLocalZoomProgress,
    onCompleteOut,
    onCompleteIn,
    localGalacticAnchor,
}: ScaleTransitionControllerProps) {
    const { camera, size } = useThree();
    const elapsedRef = useRef(0);
    const capturedPhaseRef = useRef<ScaleTransitionPhase | null>(null);
    const lastProgressRef = useRef(-1);
    const localExitArmedRef = useRef(false);
    const localEntryArmedRef = useRef(false);
    const completedRef = useRef(false);

    useEffect(() => {
        if (!canExitLocal) localExitArmedRef.current = false;
    }, [canExitLocal]);

    useEffect(() => {
        if (!canEnterLocal) localEntryArmedRef.current = false;
    }, [canEnterLocal]);

    useFrame((_, delta) => {
        const controls = controlsRef.current;
        if (!controls) return;

        const distance = camera.position.distanceTo(controls.target);

        if (phase === "local") {
            if (canExitLocal) {
                if (distance < LOCAL_EXIT_DISTANCE - 12) {
                    localExitArmedRef.current = true;
                }
                const zoomProgress = smoothRange(
                    distance,
                    LOCAL_SIMPLIFY_START_DISTANCE,
                    LOCAL_EXIT_DISTANCE
                );
                if (Math.abs(zoomProgress - lastProgressRef.current) > 0.01) {
                    lastProgressRef.current = zoomProgress;
                    onLocalZoomProgress(zoomProgress);
                }
                if (localExitArmedRef.current && distance >= LOCAL_EXIT_DISTANCE) {
                    localExitArmedRef.current = false;
                    onRequestOut();
                }
            } else if (lastProgressRef.current !== 0) {
                lastProgressRef.current = 0;
                onLocalZoomProgress(0);
            }
            return;
        }

        if (phase === "galaxy") {
            if (canEnterLocal) {
                if (distance >= GALAXY_LOCAL_ENTRY_ARM_DISTANCE) {
                    localEntryArmedRef.current = true;
                }
                if (
                    localEntryArmedRef.current &&
                    distance <= GALAXY_LOCAL_ENTRY_DISTANCE
                ) {
                    localEntryArmedRef.current = false;
                    onRequestIn();
                }
            }
            return;
        }

        if (capturedPhaseRef.current !== phase) {
            capturedPhaseRef.current = phase;
            elapsedRef.current = 0;
            completedRef.current = false;
            lastProgressRef.current = -1;
            startCameraPosition.copy(camera.position);
            if (preserveCameraLookDirection) {
                camera.getWorldDirection(cameraLookDirection);
                startTarget
                    .copy(camera.position)
                    .addScaledVector(
                        cameraLookDirection,
                        Math.max(40, camera.position.distanceTo(controls.target))
                    );
            } else {
                startTarget.copy(controls.target);
            }
            if (phase === "transitioningOut") {
                setGalaxyOverviewPosition(size.width / size.height);
                radialDirection.subVectors(startCameraPosition, startTarget);
                if (radialDirection.lengthSq() < 0.0001) {
                    radialDirection.set(0, 0.2, 1);
                }
                radialDirection.normalize();
                cameraPathControlOne
                    .copy(startCameraPosition)
                    .addScaledVector(
                        radialDirection,
                        Math.max(
                            240,
                            startCameraPosition.distanceTo(startTarget) * 1.25
                        )
                    );
                cameraPathControlOne.y += Math.max(
                    45,
                    destinationCameraPosition.y * 0.06
                );
                cameraPathControlTwo.copy(destinationCameraPosition);
                cameraPathControlTwo.x *= 0.72;
                cameraPathControlTwo.z *= 0.72;
                cameraPathControlTwo.y = Math.max(
                    cameraPathControlOne.y + 120,
                    destinationCameraPosition.y * 0.72
                );
            } else {
                destinationCameraPosition.set(0, 20, 40);
                cameraPathControlOne
                    .copy(startCameraPosition)
                    .lerp(destinationCameraPosition, 0.18);
                cameraPathControlOne.y = startCameraPosition.y;
                cameraPathControlTwo
                    .copy(startCameraPosition)
                    .lerp(destinationCameraPosition, 0.72);
                cameraPathControlTwo.y = Math.max(
                    140,
                    destinationCameraPosition.y
                );
            }
        }

        const duration = prefersReducedMotion
            ? SCALE_TRANSITION_DURATION_SECONDS.reducedMotion
            : SCALE_TRANSITION_DURATION_SECONDS[pace];
        elapsedRef.current = Math.min(duration, elapsedRef.current + delta);
        const normalized = elapsedRef.current / duration;
        const eased = normalized * normalized * (3 - 2 * normalized);
        const scaleProgress =
            phase === "transitioningOut" ? eased : 1 - eased;

        cubicBezierVector(
            cameraPathPosition,
            startCameraPosition,
            cameraPathControlOne,
            cameraPathControlTwo,
            destinationCameraPosition,
            eased
        );
        camera.position.copy(cameraPathPosition);

        transitionAnchorTarget
            .set(...localGalacticAnchor)
            .multiplyScalar(scaleProgress);
        if (phase === "transitioningOut") {
            controls.target
                .copy(transitionAnchorTarget)
                .multiplyScalar(1 - smoothRange(scaleProgress, 0.55, 1));
        } else {
            controls.target
                .copy(startTarget)
                .lerp(
                    transitionAnchorTarget,
                    smoothRange(eased, 0, 0.22)
                );
        }
        controls.update();

        if (Math.abs(scaleProgress - lastProgressRef.current) > 0.005) {
            lastProgressRef.current = scaleProgress;
            onProgress(scaleProgress);
        }

        if (normalized >= 1 && !completedRef.current) {
            completedRef.current = true;
            if (phase === "transitioningOut") onCompleteOut();
            else onCompleteIn();
        }
    });

    return null;
}
