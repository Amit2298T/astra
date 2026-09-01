import { createSeededRandom } from "@/engine/math/seededRandom";
import type { PerformanceTier } from "@/engine/performance/PerformanceTier";

export const MOON_TERRAIN_SEED = 0x6d6f6f6e;
export const MOON_TERRAIN_SIZE = 900;
export const MOON_EXPLORE_RADIUS = 340;
export const MOON_LANDING_SAFE_RADIUS = 42;
export const MOON_SURFACE_EYE_HEIGHT = 1.7;

export interface MoonSurfaceProfile {
    terrainResolution: number;
    rockCount: number;
    starCount: number;
    shadowsEnabled: boolean;
    rockShadows: boolean;
    shadowMapSize: number;
    shadowExtent: number;
}

export const MOON_SURFACE_PROFILES: Readonly<
    Record<PerformanceTier, MoonSurfaceProfile>
> = {
    high: {
        terrainResolution: 193,
        rockCount: 720,
        starCount: 900,
        shadowsEnabled: true,
        rockShadows: true,
        shadowMapSize: 2048,
        shadowExtent: 180,
    },
    medium: {
        terrainResolution: 129,
        rockCount: 440,
        starCount: 600,
        shadowsEnabled: true,
        rockShadows: false,
        shadowMapSize: 1024,
        shadowExtent: 110,
    },
    low: {
        terrainResolution: 97,
        rockCount: 220,
        starCount: 360,
        shadowsEnabled: false,
        rockShadows: false,
        shadowMapSize: 0,
        shadowExtent: 0,
    },
};

export interface MoonCrater {
    x: number;
    z: number;
    radius: number;
    depth: number;
    rimHeight: number;
    landmark?: boolean;
}

export interface MoonTerrainGrid {
    resolution: number;
    heights: Float32Array;
}

export interface MoonRockPlacement {
    position: readonly [number, number, number];
    rotation: readonly [number, number, number];
    scale: number;
    shapeIndex: number;
    shade: number;
}

const craterCache = new Map<number, readonly MoonCrater[]>();
const terrainGridCache = new Map<string, MoonTerrainGrid>();
const rockPlacementCache = new Map<PerformanceTier, readonly MoonRockPlacement[]>();

function clamp(value: number, minimum: number, maximum: number): number {
    return Math.max(minimum, Math.min(maximum, value));
}

function smoothstep(edge0: number, edge1: number, value: number): number {
    const normalized = clamp((value - edge0) / (edge1 - edge0), 0, 1);
    return normalized * normalized * (3 - 2 * normalized);
}

function hashNoise(x: number, z: number, seed: number): number {
    let hash = Math.imul(x, 374761393) ^ Math.imul(z, 668265263) ^ seed;
    hash = Math.imul(hash ^ (hash >>> 13), 1274126177);
    hash ^= hash >>> 16;
    return (hash >>> 0) / 0xffffffff;
}

function valueNoise(x: number, z: number, scale: number, seed: number): number {
    const scaledX = x / scale;
    const scaledZ = z / scale;
    const x0 = Math.floor(scaledX);
    const z0 = Math.floor(scaledZ);
    const fractionX = scaledX - x0;
    const fractionZ = scaledZ - z0;
    const blendX = fractionX * fractionX * (3 - 2 * fractionX);
    const blendZ = fractionZ * fractionZ * (3 - 2 * fractionZ);
    const lower =
        hashNoise(x0, z0, seed) * (1 - blendX) +
        hashNoise(x0 + 1, z0, seed) * blendX;
    const upper =
        hashNoise(x0, z0 + 1, seed) * (1 - blendX) +
        hashNoise(x0 + 1, z0 + 1, seed) * blendX;
    return (lower * (1 - blendZ) + upper * blendZ) * 2 - 1;
}

export function createMoonCraters(
    seed = MOON_TERRAIN_SEED
): readonly MoonCrater[] {
    const random = createSeededRandom(seed ^ 0x43726174);
    const craters: MoonCrater[] = [
        {
            x: 82,
            z: -64,
            radius: 42,
            depth: 7,
            rimHeight: 3,
            landmark: true,
        },
    ];
    const halfSize = MOON_TERRAIN_SIZE * 0.5;

    for (let index = 0; index < 22; index += 1) {
        const radius =
            index < 2
                ? 48 + random() * 20
                : index < 8
                  ? 18 + random() * 14
                  : 6 + random() * 8;
        const placementLimit = halfSize - radius * 1.45 - 18;
        let x = 0;
        let z = 0;
        let attempts = 0;

        do {
            x = (random() * 2 - 1) * placementLimit;
            z = (random() * 2 - 1) * placementLimit;
            attempts += 1;
        } while (
            Math.hypot(x, z) <
                MOON_LANDING_SAFE_RADIUS + radius * 1.45 + 18 &&
            attempts < 80
        );

        craters.push({
            x,
            z,
            radius,
            depth:
                radius *
                (index < 2
                    ? 0.075 + random() * 0.035
                    : 0.105 + random() * 0.055),
            rimHeight: radius * (0.035 + random() * 0.027),
        });
    }

    return craters;
}

export function getMoonCraters(
    seed = MOON_TERRAIN_SEED
): readonly MoonCrater[] {
    const cached = craterCache.get(seed);
    if (cached) return cached;
    const craters = createMoonCraters(seed);
    craterCache.set(seed, craters);
    return craters;
}

