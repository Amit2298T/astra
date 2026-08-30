import { voyager1Mission } from "./voyager1";
import type { MissionRecord } from "./types";

export type {
    MissionDistanceReference,
    MissionEncounter,
    MissionInstrument,
    MissionMilestone,
    MissionMilestoneCategory,
    MissionPowerPoint,
    MissionRecord,
    MissionStatus,
    MissionSystemState,
    MissionSystemStatus,
    MissionTelemetrySnapshot,
} from "./types";
export { voyager1Mission } from "./voyager1";

export const missionRegistry = [voyager1Mission] as const;

const missionsById = new Map<string, MissionRecord>(
    missionRegistry.map((mission) => [mission.id, mission])
);

export function getMissionRecord(id: string | null | undefined) {
    if (!id) return null;
    return missionsById.get(id) ?? null;
}
