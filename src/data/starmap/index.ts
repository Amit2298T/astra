export { constellations } from "./constellations";
export { starMapSources } from "./sources";
export { starMapStars } from "./stars";
export type {
    ConstellationLineSegment,
    ConstellationRecord,
    Hemisphere,
    StarMapStar,
    ViewingSeason,
} from "./types";

import { constellations } from "./constellations";
import { starMapStars } from "./stars";

export const starsById = new Map(starMapStars.map((star) => [star.id, star]));
export const constellationsById = new Map(
    constellations.map((constellation) => [constellation.id, constellation])
);

for (const constellation of constellations) {
    for (const starId of constellation.starIds) {
        if (!starsById.has(starId)) {
            throw new Error(`Unknown star ${starId} in ${constellation.id}`);
        }
    }
}
