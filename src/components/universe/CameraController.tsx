"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import type { CameraMode } from "@/engine/camera/types";
import { sceneRegistry } from "@/engine/registry/SceneRegistry";
import { freeFlightInput } from "@/engine/input/FreeFlightInput";
import { speedManager } from "@/engine/navigation/SpeedManager";
import { travelManager } from "@/engine/navigation/TravelManager";
import {
    getFocusRadius,
    getFollowRadius,
} from "@/engine/navigation/NavigationRadius";

interface CameraControllerProps {
    selectedTarget: string | null;
    activeOrbitTarget: string | null;
    mode: CameraMode;
    controlsRef: React.RefObject<OrbitControlsImpl | null>;
    onArrival?: (destinationName: string) => void;
    onTravelFailure?: () => void;
}

// Module-level reused Vectors, Quaternions, and Matrices to prevent frame allocations (0 GC overhead)
const tempWorldPos = new THREE.Vector3();
const tempCamPos = new THREE.Vector3();
const tempDir = new THREE.Vector3();
const prevTargetPos = new THREE.Vector3();
const deltaPos = new THREE.Vector3();
const tempCamDir = new THREE.Vector3();
const tempLookMatrix = new THREE.Matrix4();
const tempTargetQuat = new THREE.Quaternion();
const tempTargetVelocity = new THREE.Vector3();
const tempFollowDirection = new THREE.Vector3();
const overviewPosition = new THREE.Vector3(0, 20, 40);
const galaxyOverviewPosition = new THREE.Vector3(2250, 1300, 2400);
const galaxyCenter = new THREE.Vector3(0, 0, 0);

function updateGalaxyOverviewPosition(aspectRatio: number): void {
    if (aspectRatio < 0.75) {
        galaxyOverviewPosition.set(4800, 2800, 5100);
    } else if (aspectRatio < 1.3) {
        galaxyOverviewPosition.set(3650, 2150, 3900);
    } else {
        galaxyOverviewPosition.set(2250, 1300, 2400);
    }
}

