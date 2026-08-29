import * as THREE from "three";
import { sceneRegistry } from "@/engine/registry/SceneRegistry";
import { getArrivalRadius } from "./NavigationRadius";

export type TravelPhase =
    | "aligning"
    | "accelerating"
    | "cruise"
    | "decelerating"
    | "arriving";

export interface TravelTelemetry {
    destinationName: string;
    distanceRemaining: number;
    currentSpeed: number;
    phase: TravelPhase;
    progress: number;
    isActive: boolean;
}

export interface TravelStepResult {
    isActive: boolean;
    arrived: boolean;
    failed: boolean;
    targetPosition: THREE.Vector3;
    targetDirection: THREE.Vector3;
    speed: number;
    phase: TravelPhase;
    telemetry: TravelTelemetry;
}

// Module-level reused Vectors to prevent garbage collection overhead during frame updates
const tempTargetPos = new THREE.Vector3();
const tempTargetDir = new THREE.Vector3();
const toTargetVec = new THREE.Vector3();

/**
 * TravelManager calculates generic autopilot travel state,
 * dynamic moving destination tracking, acceleration, cruise, deceleration,
 * and arrival detection without mutating camera orientation/position directly.
 */
export class TravelManager {
    private active = false;
    private destinationName: string | null = null;
    private initialDistance = 0;
    private arrivalRadius = 3.0;
    private currentSpeed = 0;
    private phase: TravelPhase = "aligning";
    private progress = 0;
    private alignDuration = 0;
    private targetInitialized = false;
    private unresolvedDuration = 0;
    private readonly resolutionTimeout = 1.5;

    private cachedTelemetry: TravelTelemetry = {
        destinationName: "",
        distanceRemaining: 0,
        currentSpeed: 0,
        phase: "aligning",
        progress: 0,
        isActive: false,
    };

    private stepResult: TravelStepResult = {
        isActive: false,
        arrived: false,
        failed: false,
        targetPosition: tempTargetPos,
        targetDirection: tempTargetDir,
        speed: 0,
        phase: "aligning",
        telemetry: this.cachedTelemetry,
    };

    private initializeTravel(
        targetObject: THREE.Object3D,
        cameraPosition: THREE.Vector3
    ): void {
        targetObject.getWorldPosition(tempTargetPos);
        const currentDistance = cameraPosition.distanceTo(tempTargetPos);

        this.initialDistance = Math.max(
            currentDistance,
            this.arrivalRadius + 0.5
        );
        this.currentSpeed = 3.0;
        this.phase = "aligning";
        this.progress = 0;
        this.alignDuration = 0;
        this.targetInitialized = true;
        this.unresolvedDuration = 0;

        this.cachedTelemetry.distanceRemaining = Math.max(
            0,
            currentDistance - this.arrivalRadius
        );
        this.cachedTelemetry.currentSpeed = this.currentSpeed;
    }

    /**
     * Initiate autopilot travel toward any registered celestial object or spacecraft
     */
    public startTravel(
        destinationName: string,
        startCameraPos: THREE.Vector3
    ): boolean {
        this.destinationName = destinationName;
        this.arrivalRadius = getArrivalRadius(destinationName);
        this.initialDistance = 0;
        this.currentSpeed = 0;
        this.phase = "aligning";
        this.progress = 0;
        this.alignDuration = 0;
        this.targetInitialized = false;
        this.unresolvedDuration = 0;
        this.active = true;

        this.cachedTelemetry.destinationName = destinationName;
        this.cachedTelemetry.distanceRemaining = 0;
        this.cachedTelemetry.currentSpeed = 0;
        this.cachedTelemetry.phase = this.phase;
        this.cachedTelemetry.progress = 0;
        this.cachedTelemetry.isActive = true;

        const targetObject = sceneRegistry.getObject(destinationName);
        if (targetObject) {
            this.initializeTravel(targetObject, startCameraPos);
        }

        return true;
    }

    /**
     * Safely abort travel without snapping camera
     */
    public cancelTravel(): void {
        this.active = false;
        this.destinationName = null;
        this.targetInitialized = false;
        this.unresolvedDuration = 0;
        this.cachedTelemetry.isActive = false;
    }

    public getIsActive(): boolean {
        return this.active;
    }

    public getTelemetry(): TravelTelemetry {
        return this.cachedTelemetry;
    }

