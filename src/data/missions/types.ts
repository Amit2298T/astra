import type { SourceReference } from "@/data/astronomy";

export type MissionStatus = "Active mission" | "Concluded";
export type MissionMilestoneCategory =
    | "Launch"
    | "Encounter"
    | "Observation"
    | "Boundary"
    | "Mission phase";
export type MissionSystemState =
    | "Operational context"
    | "Mission-limited"
    | "Degraded over time"
    | "Historical"
    | "Powered down";

export interface MissionMilestone {
    id: string;
    date: string;
    displayDate: string;
    yearLabel: string;
    title: string;
    category: MissionMilestoneCategory;
    summary: string;
    detail: string;
    explorerTarget?: "solar-system" | "voyager-1";
}

export interface MissionSystemStatus {
    id: string;
    name: string;
    state: MissionSystemState;
    context: string;
}

export interface MissionTelemetrySnapshot {
    capturedAt: string;
    displayDate: string;
    distanceFromEarthAu?: number;
    heliocentricVelocityKmS?: number;
    phase: string;
    qualifier: string;
    sources: readonly SourceReference[];
}

export interface MissionDistanceReference {
    id: string;
    label: string;
    valueAu: number;
    displayValue: string;
    qualifier?: string;
    emphasis?: "boundary" | "mission";
}

export interface MissionInstrument {
    name: string;
    context: string;
}

export interface MissionPowerPoint {
    year: number;
    watts: number;
    label: string;
    qualifier?: string;
}

export interface MissionEncounter {
    id: string;
    name: string;
    year: string;
    date: string;
    displayDate: string;
    context: string;
    outcome: string;
}

export interface MissionRecord {
    id: string;
    canonicalAstronomyRecordId: string;
    name: string;
    program: string;
    phase: string;
    status: MissionStatus;
    launch: {
        dateTime: string;
        displayDate: string;
        vehicle: string;
    };
    summary: string;
    snapshot: MissionTelemetrySnapshot;
    milestones: readonly MissionMilestone[];
    systems: readonly MissionSystemStatus[];
    instruments: readonly MissionInstrument[];
    distanceReferences: readonly MissionDistanceReference[];
    powerHistory: readonly MissionPowerPoint[];
    encounters: readonly MissionEncounter[];
    goldenRecord: {
        purpose: string;
        context: string;
    };
    sources: readonly SourceReference[];
}
