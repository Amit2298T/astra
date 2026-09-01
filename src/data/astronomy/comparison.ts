import { astronomyRecords, type AstronomyObjectId } from "./index";
import { astronomySources } from "./sources";
import type { AstronomyObjectType, SourceReference } from "./types";
import type { ExplorerEntryTarget } from "@/engine/navigation/ExplorerEntry";

export type ComparisonMetricId =
    | "diameter"
    | "mass"
    | "surfaceGravity"
    | "temperature"
    | "orbitalDistance"
    | "orbitalPeriod"
    | "distanceFromEarth"
    | "physicalExtent"
    | "missionDistance";

export type ComparisonVisualKind =
    | "rocky"
    | "earth"
    | "gasGiant"
    | "iceGiant"
    | "dwarfPlanet"
    | "moon"
    | "star"
    | "redDwarf"
    | "exoplanet"
    | "blackHole"
    | "nebula"
    | "cluster"
    | "spacecraft"
    | "galaxy";

export interface ComparableValue {
    value: number;
    unit: "km" | "kg" | "m/s²" | "K" | "AU" | "days" | "ly";
    displayValue: string;
    qualifier?: string;
}

export interface ComparisonMetric {
    id: ComparisonMetricId;
    label: string;
    category: "Physical" | "Orbit" | "Environment" | "Distance" | "Mission";
    visual: "diameter" | "bar" | "thermal" | "distance";
}

export interface ComparisonObject {
    id: string;
    astronomyRecordId?: AstronomyObjectId;
    name: string;
    category: string;
    objectType: AstronomyObjectType | "galaxy";
    summary: string;
    visualKind: ComparisonVisualKind;
    values: Partial<Record<ComparisonMetricId, ComparableValue>>;
    sources: readonly SourceReference[];
    explorerTarget?: ExplorerEntryTarget;
}

interface ComparisonDefinition {
    astronomyRecordId: AstronomyObjectId;
    visualKind: ComparisonVisualKind;
    values: Partial<Record<ComparisonMetricId, ComparableValue>>;
    explorerTarget?: ExplorerEntryTarget;
}

const EARTH_MASS_KG = 5.9722e24;
const SOLAR_MASS_KG = 1.9885e30;

const value = (
    numericValue: number,
    unit: ComparableValue["unit"],
    displayValue: string,
    qualifier?: string
): ComparableValue => ({ value: numericValue, unit, displayValue, qualifier });

export const comparisonMetrics: readonly ComparisonMetric[] = [
    { id: "diameter", label: "Diameter", category: "Physical", visual: "diameter" },
    { id: "mass", label: "Mass", category: "Physical", visual: "bar" },
    { id: "surfaceGravity", label: "Surface gravity", category: "Physical", visual: "bar" },
    { id: "temperature", label: "Temperature", category: "Environment", visual: "thermal" },
    { id: "orbitalDistance", label: "Orbital distance", category: "Orbit", visual: "distance" },
    { id: "orbitalPeriod", label: "Orbital period", category: "Orbit", visual: "bar" },
    { id: "distanceFromEarth", label: "Distance from Earth", category: "Distance", visual: "distance" },
    { id: "physicalExtent", label: "Physical extent", category: "Physical", visual: "diameter" },
    { id: "missionDistance", label: "Mission milestone distance", category: "Mission", visual: "distance" },
];

