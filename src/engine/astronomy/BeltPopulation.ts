import type { SmallBodyRegionConfig } from "@/data/smallBodyRegions";
import { createSeededRandom, randomNormal } from "@/engine/math/seededRandom";
import type { PerformanceTier } from "@/engine/performance/PerformanceTier";

export const BELT_SHAPE_COUNT = 3;

export interface BeltInstanceData {
    position: readonly [number, number, number];
    scale: number;
    rotation: readonly [number, number, number];
    color: readonly [number, number, number];
    shapeIndex: number;
    orbitalRadius: number;
    eccentricity: number;
    inclination: number;
    phase: number;
}

const TWO_PI = Math.PI * 2;
const instancePopulationCache = new Map<string, readonly BeltInstanceData[]>();

function clamp(value: number, minimum: number, maximum: number): number {
    return Math.min(maximum, Math.max(minimum, value));
}

function parseHexColor(hex: string): readonly [number, number, number] {
    const value = Number.parseInt(hex.slice(1), 16);
    return [
        ((value >> 16) & 255) / 255,
        ((value >> 8) & 255) / 255,
        (value & 255) / 255,
    ];
}

export function getBeltInstanceCount(
    config: SmallBodyRegionConfig,
    tier: PerformanceTier
): number {
    return config.instanceCounts[tier];
}

export function createBeltInstancePopulation(
    config: SmallBodyRegionConfig,
    tier: PerformanceTier,
    seed = config.seed ^ 0x51f15e5d
): readonly BeltInstanceData[] {
    const count = getBeltInstanceCount(config, tier);
    const random = createSeededRandom(seed);
    const radialRange = config.outerRadius - config.innerRadius;
    const palette = config.colors.map(parseHexColor);
    const instances: BeltInstanceData[] = [];

    for (let index = 0; index < count; index += 1) {
        const phase = random() * TWO_PI;
        const longitudeOfPeriapsis = random() * TWO_PI;
        const eccentricity = Math.pow(random(), 1.8) * config.maxEccentricity;
        const baseRadialPosition = Math.pow(random(), 0.94);
        const eccentricOffset =
            Math.cos(phase - longitudeOfPeriapsis) * eccentricity * 0.34;
        const radialPosition = clamp(baseRadialPosition + eccentricOffset, 0, 1);
        const orbitalRadius = config.innerRadius + radialPosition * radialRange;
        const inclination =
            (random() * 2 - 1) *
            (config.maxInclinationDegrees * Math.PI) /
            180;
        const verticalEnvelope =
            config.verticalThickness * (0.38 + radialPosition * 0.62);
        const inclinedOffset =
            Math.sin(phase + longitudeOfPeriapsis) *
            Math.sin(inclination) *
            verticalEnvelope *
            2.4;
        const verticalNoise = randomNormal(random) * verticalEnvelope * 0.26;
        const scale =
            config.minInstanceScale +
            (config.maxInstanceScale - config.minInstanceScale) *
                Math.pow(random(), config.sizeDistributionPower);
        const baseColor = palette[Math.floor(random() * palette.length)];
        const brightness = 0.76 + random() * 0.25;

        instances.push({
            position: [
                Math.cos(phase) * orbitalRadius,
                inclinedOffset + verticalNoise,
                Math.sin(phase) * orbitalRadius,
            ],
            scale,
            rotation: [random() * TWO_PI, random() * TWO_PI, random() * TWO_PI],
            color: [
                clamp(baseColor[0] * brightness, 0, 1),
                clamp(baseColor[1] * brightness, 0, 1),
                clamp(baseColor[2] * brightness, 0, 1),
            ],
            shapeIndex: index % BELT_SHAPE_COUNT,
            orbitalRadius,
            eccentricity,
            inclination,
            phase,
        });
    }

    return instances;
}

export function getCachedBeltInstancePopulation(
    config: SmallBodyRegionConfig,
    tier: PerformanceTier
): readonly BeltInstanceData[] {
    const cacheKey = `${config.id}:${tier}`;
    const cached = instancePopulationCache.get(cacheKey);
    if (cached) return cached;

    const population = createBeltInstancePopulation(config, tier);
    instancePopulationCache.set(cacheKey, population);
    return population;
}
