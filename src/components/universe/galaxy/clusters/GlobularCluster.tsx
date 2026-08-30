import { useMemo } from "react";
import * as THREE from "three";

import type { StarClusterConfig } from "@/data/starClusters";
import { createSeededRandom } from "@/engine/math/seededRandom";
import { ClusterPoints, type ClusterPopulation } from "./ClusterPoints";

interface GlobularClusterProps {
    config: StarClusterConfig;
    starCount: number;
}

function createGlobularPopulation(
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

    for (let index = 0; index < count; index++) {
        const offset = index * 3;
        const inCore = random() < config.visual.coreDensity;
        const normalizedRadius = inCore
            ? Math.pow(random(), 2.25) * 0.58
            : 0.18 + Math.pow(random(), 0.72) * 0.82;
        const azimuth = random() * Math.PI * 2;
        const vertical = random() * 2 - 1;
        const horizontal = Math.sqrt(1 - vertical * vertical);
        positions[offset] =
            Math.cos(azimuth) *
            horizontal *
            normalizedRadius *
            config.visual.spread[0];
        positions[offset + 1] =
            vertical * normalizedRadius * config.visual.spread[1];
        positions[offset + 2] =
            Math.sin(azimuth) *
            horizontal *
            normalizedRadius *
            config.visual.spread[2];

        const prominent = index < config.visual.prominentStarCount;
        const colorRoll = random();
        color
            .copy(colorRoll < 0.5 ? primary : secondary)
            .lerp(accent, colorRoll > 0.82 ? 0.46 : random() * 0.14)
            .multiplyScalar(
                prominent
                    ? 1
                    : 0.5 + random() * 0.4 + (1 - normalizedRadius) * 0.12
            );
        colors[offset] = color.r;
        colors[offset + 1] = color.g;
        colors[offset + 2] = color.b;
        sizes[index] = prominent
            ? 1.15 + random() * 0.55
            : 0.14 + random() * 0.34;
    }

    return { positions, colors, sizes };
}

export function GlobularCluster({
    config,
    starCount,
}: GlobularClusterProps) {
    const population = useMemo(
        () => createGlobularPopulation(config, starCount),
        [config, starCount]
    );

    return (
        <group rotation={[0.08, 0.14, -0.04]}>
            <ClusterPoints population={population} opacity={0.88} />
            <mesh
                scale={config.visual.spread}
                raycast={() => undefined}
            >
                <sphereGeometry args={[0.34, 24, 18]} />
                <meshBasicMaterial
                    color={config.colors.haze}
                    transparent
                    opacity={config.visual.hazeStrength}
                    depthWrite={false}
                    side={THREE.BackSide}
                    blending={THREE.AdditiveBlending}
                    toneMapped={false}
                />
            </mesh>
        </group>
    );
}
