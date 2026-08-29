import * as THREE from "three";
import { sceneRegistry } from "@/engine/registry/SceneRegistry";

export interface FreeRoamSpeedPreset {
    readonly speed: number;
    readonly label: string;
}

export const FREE_ROAM_SPEED_PRESETS: readonly FreeRoamSpeedPreset[] = [
    { speed: 5, label: "Precision" },
    { speed: 10, label: "Slow" },
    { speed: 20, label: "Cruise" },
    { speed: 50, label: "Fast" },
    { speed: 100, label: "System" },
    { speed: 250, label: "Rapid" },
    { speed: 500, label: "Deep Space" },
    { speed: 1000, label: "Extreme" },
];

export interface NavigationData {
    effectiveSpeed: number;
    selectedSpeed: number;
    speedLabel: string;
    isBoosting: boolean;
    nearestObjectName: string;
    nearestDistance: number;
}

const DEFAULT_PRESET_INDEX = 1;
const SHIFT_BOOST_MULTIPLIER = 5;
const WHEEL_STEP_COOLDOWN_MS = 100;

// Module-scope temp vector to prevent frame allocations.
const tempObjPos = new THREE.Vector3();

/**
 * Owns the user-selected Free Roam speed and its navigation telemetry.
 * Autopilot travel speed is managed independently by TravelManager.
 */
export class SpeedManager {
    private selectedPresetIndex = DEFAULT_PRESET_INDEX;
    private active = false;
    private lastWheelStepTime = -Infinity;
    private nearestCamera: THREE.Camera | null = null;
    private nearestDistance = Infinity;
    private nearestName = "Space";

    private cachedData: NavigationData = {
        effectiveSpeed: FREE_ROAM_SPEED_PRESETS[DEFAULT_PRESET_INDEX].speed,
        selectedSpeed: FREE_ROAM_SPEED_PRESETS[DEFAULT_PRESET_INDEX].speed,
        speedLabel: FREE_ROAM_SPEED_PRESETS[DEFAULT_PRESET_INDEX].label,
        isBoosting: false,
        nearestObjectName: "Space",
        nearestDistance: 0,
    };

    public activate() {
        if (this.active) return;
        this.active = true;
        this.lastWheelStepTime = -Infinity;
        if (typeof window !== "undefined") {
            window.addEventListener("wheel", this.handleWheel, {
                passive: false,
            });
        }
    }

    public deactivate() {
        this.active = false;
        if (typeof window !== "undefined") {
            window.removeEventListener("wheel", this.handleWheel);
        }
    }

    private handleWheel = (event: WheelEvent) => {
        if (!this.active || event.deltaY === 0) return;

        event.preventDefault();
        if (
            event.timeStamp - this.lastWheelStepTime <
            WHEEL_STEP_COOLDOWN_MS
        ) {
            return;
        }

        const direction = event.deltaY < 0 ? 1 : -1;
        this.selectedPresetIndex = Math.max(
            0,
            Math.min(
                FREE_ROAM_SPEED_PRESETS.length - 1,
                this.selectedPresetIndex + direction
            )
        );
        this.syncSelectedPreset();
        this.lastWheelStepTime = event.timeStamp;
    };

    private syncSelectedPreset(): void {
        const preset = FREE_ROAM_SPEED_PRESETS[this.selectedPresetIndex];
        this.cachedData.selectedSpeed = preset.speed;
        this.cachedData.speedLabel = preset.label;
        this.cachedData.effectiveSpeed =
            preset.speed *
            (this.cachedData.isBoosting ? SHIFT_BOOST_MULTIPLIER : 1);
    }

    private measureRegisteredObject = (
        object3D: THREE.Object3D,
        name: string
    ): void => {
        if (!this.nearestCamera) return;

        object3D.getWorldPosition(tempObjPos);
        const distance = this.nearestCamera.position.distanceTo(tempObjPos);
        if (distance < this.nearestDistance) {
            this.nearestDistance = distance;
            this.nearestName = name;
        }
    };

    /** Per-frame update with no allocations in the movement path. */
    public update(
        camera: THREE.Camera,
        _delta: number,
        isBoosting: boolean
    ): NavigationData {
        this.nearestCamera = camera;
        this.nearestDistance = Infinity;
        this.nearestName = "Space";
        sceneRegistry.forEachRegisteredObject(this.measureRegisteredObject);

        if (this.nearestDistance === Infinity) {
            this.nearestDistance = 100;
        }

        const preset = FREE_ROAM_SPEED_PRESETS[this.selectedPresetIndex];
        this.cachedData.selectedSpeed = preset.speed;
        this.cachedData.speedLabel = preset.label;
        this.cachedData.isBoosting = isBoosting;
        this.cachedData.effectiveSpeed =
            preset.speed * (isBoosting ? SHIFT_BOOST_MULTIPLIER : 1);
        this.cachedData.nearestObjectName = this.nearestName;
        this.cachedData.nearestDistance = this.nearestDistance;

        return this.cachedData;
    }

    public getNavigationData(): NavigationData {
        return this.cachedData;
    }

    public setSelectedSpeed(speed: number): void {
        const presetIndex = FREE_ROAM_SPEED_PRESETS.findIndex(
            (preset) => preset.speed === speed
        );
        if (presetIndex === -1) return;

        this.selectedPresetIndex = presetIndex;
        this.syncSelectedPreset();
    }
}

export const speedManager = new SpeedManager();
