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

/** Shared cinematic viewing direction for galaxy-scale focus destinations. */
export const GALACTIC_INSPECTION_DIRECTION: ScenePosition = [0.63, 0.38, 0.68];

export function galacticPolarPosition(
    radius: number,
    angle: number,
    height = 0
): ScenePosition {
    return [Math.cos(angle) * radius, height, Math.sin(angle) * radius];
}

/**
 * Converts heliocentric Galactic longitude, latitude, and distance into the
 * compressed Milky Way scene around a known Solar System anchor. Longitude
 * zero points from the Sun toward the Galactic Center; latitude controls the
 * small height above or below the disk. This is an educational placement,
 * not a precision astrometry pipeline.
 */
export function heliocentricGalacticPosition(
    solarSystemPosition: ScenePosition,
    distanceLightYears: number,
    longitudeDegrees: number,
    latitudeDegrees: number,
    solarGalactocentricDistanceLightYears = 27000
): ScenePosition {
    const solarRadius = Math.hypot(
        solarSystemPosition[0],
        solarSystemPosition[2]
    );
    const sceneDistance =
        distanceLightYears *
        (solarRadius / solarGalactocentricDistanceLightYears);
    const solarAngle = Math.atan2(
        solarSystemPosition[2],
        solarSystemPosition[0]
    );
    const longitude = (longitudeDegrees * Math.PI) / 180;
    const latitude = (latitudeDegrees * Math.PI) / 180;
    const directionAngle = solarAngle + Math.PI + longitude;
    const planarDistance = sceneDistance * Math.cos(latitude);

    return [
        solarSystemPosition[0] +
            Math.cos(directionAngle) * planarDistance,
        solarSystemPosition[1] + Math.sin(latitude) * sceneDistance,
        solarSystemPosition[2] +
            Math.sin(directionAngle) * planarDistance,
    ];
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

/** Uniform visual magnification for sub-pixel nearby-star offsets. */
export const NEARBY_STAR_DISPLAY_MAGNIFICATION = 600;

export function magnifyNearbyGalacticOffset(
    solarSystemPosition: ScenePosition,
    scientificPosition: ScenePosition,
    magnification = NEARBY_STAR_DISPLAY_MAGNIFICATION
): ScenePosition {
    return [
        solarSystemPosition[0] + (scientificPosition[0] - solarSystemPosition[0]) * magnification,
        solarSystemPosition[1] + (scientificPosition[1] - solarSystemPosition[1]) * magnification,
        solarSystemPosition[2] + (scientificPosition[2] - solarSystemPosition[2]) * magnification,
    ];
}
