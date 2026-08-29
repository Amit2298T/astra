import * as THREE from "three";

import {
    milkyWayConfig,
    type GalacticNavigationTarget,
} from "@/data/galaxy";

class GalacticRegistryStore {
    private readonly targetsById = new Map<
        string,
        GalacticNavigationTarget
    >();
    private readonly targetsByName = new Map<
        string,
        GalacticNavigationTarget
    >();

    public constructor(targets: readonly GalacticNavigationTarget[]) {
        targets.forEach((target) => {
            this.targetsById.set(target.id, target);
            this.targetsByName.set(target.navigationName.toLowerCase(), target);
        });
    }

    public getById(id: string): GalacticNavigationTarget | undefined {
        return this.targetsById.get(id);
    }

    public getByName(name: string): GalacticNavigationTarget | undefined {
        return this.targetsByName.get(name.toLowerCase());
    }

    public getPosition(
        target: GalacticNavigationTarget,
        destination: THREE.Vector3
    ): THREE.Vector3 {
        return destination.set(...target.position);
    }

    public getVisibleTargets(): readonly GalacticNavigationTarget[] {
        return milkyWayConfig.locations.filter((target) => target.markerVisible);
    }
}

export const galacticRegistry = new GalacticRegistryStore(
    milkyWayConfig.locations
);
