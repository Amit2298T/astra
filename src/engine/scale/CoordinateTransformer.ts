export type ScenePosition = readonly [number, number, number];

export const LOCAL_SCENE_SCALE = {
    layer: "local",
    typicalRadius: 400,
} as const;

export const GALACTIC_SCENE_SCALE = {
    layer: "galactic",
    milkyWayRadius: 1800,
    approximateRadiusLightYears: 50000,
} as const;

export function galacticPolarPosition(
    radius: number,
    angle: number,
    height = 0
): ScenePosition {
    return [Math.cos(angle) * radius, height, Math.sin(angle) * radius];
}

/**
 * Converts a real local separation into a deliberately tiny galactic offset.
 * This is for marker legibility only, not for rendering the local-space scene.
 */
export function nearbyGalacticPosition(
    origin: ScenePosition,
    offset: ScenePosition
): ScenePosition {
    return [
        origin[0] + offset[0],
        origin[1] + offset[1],
        origin[2] + offset[2],
    ];
}
