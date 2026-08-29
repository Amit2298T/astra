export type DwarfPlanetRegion =
    | "Main Asteroid Belt"
    | "Kuiper Belt"
    | "Scattered Disc";

export interface DwarfPlanetFact {
    label: string;
    value: string;
}

export interface DwarfPlanetConfig {
    id: string;
    name: string;
    classification: "Dwarf Planet";
    region: DwarfPlanetRegion;
    visualRadius: number;
    orbitRadius: number;
    orbitSpeed: number;
    rotationSpeed: number;
    initialAngle: number;
    axialTilt: number;
    inclination: number;
    eccentricity: number;
    longitudeOfAscendingNode: number;
    color: string;
    roughness: number;
    shapeScale: readonly [number, number, number];
    navigationRadius: number;
    diameter: string;
    orbitDescription: string;
    description: string;
    facts: readonly DwarfPlanetFact[];
}

export const dwarfPlanets: readonly DwarfPlanetConfig[] = [
    {
        id: "ceres",
        name: "Ceres",
        classification: "Dwarf Planet",
        region: "Main Asteroid Belt",
        visualRadius: 0.17,
        orbitRadius: 9.8,
        orbitSpeed: 0.13,
        rotationSpeed: 0.72,
        initialAngle: 0.45,
        axialTilt: 4,
        inclination: 10.6,
        eccentricity: 0.08,
        longitudeOfAscendingNode: 80,
        color: "#85827b",
        roughness: 0.94,
        shapeScale: [1, 0.97, 1],
        navigationRadius: 1.45,
        diameter: "About 940 km",
        orbitDescription: "About 2.8 AU from the Sun",
        description:
            "Ceres is the largest object in the main asteroid belt and the only dwarf planet in the inner Solar System.",
        facts: [
            { label: "Classification", value: "Dwarf Planet" },
            { label: "Region", value: "Main Asteroid Belt" },
            { label: "Approx. Diameter", value: "940 km" },
            { label: "Average Distance", value: "2.8 AU" },
        ],
    },
    {
        id: "pluto",
        name: "Pluto",
        classification: "Dwarf Planet",
        region: "Kuiper Belt",
        visualRadius: 0.22,
        orbitRadius: 34.5,
        orbitSpeed: 0.019,
        rotationSpeed: -0.09,
        initialAngle: 2.35,
        axialTilt: 57,
        inclination: 17.2,
        eccentricity: 0.25,
        longitudeOfAscendingNode: 110,
        color: "#b88b70",
        roughness: 0.86,
        shapeScale: [1, 0.98, 1],
        navigationRadius: 1.65,
        diameter: "About 2,377 km",
        orbitDescription: "Average distance about 39 AU",
        description:
            "Pluto is an icy dwarf planet in the Kuiper Belt with a distinctly elliptical and inclined orbit.",
        facts: [
            { label: "Classification", value: "Dwarf Planet" },
            { label: "Region", value: "Kuiper Belt" },
            { label: "Approx. Diameter", value: "2,377 km" },
            { label: "Average Distance", value: "39 AU" },
        ],
    },
    {
        id: "haumea",
        name: "Haumea",
        classification: "Dwarf Planet",
        region: "Kuiper Belt",
        visualRadius: 0.2,
        orbitRadius: 38.5,
        orbitSpeed: 0.016,
        rotationSpeed: 1.25,
        initialAngle: 4.7,
        axialTilt: 28,
        inclination: 28.2,
        eccentricity: 0.2,
        longitudeOfAscendingNode: 122,
        color: "#c8c5bd",
        roughness: 0.78,
        shapeScale: [1.55, 0.72, 0.86],
        navigationRadius: 1.7,
        diameter: "About 1,740 km equatorial",
        orbitDescription: "Average distance about 43 AU",
        description:
            "Haumea is a rapidly rotating Kuiper Belt dwarf planet whose fast spin stretches it into an elongated shape.",
        facts: [
            { label: "Classification", value: "Dwarf Planet" },
            { label: "Region", value: "Kuiper Belt" },
            { label: "Approx. Diameter", value: "1,740 km equatorial" },
            { label: "Rotation", value: "About 4 hours" },
        ],
    },
    {
        id: "makemake",
        name: "Makemake",
        classification: "Dwarf Planet",
        region: "Kuiper Belt",
        visualRadius: 0.19,
        orbitRadius: 42.5,
        orbitSpeed: 0.014,
        rotationSpeed: 0.25,
        initialAngle: 1.25,
        axialTilt: 29,
        inclination: 29,
        eccentricity: 0.16,
        longitudeOfAscendingNode: 80,
        color: "#a66f58",
        roughness: 0.9,
        shapeScale: [1, 0.94, 1],
        navigationRadius: 1.55,
        diameter: "About 1,434 km",
        orbitDescription: "Average distance about 46 AU",
        description:
            "Makemake is a bright, methane-rich trans-Neptunian dwarf planet orbiting in the Kuiper Belt.",
        facts: [
            { label: "Classification", value: "Dwarf Planet" },
            { label: "Region", value: "Kuiper Belt" },
            { label: "Approx. Diameter", value: "1,434 km" },
            { label: "Average Distance", value: "46 AU" },
        ],
    },
    {
        id: "eris",
        name: "Eris",
        classification: "Dwarf Planet",
        region: "Scattered Disc",
        visualRadius: 0.21,
        orbitRadius: 51,
        orbitSpeed: 0.01,
        rotationSpeed: 0.12,
        initialAngle: 3.55,
        axialTilt: 44,
        inclination: 44,
        eccentricity: 0.44,
        longitudeOfAscendingNode: 36,
        color: "#d2d0c8",
        roughness: 0.82,
        shapeScale: [1, 0.98, 1],
        navigationRadius: 1.7,
        diameter: "About 2,326 km",
        orbitDescription: "Average distance about 68 AU",
        description:
            "Eris is a distant, highly inclined dwarf planet whose orbit extends well beyond the main Kuiper Belt.",
        facts: [
            { label: "Classification", value: "Dwarf Planet" },
            { label: "Region", value: "Scattered Disc" },
            { label: "Approx. Diameter", value: "2,326 km" },
            { label: "Average Distance", value: "68 AU" },
        ],
    },
];

export function getDwarfPlanetByName(
    name: string
): DwarfPlanetConfig | undefined {
    return dwarfPlanets.find(
        (dwarfPlanet) => dwarfPlanet.name.toLowerCase() === name.toLowerCase()
    );
}
