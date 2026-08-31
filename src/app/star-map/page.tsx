import type { Metadata } from "next";

import { StarMapExplorer } from "@/components/star-map/StarMapExplorer";
import { constellationsById, starsById } from "@/data/starmap";

export const metadata: Metadata = {
    title: { absolute: "ASTRA — Star Map" },
    description: "Explore constellations, bright stars, and the structure of the night sky.",
};

interface StarMapPageProps {
    searchParams: Promise<{
        constellation?: string | string[];
        star?: string | string[];
    }>;
}

function first(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] : value;
}

export default async function StarMapPage({ searchParams }: StarMapPageProps) {
    const query = await searchParams;
    const requestedConstellation = first(query.constellation);
    const requestedStar = first(query.star);
    const initialStar = requestedStar && starsById.has(requestedStar) ? requestedStar : null;
    const starConstellation = initialStar ? starsById.get(initialStar)?.constellationId : null;
    const initialConstellation = starConstellation ?? (
        requestedConstellation && constellationsById.has(requestedConstellation)
            ? requestedConstellation
            : null
    );

    return (
        <StarMapExplorer
            initialConstellationId={initialConstellation}
            initialStarId={initialStar}
        />
    );
}
