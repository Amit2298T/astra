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
    seed: number;
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
        basePointSize: 0.035,
        prominentPointSize: 0.075,
        opacity: 0.72,
        colors: ["#77736d", "#a29b91", "#625f5c"],
        seed: 0x4b1d5eed,
    },
    kuiperBelt: {
        id: "kuiper-belt",
        name: "Kuiper Belt",
        innerRadius: 29.5,
        outerRadius: 45.5,
        verticalThickness: 1.65,
        particleCount: 6000,
        prominentFraction: 0.045,
        basePointSize: 0.045,
        prominentPointSize: 0.09,
        opacity: 0.54,
        colors: ["#75818d", "#9aaab7", "#66727e"],
        seed: 0x7f4a7c15,
    },
} as const satisfies Record<string, SmallBodyRegionConfig>;
