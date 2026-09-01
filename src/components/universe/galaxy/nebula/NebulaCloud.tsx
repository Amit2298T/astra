"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import type {
    NebulaConfig,
    NebulaVisualPreset,
} from "@/data/nebulae";
import {
    createSeededRandom,
    randomNormal,
} from "@/engine/math/seededRandom";
import {
    PERFORMANCE_PROFILES,
    type PerformanceTier,
} from "@/engine/performance/PerformanceTier";

interface CloudPopulation {
    positions: Float32Array;
    colors: Float32Array;
    sizes: Float32Array;
    phases: Float32Array;
    opacities: Float32Array;
}

interface NebulaCloudProps {
    config: NebulaConfig;
    performanceTier: PerformanceTier;
}

const cloudVertexShader = /* glsl */ `
    uniform float uTime;
    attribute float aSize;
    attribute float aPhase;
    attribute float aOpacity;
    varying vec3 vColor;
    varying float vPhase;
    varying float vOpacity;

    void main() {
        vec3 animatedPosition = position;
        animatedPosition.x += sin(aPhase + uTime * 0.055 + position.z * 0.08) * 0.12;
        animatedPosition.y += cos(aPhase * 1.7 + uTime * 0.04 + position.x * 0.07) * 0.09;
        vec4 viewPosition = modelViewMatrix * vec4(animatedPosition, 1.0);
        vColor = color;
        vPhase = aPhase;
        vOpacity = aOpacity;
        gl_PointSize = min(96.0, aSize * (360.0 / max(1.0, -viewPosition.z)));
        gl_Position = projectionMatrix * viewPosition;
    }
`;

const cloudFragmentShader = /* glsl */ `
    uniform float uTime;
    uniform float uOpacity;
    varying vec3 vColor;
    varying float vPhase;
    varying float vOpacity;

    void main() {
        vec2 centered = gl_PointCoord - vec2(0.5);
        float radius = length(centered);
        float angle = atan(centered.y, centered.x);
        float boundary = 0.43
            + sin(angle * 5.0 + vPhase) * 0.035
            + sin(angle * 9.0 - vPhase * 1.7 + uTime * 0.025) * 0.018;
        if (radius > boundary) discard;
        float softShape = 1.0 - smoothstep(boundary - 0.2, boundary, radius);
        float internalVariation = 0.82
            + 0.18 * sin(centered.x * 17.0 + centered.y * 13.0 + vPhase);
        float alpha = softShape * internalVariation * vOpacity * uOpacity;
        gl_FragColor = vec4(vColor, alpha);
    }
`;

