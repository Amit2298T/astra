export interface BlackHoleFact {
    label: string;
    value: string;
}

export interface BlackHoleConfig {
    id: string;
    name: string;
    type: "blackHole";
    classification: string;
    mass: string;
    distanceFromEarth: string;
    location: string;
    description: string;
    eventHorizonRadiusVisual: number;
    accretionDiskRadius: number;
    navigationRadius: number;
    facts: readonly BlackHoleFact[];
}

export const sagittariusAStar: BlackHoleConfig = {
    id: "sagittarius-a-star",
    name: "Sagittarius A*",
    type: "blackHole",
    classification: "Supermassive black hole",
    mass: "About 4 million solar masses",
    distanceFromEarth: "About 26,000 light-years",
    location: "Center of the Milky Way",
    description:
        "Sagittarius A* is the relatively quiet supermassive black hole at the center of the Milky Way. This enhanced accretion environment is a scientifically inspired visualization for educational clarity, not a literal naked-eye view.",
    eventHorizonRadiusVisual: 2.6,
    accretionDiskRadius: 18,
    navigationRadius: 46,
    facts: [
        { label: "Mass", value: "~4 million Suns" },
        { label: "Location", value: "Milky Way center" },
        { label: "Distance", value: "~26,000 light-years" },
        { label: "Activity", value: "Relatively quiet" },
        { label: "Evidence", value: "Fast-orbiting stars and hot gas" },
        { label: "Observed", value: "EHT image released in 2022" },
    ],
};
