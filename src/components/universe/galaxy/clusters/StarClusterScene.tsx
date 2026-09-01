"use client";

import type { StarClusterConfig } from "@/data/starClusters";
import {
    PERFORMANCE_PROFILES,
    scaledCount,
    type PerformanceTier,
} from "@/engine/performance/PerformanceTier";
import { GlobularCluster } from "./GlobularCluster";
import { MassiveYoungCluster } from "./MassiveYoungCluster";
import { OpenCluster } from "./OpenCluster";

interface StarClusterSceneProps {
    config: StarClusterConfig;
    performanceTier: PerformanceTier;
}

export function StarClusterScene({
    config,
    performanceTier,
}: StarClusterSceneProps) {
    const baseCount =
        performanceTier === "low"
            ? config.visual.mobileStarCount
            : config.visual.desktopStarCount;
    const starCount = scaledCount(
        baseCount,
        PERFORMANCE_PROFILES[performanceTier].clusterScale
    );

    switch (config.clusterType) {
        case "openCluster":
            return <OpenCluster config={config} starCount={starCount} />;
        case "globularCluster":
            return <GlobularCluster config={config} starCount={starCount} />;
        case "massiveYoungCluster":
            return (
                <MassiveYoungCluster config={config} starCount={starCount} />
            );
    }
}
