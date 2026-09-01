import type { NebulaConfig } from "@/data/nebulae";
import { NebulaCloud } from "./NebulaCloud";
import { NebulaStars } from "./NebulaStars";
import type { PerformanceTier } from "@/engine/performance/PerformanceTier";

interface NebulaSceneProps {
    config: NebulaConfig;
    performanceTier: PerformanceTier;
}

export function NebulaScene({ config, performanceTier }: NebulaSceneProps) {
    return (
        <group rotation={[0.08, -0.2, 0.06]}>
            <NebulaCloud config={config} performanceTier={performanceTier} />
            <NebulaStars config={config} performanceTier={performanceTier} />
        </group>
    );
}
