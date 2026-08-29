import { smallBodyRegions } from "@/data/smallBodyRegions";
import { SmallBodyBelt } from "./SmallBodyBelt";

export function KuiperBelt() {
    return <SmallBodyBelt config={smallBodyRegions.kuiperBelt} />;
}
