import type { AstronomyRecord } from "./types";

export function defineAstronomyRecords<
    const TRecords extends readonly AstronomyRecord[],
>(records: TRecords): TRecords {
    for (const record of records) {
        if (!record.id || !record.name || !record.summary) {
            throw new Error(`Invalid astronomy record: ${record.id || "unknown"}`);
        }
        if (record.sources.length === 0) {
            throw new Error(`Astronomy record has no sources: ${record.id}`);
        }
    }
    return records;
}
