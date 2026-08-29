/** Shared type for planet configuration in the solar system */
export interface PlanetConfig {
    name: string;
    radius: number;
    orbitRadius: number;
    orbitSpeed: number;
    rotationSpeed: number;
    texturePath: string;
    initialAngle: number;
    axialTilt?: number;
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
    orbitSpeed: number;
    rotationSpeed: number;
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
            orbitSpeed: 0.45,
            rotationSpeed: 0.02,
            texturePath: "/textures/mercury/mercury.jpg",
            initialAngle: Math.PI * 0.8,
            axialTilt: 0.03,
        },
        {
            name: "Venus",
            radius: 0.34,
            orbitRadius: 4.5,
            orbitSpeed: 0.35,
            rotationSpeed: -0.01, // retrograde rotation
            texturePath: "/textures/venus/venus.jpg",
            initialAngle: Math.PI * 1.5,
            axialTilt: 177.4, // nearly upside-down
        },
        {
            name: "Earth",
            radius: 0.35,
            orbitRadius: 6,
            orbitSpeed: 0.25,
            rotationSpeed: 0.5,
            texturePath: "/textures/earth/earth_daymap.jpg",
            initialAngle: 0,
            axialTilt: 23.4,
        },
        {
            name: "Mars",
            radius: 0.28,
            orbitRadius: 8,
            orbitSpeed: 0.18,
            rotationSpeed: 0.48,
            texturePath: "/textures/mars/mars.jpg",
            initialAngle: Math.PI * 0.6,
            axialTilt: 25.2,
        },
        {
            name: "Jupiter",
            radius: 0.75,
            orbitRadius: 12,
            orbitSpeed: 0.1,
            rotationSpeed: 1.2,
            texturePath: "/textures/jupiter/jupiter.jpg",
            initialAngle: Math.PI * 1.2,
            axialTilt: 3.1,
        },
        {
            name: "Saturn",
            radius: 0.65,
            orbitRadius: 16,
            orbitSpeed: 0.07,
            rotationSpeed: 1.0,
            texturePath: "/textures/saturn/saturn.jpg",
            initialAngle: Math.PI * 0.3,
            axialTilt: 26.7,
            hasRings: true,
            ringTexturePath: "/textures/saturn/saturn_ring.png",
            ringInnerRadius: 0.85,
            ringOuterRadius: 1.7,
        },
        {
            name: "Uranus",
            radius: 0.48,
            orbitRadius: 21,
            orbitSpeed: 0.045,
            rotationSpeed: -0.6, // retrograde
            texturePath: "/textures/uranus/uranus.jpg",
            initialAngle: Math.PI * 0.9,
            axialTilt: 97.8, // extreme sideways tilt
        },
        {
            name: "Neptune",
            radius: 0.46,
            orbitRadius: 26,
            orbitSpeed: 0.03,
            rotationSpeed: 0.55,
            texturePath: "/textures/neptune/neptune.jpg",
            initialAngle: Math.PI * 1.7,
            axialTilt: 28.3,
        },
    ],
    moons: {
        Earth: [
            {
                name: "Moon",
                radius: 0.1,
                orbitRadius: 0.9,
                orbitSpeed: 1.5,
                rotationSpeed: 0.1,
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