const irregularVolumeVertexShader = /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vViewDirection;
    varying vec3 vLocalPosition;

    void main() {
        float irregularity =
            sin(position.y * 6.7 + position.x * 4.1) * 0.055
            + sin(position.z * 8.3 - position.y * 3.6) * 0.038
            + sin((position.x + position.z) * 11.0) * 0.022;
        vec3 transformed = position + normal * irregularity;
        vec4 viewPosition = modelViewMatrix * vec4(transformed, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vViewDirection = normalize(-viewPosition.xyz);
        vLocalPosition = transformed;
        gl_Position = projectionMatrix * viewPosition;
    }
`;

const irregularVolumeFragmentShader = /* glsl */ `
    uniform vec3 uColor;
    uniform float uOpacity;
    uniform float uVariation;
    varying vec3 vNormal;
    varying vec3 vViewDirection;
    varying vec3 vLocalPosition;

    void main() {
        float facing = abs(dot(vNormal, vViewDirection));
        float softEdge = smoothstep(0.02, 0.72, facing);
        float breakup = 0.76
            + sin(vLocalPosition.y * 5.4 + vLocalPosition.x * 7.1 + uVariation) * 0.12
            + sin(vLocalPosition.z * 9.3 - vLocalPosition.y * 4.2) * 0.07;
        float alpha = uOpacity * softEdge * clamp(breakup, 0.52, 0.94);
        gl_FragColor = vec4(uColor, alpha);
    }
`;

function createCloudPopulation(
    config: NebulaConfig,
    count: number,
    dust: boolean
): CloudPopulation {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const opacities = new Float32Array(count);
    const random = createSeededRandom(config.visual.seed + (dust ? 0x44555354 : 0));
    const inner = new THREE.Color(config.palette.inner);
    const primary = new THREE.Color(config.palette.primary);
    const secondary = new THREE.Color(config.palette.secondary);
    const dustColor = new THREE.Color(config.palette.dust);
    const color = new THREE.Color();
    const shellPreset = config.visual.preset === "expandingShell";
    const eaglePreset = config.visual.preset === "dustPillars";
    const carinaPreset = config.visual.preset === "chaoticComplex";

    for (let index = 0; index < count; index++) {
        const offset = index * 3;
        let normalizedRadius = 0;

        let eagleBacklight = false;
        let eagleForegroundHaze = false;
        let carinaBrightRidge = false;
        let carinaCoolPocket = false;

        if (shellPreset) {
            const azimuth = random() * Math.PI * 2;
            const tubeAngle = random() * Math.PI * 2;
            const majorRadius = dust ? 11.6 : 10.3 + randomNormal(random) * 0.9;
            const tubeRadius = dust ? 3.2 : 2.2 + random() * 2.4;
            positions[offset] =
                (majorRadius + Math.cos(tubeAngle) * tubeRadius) *
                Math.cos(azimuth);
            positions[offset + 1] = Math.sin(tubeAngle) * tubeRadius;
            positions[offset + 2] =
                (majorRadius + Math.cos(tubeAngle) * tubeRadius) *
                Math.sin(azimuth);
            normalizedRadius = Math.min(1, majorRadius / 13);
        } else if (carinaPreset) {
            const clusterRoll = random();
            const clusterIndex = Math.min(3, Math.floor(clusterRoll * 4));
            const clusterCenters = [
                [-8.5, 3.8, -2.5],
                [7.2, -4.2, 3.4],
                [3.8, 7.2, -5.2],
                [-2.8, -6.4, 5.8],
            ] as const;
            const center = clusterCenters[clusterIndex];
            const clusterRadius = dust
                ? 2.8 + random() * 4.8
                : Math.pow(random(), 0.64) * (6.2 + clusterIndex * 0.7);
            const azimuth = random() * Math.PI * 2;
            const vertical = random() * 2 - 1;
            const horizontal = Math.sqrt(1 - vertical * vertical);
            positions[offset] =
                center[0] + clusterRadius * horizontal * Math.cos(azimuth);
            positions[offset + 1] = center[1] + clusterRadius * vertical * 0.72;
            positions[offset + 2] =
                center[2] + clusterRadius * horizontal * Math.sin(azimuth);
            normalizedRadius = Math.min(1, clusterRadius / 9);

            carinaBrightRidge = !dust && random() < 0.27;
            if (carinaBrightRidge) {
                const ridgeProgress = random();
                positions[offset] = -13 + ridgeProgress * 25;
                positions[offset + 1] =
                    Math.sin(ridgeProgress * Math.PI * 2.4) * 3.4 +
                    randomNormal(random) * 1.1;
                positions[offset + 2] =
                    -3.8 +
                    Math.cos(ridgeProgress * Math.PI * 1.6) * 2.6 +
                    randomNormal(random) * 0.9;
                normalizedRadius = 0.18 + ridgeProgress * 0.46;
            }
            carinaCoolPocket = !dust && !carinaBrightRidge && random() < 0.22;
        } else {
            const radius = Math.pow(random(), 0.58) * 17.5;
            const azimuth = random() * Math.PI * 2;
            const vertical = random() * 2 - 1;
            const horizontal = Math.sqrt(1 - vertical * vertical);
            const clump = random() < 0.38 ? 0.68 : 1;
            positions[offset] =
                radius * horizontal * Math.cos(azimuth) * clump +
                randomNormal(random) * 1.5;
            positions[offset + 1] =
                radius * vertical * clump + randomNormal(random) * 0.9;
            positions[offset + 2] =
                radius * horizontal * Math.sin(azimuth) * clump +
                randomNormal(random) * 1.3;
            normalizedRadius = radius / 17.5;
        }

        if (eaglePreset && !dust) {
            const layerRoll = random();
            eagleBacklight = layerRoll < 0.26;
            eagleForegroundHaze = layerRoll >= 0.26 && layerRoll < 0.38;

            if (eagleBacklight) {
                positions[offset] = randomNormal(random) * 7.2;
                positions[offset + 1] = randomNormal(random) * 6.8 + 0.8;
                positions[offset + 2] = -5.8 + randomNormal(random) * 1.4;
                normalizedRadius = 0.12 + random() * 0.3;
            } else if (eagleForegroundHaze) {
                positions[offset] = randomNormal(random) * 8.8;
                positions[offset + 1] = randomNormal(random) * 6.2;
                positions[offset + 2] = 5.5 + random() * 3.8;
                normalizedRadius = 0.45 + random() * 0.35;
            }
        }

        if (dust) {
            color.copy(dustColor).multiplyScalar(0.58 + random() * 0.42);
            sizes[index] = 5.8 + random() * 7.2;
            opacities[index] =
                (0.055 + random() * 0.08) * config.visual.dustStrength;
        } else {
            if (eagleBacklight) {
                color.copy(inner).lerp(primary, 0.2 + random() * 0.28);
                color.multiplyScalar(0.88 + random() * 0.2);
                sizes[index] = 9.5 + random() * 11.5;
                opacities[index] =
                    (0.12 + random() * 0.1) * config.visual.density;
            } else if (eagleForegroundHaze) {
                color.copy(primary).lerp(secondary, 0.35 + random() * 0.35);
                color.multiplyScalar(0.56 + random() * 0.2);
                sizes[index] = 11 + random() * 9;
                opacities[index] =
                    (0.035 + random() * 0.045) * config.visual.density;
            } else if (carinaBrightRidge) {
                color.copy(inner).lerp(primary, 0.16 + random() * 0.34);
                color.multiplyScalar(0.9 + random() * 0.18);
                sizes[index] = 5.8 + random() * 8.2;
                opacities[index] =
                    (0.13 + random() * 0.11) * config.visual.density;
            } else if (carinaCoolPocket) {
                color.copy(secondary).lerp(inner, random() * 0.16);
                color.multiplyScalar(0.7 + random() * 0.28);
                sizes[index] = 5.5 + random() * 8.8;
                opacities[index] =
                    (0.075 + random() * 0.09) * config.visual.density;
            } else {
                color
                    .copy(inner)
                    .lerp(primary, Math.min(1, normalizedRadius * 1.25));
                color.lerp(secondary, random() * 0.36 + normalizedRadius * 0.16);
                color.multiplyScalar(0.64 + random() * 0.36);
                sizes[index] = 6.5 + random() * 10.5;
                opacities[index] =
                    (0.065 + random() * 0.105) * config.visual.density;
            }
        }

        colors[offset] = color.r;
        colors[offset + 1] = color.g;
        colors[offset + 2] = color.b;
        phases[index] = random() * Math.PI * 2;
    }

    return { positions, colors, sizes, phases, opacities };
}

interface CloudPointsProps {
    population: CloudPopulation;
    opacity: number;
    materialRef: React.RefObject<THREE.ShaderMaterial | null>;
}

function CloudPoints({ population, opacity, materialRef }: CloudPointsProps) {
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
                    attach="attributes-aPhase"
                    args={[population.phases, 1]}
                />
                <bufferAttribute
                    attach="attributes-aOpacity"
                    args={[population.opacities, 1]}
                />
            </bufferGeometry>
            <shaderMaterial
                ref={materialRef}
                vertexShader={cloudVertexShader}
                fragmentShader={cloudFragmentShader}
                uniforms={{
                    uTime: { value: 0 },
                    uOpacity: { value: opacity },
                }}
                vertexColors
                transparent
                depthWrite={false}
                toneMapped={false}
            />
        </points>
    );
}

interface DustStructure {
    position: readonly [number, number, number];
    scale: readonly [number, number, number];
    rotation: readonly [number, number, number];
    opacity: number;
}

function getDustStructures(preset: NebulaVisualPreset): readonly DustStructure[] {
    switch (preset) {
        case "dustPillars":
            return [
                {
                    position: [-5.2, -1.8, 0.4],
                    scale: [2.05, 12.8, 2.35],
                    rotation: [0.06, -0.14, -0.27],
                    opacity: 0.36,
                },
                {
                    position: [0.1, -2.7, 1.8],
                    scale: [1.62, 9.8, 1.88],
                    rotation: [-0.12, 0.22, 0.18],
                    opacity: 0.39,
                },
                {
                    position: [4.6, -3.3, -0.8],
                    scale: [1.38, 7.4, 1.7],
                    rotation: [0.18, -0.28, 0.34],
                    opacity: 0.34,
                },
            ];
        case "chaoticComplex":
            return [
                {
                    position: [-7.5, 2.6, 1],
                    scale: [6.8, 3.1, 5.4],
                    rotation: [0.34, 0.25, -0.08],
                    opacity: 0.2,
                },
                {
                    position: [7.1, -3.8, 3.6],
                    scale: [4.6, 6.8, 3.2],
                    rotation: [-0.24, 0.46, 0.54],
                    opacity: 0.23,
                },
                {
                    position: [2.2, 6.5, -5.3],
                    scale: [6.2, 2.4, 4.8],
                    rotation: [0.16, -0.38, 0.26],
                    opacity: 0.18,
                },
                {
                    position: [-1.5, -6.2, -1.5],
                    scale: [9.5, 1.25, 3.4],
                    rotation: [-0.2, 0.15, -0.34],
                    opacity: 0.16,
                },
            ];
        case "darkLane":
            return [
                { position: [0, -0.5, 1], scale: [15, 1.7, 4.2], rotation: [0.2, 0.1, -0.12], opacity: 0.17 },
                { position: [-4, 3, -2], scale: [5, 2.2, 3], rotation: [-0.2, 0.3, 0.25], opacity: 0.1 },
            ];
        case "luminousNursery":
            return [
                { position: [4, -2, 2], scale: [5.5, 2.4, 4], rotation: [0.2, 0.1, -0.3], opacity: 0.075 },
            ];
        case "expandingShell":
            return [];
    }
}

export function NebulaCloud({ config, performanceTier }: NebulaCloudProps) {
    const qualityScale = PERFORMANCE_PROFILES[performanceTier].nebulaScale;
    const cloudMaterialRef = useRef<THREE.ShaderMaterial>(null);
    const dustMaterialRef = useRef<THREE.ShaderMaterial>(null);
    const populations = useMemo(
        () => ({
            clouds: createCloudPopulation(
                config,
                Math.round(config.visual.cloudCount * qualityScale),
                false
            ),
            dust: createCloudPopulation(
                config,
                Math.round(config.visual.dustCount * qualityScale),
                true
            ),
        }),
        [config, qualityScale]
    );
    const dustStructures = getDustStructures(config.visual.preset);
    const usesIrregularVolumes =
        config.visual.preset === "dustPillars" ||
        config.visual.preset === "chaoticComplex";

    useFrame((_, delta) => {
        if (cloudMaterialRef.current) {
            cloudMaterialRef.current.uniforms.uTime.value += delta;
        }
        if (dustMaterialRef.current) {
            dustMaterialRef.current.uniforms.uTime.value += delta;
        }
    });

    return (
        <group scale={config.visual.scale}>
            <CloudPoints
                population={populations.clouds}
                opacity={1}
                materialRef={cloudMaterialRef}
            />
            <CloudPoints
                population={populations.dust}
                opacity={1}
                materialRef={dustMaterialRef}
            />
            {dustStructures.map((structure, index) => (
                <mesh
                    key={`${config.id}-dust-structure-${index}`}
                    position={structure.position}
                    scale={structure.scale}
                    rotation={structure.rotation}
                    raycast={() => undefined}
                >
                    <sphereGeometry
                        args={[1, usesIrregularVolumes ? 14 : 16, 12]}
                    />
                    {usesIrregularVolumes ? (
                        <shaderMaterial
                            vertexShader={irregularVolumeVertexShader}
                            fragmentShader={irregularVolumeFragmentShader}
                            uniforms={{
                                uColor: {
                                    value: new THREE.Color(
                                        config.palette.dust
                                    ),
                                },
                                uOpacity: {
                                    value:
                                        structure.opacity *
                                        config.visual.dustStrength,
                                },
                                uVariation: { value: index * 1.73 + 0.8 },
                            }}
                            transparent
                            depthWrite={false}
                            side={THREE.DoubleSide}
                            toneMapped={false}
                        />
                    ) : (
                        <meshBasicMaterial
                            color={config.palette.dust}
                            transparent
                            opacity={
                                structure.opacity *
                                config.visual.dustStrength
                            }
                            depthWrite={false}
                            side={THREE.DoubleSide}
                            toneMapped={false}
                        />
                    )}
                </mesh>
            ))}
            {config.visual.preset === "expandingShell" && (
                <group rotation={[0.34, 0.08, -0.12]}>
                    <mesh scale={[1, 0.72, 1]} raycast={() => undefined}>
                        <torusGeometry args={[10.6, 2.7, 18, 96]} />
                        <meshBasicMaterial
                            color={config.palette.primary}
                            transparent
                            opacity={0.075}
                            depthWrite={false}
                            blending={THREE.AdditiveBlending}
                            toneMapped={false}
                        />
                    </mesh>
                    <mesh scale={[1.16, 0.8, 1.16]} raycast={() => undefined}>
                        <torusGeometry args={[10.6, 1.4, 14, 96]} />
                        <meshBasicMaterial
                            color={config.palette.secondary}
                            transparent
                            opacity={0.06}
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
