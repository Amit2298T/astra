import { useMemo } from "react";
import * as THREE from "three";

import type { StarClusterConfig } from "@/data/starClusters";
import {
    createSeededRandom,
    randomNormal,
} from "@/engine/math/seededRandom";
import { ClusterPoints, type ClusterPopulation } from "./ClusterPoints";

interface OpenClusterProps {
    config: StarClusterConfig;
    starCount: number;
}

function createOpenPopulation(
    config: StarClusterConfig,
    count: number
): ClusterPopulation {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const random = createSeededRandom(config.visual.seed);
    const primary = new THREE.Color(config.colors.primary);
    const secondary = new THREE.Color(config.colors.secondary);
    const accent = new THREE.Color(config.colors.accent);
    const color = new THREE.Color();
    const broad = config.visual.preset === "broadMixedOpen";

    for (let index = 0; index < count; index++) {
        const offset = index * 3;
        if (broad) {
            const azimuth = random() * Math.PI * 2;
            const vertical = random() * 2 - 1;
            const horizontal = Math.sqrt(1 - vertical * vertical);
            const radius = Math.pow(random(), 0.58);
            positions[offset] =
                Math.cos(azimuth) * horizontal * radius * config.visual.spread[0];
            positions[offset + 1] =
                vertical * radius * config.visual.spread[1];
            positions[offset + 2] =
                Math.sin(azimuth) * horizontal * radius * config.visual.spread[2];
        } else {
            positions[offset] =
                THREE.MathUtils.clamp(randomNormal(random), -2.2, 2.2) *
                config.visual.spread[0] *
                0.42;
            positions[offset + 1] =
                THREE.MathUtils.clamp(randomNormal(random), -2.2, 2.2) *
                config.visual.spread[1] *
                0.42;
            positions[offset + 2] =
                THREE.MathUtils.clamp(randomNormal(random), -2.2, 2.2) *
                config.visual.spread[2] *
                0.42;
        }

        const prominent = index < config.visual.prominentStarCount;
        const colorRoll = random();
        color
            .copy(colorRoll < 0.58 ? primary : secondary)
            .lerp(accent, prominent ? 0.48 : random() * 0.16)
            .multiplyScalar(prominent ? 1 : 0.58 + random() * 0.4);
        colors[offset] = color.r;
        colors[offset + 1] = color.g;
        colors[offset + 2] = color.b;
        sizes[index] = prominent
            ? 1.75 + random() * 0.85
            : 0.2 + random() * 0.5;
    }

    return { positions, colors, sizes };
}

export function OpenCluster({ config, starCount }: OpenClusterProps) {
    const population = useMemo(
        () => createOpenPopulation(config, starCount),
        [config, starCount]
    );

    return (
        <group rotation={[0.12, -0.2, 0.08]}>
            <ClusterPoints population={population} opacity={0.92} />
            {config.visual.hazeStrength > 0 && (
                <mesh scale={config.visual.spread} raycast={() => undefined}>
                    <sphereGeometry args={[0.72, 24, 18]} />
                    <meshBasicMaterial
                        color={config.colors.haze}
                        transparent
                        opacity={config.visual.hazeStrength * 0.22}
                        depthWrite={false}
                        side={THREE.BackSide}
                        blending={THREE.AdditiveBlending}
                        toneMapped={false}
                    />
                </mesh>
            )}
        </group>
    );
}