    /**
     * Frame-rate independent travel update.
     * Computes direction, speed, and phase based on live target position.
     * Does NOT mutate the camera directly.
     */
    public update(
        cameraPosition: THREE.Vector3,
        cameraDirection: THREE.Vector3,
        delta: number
    ): TravelStepResult {
        this.stepResult.failed = false;

        if (!this.active || !this.destinationName) {
            this.stepResult.isActive = false;
            this.stepResult.arrived = false;
            this.stepResult.speed = 0;
            return this.stepResult;
        }

        // 1. Resolve live world position of destination generically every single frame
        const targetObj = sceneRegistry.getObject(this.destinationName);
        if (!targetObj) {
            this.unresolvedDuration += delta;
            this.stepResult.isActive = false;
            this.stepResult.arrived = false;
            this.stepResult.failed = false;
            this.stepResult.speed = 0;
            this.cachedTelemetry.currentSpeed = 0;
            this.cachedTelemetry.isActive = true;

            if (this.unresolvedDuration >= this.resolutionTimeout) {
                const missingDestination = this.destinationName;
                const registeredContext =
                    process.env.NODE_ENV === "development"
                        ? ` Registered targets: ${sceneRegistry
                              .getRegisteredNames()
                              .join(", ") || "none"}.`
                        : "";
                console.warn(
                    `[TravelManager] Destination "${missingDestination}" was unavailable for ${this.resolutionTimeout.toFixed(1)} seconds; travel was cancelled.${registeredContext}`
                );
                this.cancelTravel();
                this.stepResult.failed = true;
            }

            return this.stepResult;
        }

        if (!this.targetInitialized) {
            this.initializeTravel(targetObj, cameraPosition);
        } else {
            this.unresolvedDuration = 0;
        }

        targetObj.getWorldPosition(tempTargetPos);

        // 2. Compute live distance and normalized direction vector to moving target
        toTargetVec.subVectors(tempTargetPos, cameraPosition);
        const currentDist = toTargetVec.length();

        if (currentDist > 0.0001) {
            tempTargetDir.copy(toTargetVec).normalize();
        } else {
            tempTargetDir.set(0, 0, -1);
        }

        // 3. Compute journey progress (0.0 to 1.0)
        const totalTravelRange = Math.max(
            0.5,
            this.initialDistance - this.arrivalRadius
        );
        const remainingDistance = Math.max(0, currentDist - this.arrivalRadius);
        this.progress = Math.max(
            0,
            Math.min(1, 1 - remainingDistance / totalTravelRange)
        );

        // 4. Calculate dynamic scale-aware cruise speed based on travel distance
        // Generic formula: shorter trips cruise slower, deep interstellar trips cruise fast & smoothly
        const targetCruiseSpeed = Math.min(
            240,
            Math.max(14, Math.sqrt(this.initialDistance) * 11.5)
        );

        // Required stopping distance with smooth deceleration
        const decelDist = Math.max(
            6.0,
            Math.min(
                this.initialDistance * 0.55,
                (targetCruiseSpeed * targetCruiseSpeed) / 50 + this.arrivalRadius * 1.8
            )
        );

        // 5. Phase state machine
        let arrived = false;

        if (this.phase === "aligning") {
            this.alignDuration += delta;
            // Check angular alignment
            const dot = cameraDirection.dot(tempTargetDir);

            // Gentle forward crawl while orienting
            this.currentSpeed = Math.min(this.currentSpeed, 4.5);

            // Once camera is largely aligned or after 0.5s alignment window, begin acceleration
            if (dot > 0.96 || this.alignDuration > 0.55) {
                this.phase = "accelerating";
            }
        }

        if (this.phase === "accelerating") {
            const accelRate = Math.max(16, targetCruiseSpeed * 0.9);
            this.currentSpeed = Math.min(
                targetCruiseSpeed,
                this.currentSpeed + accelRate * delta
            );

            if (this.currentSpeed >= targetCruiseSpeed * 0.96) {
                this.phase = "cruise";
            }

            if (currentDist <= decelDist) {
                this.phase = "decelerating";
            }
        } else if (this.phase === "cruise") {
            this.currentSpeed = targetCruiseSpeed;

            if (currentDist <= decelDist) {
                this.phase = "decelerating";
            }
        }

        if (this.phase === "decelerating") {
            // Smooth non-linear deceleration ramp toward arrival threshold
            const distRatio = Math.max(
                0,
                (currentDist - this.arrivalRadius) /
                    Math.max(0.5, decelDist - this.arrivalRadius)
            );
            const minApproachSpeed = 2.0;
            const desiredSpeed =
                minApproachSpeed +
                (targetCruiseSpeed - minApproachSpeed) *
                    Math.pow(distRatio, 0.8);

            const decelDamping = 1 - Math.exp(-6 * delta);
            this.currentSpeed += (desiredSpeed - this.currentSpeed) * decelDamping;

            if (
                currentDist <= this.arrivalRadius * 1.12 ||
                remainingDistance < 0.3
            ) {
                this.phase = "arriving";
            }
        }

        if (this.phase === "arriving") {
            const arrivalDamping = 1 - Math.exp(-8 * delta);
            this.currentSpeed = Math.max(
                0.6,
                this.currentSpeed * (1 - arrivalDamping)
            );

            // Arrival condition satisfied
            if (
                currentDist <= this.arrivalRadius ||
                (currentDist <= this.arrivalRadius + 0.25 &&
                    this.currentSpeed <= 1.2)
            ) {
                arrived = true;
                this.active = false;
                this.currentSpeed = 0;
            }
        }

        // 6. Update telemetry snapshot
        this.cachedTelemetry.destinationName = this.destinationName;
        this.cachedTelemetry.distanceRemaining = remainingDistance;
        this.cachedTelemetry.currentSpeed = this.currentSpeed;
        this.cachedTelemetry.phase = this.phase;
        this.cachedTelemetry.progress = this.progress;
        this.cachedTelemetry.isActive = this.active;

        // 7. Return step results to CameraController
        this.stepResult.isActive = this.active;
        this.stepResult.arrived = arrived;
        this.stepResult.targetPosition = tempTargetPos;
        this.stepResult.targetDirection = tempTargetDir;
        this.stepResult.speed = this.currentSpeed;
        this.stepResult.phase = this.phase;
        this.stepResult.telemetry = this.cachedTelemetry;

        return this.stepResult;
    }
}

export const travelManager = new TravelManager();
