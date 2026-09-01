"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import type { GalacticNavigationTarget } from "@/data/galaxy";
import { galaxyTravelManager } from "@/engine/navigation/GalaxyTravelManager";
import { galacticRegistry } from "@/engine/registry/GalacticRegistry";
import { GALACTIC_INSPECTION_DIRECTION } from "@/engine/scale/CoordinateTransformer";
import type { GalaxyNavigationMode } from "./useGalaxyNavigation";
import { milkyWayConfig } from "@/data/galaxy";
import {
    calculateLocalNeighborhoodBounds,
    getLocalNeighborhoodCameraDistance,
} from "@/engine/navigation/LocalNeighborhoodView";

interface GalaxyCameraControllerProps {
    mode: GalaxyNavigationMode;
    activeTarget: GalacticNavigationTarget | null;
    focusRequestId: number;
    controlsRef: React.RefObject<OrbitControlsImpl | null>;
    onArrival: (targetName: string) => void;
}

const desiredCameraPosition = new THREE.Vector3();
const targetPosition = new THREE.Vector3();
const offsetDirection = new THREE.Vector3();
const cameraDirection = new THREE.Vector3();
const lookMatrix = new THREE.Matrix4();
const targetQuaternion = new THREE.Quaternion();

function setOverviewPosition(aspectRatio: number): void {
    if (aspectRatio < 0.75) {
        desiredCameraPosition.set(4800, 2800, 5100);
    } else if (aspectRatio < 1.3) {
        desiredCameraPosition.set(3650, 2150, 3900);
    } else {
        desiredCameraPosition.set(2250, 1300, 2400);
    }
}

export function GalaxyCameraController({
    mode,
    activeTarget,
    focusRequestId,
    controlsRef,
    onArrival,
}: GalaxyCameraControllerProps) {
    const { camera, size } = useThree();
    const transitioningRef = useRef(true);
    const travelStartedRef = useRef(false);
    const arrivalReportedRef = useRef(false);

    useEffect(() => {
        transitioningRef.current = mode !== "travel";
        travelStartedRef.current = false;
        arrivalReportedRef.current = false;

        if (mode === "overview") {
            targetPosition.set(0, 0, 0);
            setOverviewPosition(size.width / size.height);
        } else if (mode === "neighborhood") {
            const bounds = calculateLocalNeighborhoodBounds(
                milkyWayConfig.locations
            );
            targetPosition.set(...bounds.center);
            offsetDirection
                .set(...GALACTIC_INSPECTION_DIRECTION)
                .normalize();
            const fov =
                camera instanceof THREE.PerspectiveCamera ? camera.fov : 50;
            const distance = getLocalNeighborhoodCameraDistance(
                bounds.radius,
                fov,
                size.width / size.height
            );
            desiredCameraPosition
                .copy(targetPosition)
                .addScaledVector(offsetDirection, distance);
        } else if (mode === "focus" && activeTarget) {
            galacticRegistry.getPosition(activeTarget, targetPosition);
            offsetDirection
                .set(...GALACTIC_INSPECTION_DIRECTION)
                .normalize();
            desiredCameraPosition
                .copy(targetPosition)
                .addScaledVector(offsetDirection, activeTarget.navigationRadius);
        }
    }, [
        activeTarget,
        camera,
        focusRequestId,
        mode,
        size.width,
        size.height,
    ]);

    useFrame((_, delta) => {
        const controls = controlsRef.current;
        if (!controls) return;

        if (mode === "travel" && activeTarget) {
            if (!travelStartedRef.current) {
                galaxyTravelManager.startTravel(activeTarget, camera.position);
                travelStartedRef.current = true;
            }

            const step = galaxyTravelManager.update(delta);
            camera.position.copy(step.position);
            controls.target.copy(step.targetPosition);

            camera.getWorldDirection(cameraDirection);
            lookMatrix.lookAt(camera.position, step.targetPosition, camera.up);
            targetQuaternion.setFromRotationMatrix(lookMatrix);
            const orientationDamping =
                step.phase === "aligning"
                    ? 1 - Math.exp(-7 * delta)
                    : 1 - Math.exp(-3.8 * delta);
            camera.quaternion.slerp(targetQuaternion, orientationDamping);

            if (step.arrived && !arrivalReportedRef.current) {
                arrivalReportedRef.current = true;
                onArrival(activeTarget.navigationName);
            }
            return;
        }

        if (!transitioningRef.current) return;

        const transitionDamping = 1 - Math.exp(-3.2 * delta);
        controls.target.lerp(targetPosition, transitionDamping);
        camera.position.lerp(desiredCameraPosition, transitionDamping);
        controls.update();

        if (
            controls.target.distanceTo(targetPosition) < 0.5 &&
            camera.position.distanceTo(desiredCameraPosition) < 1.5
        ) {
            controls.target.copy(targetPosition);
            camera.position.copy(desiredCameraPosition);
            controls.update();
            transitioningRef.current = false;
        }
    });

    return null;
}
