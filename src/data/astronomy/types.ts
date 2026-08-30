export type AstronomyObjectType =
    | "planet"
    | "moon"
    | "dwarfPlanet"
    | "star"
    | "spacecraft"
    | "exoplanet"
    | "blackHole"
    | "nebula"
    | "starCluster"
    | "galacticRegion";

export type AstronomyFactCategory =
    | "Physical"
    | "Orbit"
    | "Environment"
    | "Discovery"
    | "Mission"
    | "Observation"
    | "Context";

export interface SourceReference {
    label: string;
    organization: string;
    url: string;
    accessedAt?: string;
}

export interface AstronomyFact {
    label: string;
    value: string;
}

export interface AstronomyFactGroup {
    category: AstronomyFactCategory;
    facts: readonly AstronomyFact[];
}

export interface AstronomyRecord {
    id: string;
    name: string;
    objectType: AstronomyObjectType;
    classification: string;
    summary: string;
    factGroups: readonly AstronomyFactGroup[];
    sources: readonly SourceReference[];
}
