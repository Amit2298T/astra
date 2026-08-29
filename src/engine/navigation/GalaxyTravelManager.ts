import * as THREE from "three";

import type { GalacticNavigationTarget } from "@/data/galaxy";
import { galacticRegistry } from "@/engine/registry/GalacticRegistry";
import { GALACTIC_INSPECTION_DIRECTION } from "@/engine/scale/CoordinateTransformer";

export type GalaxyTravelPhase =
    | "aligning"
    | "accelerating"
    | "cruise"
    | "decelerating"
    | "arriving";

export interface GalaxyTravelTelemetry {
    destinationName: string;
    distanceRemaining: number;
    progress: number;
    phase: GalaxyTravelPhase;
    isActive: boolean;
}

export interface GalaxyTravelStep {
    position: THREE.Vector3;
    targetPosition: THREE.Vector3;
    progress: number;
    phase: GalaxyTravelPhase;
    arrived: boolean;
    isActive: boolean;
}

const ACCELERATION_FRACTION = 0.18;
const DECELERATION_FRACTION = 0.22;
const CRUISE_FRACTION = 1 - ACCELERATION_FRACTION - DECELERATION_FRACTION;
const PROFILE_AREA =
    ACCELERATION_FRACTION * 0.5 +
    CRUISE_FRACTION +
    DECELERATION_FRACTION * 0.5;

function cinematicDistanceProgress(progress: number): number {
    if (progress <= ACCELERATION_FRACTION) {
        return (
            (0.5 * progress * progress) /
            ACCELERATION_FRACTION /
            PROFILE_AREA
        );
    }

    if (progress <= ACCELERATION_FRACTION + CRUISE_FRACTION) {
        return (
            (ACCELERATION_FRACTION * 0.5 +
                progress -
                ACCELERATION_FRACTION) /
            PROFILE_AREA
        );
    }

    const decelerationProgress =
        progress - ACCELERATION_FRACTION - CRUISE_FRACTION;
    const coveredArea =
        ACCELERATION_FRACTION * 0.5 +
        CRUISE_FRACTION +
        decelerationProgress -
        (decelerationProgress * decelerationProgress) /
            (2 * DECELERATION_FRACTION);
    return Math.min(1, coveredArea / PROFILE_AREA);
}

class GalaxyTravelManager {
    private readonly startPosition = new THREE.Vector3();
    private readonly endPosition = new THREE.Vector3();
    private readonly targetPosition = new THREE.Vector3();
    private readonly travelDirection = new THREE.Vector3();
    private readonly currentPosition = new THREE.Vector3();
    private totalDistance = 0;
    private elapsed = 0;
    private motionDuration = 8;
    private readonly alignmentDuration = 0.7;
    private active = false;

    private readonly telemetry: GalaxyTravelTelemetry = {
        destinationName: "",
        distanceRemaining: 0,
        progress: 0,
        phase: "aligning",
        isActive: false,
    };

    private readonly step: GalaxyTravelStep = {
        position: this.currentPosition,
        targetPosition: this.targetPosition,
        progress: 0,
        phase: "aligning",
        arrived: false,
        isActive: false,
    };

    public startTravel(
        target: GalacticNavigationTarget,
        cameraPosition: THREE.Vector3
    ): void {
        this.startPosition.copy(cameraPosition);
        galacticRegistry.getPosition(target, this.targetPosition);
        this.travelDirection
            .set(...GALACTIC_INSPECTION_DIRECTION)
            .normalize();
        this.endPosition
            .copy(this.targetPosition)
            .addScaledVector(this.travelDirection, target.navigationRadius);
        this.totalDistance = this.startPosition.distanceTo(this.endPosition);
        this.motionDuration = THREE.MathUtils.clamp(
            6 + (this.totalDistance / 2600) * 3,
            6,
            10
        );
        this.elapsed = 0;
        this.active = true;
        this.currentPosition.copy(this.startPosition);

        this.telemetry.destinationName = target.name;
        this.telemetry.distanceRemaining = this.totalDistance;
        this.telemetry.progress = 0;
        this.telemetry.phase = "aligning";
        this.telemetry.isActive = true;
    }

    public update(delta: number): GalaxyTravelStep {
        this.step.arrived = false;
        if (!this.active) {
            this.step.isActive = false;
            return this.step;
        }

        this.elapsed += delta;
        const motionElapsed = Math.max(0, this.elapsed - this.alignmentDuration);
        const progress = THREE.MathUtils.clamp(
            motionElapsed / this.motionDuration,
            0,
            1
        );
        const distanceProgress = cinematicDistanceProgress(progress);

        let phase: GalaxyTravelPhase = "aligning";
        if (this.elapsed >= this.alignmentDuration) {
            if (progress < ACCELERATION_FRACTION) phase = "accelerating";
            else if (progress < ACCELERATION_FRACTION + CRUISE_FRACTION) {
                phase = "cruise";
            } else if (progress < 0.97) phase = "decelerating";
            else phase = "arriving";
        }

        this.currentPosition.lerpVectors(
            this.startPosition,
            this.endPosition,
            distanceProgress
        );
        this.telemetry.progress = progress;
        this.telemetry.phase = phase;
        this.telemetry.distanceRemaining =
            this.totalDistance * (1 - distanceProgress);

        if (progress >= 1) {
            this.active = false;
            this.telemetry.isActive = false;
            this.step.arrived = true;
        }

        this.step.position.copy(this.currentPosition);
        this.step.progress = progress;
        this.step.phase = phase;
        this.step.isActive = this.active;
        return this.step;
    }

    public cancelTravel(): void {
        this.active = false;
        this.telemetry.isActive = false;
    }

    public getTelemetry(): GalaxyTravelTelemetry {
        return this.telemetry;
    }
}

export const galaxyTravelManager = new GalaxyTravelManager();
