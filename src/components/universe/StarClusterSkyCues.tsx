"use client";

import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

import { starClusters, type StarClusterConfig } from "@/data/starClusters";
import {
    LOCAL_MILKY_WAY_ORIENTATION,
    LOCAL_SKY_RADIUS,
} from "./MilkyWaySkyBand";
import { useSceneLayerOpacity } from "./scale/FadingSceneGroup";

interface CueStar {
    position: readonly [number, number, number];
    size: number;
    color: string;
    opacity: number;
}

interface CuePopulation {
    positions: Float32Array;
    colors: Float32Array;
    sizes: Float32Array;
    opacities: Float32Array;
}

const GALACTIC_CENTER_SKY_LONGITUDE = -0.95;
const SKY_CUE_RADIUS = LOCAL_SKY_RADIUS - 18;

const PLEIADES_STARS: readonly CueStar[] = [
    { position: [0, 0, 0], size: 3.25, color: "#eff7ff", opacity: 0.9 },
    { position: [-1.6, 0.8, 0.1], size: 2.8, color: "#dbeeff", opacity: 0.86 },
    { position: [1.35, 1.15, -0.1], size: 2.65, color: "#d4e9ff", opacity: 0.82 },
    { position: [2.25, -0.35, 0.15], size: 2.45, color: "#c9e3ff", opacity: 0.78 },
    { position: [-2.3, -0.85, -0.1], size: 2.35, color: "#dceeff", opacity: 0.76 },
    { position: [0.3, -1.75, 0], size: 2.2, color: "#bddcff", opacity: 0.72 },
    { position: [-0.65, 2.1, 0.1], size: 2.05, color: "#d3e9ff", opacity: 0.68 },
    { position: [3.15, 1.15, -0.1], size: 1.8, color: "#b7d8ff", opacity: 0.6 },
    { position: [-3.25, 1.35, 0], size: 1.65, color: "#c4dfff", opacity: 0.56 },
    { position: [1.4, 2.8, 0.1], size: 1.25, color: "#9fc8f2", opacity: 0.38 },
    { position: [-1.8, -2.55, 0], size: 1.2, color: "#aacff5", opacity: 0.36 },
    { position: [3.8, -1.7, -0.1], size: 1.1, color: "#9cc3eb", opacity: 0.31 },
    { position: [-4.1, -0.15, 0.1], size: 1.05, color: "#a9c9e8", opacity: 0.28 },
] as const;

const HYADES_STARS: readonly CueStar[] = [
    { position: [-8.5, 4.4, 0], size: 2.1, color: "#f0e4cf", opacity: 0.56 },
    { position: [-5.1, 2.2, 0.1], size: 1.75, color: "#e7dfd2", opacity: 0.48 },
    { position: [-2.2, 0.2, -0.1], size: 1.9, color: "#dbe4ed", opacity: 0.5 },
    { position: [0.5, -2.1, 0], size: 1.55, color: "#eed8bd", opacity: 0.43 },
    { position: [3.8, -4.5, 0.1], size: 1.85, color: "#e6e1d7", opacity: 0.48 },
    { position: [7.7, -6.2, -0.1], size: 1.6, color: "#d5e1ed", opacity: 0.41 },
    { position: [-6.8, -2.8, 0.1], size: 1.35, color: "#d9c4a9", opacity: 0.34 },
    { position: [1.8, 4.8, 0], size: 1.45, color: "#e9edf0", opacity: 0.38 },
    { position: [6.2, 1.9, -0.1], size: 1.3, color: "#dccbb4", opacity: 0.32 },
    { position: [10.1, 4.6, 0], size: 1.15, color: "#d7e1e8", opacity: 0.27 },
] as const;

const GLOBULAR_GUIDE_STARS: readonly CueStar[] = [
    { position: [-2.6, 1.1, 0], size: 1.1, color: "#e6d5b9", opacity: 0.18 },
    { position: [2.2, 1.8, 0.1], size: 1, color: "#eee8dc", opacity: 0.16 },
    { position: [1.4, -2.3, -0.1], size: 1, color: "#dbc5a4", opacity: 0.14 },
] as const;

function createCuePopulation(stars: readonly CueStar[]): CuePopulation {
    const positions = new Float32Array(stars.length * 3);
    const colors = new Float32Array(stars.length * 3);
    const sizes = new Float32Array(stars.length);
    const opacities = new Float32Array(stars.length);
    const color = new THREE.Color();

    stars.forEach((star, index) => {
        const offset = index * 3;
        positions.set(star.position, offset);
        color.set(star.color);
        colors[offset] = color.r;
        colors[offset + 1] = color.g;
        colors[offset + 2] = color.b;
        sizes[index] = star.size;
        opacities[index] = star.opacity;
    });

    return { positions, colors, sizes, opacities };
}

const pleiadesPopulation = createCuePopulation(PLEIADES_STARS);
const hyadesPopulation = createCuePopulation(HYADES_STARS);
const globularGuidePopulation = createCuePopulation(GLOBULAR_GUIDE_STARS);

const starVertexShader = /* glsl */ `
    attribute float aSize;
    attribute float aOpacity;
    varying vec3 vColor;
    varying float vOpacity;

    void main() {
        vColor = color;
        vOpacity = aOpacity;
        gl_PointSize = aSize;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const starFragmentShader = /* glsl */ `
    uniform float uLayerOpacity;
    varying vec3 vColor;
    varying float vOpacity;

    void main() {
        float radius = length(gl_PointCoord - vec2(0.5));
        if (radius > 0.5) discard;
        float softness = 1.0 - smoothstep(0.12, 0.5, radius);
        float core = 1.0 - smoothstep(0.0, 0.14, radius);
        gl_FragColor = vec4(
            vColor * (0.82 + core * 0.34),
            softness * vOpacity * uLayerOpacity
        );
    }
