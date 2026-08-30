import { blackHoleAstronomyRecords } from "./blackHoles";
import { dwarfPlanetAstronomyRecords } from "./dwarfPlanets";
import { exoplanetAstronomyRecords } from "./exoplanets";
import { galacticRegionAstronomyRecords } from "./galacticRegions";
import { nebulaAstronomyRecords } from "./nebulae";
import { planetAstronomyRecords } from "./planets";
import { spacecraftAstronomyRecords } from "./spacecraft";
import { starClusterAstronomyRecords } from "./starClusters";
import { starAstronomyRecords } from "./stars";

export type {
    AstronomyFact,
    AstronomyFactCategory,
    AstronomyFactGroup,
    AstronomyObjectType,
    AstronomyRecord,
    SourceReference,
} from "./types";

export const astronomyRecords = [
    ...planetAstronomyRecords,
    ...dwarfPlanetAstronomyRecords,
    ...starAstronomyRecords,
    ...spacecraftAstronomyRecords,
    ...exoplanetAstronomyRecords,
    ...blackHoleAstronomyRecords,
    ...nebulaAstronomyRecords,
    ...starClusterAstronomyRecords,
    ...galacticRegionAstronomyRecords,
] as const;

export type AstronomyObjectId = (typeof astronomyRecords)[number]["id"];

const aliases = {
    "sagittarius-a": "sagittarius-a-star",
    "proxima-b": "proxima-centauri-b",
} as const satisfies Record<string, AstronomyObjectId>;

const astronomyRecordsById = new Map(
    astronomyRecords.map((record) => [record.id, record])
);
const astronomyRecordsByName = new Map(
    astronomyRecords.map((record) => [record.name.toLowerCase(), record])
);

if (astronomyRecordsById.size !== astronomyRecords.length) {
    throw new Error("Astronomy record IDs must be unique");
}

export function getAstronomyRecord(id: string | null | undefined) {
    if (!id) return null;
    const canonicalId = aliases[id as keyof typeof aliases] ?? id;
    return astronomyRecordsById.get(canonicalId) ?? null;
}

export function getAstronomyRecordByName(name: string | null | undefined) {
    if (!name) return null;
    return astronomyRecordsByName.get(name.toLowerCase()) ?? null;
}

export function resolveAstronomyRecord(
    id: string | null | undefined,
    name?: string | null
) {
    return getAstronomyRecord(id) ?? getAstronomyRecordByName(name);
}
