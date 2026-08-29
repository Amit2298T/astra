import * as THREE from "three";

/**
 * SceneRegistry is a centralized, typed registry for 3D objects in the scene.
 * Components (e.g. Sun, planets, stars, exoplanets, and spacecraft) register here.
 * Systems like CameraController and SpeedManager can query objects dynamically.
 */
class SceneRegistryStore {
    private objects = new Map<string, THREE.Object3D>();

    public registerObject(name: string, object3D: THREE.Object3D): void {
        this.objects.set(name, object3D);
    }

    public unregisterObject(name: string, object3D: THREE.Object3D): void {
        if (this.objects.get(name) === object3D) {
            this.objects.delete(name);
        }
    }

    public getObject(name: string): THREE.Object3D | undefined {
        return this.objects.get(name);
    }

    public hasObject(name: string): boolean {
        return this.objects.has(name);
    }

    public getRegisteredNames(): readonly string[] {
        return Array.from(this.objects.keys());
    }

    public forEachRegisteredObject(
        callback: (object3D: THREE.Object3D, name: string) => void
    ): void {
        this.objects.forEach((object3D, name) => {
            callback(object3D, name);
        });
    }
}

export const sceneRegistry = new SceneRegistryStore();
