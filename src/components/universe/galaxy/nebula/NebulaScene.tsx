import type { NebulaConfig } from "@/data/nebulae";
import { NebulaCloud } from "./NebulaCloud";
import { NebulaStars } from "./NebulaStars";

interface NebulaSceneProps {
    config: NebulaConfig;
}

export function NebulaScene({ config }: NebulaSceneProps) {
    return (
        <group rotation={[0.08, -0.2, 0.06]}>
            <NebulaCloud config={config} />
            <NebulaStars config={config} />
        </group>
    );
}
