import * as THREE from "three";

const forwardVec = new THREE.Vector3();
const rightVec = new THREE.Vector3();
const moveVec = new THREE.Vector3();
const euler = new THREE.Euler(0, 0, 0, "YXZ");
const movementKeys = new Set([
    "KeyW",
    "KeyA",
    "KeyS",
    "KeyD",
    "Space",
    "ControlLeft",
    "ControlRight",
    "ShiftLeft",
    "ShiftRight",
]);

type PointerLockState = "inactive" | "locked" | "unlockedAwaitingGesture";

/**
 * FreeFlightInput manages WASD + Space/Ctrl + Shift movement
 * and smooth mouse-look pitching/yawing without gimbal lock.
 * 0 GC allocations inside frame updates.
 */
export class FreeFlightInput {
    private keys = new Set<string>();
    private pitch = 0;
    private yaw = 0;
    private sensitivity = 0.002;
    private isLocked = false;
    private lockState: PointerLockState = "inactive";
    private requestPending = false;
    private active = false;
    private targetElement: HTMLElement | null = null;
    private onLockChangeCallback?: (isLocked: boolean) => void;

    public setOnLockChange(cb: (isLocked: boolean) => void) {
        this.onLockChangeCallback = cb;
    }

    private setLockState(state: PointerLockState): void {
        this.lockState = state;
        this.isLocked = state === "locked";
        this.onLockChangeCallback?.(this.isLocked);
    }

    public activate(element: HTMLElement, camera: THREE.Camera) {
        this.targetElement = element;
        this.active = true;
        this.requestPending = false;
        this.setLockState(
            document.pointerLockElement === element
                ? "locked"
                : "unlockedAwaitingGesture"
        );

        // Sync initial pitch & yaw from current camera orientation
        euler.setFromQuaternion(camera.quaternion, "YXZ");
        this.pitch = euler.x;
        this.yaw = euler.y;

        window.addEventListener("keydown", this.handleKeyDown);
        window.addEventListener("keyup", this.handleKeyUp);
        window.addEventListener("blur", this.handleWindowBlur);
        window.addEventListener("mousemove", this.handleMouseMove);
        document.addEventListener(
            "pointerlockchange",
            this.handlePointerLockChange
        );
        document.addEventListener("pointerlockerror", this.handlePointerLockError);
    }

    public deactivate() {
        this.active = false;
        this.keys.clear();
        this.requestPending = false;
        if (
            typeof document !== "undefined" &&
            document.pointerLockElement === this.targetElement
        ) {
            try {
                document.exitPointerLock();
            } catch {
                // The browser already released ownership; no recovery is needed.
            }
        }
        window.removeEventListener("keydown", this.handleKeyDown);
        window.removeEventListener("keyup", this.handleKeyUp);
        window.removeEventListener("blur", this.handleWindowBlur);
        window.removeEventListener("mousemove", this.handleMouseMove);
        document.removeEventListener(
            "pointerlockchange",
            this.handlePointerLockChange
        );
        document.removeEventListener(
            "pointerlockerror",
            this.handlePointerLockError
        );
        this.targetElement = null;
        this.setLockState("inactive");
    }

    public async requestLock(): Promise<boolean> {
        const targetElement = this.targetElement;
        if (
            !this.active ||
            !targetElement ||
            this.requestPending ||
            document.pointerLockElement === targetElement ||
            document.pointerLockElement !== null
        ) {
            return false;
        }

        this.requestPending = true;

        try {
            const result = targetElement.requestPointerLock() as
                | void
                | Promise<void>;

            if (result && typeof result.then === "function") {
                await result;
                this.requestPending = false;
            }

            return true;
        } catch (error) {
            this.requestPending = false;
            this.setLockState("unlockedAwaitingGesture");

            const isExpectedRejection =
                error instanceof DOMException &&
                (error.name === "SecurityError" ||
                    error.name === "NotAllowedError" ||
                    error.name === "AbortError");

            if (
                process.env.NODE_ENV === "development" &&
                !isExpectedRejection
            ) {
                console.warn(
                    "[FreeFlightInput] Unexpected pointer lock failure.",
                    error
                );
            }

            return false;
        }
    }

    private handleKeyDown = (e: KeyboardEvent) => {
        if (
            !this.active ||
            !movementKeys.has(e.code) ||
            (e.target instanceof HTMLElement &&
                e.target.matches(
                    "input, textarea, select, [contenteditable='true']"
                ))
        ) {
            return;
        }

        e.preventDefault();
        this.keys.add(e.code);
    };

    private handleKeyUp = (e: KeyboardEvent) => {
        if (!this.active || !movementKeys.has(e.code)) return;
        e.preventDefault();
        this.keys.delete(e.code);
    };

    private handleWindowBlur = () => {
        this.keys.clear();
    };

    private handleMouseMove = (e: MouseEvent) => {
        if (!this.active || !this.isLocked) return;

        this.yaw -= e.movementX * this.sensitivity;
        this.pitch -= e.movementY * this.sensitivity;

        // Clamp pitch to avoid flipping upside down (-88° to +88°)
        const maxPitch = Math.PI / 2 - 0.03;
        this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));
    };

    private handlePointerLockChange = () => {
        this.requestPending = false;
        this.setLockState(
            this.active && document.pointerLockElement === this.targetElement
                ? "locked"
                : this.active
                  ? "unlockedAwaitingGesture"
                  : "inactive"
        );
    };

    private handlePointerLockError = () => {
        this.requestPending = false;
        this.setLockState(
            this.active ? "unlockedAwaitingGesture" : "inactive"
        );
    };

    public isShiftPressed(): boolean {
        return this.keys.has("ShiftLeft") || this.keys.has("ShiftRight");
    }

    public update(
        camera: THREE.Camera,
        delta: number,
        effectiveSpeed: number
    ): { isBoosting: boolean; isMoving: boolean } {
        if (!this.active) return { isBoosting: false, isMoving: false };

        // 1. Update Camera Rotation (YXZ order prevents roll)
        if (this.isLocked) {
            euler.set(this.pitch, this.yaw, 0, "YXZ");
            camera.quaternion.setFromEuler(euler);
        }

        // 2. Movement direction relative to camera facing
        const isBoosting = this.isShiftPressed();
        const dist = effectiveSpeed * delta;

        moveVec.set(0, 0, 0);

        // Vector facing forward
        camera.getWorldDirection(forwardVec);
        rightVec.crossVectors(forwardVec, camera.up).normalize();

        if (this.keys.has("KeyW")) moveVec.addScaledVector(forwardVec, dist);
        if (this.keys.has("KeyS")) moveVec.addScaledVector(forwardVec, -dist);
        if (this.keys.has("KeyD")) moveVec.addScaledVector(rightVec, dist);
        if (this.keys.has("KeyA")) moveVec.addScaledVector(rightVec, -dist);
        if (this.keys.has("Space")) moveVec.y += dist;
        if (this.keys.has("ControlLeft") || this.keys.has("ControlRight"))
            moveVec.y -= dist;

        const isMoving = moveVec.lengthSq() > 0;
        if (isMoving) {
            moveVec.normalize().multiplyScalar(dist);
            camera.position.add(moveVec);
        }

        return { isBoosting, isMoving };
    }

    public getIsLocked(): boolean {
        return this.isLocked;
    }
}

export const freeFlightInput = new FreeFlightInput();
