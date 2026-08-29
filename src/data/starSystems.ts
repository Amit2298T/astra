/**
 * Star system, stellar, and exoplanet data configurations for ASTRA.
 */

export interface StarFact {
    label: string;
    value: string;
}

export interface StarConfig {
    id: string;
    name: string;
    systemName: string;
    spectralType: string;
    visualRadius: number;
    coreColor: string;
    glowColor: string;
    outerGlowColor: string;
    temperature: string;
    luminosity: string;
    mass: string;
    registryName: string;
    relativePosition: [number, number, number];
    navigationRadius: number;
    description: string;
    facts: StarFact[];
}

export interface ExoplanetConfig {
    id: string;
    name: string;
    systemName: string;
    parentStarName: string;
    radius: number;
    orbitRadius: number;
    orbitSpeed: number;
    rotationSpeed: number;
    color: string;
    texturePath?: string;
    initialAngle: number;
    registryName: string;
    navigationRadius: number;
    habitableZone: boolean;
    description: string;
    facts: StarFact[];
}

export interface StarSystemConfig {
    id: string;
    name: string;
    position: [number, number, number]; // 3D coordinates in ASTRA scene units
    distanceLightYears: string;
    label: string;
    description: string;
    stars: StarConfig[];
    exoplanets: ExoplanetConfig[];
}

export const starSystemsData: Record<string, StarSystemConfig> = {
    alphaCentauri: {
        id: "alpha-centauri",
        name: "Alpha Centauri System",
        // Positioned ~370 scene units away in deep interstellar space
        position: [280, 35, -240],
        distanceLightYears: "4.37 ly",
        label: "Alpha Centauri System",
        description:
            "The closest stellar system to Earth, consisting of a close binary pair of Sun-like stars (Alpha Centauri A & B) gravitationally bound with the outer red dwarf Proxima Centauri.",
        stars: [
            {
                id: "alpha-centauri-a",
                name: "Alpha Centauri A",
                systemName: "Alpha Centauri",
                spectralType: "G2V (Yellow Dwarf)",
                visualRadius: 1.65,
                coreColor: "#fffbe8",
                glowColor: "#ffd166",
                outerGlowColor: "#ff9f1c",
                temperature: "5,790 K",
                luminosity: "1.52 L☉",
                mass: "1.10 M☉",
                registryName: "Alpha Centauri A",
                // Position relative to system barycenter
                relativePosition: [-4.5, 0, 0],
                navigationRadius: 4.8,
                description:
                    "The primary star of the Alpha Centauri binary pair. A yellow-white G-type main sequence star slightly larger, more massive, and brighter than our Sun.",
                facts: [
                    { label: "Spectral Class", value: "G2V Main Sequence" },
                    { label: "Surface Temp", value: "5,790 K" },
                    { label: "Luminosity", value: "1.519 Solar" },
                    { label: "Mass", value: "1.10 Solar Masses" },
                    { label: "Constellation", value: "Centaurus" },
                ],
            },
            {
                id: "alpha-centauri-b",
                name: "Alpha Centauri B",
                systemName: "Alpha Centauri",
                spectralType: "K1V (Orange Dwarf)",
                visualRadius: 1.25,
                coreColor: "#ffe5b4",
                glowColor: "#ff9233",
                outerGlowColor: "#e65100",
                temperature: "5,260 K",
                luminosity: "0.50 L☉",
                mass: "0.91 M☉",
                registryName: "Alpha Centauri B",
                // Position relative to system barycenter (opposite A)
                relativePosition: [4.5, 0, 0],
                navigationRadius: 4.0,
                description:
                    "The companion star to Alpha Centauri A in the central binary. A cooler, orange-hued K-type main sequence star with roughly 90% of the Sun's mass.",
                facts: [
                    { label: "Spectral Class", value: "K1V Main Sequence" },
                    { label: "Surface Temp", value: "5,260 K" },
                    { label: "Luminosity", value: "0.500 Solar" },
                    { label: "Mass", value: "0.907 Solar Masses" },
                    { label: "Orbit Period", value: "79.91 Years" },
                ],
            },
            {
                id: "proxima-centauri",
                name: "Proxima Centauri",
                systemName: "Alpha Centauri",
                spectralType: "M5.5Ve (Red Dwarf)",
                visualRadius: 0.65,
                coreColor: "#ff7b7b",
                glowColor: "#ff3333",
                outerGlowColor: "#990000",
                temperature: "3,042 K",
                luminosity: "0.0017 L☉",
                mass: "0.122 M☉",
                registryName: "Proxima Centauri",
                // Visually separated within system group by 38 units
                relativePosition: [28, -6, 26],
                navigationRadius: 2.8,
                description:
                    "The closest known individual star to our Solar System at 4.246 light-years. A small, active low-mass red dwarf star hosting the habitable zone exoplanet Proxima b.",
                facts: [
                    { label: "Spectral Class", value: "M5.5Ve Flare Star" },
                    { label: "Distance", value: "4.246 Light-Years" },
                    { label: "Surface Temp", value: "3,042 K" },
                    { label: "Luminosity", value: "0.0017 Solar" },
                    { label: "Habitable Planets", value: "1 Confirmed (b)" },
                ],
            },
        ],
        exoplanets: [
            {
                id: "proxima-centauri-b",
                name: "Proxima Centauri b",
                systemName: "Alpha Centauri",
                parentStarName: "Proxima Centauri",
                radius: 0.32,
                orbitRadius: 2.4,
                orbitSpeed: 0.65,
                rotationSpeed: 0.4,
                color: "#6b7280", // rocky terrestrial appearance
                texturePath: "/textures/mars/mars.jpg", // fallback high quality rocky planet texture
                initialAngle: Math.PI * 0.4,
                registryName: "Proxima Centauri b",
                navigationRadius: 1.8,
                habitableZone: true,
                description:
                    "An Earth-mass terrestrial exoplanet orbiting within the circumstellar habitable zone of Proxima Centauri every 11.2 Earth days, making it the closest known exoplanet to Earth.",
                facts: [
                    { label: "Host Star", value: "Proxima Centauri" },
                    { label: "Orbital Period", value: "11.186 Days" },
                    { label: "Semi-Major Axis", value: "0.0485 AU" },
                    { label: "Minimum Mass", value: "1.07 Earths" },
                    { label: "Habitable Zone", value: "Optimistic HZ" },
                    { label: "Discovery", value: "2016 (ESO / HARPS)" },
                ],
            },
        ],
    },
};