export function getMoonTerrainHeight(
    x: number,
    z: number,
    seed = MOON_TERRAIN_SEED
): number {
    const distanceFromLanding = Math.hypot(x, z);
    const terrainBlend = smoothstep(
        MOON_LANDING_SAFE_RADIUS * 0.72,
        MOON_LANDING_SAFE_RADIUS * 2.35,
        distanceFromLanding
    );
    const closeDetailBlend = smoothstep(
        MOON_LANDING_SAFE_RADIUS * 0.2,
        MOON_LANDING_SAFE_RADIUS * 1.15,
        distanceFromLanding
    );
    const ridgeNoise =
        1 - Math.abs(valueNoise(x, z, 92, seed ^ 0x5c17a2e9));
    let height =
        (valueNoise(x, z, 178, seed ^ 0x11a9b37d) * 7.2 +
            valueNoise(x, z, 61, seed ^ 0x7c2e4a61) * 2.65 +
            valueNoise(x, z, 21, seed ^ 0x2f85c6d3) * 0.72 +
            (Math.pow(ridgeNoise, 3.2) - 0.32) * 2.1) *
            terrainBlend +
        valueNoise(x, z, 9, seed ^ 0x6a09e667) * 0.18 * closeDetailBlend;

    for (const crater of getMoonCraters(seed)) {
        const distance = Math.hypot(x - crater.x, z - crater.z);
        const normalized = distance / crater.radius;
        if (normalized > 1.42) continue;

        if (normalized < 1) {
            const bowl = 1 - normalized * normalized;
            height -= crater.depth * Math.pow(bowl, 1.55);
        }

        const rimDistance = (normalized - 1) / 0.13;
        height += crater.rimHeight * Math.exp(-(rimDistance * rimDistance));
        if (normalized >= 1) {
            const ejecta = 1 - smoothstep(1.05, 1.42, normalized);
            height += crater.rimHeight * 0.14 * ejecta;
        }
    }

    const horizonCurve = smoothstep(
        MOON_EXPLORE_RADIUS + 16,
        MOON_TERRAIN_SIZE * 0.62,
        distanceFromLanding
    );
    height -= horizonCurve * horizonCurve * 16;

    return height;
}

export function createMoonTerrainGrid(
    resolution: number,
    seed = MOON_TERRAIN_SEED
): MoonTerrainGrid {
    const heights = new Float32Array(resolution * resolution);
    const spacing = MOON_TERRAIN_SIZE / (resolution - 1);
    const halfSize = MOON_TERRAIN_SIZE * 0.5;

    for (let row = 0; row < resolution; row += 1) {
        const z = row * spacing - halfSize;
        for (let column = 0; column < resolution; column += 1) {
            const x = column * spacing - halfSize;
            heights[row * resolution + column] = getMoonTerrainHeight(x, z, seed);
        }
    }

    return { resolution, heights };
}

export function getCachedMoonTerrainGrid(
    resolution: number,
    seed = MOON_TERRAIN_SEED
): MoonTerrainGrid {
    const cacheKey = `${seed}:${resolution}`;
    const cached = terrainGridCache.get(cacheKey);
    if (cached) return cached;
    const grid = createMoonTerrainGrid(resolution, seed);
    terrainGridCache.set(cacheKey, grid);
    return grid;
}

export function createMoonRockPlacements(
    tier: PerformanceTier,
    seed = MOON_TERRAIN_SEED
): readonly MoonRockPlacement[] {
    const count = MOON_SURFACE_PROFILES[tier].rockCount;
    const random = createSeededRandom(seed ^ 0x526f636b ^ count);
    const placements: MoonRockPlacement[] = [];
    const clusterCraters = getMoonCraters(seed).filter(
        (crater) => crater.radius >= 14
    );

    while (placements.length < count) {
        let x: number;
        let z: number;
        if (random() < 0.34) {
            const crater =
                clusterCraters[
                    Math.floor(random() * clusterCraters.length)
                ];
            const angle = random() * Math.PI * 2;
            const rimDistance = crater.radius * (0.88 + random() * 0.48);
            x = crater.x + Math.cos(angle) * rimDistance;
            z = crater.z + Math.sin(angle) * rimDistance;
        } else {
            const angle = random() * Math.PI * 2;
            const radius = Math.sqrt(random()) * (MOON_EXPLORE_RADIUS - 8);
            x = Math.cos(angle) * radius;
            z = Math.sin(angle) * radius;
        }
        if (Math.hypot(x, z) > MOON_EXPLORE_RADIUS - 8) continue;
        if (Math.hypot(x, z) < MOON_LANDING_SAFE_RADIUS + 14) continue;

        const scale = 0.14 + Math.pow(random(), 7.8) * 2.5;
        placements.push({
            position: [x, getMoonTerrainHeight(x, z, seed) + scale * 0.32, z],
            rotation: [
                random() * Math.PI,
                random() * Math.PI * 2,
                random() * Math.PI,
            ],
            scale,
            shapeIndex: placements.length % 3,
            shade: 0.54 + random() * 0.25,
        });
    }

    return placements;
}

export function getCachedMoonRockPlacements(
    tier: PerformanceTier
): readonly MoonRockPlacement[] {
    const cached = rockPlacementCache.get(tier);
    if (cached) return cached;
    const placements = createMoonRockPlacements(tier);
    rockPlacementCache.set(tier, placements);
    return placements;
}
