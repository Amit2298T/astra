import type { GalacticNavigationTarget } from "@/data/galaxy";
import type { ScenePosition } from "@/engine/scale/CoordinateTransformer";

export interface LocalNeighborhoodBounds {
    center: ScenePosition;
    radius: number;
    targets: readonly GalacticNavigationTarget[];
}

export function getLocalNeighborhoodTargets(
    targets: readonly GalacticNavigationTarget[]
): readonly GalacticNavigationTarget[] {
    return targets.filter(
        (target) =>
            target.id === "solar-system-galactic" ||
            target.starSystemId !== undefined
    );
}

export function calculateLocalNeighborhoodBounds(
    targets: readonly GalacticNavigationTarget[]
): LocalNeighborhoodBounds {
    const localTargets = getLocalNeighborhoodTargets(targets);
    if (localTargets.length === 0) {
        throw new Error("Local neighborhood requires at least one target");
    }

    const minimum = [Infinity, Infinity, Infinity];
    const maximum = [-Infinity, -Infinity, -Infinity];
    for (const target of localTargets) {
        target.position.forEach((value, axis) => {
            minimum[axis] = Math.min(minimum[axis], value);
            maximum[axis] = Math.max(maximum[axis], value);
        });
    }
    const center = minimum.map(
        (value, axis) => (value + maximum[axis]) / 2
    ) as unknown as ScenePosition;
    const radius = Math.max(
        ...localTargets.map((target) =>
            Math.hypot(
                target.position[0] - center[0],
                target.position[1] - center[1],
                target.position[2] - center[2]
            )
        )
    );
    return { center, radius, targets: localTargets };
}

export function getLocalNeighborhoodCameraDistance(
    radius: number,
    verticalFovDegrees: number,
    aspectRatio: number,
    padding = 1.28
): number {
    const verticalHalfFov = (verticalFovDegrees * Math.PI) / 360;
    const horizontalHalfFov = Math.atan(
        Math.tan(verticalHalfFov) * aspectRatio
    );
    const limitingHalfFov = Math.min(verticalHalfFov, horizontalHalfFov);
    return (radius * padding) / Math.tan(limitingHalfFov);
}
