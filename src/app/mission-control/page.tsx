import type { Metadata } from "next";

import { MissionControlDashboard } from "@/components/mission-control/MissionControlDashboard";
import { getAstronomyRecord } from "@/data/astronomy";
import { voyager1Mission } from "@/data/missions";

export const metadata: Metadata = {
    title: "ASTRA — Mission Control",
    description:
        "Track historic spacecraft missions, milestones, trajectories, and deep-space context.",
};

export default function MissionControlPage() {
    const canonicalRecord = getAstronomyRecord(voyager1Mission.canonicalAstronomyRecordId);

    return (
        <MissionControlDashboard
            mission={voyager1Mission}
            canonicalSummary={canonicalRecord?.summary ?? voyager1Mission.summary}
        />
    );
}
