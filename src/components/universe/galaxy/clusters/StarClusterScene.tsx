"use client";

import { useThree } from "@react-three/fiber";

import type { StarClusterConfig } from "@/data/starClusters";
import { GlobularCluster } from "./GlobularCluster";
import { MassiveYoungCluster } from "./MassiveYoungCluster";
import { OpenCluster } from "./OpenCluster";

interface StarClusterSceneProps {
    config: StarClusterConfig;
}

export function StarClusterScene({ config }: StarClusterSceneProps) {
    const compact = useThree((state) => state.size.width < 720);
    const starCount = compact
        ? config.visual.mobileStarCount
        : config.visual.desktopStarCount;

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
