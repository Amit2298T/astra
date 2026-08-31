import type { Metadata } from "next";

import { GuideExperience } from "@/components/guide/GuideExperience";
import { resolveInitialGuideContext } from "@/engine/guide";

export const metadata: Metadata = {
    title: { absolute: "ASTRA — AI Space Guide" },
    description: "Ask questions about planets, stars, missions, nebulae, black holes, and the universe using ASTRA’s curated astronomy knowledge.",
};

interface GuidePageProps {
    searchParams: Promise<{
        object?: string | string[];
        context?: string | string[];
        star?: string | string[];
        constellation?: string | string[];
    }>;
}

function first(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] : value;
}

export default async function GuidePage({ searchParams }: GuidePageProps) {
    const query = await searchParams;
    const objectId = first(query.object) ?? first(query.context);
    const initialEntity = resolveInitialGuideContext(
        objectId,
        first(query.star),
        first(query.constellation)
    );

    return <GuideExperience initialEntity={initialEntity} />;
}
