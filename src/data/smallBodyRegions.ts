export interface SmallBodyRegionConfig {
    id: string;
    name: string;
    innerRadius: number;
    outerRadius: number;
    verticalThickness: number;
    particleCount: number;
    prominentFraction: number;
    basePointSize: number;
    prominentPointSize: number;
    opacity: number;
    colors: readonly [string, string, string];
    particleColors: readonly [string, string, string];
    seed: number;
    instanceCounts: Readonly<Record<"high" | "medium" | "low", number>>;
    minInstanceScale: number;
    maxInstanceScale: number;
    sizeDistributionPower: number;
    maxEccentricity: number;
    maxInclinationDegrees: number;
    instanceOpacity: number;
    instanceFadeNear: number;
    instanceFadeFar: number;
    visualizationNote: string;
}

export const smallBodyRegions = {
    asteroidBelt: {
        id: "main-asteroid-belt",
        name: "Main Asteroid Belt",
        innerRadius: 8.8,
        outerRadius: 11.1,
        verticalThickness: 0.38,
        particleCount: 3800,
        prominentFraction: 0.065,
        basePointSize: 0.026,
        prominentPointSize: 0.075,
        opacity: 0.58,
        colors: ["#77736d", "#a29b91", "#625f5c"],
        particleColors: ["#5f5b56", "#716b63", "#4d4b48"],
        seed: 0x4b1d5eed,
        instanceCounts: { high: 1000, medium: 640, low: 320 },
        minInstanceScale: 0.014,
        maxInstanceScale: 0.064,
        sizeDistributionPower: 10,
        maxEccentricity: 0.12,
        maxInclinationDegrees: 8,
        instanceOpacity: 0.9,
        instanceFadeNear: 4,
        instanceFadeFar: 16,
        visualizationNote:
            "Individual bodies are procedurally sampled for visualization; population, sizes and spacing are compressed for readability.",
    },
    kuiperBelt: {
        id: "kuiper-belt",
        name: "Kuiper Belt",
        innerRadius: 29.5,
        outerRadius: 45.5,
        verticalThickness: 1.65,
        particleCount: 6000,
        prominentFraction: 0.045,
        basePointSize: 0.032,
        prominentPointSize: 0.09,
        opacity: 0.44,
        colors: ["#75818d", "#9aaab7", "#66727e"],
        particleColors: ["#596671", "#71808c", "#4e5b66"],
        seed: 0x7f4a7c15,
        instanceCounts: { high: 1200, medium: 720, low: 340 },
        minInstanceScale: 0.012,
        maxInstanceScale: 0.052,
        sizeDistributionPower: 11,
        maxEccentricity: 0.24,
        maxInclinationDegrees: 22,
        instanceOpacity: 0.86,
        instanceFadeNear: 6,
        instanceFadeFar: 22,
        visualizationNote:
            "Individual bodies are procedurally sampled for visualization; population, sizes and spacing are compressed for readability.",
    },
} as const satisfies Record<string, SmallBodyRegionConfig>;