const definitions: readonly ComparisonDefinition[] = [
    {
        astronomyRecordId: "mercury", visualKind: "rocky", explorerTarget: "solar-system",
        values: {
            diameter: value(4_880, "km", "About 4,880 km"),
            mass: value(3.301e23, "kg", "0.055 Earth masses"),
            surfaceGravity: value(3.7, "m/s²", "About 3.7 m/s²"),
            orbitalDistance: value(0.39, "AU", "0.39 AU"),
            orbitalPeriod: value(88, "days", "88 Earth days"),
        },
    },
    {
        astronomyRecordId: "venus", visualKind: "rocky", explorerTarget: "solar-system",
        values: {
            diameter: value(12_104, "km", "About 12,104 km"),
            mass: value(4.867e24, "kg", "0.815 Earth masses"),
            surfaceGravity: value(8.9, "m/s²", "About 8.9 m/s²"),
            orbitalDistance: value(0.72, "AU", "0.72 AU"),
            orbitalPeriod: value(225, "days", "225 Earth days"),
        },
    },
    {
        astronomyRecordId: "earth", visualKind: "earth", explorerTarget: "solar-system",
        values: {
            diameter: value(12_742, "km", "About 12,742 km"),
            mass: value(EARTH_MASS_KG, "kg", "1 Earth mass"),
            surfaceGravity: value(9.8, "m/s²", "About 9.8 m/s²"),
            orbitalDistance: value(1, "AU", "1 AU"),
            orbitalPeriod: value(365.25, "days", "About 365.25 days"),
        },
    },
    {
        astronomyRecordId: "mars", visualKind: "rocky", explorerTarget: "solar-system",
        values: {
            diameter: value(6_780, "km", "About 6,780 km"),
            mass: value(6.417e23, "kg", "0.107 Earth masses"),
            surfaceGravity: value(3.7, "m/s²", "About 3.7 m/s²"),
            orbitalDistance: value(1.52, "AU", "1.52 AU"),
            orbitalPeriod: value(687, "days", "687 Earth days"),
        },
    },
    {
        astronomyRecordId: "jupiter", visualKind: "gasGiant", explorerTarget: "solar-system",
        values: {
            diameter: value(139_800, "km", "About 139,800 km"),
            mass: value(1.898e27, "kg", "About 318 Earth masses"),
            surfaceGravity: value(24.8, "m/s²", "About 24.8 m/s²", "Cloud-top gravity"),
            orbitalDistance: value(5.2, "AU", "5.2 AU"),
            orbitalPeriod: value(4_332.6, "days", "About 11.9 Earth years"),
        },
    },
    {
        astronomyRecordId: "saturn", visualKind: "gasGiant", explorerTarget: "solar-system",
        values: {
            diameter: value(116_400, "km", "About 116,400 km"),
            mass: value(5.683e26, "kg", "About 95 Earth masses"),
            surfaceGravity: value(10.4, "m/s²", "About 10.4 m/s²", "Cloud-top gravity"),
            orbitalDistance: value(9.5, "AU", "9.5 AU"),
            orbitalPeriod: value(10_759, "days", "About 29.5 Earth years"),
        },
    },
    {
        astronomyRecordId: "uranus", visualKind: "iceGiant", explorerTarget: "solar-system",
        values: {
            diameter: value(50_800, "km", "About 50,800 km"),
            mass: value(8.681e25, "kg", "About 14.5 Earth masses"),
            surfaceGravity: value(8.7, "m/s²", "About 8.7 m/s²", "Cloud-top gravity"),
            orbitalDistance: value(19.2, "AU", "19.2 AU"),
            orbitalPeriod: value(30_681, "days", "About 84 Earth years"),
        },
    },
    {
        astronomyRecordId: "neptune", visualKind: "iceGiant", explorerTarget: "solar-system",
        values: {
            diameter: value(49_200, "km", "About 49,200 km"),
            mass: value(1.024e26, "kg", "About 17.1 Earth masses"),
            surfaceGravity: value(11.2, "m/s²", "About 11.2 m/s²", "Cloud-top gravity"),
            orbitalDistance: value(30.1, "AU", "30.1 AU"),
            orbitalPeriod: value(60_225, "days", "About 165 Earth years"),
        },
    },
    {
        astronomyRecordId: "moon", visualKind: "moon", explorerTarget: "solar-system",
        values: {
            diameter: value(3_475, "km", "About 3,475 km"),
            mass: value(7.342e22, "kg", "About 0.0123 Earth masses"),
            surfaceGravity: value(1.62, "m/s²", "About 1.62 m/s²"),
            orbitalPeriod: value(27.3, "days", "About 27.3 days"),
        },
    },
    ...([
        ["ceres", 940, 2.77, 1_682],
        ["pluto", 2_377, 39.5, 90_560],
        ["haumea", 1_740, 43, 104_025],
        ["makemake", 1_430, 46, 111_325],
        ["eris", 2_326, 68, 203_305],
    ] as const).map(([astronomyRecordId, diameter, distance, period]) => ({
        astronomyRecordId,
        visualKind: "dwarfPlanet" as const,
        explorerTarget: "solar-system" as const,
        values: {
            diameter: value(diameter, "km", `About ${diameter.toLocaleString("en-US")} km`, "Approximate diameter"),
            orbitalDistance: value(distance, "AU", `About ${distance} AU`),
            orbitalPeriod: value(period, "days", `About ${Math.round(period / 365.25)} Earth years`),
        },
    })),
    {
        astronomyRecordId: "sun", visualKind: "star", explorerTarget: "solar-system",
        values: {
            diameter: value(1_400_000, "km", "About 1.4 million km"),
            mass: value(SOLAR_MASS_KG, "kg", "1 solar mass"),
            temperature: value(5_772, "K", "About 5,800 K", "Visible-surface temperature"),
        },
    },
    {
        astronomyRecordId: "alpha-centauri-a", visualKind: "star", explorerTarget: "alpha-centauri",
        values: {
            diameter: value(1_708_000, "km", "About 1.7 million km", "Inferred from approximate radius"),
            mass: value(1.08 * SOLAR_MASS_KG, "kg", "About 1.08 solar masses"),
            temperature: value(5_800, "K", "About 5,800 K", "Surface temperature"),
            distanceFromEarth: value(4.37, "ly", "About 4.37 light-years"),
        },
    },
    {
        astronomyRecordId: "alpha-centauri-b", visualKind: "star", explorerTarget: "alpha-centauri",
        values: {
            diameter: value(1_204_000, "km", "About 1.2 million km", "Inferred from approximate radius"),
            mass: value(0.91 * SOLAR_MASS_KG, "kg", "About 0.91 solar masses"),
            temperature: value(5_200, "K", "About 5,200 K", "Surface temperature"),
            distanceFromEarth: value(4.37, "ly", "About 4.37 light-years"),
        },
    },
    {
        astronomyRecordId: "proxima-centauri", visualKind: "redDwarf", explorerTarget: "alpha-centauri",
        values: {
            diameter: value(196_000, "km", "About 196,000 km", "Inferred from approximate radius"),
            mass: value(0.12 * SOLAR_MASS_KG, "kg", "About 0.12 solar masses"),
            temperature: value(3_000, "K", "About 3,000 K", "Surface temperature"),
            distanceFromEarth: value(4.24, "ly", "About 4.24 light-years"),
        },
    },
    {
        astronomyRecordId: "proxima-centauri-b", visualKind: "exoplanet", explorerTarget: "alpha-centauri",
        values: {
            mass: value(1.06 * EARTH_MASS_KG, "kg", "About 1.06 Earth masses", "Minimum mass"),
            orbitalDistance: value(0.0485, "AU", "About 0.0485 AU"),
            orbitalPeriod: value(11.2, "days", "About 11.2 days"),
        },
    },
    {
        astronomyRecordId: "sirius-a", visualKind: "star", explorerTarget: "sirius",
        values: { diameter:value(2_380_000,"km","About 2.38 million km"), mass:value(2.02*SOLAR_MASS_KG,"kg","About 2.02 solar masses"), temperature:value(9_940,"K","About 9,940 K"), distanceFromEarth:value(8.6,"ly","About 8.6 light-years") },
    },
    {
        astronomyRecordId: "barnards-star", visualKind: "redDwarf", explorerTarget: "barnards-star",
        values: { diameter:value(273_000,"km","About 273,000 km"), mass:value(.144*SOLAR_MASS_KG,"kg","About 0.144 solar masses"), temperature:value(3_130,"K","About 3,130 K"), distanceFromEarth:value(5.96,"ly","About 5.96 light-years") },
    },
    {
        astronomyRecordId: "trappist-1-e", visualKind: "exoplanet", explorerTarget: "trappist-1",
        values: { diameter:value(11_723,"km","About 11,723 km"), mass:value(.692*EARTH_MASS_KG,"kg","About 0.692 Earth masses"), orbitalDistance:value(.02925,"AU","0.02925 AU"), orbitalPeriod:value(6.101013,"days","About 6.10 days"), distanceFromEarth:value(40.7,"ly","About 40.7 light-years") },
    },
    {
        astronomyRecordId: "sagittarius-a-star", visualKind: "blackHole", explorerTarget: "sagittarius-a",
        values: {
            diameter: value(23_600_000, "km", "About 24 million km", "Approximate event-horizon diameter; not the accretion flow"),
            mass: value(4_000_000 * SOLAR_MASS_KG, "kg", "About 4 million solar masses", "Approximate central mass"),
            distanceFromEarth: value(26_000, "ly", "About 26,000 light-years"),
        },
    },
    ...([
        ["orion-nebula", "nebula", 24, 1_300],
        ["eagle-nebula", "nebula", 70, 7_000],
        ["carina-nebula", "nebula", 300, 7_500],
        ["lagoon-nebula", "nebula", 100, 4_600],
        ["helix-nebula", "nebula", 3, 650],
        ["pleiades", "cluster", 17, 445],
        ["hyades", "cluster", 20, 150],
        ["omega-centauri", "cluster", 150, 17_000],
        ["47-tucanae", "cluster", 120, 16_700],
        ["westerlund-1", "cluster", 6, 12_000],
    ] as const).map(([astronomyRecordId, visualKind, extent, distance]) => ({
        astronomyRecordId,
        visualKind,
        values: {
            physicalExtent: value(extent, "ly", `About ${extent} light-years`, "Approximate physical extent"),
            distanceFromEarth: value(distance, "ly", `About ${distance.toLocaleString("en-US")} light-years`),
        },
        ...(astronomyRecordId === "orion-nebula" ? { explorerTarget: "orion-nebula" as const } : {}),
    })),
    {
        astronomyRecordId: "voyager-1", visualKind: "spacecraft", explorerTarget: "voyager-1",
        values: {
            missionDistance: value(121, "AU", "About 121 AU", "Distance at the 2012 heliopause crossing"),
        },
    },
];

