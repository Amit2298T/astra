import type { Metadata } from "next";

import { SpaceComparisonTool } from "@/components/compare/SpaceComparisonTool";
import { parseComparisonUrlState } from "@/engine/comparison/SpaceComparison";

export const metadata: Metadata = {
    title: "Space Comparison",
    description:
        "Compare the physical properties of planets, stars, black holes, nebulae, clusters, and other ASTRA objects side by side.",
};

interface ComparePageProps {
    searchParams: Promise<{
        objects?: string | string[];
        metric?: string | string[];
    }>;
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
    const query = await searchParams;
    const initialState = parseComparisonUrlState(query.objects, query.metric);
    return <SpaceComparisonTool initialState={initialState} />;
}
