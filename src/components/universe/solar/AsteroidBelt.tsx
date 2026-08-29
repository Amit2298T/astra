import { smallBodyRegions } from "@/data/smallBodyRegions";
import { SmallBodyBelt } from "./SmallBodyBelt";

export function AsteroidBelt() {
    return <SmallBodyBelt config={smallBodyRegions.asteroidBelt} />;
}
