import { smallBodyRegions } from "@/data/smallBodyRegions";
import { SmallBodyBelt } from "./SmallBodyBelt";
import type { PerformanceTier } from "@/engine/performance/PerformanceTier";

export function KuiperBelt({
    performanceTier,
}: {
    performanceTier?: PerformanceTier;
}) {
    return <SmallBodyBelt config={smallBodyRegions.kuiperBelt} performanceTier={performanceTier} />;
}
