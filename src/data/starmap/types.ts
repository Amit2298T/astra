import type { SourceReference } from "@/data/astronomy";

export type Hemisphere = "Northern" | "Southern";
export type ViewingSeason = "Winter" | "Spring" | "Summer" | "Autumn";

export interface StarMapStar {
    id: string;
    name: string;
    constellationId: string;
    raHours: number;
    decDegrees: number;
    magnitude: number;
    spectralClass?: string;
    distanceLy?: number;
    astronomyRecordId?: string;
    note: string;
    sources: readonly SourceReference[];
}

export interface ConstellationLineSegment {
    from: string;
    to: string;
}

export interface ConstellationRecord {
    id: string;
    name: string;
    abbreviation: string;
    hemisphere: Hemisphere;
    season: ViewingSeason;
    description: string;
    starIds: readonly string[];
    lineSegments: readonly ConstellationLineSegment[];
    mythologySummary?: string;
    visibilityNotes?: string;
    labelOffset?: readonly [number, number];
}
