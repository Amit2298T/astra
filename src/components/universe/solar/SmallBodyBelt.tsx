import { useMemo } from "react";

import type { SmallBodyRegionConfig } from "@/data/smallBodyRegions";
import { createSeededRandom, randomNormal } from "@/engine/math/seededRandom";

interface BeltPopulation {
    positions: Float32Array;
    colors: Float32Array;
}

function createPopulation(
    config: SmallBodyRegionConfig,
    count: number,
    seedOffset: number
): BeltPopulation {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const random = createSeededRandom(config.seed ^ seedOffset);
    const parsedColors = config.colors.map((hex) => {
        const value = Number.parseInt(hex.slice(1), 16);
        return [
            ((value >> 16) & 255) / 255,
            ((value >> 8) & 255) / 255,
            (value & 255) / 255,
        ] as const;
    });

    let index = 0;
    while (index < count) {
        const angle = random() * Math.PI * 2;
        const gapPattern =
            0.58 +
            Math.sin(angle * 3.1 + 0.7) * 0.15 +
            Math.sin(angle * 8.3 - 1.2) * 0.1;
        if (random() > gapPattern) continue;

        const radialPosition = Math.pow(random(), 0.92);
        const radialRange = config.outerRadius - config.innerRadius;
        const irregularOffset =
            Math.sin(angle * 6.7 + radialPosition * 4) * radialRange * 0.025;
        const radius =
            config.innerRadius + radialPosition * radialRange + irregularOffset;
        const verticalSpread =
            config.verticalThickness * (0.45 + radialPosition * 0.55);
        const offset = index * 3;

        positions[offset] = Math.cos(angle) * radius;
        positions[offset + 1] = randomNormal(random) * verticalSpread;
        positions[offset + 2] = Math.sin(angle) * radius;

        const color = parsedColors[Math.floor(random() * parsedColors.length)];
        const brightness = 0.62 + random() * 0.38;
        colors[offset] = color[0] * brightness;
        colors[offset + 1] = color[1] * brightness;
        colors[offset + 2] = color[2] * brightness;
        index += 1;
    }

    return { positions, colors };
}

interface BeltPointsProps {
    population: BeltPopulation;
    size: number;
    opacity: number;
}

function BeltPoints({ population, size, opacity }: BeltPointsProps) {
    return (
        <points frustumCulled={false}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[population.positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-color"
                    args={[population.colors, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={size}
                sizeAttenuation
                vertexColors
                transparent
                opacity={opacity}
                depthWrite={false}
                toneMapped={false}
            />
        </points>
    );
}

interface SmallBodyBeltProps {
    config: SmallBodyRegionConfig;
}

export function SmallBodyBelt({ config }: SmallBodyBeltProps) {
    const prominentCount = Math.round(
        config.particleCount * config.prominentFraction
    );
    const populations = useMemo(
        () => ({
            base: createPopulation(
                config,
                config.particleCount - prominentCount,
                0x68bc21eb
            ),
            prominent: createPopulation(config, prominentCount, 0x02e5be93),
        }),
        [config, prominentCount]
    );

    return (
        <group>
            <BeltPoints
                population={populations.base}
                size={config.basePointSize}
                opacity={config.opacity}
            />
            <BeltPoints
                population={populations.prominent}
                size={config.prominentPointSize}
                opacity={Math.min(0.86, config.opacity + 0.12)}
            />
        </group>
    );
}
