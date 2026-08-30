import { useMemo } from "react";
import * as THREE from "three";

import type { StarClusterConfig } from "@/data/starClusters";
import {
    createSeededRandom,
    randomNormal,
} from "@/engine/math/seededRandom";
import { ClusterPoints, type ClusterPopulation } from "./ClusterPoints";

interface MassiveYoungClusterProps {
    config: StarClusterConfig;
    starCount: number;
}

const SUBCLUSTER_CENTERS = [
    [-0.3, 0.08, 0.1],
    [0.22, -0.14, -0.2],
    [0.05, 0.25, 0.18],
] as const;

function createYoungPopulation(
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
        const center =
            SUBCLUSTER_CENTERS[
                Math.floor(random() * SUBCLUSTER_CENTERS.length)
            ];
        const scatter = 0.24 + random() * 0.2;
        positions[offset] =
            (center[0] + randomNormal(random) * scatter) *
            config.visual.spread[0];
        positions[offset + 1] =
            (center[1] + randomNormal(random) * scatter) *
            config.visual.spread[1];
        positions[offset + 2] =
            (center[2] + randomNormal(random) * scatter) *
            config.visual.spread[2];

        const prominent = index < config.visual.prominentStarCount;
        const evolved = random() < 0.1;
        color
            .copy(evolved ? accent : random() < 0.72 ? primary : secondary)
            .multiplyScalar(prominent ? 1 : 0.55 + random() * 0.42);
        colors[offset] = color.r;
        colors[offset + 1] = color.g;
        colors[offset + 2] = color.b;
        sizes[index] = prominent
            ? 1.4 + random() * 0.75
            : 0.17 + random() * 0.44;
    }

    return { positions, colors, sizes };
}

export function MassiveYoungCluster({
    config,
    starCount,
}: MassiveYoungClusterProps) {
    const population = useMemo(
        () => createYoungPopulation(config, starCount),
        [config, starCount]
    );

    return (
        <group rotation={[0.08, -0.18, 0.12]}>
            <ClusterPoints population={population} opacity={0.9} />
            {SUBCLUSTER_CENTERS.map((center, index) => (
                <mesh
                    key={`${config.id}-dust-${index}`}
                    position={[
                        center[0] * config.visual.spread[0],
                        center[1] * config.visual.spread[1],
                        center[2] * config.visual.spread[2],
                    ]}
                    scale={[13 + index * 2, 8 + index, 11 + index]}
                    raycast={() => undefined}
                >
                    <sphereGeometry args={[1, 18, 14]} />
                    <meshBasicMaterial
                        color={config.colors.haze}
                        transparent
                        opacity={config.visual.dustStrength * 0.16}
                        depthWrite={false}
                        side={THREE.BackSide}
                        toneMapped={false}
                    />
                </mesh>
            ))}
        </group>
    );
}
