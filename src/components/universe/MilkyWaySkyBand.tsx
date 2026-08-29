"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { createSeededRandom, randomNormal } from "@/engine/math/seededRandom";

interface SkyBandPopulation {
    positions: Float32Array;
    colors: Float32Array;
}

interface SkyBandConfig {
    count: number;
    seed: number;
    latitudeSpread: number;
}

export const LOCAL_SKY_RADIUS = 1120;
export const LOCAL_MILKY_WAY_ORIENTATION = [0.54, -0.32, 0.72] as const;
const BAND_STAR_COUNT = 5000;
const PROMINENT_STAR_COUNT = 600;

const BAND_COLORS = [
    [0.72, 0.79, 0.88],
    [0.82, 0.78, 0.7],
    [0.62, 0.7, 0.82],
    [0.88, 0.84, 0.76],
] as const;

function createSkyBandPopulation({
    count,
    seed,
    latitudeSpread,
}: SkyBandConfig): SkyBandPopulation {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const random = createSeededRandom(seed);
    let index = 0;

    while (index < count) {
        const longitude = random() * Math.PI * 2;
        const broadDensity =
            0.67 +
            Math.sin(longitude * 3.1 + 0.8) * 0.13 +
            Math.sin(longitude * 7.4 - 1.1) * 0.09;
        if (random() > broadDensity) continue;

        const latitude = randomNormal(random) * latitudeSpread;
        if (Math.abs(latitude) > latitudeSpread * 3.2) continue;

        const dustLaneCenter = Math.sin(longitude * 2.7 + 0.35) * 0.022;
        const isDustLane =
            Math.abs(latitude - dustLaneCenter) < 0.027 && random() < 0.7;
        const patchyGap =
            Math.sin(longitude * 5.3 - 0.4) > 0.72 && random() < 0.36;
        if (isDustLane || patchyGap) continue;

        const horizontal = Math.cos(latitude) * LOCAL_SKY_RADIUS;
        const offset = index * 3;
        positions[offset] = horizontal * Math.cos(longitude);
        positions[offset + 1] = Math.sin(latitude) * LOCAL_SKY_RADIUS;
        positions[offset + 2] = horizontal * Math.sin(longitude);

        const color = BAND_COLORS[Math.floor(random() * BAND_COLORS.length)];
        const centerConcentration = Math.exp(
            -Math.pow(latitude / (latitudeSpread * 1.75), 2)
        );
        const brightness =
            (0.48 + random() * 0.42) * (0.72 + centerConcentration * 0.28);
        colors[offset] = color[0] * brightness;
        colors[offset + 1] = color[1] * brightness;
        colors[offset + 2] = color[2] * brightness;
        index += 1;
    }

    return { positions, colors };
}

const bandStars = createSkyBandPopulation({
    count: BAND_STAR_COUNT,
    seed: 0x92d68ca2,
    latitudeSpread: 0.105,
});

const prominentBandStars = createSkyBandPopulation({
    count: PROMINENT_STAR_COUNT,
    seed: 0x5a17c9e3,
    latitudeSpread: 0.075,
});

interface SkyBandPointsProps {
    population: SkyBandPopulation;
    size: number;
    opacity: number;
}

function SkyBandPoints({
    population,
    size,
    opacity,
}: SkyBandPointsProps) {
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
            </bufferGeometry>
            <pointsMaterial
                size={size}
                sizeAttenuation={false}
                vertexColors
                transparent
                opacity={opacity}
                depthWrite={false}
                toneMapped={false}
            />
        </points>
    );
}

const hazeVertexShader = `
    varying vec3 vDirection;

    void main() {
        vDirection = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const hazeFragmentShader = `
    varying vec3 vDirection;

    void main() {
        float longitude = atan(vDirection.z, vDirection.x);
        float latitude = vDirection.y;
        float center = sin(longitude * 2.7 + 0.35) * 0.022;
        float band = exp(-pow(abs(latitude) / 0.16, 2.0));
        float irregularity = 0.72 + 0.18 * sin(longitude * 3.1 + 0.8)
            + 0.10 * sin(longitude * 7.4 - 1.1);
        float dust = 1.0 - 0.52 * exp(-pow(abs(latitude - center) / 0.032, 2.0));
        float alpha = band * irregularity * dust * 0.026;
        gl_FragColor = vec4(0.55, 0.62, 0.72, alpha);
    }
`;

/**
 * Stylized fixed celestial orientation; it does not simulate observer date,
 * location, or the exact Earth-sky galactic plane.
 */
export function MilkyWaySkyBand() {
    const rootRef = useRef<THREE.Group>(null);

    useFrame(({ camera }) => {
        rootRef.current?.position.copy(camera.position);
    });

    return (
        <group ref={rootRef} rotation={LOCAL_MILKY_WAY_ORIENTATION}>
            <mesh raycast={() => undefined}>
                <sphereGeometry args={[LOCAL_SKY_RADIUS - 4, 48, 28]} />
                <shaderMaterial
                    vertexShader={hazeVertexShader}
                    fragmentShader={hazeFragmentShader}
                    transparent
                    depthWrite={false}
                    side={THREE.BackSide}
                    blending={THREE.NormalBlending}
                    toneMapped={false}
                />
            </mesh>
            <SkyBandPoints
                population={bandStars}
                size={0.58}
                opacity={0.48}
            />
            <SkyBandPoints
                population={prominentBandStars}
                size={0.92}
                opacity={0.62}
            />
        </group>
    );
}

export const MILKY_WAY_SKY_BAND_POINT_COUNT =
    BAND_STAR_COUNT + PROMINENT_STAR_COUNT;