`;

function createSoftGlowTexture(): THREE.DataTexture {
    const size = 32;
    const data = new Uint8Array(size * size * 4);
    const center = (size - 1) / 2;

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const radius = Math.hypot(x - center, y - center) / center;
            const alpha = Math.max(0, 1 - radius);
            const softened = alpha * alpha * (3 - 2 * alpha);
            const offset = (y * size + x) * 4;
            data[offset] = 255;
            data[offset + 1] = 255;
            data[offset + 2] = 255;
            data[offset + 3] = Math.round(softened * 255);
        }
    }

    const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    texture.needsUpdate = true;
    return texture;
}

const softGlowTexture = createSoftGlowTexture();

interface SkyCuePointsProps {
    population: CuePopulation;
    layerOpacity: number;
}

function SkyCuePoints({ population, layerOpacity }: SkyCuePointsProps) {
    return (
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
                <bufferAttribute
                    attach="attributes-aOpacity"
                    args={[population.opacities, 1]}
                />
            </bufferGeometry>
            <shaderMaterial
                vertexShader={starVertexShader}
                fragmentShader={starFragmentShader}
                uniforms={{ uLayerOpacity: { value: layerOpacity } }}
                vertexColors
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                toneMapped={false}
            />
        </points>
    );
}

const placements = starClusters.map((cluster) => {
    const longitude =
        GALACTIC_CENTER_SKY_LONGITUDE +
        (cluster.galacticLongitudeDeg * Math.PI) / 180;
    const latitude = (cluster.galacticLatitudeDeg * Math.PI) / 180;
    const horizontal = Math.cos(latitude) * SKY_CUE_RADIUS;
    return {
        cluster,
        position: [
            Math.cos(longitude) * horizontal,
            Math.sin(latitude) * SKY_CUE_RADIUS,
            Math.sin(longitude) * horizontal,
        ] as const,
    };
});

function getLabel(cluster: StarClusterConfig): string {
    if (cluster.id === "pleiades") return "Pleiades · M45";
    if (cluster.id === "hyades") return "Hyades";
    return `${cluster.name} · guide`;
}

export function StarClusterSkyCues() {
    const rootRef = useRef<THREE.Group>(null);
    const layerOpacity = useSceneLayerOpacity();
    const mobile = useThree((state) => state.size.width < 720);

    useFrame(({ camera }) => {
        rootRef.current?.position.copy(camera.position);
    });

    return (
        <group ref={rootRef} rotation={LOCAL_MILKY_WAY_ORIENTATION}>
            {placements.map(({ cluster, position }) => {
                const isPleiades = cluster.id === "pleiades";
                const isHyades = cluster.id === "hyades";
                const isOmega = cluster.id === "omega-centauri";
                const isGlobular = isOmega || cluster.id === "47-tucanae";
                const isWesterlund = cluster.id === "westerlund-1";
                const population = isPleiades
                    ? pleiadesPopulation
                    : isHyades
                      ? hyadesPopulation
                      : isGlobular
                        ? globularGuidePopulation
                        : null;
                const showLabel = !mobile || isPleiades || isHyades;
                const labelOpacity = isPleiades
                    ? 0.46
                    : isHyades
                      ? 0.28
                      : isWesterlund
                        ? 0.13
                        : 0.18;

                return (
                    <group key={cluster.id} position={position}>
                        {population && (
                            <SkyCuePoints
                                population={population}
                                layerOpacity={
                                    layerOpacity * (isGlobular ? 0.72 : 1)
                                }
                            />
                        )}

                        {(isGlobular || isWesterlund) && (
                            <sprite
                                scale={
                                    isWesterlund
                                        ? [1.7, 1.7, 1]
                                        : isOmega
                                          ? [4.4, 4.4, 1]
                                          : [3.2, 3.2, 1]
                                }
                                raycast={() => undefined}
                            >
                                <spriteMaterial
                                    map={softGlowTexture}
                                    color={cluster.colors.marker}
                                    transparent
                                    opacity={
                                        layerOpacity *
                                        (isWesterlund
                                            ? 0.035
                                            : isOmega
                                              ? 0.16
                                              : 0.1)
                                    }
                                    depthWrite={false}
                                    blending={THREE.AdditiveBlending}
                                    toneMapped={false}
                                />
                            </sprite>
                        )}

                        {showLabel && (
                            <Html
                                center
                                position={[
                                    0,
                                    isPleiades ? 7 : isHyades ? 9 : 5.5,
                                    0,
                                ]}
                                distanceFactor={900}
                                style={{ pointerEvents: "none" }}
                            >
                                <div
                                    title="Astronomy guide cue; apparent size and brightness are stylized."
                                    style={{
                                        whiteSpace: "nowrap",
                                        color: "#dbeafe",
                                        fontFamily:
                                            "Inter, system-ui, sans-serif",
                                        fontSize: "clamp(7px, 0.7vw, 9px)",
                                        fontWeight: 560,
                                        letterSpacing: "0.1em",
                                        textShadow: "0 1px 6px #000",
                                        textTransform: "uppercase",
                                        userSelect: "none",
                                        opacity:
                                            labelOpacity * layerOpacity,
                                    }}
                                >
                                    {getLabel(cluster)}
                                </div>
                            </Html>
                        )}
                    </group>
                );
            })}
        </group>
    );
}
