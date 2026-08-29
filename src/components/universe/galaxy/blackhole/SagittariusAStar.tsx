import type { BlackHoleConfig } from "@/data/blackHoles";
import { AccretionDisk } from "./AccretionDisk";
import { BlackHoleEnvironment } from "./BlackHoleEnvironment";
import { BlackHoleLensing } from "./BlackHoleLensing";

interface SagittariusAStarProps {
    config: BlackHoleConfig;
}

export function SagittariusAStar({ config }: SagittariusAStarProps) {
    const innerDiskRadius = config.eventHorizonRadiusVisual * 1.52;

    return (
        <group>
            <BlackHoleEnvironment />
            <AccretionDisk
                innerRadius={innerDiskRadius}
                outerRadius={config.accretionDiskRadius}
            />
            <BlackHoleLensing
                eventHorizonRadius={config.eventHorizonRadiusVisual}
            />
            <mesh renderOrder={6}>
                <sphereGeometry
                    args={[config.eventHorizonRadiusVisual, 72, 48]}
                />
                <meshBasicMaterial color="#000000" toneMapped={false} />
            </mesh>
        </group>
    );
}
