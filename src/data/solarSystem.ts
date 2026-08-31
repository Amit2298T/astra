/** Shared type for planet configuration in the solar system */
export interface PlanetConfig {
    name: string;
    radius: number;
    orbitRadius: number;
    orbitalPeriodDays: number;
    /** Positive sidereal period magnitude; axialTiltDeg encodes spin direction. */
    rotationPeriodHours: number;
    texturePath: string;
    initialAngle: number;
    axialTiltDeg: number;
    hasRings?: boolean;
    ringTexturePath?: string;
    ringInnerRadius?: number;
    ringOuterRadius?: number;
}

/** Configuration for a moon orbiting a planet */
export interface MoonConfig {
    name: string;
    radius: number;
    orbitRadius: number;
    averageDistanceKm: number;
    orbitalPeriodDays: number;
    rotationPeriodDays: number;
    inclinationDeg: number;
    texturePath: string;
    initialAngle: number;
}

export interface SolarSystemData {
    sun: {
        radius: number;
    };
    planets: PlanetConfig[];
    moons: Record<string, MoonConfig[]>;
}

export const solarSystemData: SolarSystemData = {
    sun: {
        radius: 1.5,
    },
    planets: [
        {
            name: "Mercury",
            radius: 0.18,
            orbitRadius: 3,
            orbitalPeriodDays: 87.969,
            rotationPeriodHours: 1407.5,
            texturePath: "/textures/mercury/mercury.jpg",
            initialAngle: Math.PI * 0.8,
            axialTiltDeg: 0.034,
        },
        {
            name: "Venus",
            radius: 0.34,
            orbitRadius: 4.5,
            orbitalPeriodDays: 224.701,
            rotationPeriodHours: 5832.5,
            texturePath: "/textures/venus/venus.jpg",
            initialAngle: Math.PI * 1.5,
            axialTiltDeg: 177.36,
        },
        {
            name: "Earth",
            radius: 0.35,
            orbitRadius: 6,
            orbitalPeriodDays: 365.256,
            rotationPeriodHours: 23.9345,
            texturePath: "/textures/earth/earth_daymap.jpg",
            initialAngle: 0,
            axialTiltDeg: 23.44,
        },
        {
            name: "Mars",
            radius: 0.28,
            orbitRadius: 8,
            orbitalPeriodDays: 686.98,
            rotationPeriodHours: 24.6229,
            texturePath: "/textures/mars/mars.jpg",
            initialAngle: Math.PI * 0.6,
            axialTiltDeg: 25.19,
        },
        {
            name: "Jupiter",
            radius: 0.75,
            orbitRadius: 12,
            orbitalPeriodDays: 4332.59,
            rotationPeriodHours: 9.925,
            texturePath: "/textures/jupiter/jupiter.jpg",
            initialAngle: Math.PI * 1.2,
            axialTiltDeg: 3.13,
        },
        {
            name: "Saturn",
            radius: 0.65,
            orbitRadius: 16,
            orbitalPeriodDays: 10759.22,
            rotationPeriodHours: 10.7,
            texturePath: "/textures/saturn/saturn.jpg",
            initialAngle: Math.PI * 0.3,
            axialTiltDeg: 26.73,
            hasRings: true,
            ringTexturePath: "/textures/saturn/saturn_ring.png",
            ringInnerRadius: 0.85,
            ringOuterRadius: 1.7,
        },
        {
            name: "Uranus",
            radius: 0.48,
            orbitRadius: 21,
            orbitalPeriodDays: 30688.5,
            rotationPeriodHours: 17.24,
            texturePath: "/textures/uranus/uranus.jpg",
            initialAngle: Math.PI * 0.9,
            axialTiltDeg: 97.77,
        },
        {
            name: "Neptune",
            radius: 0.46,
            orbitRadius: 26,
            orbitalPeriodDays: 60182,
            rotationPeriodHours: 16.11,
            texturePath: "/textures/neptune/neptune.jpg",
            initialAngle: Math.PI * 1.7,
            axialTiltDeg: 28.32,
        },
    ],
    moons: {
        Earth: [
            {
                name: "Moon",
                radius: 0.1,
                orbitRadius: 0.9,
                averageDistanceKm: 384400,
                orbitalPeriodDays: 27.3217,
                rotationPeriodDays: 27.3217,
                inclinationDeg: 5.145,
                texturePath: "/textures/moon/moon.jpg",
                initialAngle: 0,
            },
        ],
    },
};

/** Helper to look up a planet config by name */
export function getPlanetByName(name: string): PlanetConfig | undefined {
    return solarSystemData.planets.find((p) => p.name === name);
}
