import type { SelectedObject } from "@/engine/camera/types";
import {
    getStarSystemByEntryId,
    getStarSystemRegistryName,
    type StarSystemEntryId,
} from "@/data/starSystems";

export type LocalDestination =
    | { kind: "solar-system" }
    | { kind: "star-system"; systemId: StarSystemEntryId };

export interface LocalDestinationArrival {
    activeStarSystemId: StarSystemEntryId | null;
    activeOrbitTarget: string;
    selectedObject: SelectedObject | null;
}

export function getDestinationStarSystemId(
    destination: LocalDestination
): StarSystemEntryId | null {
    return destination.kind === "star-system" ? destination.systemId : null;
}

export function resolveLocalDestinationArrival(
    destination: LocalDestination
): LocalDestinationArrival {
    if (destination.kind === "solar-system") {
        return {
            activeStarSystemId: null,
            activeOrbitTarget: "Sun",
            selectedObject: null,
        };
    }

    const system = getStarSystemByEntryId(destination.systemId);
    if (!system) {
        throw new Error(`Unknown local star-system destination: ${destination.systemId}`);
    }

    const primary = system.stars[0];
    return {
        activeStarSystemId: destination.systemId,
        activeOrbitTarget: getStarSystemRegistryName(destination.systemId),
        selectedObject: {
            id: primary.id,
            name: primary.name,
            type: "star",
        },
    };
}