export function CameraController({
    selectedTarget,
    activeOrbitTarget,
    mode,
    controlsRef,
    onArrival,
    onTravelFailure,
}: CameraControllerProps) {
    const { camera, gl, size } = useThree();

    const modeRef = useRef<CameraMode>(mode);
    const orbitTargetRef = useRef<string | null>(activeOrbitTarget);

    const isTargetTransitioningRef = useRef<boolean>(false);
    const isCameraTransitioningRef = useRef<boolean>(false);
    const initializedTargetRef = useRef<boolean>(false);
    const followDirectionRef = useRef(new THREE.Vector3());
    const hasFollowDirectionRef = useRef(false);

    // Keep camera mode and authoritative orbit target synchronized.
    useEffect(() => {
        modeRef.current = mode;
        orbitTargetRef.current = activeOrbitTarget;
        initializedTargetRef.current = false;
        hasFollowDirectionRef.current = false;

        if (
            mode === "focus" ||
            mode === "follow" ||
            mode === "system" ||
            mode === "galaxy"
        ) {
            isCameraTransitioningRef.current = true;
            isTargetTransitioningRef.current = true;
        }
    }, [mode, activeOrbitTarget]);

    useEffect(() => {
        if (mode === "galaxy") {
            isCameraTransitioningRef.current = true;
        }
    }, [mode, size.width, size.height]);

    // Free-flight input lifecycle is independent from object selection.
    useEffect(() => {
        if (mode !== "freeFlight") return;

        freeFlightInput.activate(gl.domElement, camera);
        speedManager.activate();

        return () => {
            freeFlightInput.deactivate();
            speedManager.deactivate();
        };
    }, [mode, gl.domElement, camera]);

    // Autopilot uses the selected UI object only to capture its destination.
    useEffect(() => {
        if (mode !== "travel") return;

        const destination = selectedTarget || activeOrbitTarget;
        if (destination) {
            travelManager.startTravel(destination, camera.position);
        }

        return () => {
            travelManager.cancelTravel();
        };
    }, [mode, selectedTarget, activeOrbitTarget, gl.domElement, camera]);

    useFrame((_, delta) => {
        const controls = controlsRef.current;

        if (modeRef.current === "galaxy") {
            if (!controls) return;

            updateGalaxyOverviewPosition(size.width / size.height);

            if (isCameraTransitioningRef.current) {
                const galaxyLerpFactor = 1 - Math.exp(-2.8 * delta);
                controls.target.lerp(galaxyCenter, galaxyLerpFactor);
                camera.position.lerp(galaxyOverviewPosition, galaxyLerpFactor);
                controls.update();

                if (
                    controls.target.distanceTo(galaxyCenter) < 0.5 &&
                    camera.position.distanceTo(galaxyOverviewPosition) < 2
                ) {
                    controls.target.copy(galaxyCenter);
                    camera.position.copy(galaxyOverviewPosition);
                    controls.update();
                    isCameraTransitioningRef.current = false;
                }
            }
            return;
        }

        // 1. Mode: FREE FLIGHT
        if (modeRef.current === "freeFlight") {
            const isBoosting = freeFlightInput.isShiftPressed();
            const navData = speedManager.update(camera, delta, isBoosting);
            freeFlightInput.update(camera, delta, navData.effectiveSpeed);
            return;
        }

        // 2. Mode: TRAVEL / AUTOPILOT
        if (modeRef.current === "travel") {
            camera.getWorldDirection(tempCamDir);
            const step = travelManager.update(
                camera.position,
                tempCamDir,
                delta
            );

            if (step.isActive) {
                // Apply physical camera translation through 3D space
                camera.position.addScaledVector(
                    step.targetDirection,
                    step.speed * delta
                );

                // Smoothly orient camera toward target using quaternion slerp (stable roll)
                tempLookMatrix.lookAt(
                    camera.position,
                    step.targetPosition,
                    camera.up
                );
                tempTargetQuat.setFromRotationMatrix(tempLookMatrix);

                const slerpFactor =
                    step.phase === "aligning"
                        ? 1 - Math.exp(-9 * delta)
                        : 1 - Math.exp(-5.5 * delta);

                camera.quaternion.slerp(tempTargetQuat, slerpFactor);
            }

            if (step.arrived) {
                if (controls) {
                    controls.target.copy(step.targetPosition);
                    controls.update();
                }
                onArrival?.(step.telemetry.destinationName);
            }

            if (step.failed) {
                onTravelFailure?.();
            }

            return;
        }

        if (!controls) return;

        const lerpFactor = 1 - Math.exp(-6 * delta); // Smooth frame-rate independent lerp

        // Resolve live world position of the active orbit target
        const currentTargetName = orbitTargetRef.current;
        if (!currentTargetName) return;

        const targetObj = sceneRegistry.getObject(currentTargetName);
        if (!targetObj) return;

        targetObj.getWorldPosition(tempWorldPos);

        // Initialize target position tracker if uninitialized
        if (!initializedTargetRef.current) {
            prevTargetPos.copy(tempWorldPos);
            initializedTargetRef.current = true;
        }

        // 3. Mode: FOLLOW (companion trailing camera)
        if (modeRef.current === "follow") {
            const followDist = getFollowRadius(currentTargetName);
            tempTargetVelocity.subVectors(tempWorldPos, prevTargetPos);

            if (tempTargetVelocity.lengthSq() > 1e-10) {
                followDirectionRef.current.copy(tempTargetVelocity).normalize();
                hasFollowDirectionRef.current = true;
            } else if (!hasFollowDirectionRef.current) {
                tempFollowDirection.subVectors(tempWorldPos, camera.position);
                if (tempFollowDirection.lengthSq() < 1e-10) {
                    tempFollowDirection.set(0, 0, -1);
                }
                followDirectionRef.current.copy(tempFollowDirection).normalize();
                hasFollowDirectionRef.current = true;
            }

            tempCamPos
                .copy(tempWorldPos)
                .addScaledVector(followDirectionRef.current, -followDist);
            tempCamPos.y += followDist * 0.35;

            if (isCameraTransitioningRef.current) {
                controls.target.lerp(tempWorldPos, lerpFactor);
                camera.position.lerp(tempCamPos, lerpFactor);
                controls.update();

                if (
                    controls.target.distanceTo(tempWorldPos) < 0.04 &&
                    camera.position.distanceTo(tempCamPos) < 0.08
                ) {
                    isCameraTransitioningRef.current = false;
                }
            } else {
                controls.target.copy(tempWorldPos);
                camera.position.lerp(
                    tempCamPos,
                    1 - Math.exp(-8 * delta)
                );
                controls.update();
            }
            prevTargetPos.copy(tempWorldPos);
            return;
        }

        // 4. Mode: FOCUS (cinematic close-up approach)
        if (modeRef.current === "focus") {
            const focusDist = getFocusRadius(currentTargetName);
            tempDir.subVectors(camera.position, tempWorldPos);
            if (tempDir.lengthSq() < 0.0001) {
                tempDir.set(0, 0.4, 1);
            }
            tempDir.normalize();

            tempCamPos.copy(tempWorldPos).addScaledVector(tempDir, focusDist);

            if (isCameraTransitioningRef.current) {
                controls.target.lerp(tempWorldPos, lerpFactor);
                camera.position.lerp(tempCamPos, lerpFactor);
                controls.update();

                if (
                    controls.target.distanceTo(tempWorldPos) < 0.04 &&
                    camera.position.distanceTo(tempCamPos) <
                        Math.max(0.05, focusDist * 0.015)
                ) {
                    isCameraTransitioningRef.current = false;
                    prevTargetPos.copy(tempWorldPos);
                }
            } else {
                deltaPos.subVectors(tempWorldPos, prevTargetPos);
                controls.target.copy(tempWorldPos);
                camera.position.add(deltaPos);
                prevTargetPos.copy(tempWorldPos);
                controls.update();
            }
            return;
        }

        // 5. Mode: SYSTEM (Solar System Overview)
        if (modeRef.current === "system") {
            if (isCameraTransitioningRef.current) {
                controls.target.lerp(tempWorldPos, lerpFactor);
                camera.position.lerp(overviewPosition, lerpFactor);
                controls.update();

                if (
                    controls.target.distanceTo(tempWorldPos) < 0.05 &&
                    camera.position.distanceTo(overviewPosition) < 0.1
                ) {
                    isCameraTransitioningRef.current = false;
                    isTargetTransitioningRef.current = false;
                    prevTargetPos.copy(tempWorldPos);
                }
            } else if (isTargetTransitioningRef.current) {
                controls.target.lerp(tempWorldPos, lerpFactor);
                controls.update();

                if (controls.target.distanceTo(tempWorldPos) < 0.04) {
                    isTargetTransitioningRef.current = false;
                    prevTargetPos.copy(tempWorldPos);
                }
            } else if (targetObj) {
                deltaPos.subVectors(tempWorldPos, prevTargetPos);
                controls.target.copy(tempWorldPos);
                camera.position.add(deltaPos);
                prevTargetPos.copy(tempWorldPos);
                controls.update();
            }
        }
    });

    return null;
}