const recordsById = new Map(astronomyRecords.map((record) => [record.id, record]));

const registryObjects: ComparisonObject[] = definitions.map((definition) => {
    const record = recordsById.get(definition.astronomyRecordId);
    if (!record) throw new Error(`Missing astronomy record: ${definition.astronomyRecordId}`);
    return {
        id: record.id,
        astronomyRecordId: definition.astronomyRecordId,
        name: record.name,
        category: record.classification,
        objectType: record.objectType,
        summary: record.summary,
        visualKind: definition.visualKind,
        values: definition.values,
        sources: record.sources,
        explorerTarget: definition.explorerTarget,
    };
});

export const comparisonObjects: readonly ComparisonObject[] = [
    ...registryObjects,
    {
        id: "milky-way",
        name: "Milky Way",
        category: "Barred spiral galaxy",
        objectType: "galaxy",
        summary: "The Milky Way is our home galaxy, a barred spiral whose stellar disk fades gradually rather than ending at one exact edge.",
        visualKind: "galaxy",
        values: {
            physicalExtent: value(100_000, "ly", "About 100,000 light-years", "Approximate stellar-disk diameter"),
        },
        sources: [astronomySources.milkyWayScale],
        explorerTarget: "milky-way",
    },
];

export const comparisonObjectIds = new Set(comparisonObjects.map((object) => object.id));

export function getComparisonObject(id: string | null | undefined): ComparisonObject | null {
    if (!id) return null;
    return comparisonObjects.find((object) => object.id === id) ?? null;
}

export function formatComparisonObjectType(type: ComparisonObject["objectType"]): string {
    const labels: Record<ComparisonObject["objectType"], string> = {
        planet: "Planet",
        moon: "Moon",
        dwarfPlanet: "Dwarf Planet",
        star: "Star",
        starSystem: "Star System",
        spacecraft: "Spacecraft",
        exoplanet: "Exoplanet",
        blackHole: "Black Hole",
        nebula: "Nebula",
        starCluster: "Star Cluster",
        galacticRegion: "Galactic Region",
        galaxy: "Galaxy",
    };
    return labels[type];
}
