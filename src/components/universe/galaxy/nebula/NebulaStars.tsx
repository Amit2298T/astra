import { useMemo } from "react";
import * as THREE from "three";

import type { NebulaConfig } from "@/data/nebulae";
import { createSeededRandom } from "@/engine/math/seededRandom";
import {
    PERFORMANCE_PROFILES,
    scaledCount,
    type PerformanceTier,
} from "@/engine/performance/PerformanceTier";

interface NebulaStarsProps {
    config: NebulaConfig;
    performanceTier: PerformanceTier;
}

const starVertexShader = /* glsl */ `
    attribute float aSize;
    varying vec3 vColor;

    void main() {
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        vColor = color;
        gl_PointSize = max(1.0, aSize * (310.0 / max(1.0, -viewPosition.z)));
        gl_Position = projectionMatrix * viewPosition;
    }
`;

const starFragmentShader = /* glsl */ `
    varying vec3 vColor;

    void main() {
        float radius = length(gl_PointCoord - vec2(0.5));
        if (radius > 0.5) discard;
        float alpha = 1.0 - smoothstep(0.12, 0.5, radius);
        float core = 1.0 - smoothstep(0.0, 0.15, radius);
        gl_FragColor = vec4(vColor * (0.82 + core * 0.34), alpha * 0.82);
    }
`;

function createEmbeddedStars(config: NebulaConfig, count: number) {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const random = createSeededRandom(config.visual.seed + 0x53544152);
    const baseColor = new THREE.Color(config.palette.star);
    const warmColor = new THREE.Color(config.palette.inner);
    const shellPreset = config.visual.preset === "expandingShell";

    for (let index = 0; index < count; index++) {
        const offset = index * 3;
        const radius = shellPreset
            ? 5 + random() * 13
            : Math.pow(random(), 0.72) * 17;
        const azimuth = random() * Math.PI * 2;
        const vertical = random() * 2 - 1;
        const horizontal = Math.sqrt(1 - vertical * vertical);
        positions[offset] = radius * horizontal * Math.cos(azimuth);
        positions[offset + 1] = radius * vertical;
        positions[offset + 2] = radius * horizontal * Math.sin(azimuth);

        const color = baseColor.clone().lerp(warmColor, random() * 0.28);
        const brightness = 0.62 + random() * 0.38;
        colors[offset] = color.r * brightness;
        colors[offset + 1] = color.g * brightness;
        colors[offset + 2] = color.b * brightness;
        sizes[index] = 0.18 + random() * 0.3;
    }

    return { positions, colors, sizes };
}

export function NebulaStars({ config, performanceTier }: NebulaStarsProps) {
    const count = scaledCount(
        config.visual.embeddedStarCount,
        PERFORMANCE_PROFILES[performanceTier].nebulaScale
    );
    const population = useMemo(
        () => createEmbeddedStars(config, count),
        [config, count]
    );
    const isHelix = config.visual.preset === "expandingShell";

    return (
        <group scale={config.visual.scale}>
            <points frustumCulled={false} raycast={() => undefined}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[population.positions, 3]}
                    />
                    <bufferAttribute
                        attach="attributes-color"
                        args={[population.colors, 3]}
                    />
                    <bufferAttribute
                        attach="attributes-aSize"
                        args={[population.sizes, 1]}
                    />
                </bufferGeometry>
                <shaderMaterial
                    vertexShader={starVertexShader}
                    fragmentShader={starFragmentShader}
                    vertexColors
                    transparent
                    depthWrite={false}
                    toneMapped={false}
                />
            </points>
            {isHelix && (
                <group>
                    <mesh raycast={() => undefined}>
                        <sphereGeometry args={[0.42, 20, 16]} />
                        <meshBasicMaterial
                            color="#efffff"
                            toneMapped={false}
                        />
                    </mesh>
                    <mesh raycast={() => undefined}>
                        <sphereGeometry args={[1.25, 20, 16]} />
                        <meshBasicMaterial
                            color="#bdefff"
                            transparent
                            opacity={0.13}
                            depthWrite={false}
                            blending={THREE.AdditiveBlending}
                            toneMapped={false}
                        />
                    </mesh>
                </group>
            )}
        </group>
    );
}