export const sunStarConfig: StarConfig = {
    id: "sun",
    name: "Sun",
    systemName: "Solar System",
    spectralType: "G2V (Yellow Dwarf)",
    visualRadius: 1.5,
    coreColor: "#fff5c0",
    glowColor: "#ffb347",
    outerGlowColor: "#ff6600",
    temperature: "5,778 K",
    luminosity: "1.00 L☉",
    mass: "1.00 M☉",
    registryName: "Sun",
    relativePosition: [0, 0, 0],
    navigationRadius: 4.5,
    description:
        "The star at the heart of our Solar System, comprising 99.86% of the system's total mass and providing light and gravitational stability for all orbiting planets.",
    facts: [
        { label: "Spectral Class", value: "G2V Main Sequence" },
        { label: "Surface Temp", value: "5,778 K" },
        { label: "Luminosity", value: "1.00 Solar (3.828×10²⁶ W)" },
        { label: "Age", value: "4.6 Billion Years" },
        { label: "Composition", value: "73% H, 25% He, 2% Metals" },
    ],
};

export const starSystemsList: StarSystemConfig[] = Object.values(starSystemsData);

export function getStarSystemById(id: string): StarSystemConfig | undefined {
    return starSystemsData[id] ?? starSystemsList.find((s) => s.id === id);
}

export function getStarByName(name: string): StarConfig | undefined {
    if (name.toLowerCase() === "sun") {
        return sunStarConfig;
    }
    for (const system of starSystemsList) {
        const star = system.stars.find(
            (s) =>
                s.name.toLowerCase() === name.toLowerCase() ||
                s.registryName.toLowerCase() === name.toLowerCase()
        );
        if (star) return star;
    }
    return undefined;
}

export function getExoplanetByName(name: string): ExoplanetConfig | undefined {
    for (const system of starSystemsList) {
        const planet = system.exoplanets.find(
            (p) =>
                p.name.toLowerCase() === name.toLowerCase() ||
                p.registryName.toLowerCase() === name.toLowerCase()
        );
        if (planet) return planet;
    }
    return undefined;
}
