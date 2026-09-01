"use client";

import { useMemo } from "react";
import { useTexture } from "@react-three/drei";

import { createSeededRandom } from "@/engine/math/seededRandom";
import type { PerformanceTier } from "@/engine/performance/PerformanceTier";
import { MOON_SURFACE_PROFILES } from "@/engine/surface/SurfaceTerrain";

const MAX_STAR_COUNT = MOON_SURFACE_PROFILES.high.starCount;

function createSurfaceStars(): {
    positions: Float32Array;
    colors: Float32Array;
} {
    const positions = new Float32Array(MAX_STAR_COUNT * 3);
    const colors = new Float32Array(MAX_STAR_COUNT * 3);
    const random = createSeededRandom(0x4c756e53);

    for (let index = 0; index < MAX_STAR_COUNT; index += 1) {
        const longitude = random() * Math.PI * 2;
        const vertical = random() * 0.92 + 0.05;
        const horizontal = Math.sqrt(1 - vertical * vertical);
        const radius = 1050;
        const offset = index * 3;
        const brightness = 0.58 + random() * 0.34;

        positions[offset] = radius * horizontal * Math.cos(longitude);
        positions[offset + 1] = radius * vertical;
        positions[offset + 2] = radius * horizontal * Math.sin(longitude);
        colors[offset] = brightness * 0.88;
        colors[offset + 1] = brightness * 0.92;
        colors[offset + 2] = brightness;
    }

    return { positions, colors };
}

const surfaceStars = createSurfaceStars();

export function MoonSky({ tier }: { tier: PerformanceTier }) {
    const earthTexture = useTexture("/textures/earth/earth_daymap.jpg");
    const count = MOON_SURFACE_PROFILES[tier].starCount;
    const positions = useMemo(
        () => surfaceStars.positions.subarray(0, count * 3),
        [count]
    );
    const colors = useMemo(
        () => surfaceStars.colors.subarray(0, count * 3),
        [count]
    );

    return (
        <group>
            <points frustumCulled={false} raycast={() => undefined}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[positions, 3]}
                    />
                    <bufferAttribute
                        attach="attributes-color"
                        args={[colors, 3]}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.9}
                    sizeAttenuation={false}
                    vertexColors
                    transparent
                    opacity={0.72}
                    depthWrite={false}
                    toneMapped={false}
                />
            </points>

            <mesh position={[112, 76, -205]} rotation={[0.08, -0.65, 0.04]}>
                <sphereGeometry args={[10, 48, 48]} />
                <meshStandardMaterial
                    map={earthTexture}
                    roughness={0.9}
                    metalness={0}
                />
            </mesh>
        </group>
    );
}
