import { useMemo } from "react";
import * as THREE from "three";

import { milkyWayConfig } from "@/data/galaxy";
import { createSeededRandom, randomNormal } from "@/engine/math/seededRandom";
import { GalacticMarker } from "./GalacticMarker";
import type { GalacticNavigationTarget } from "@/data/galaxy";
import { SOLAR_SYSTEM_GALACTIC_POSITION } from "@/data/nebulae";
import { smoothRange } from "@/engine/scale/ScaleTransition";

interface ParticlePopulation {
    positions: Float32Array;
    colors: Float32Array;
}

const BULGE_COUNT = 10000;
const DISK_COUNT = 37000;
const DUST_COUNT = 8000;
const POINT_TEXTURE_SIZE = 32;

function createCircularPointTexture(): THREE.DataTexture {
    const data = new Uint8Array(POINT_TEXTURE_SIZE * POINT_TEXTURE_SIZE * 4);
    const center = (POINT_TEXTURE_SIZE - 1) / 2;

    for (let y = 0; y < POINT_TEXTURE_SIZE; y++) {
        for (let x = 0; x < POINT_TEXTURE_SIZE; x++) {
            const distance = Math.hypot(x - center, y - center) / center;
            const alpha = THREE.MathUtils.smoothstep(1 - distance, 0, 0.34);
            const offset = (y * POINT_TEXTURE_SIZE + x) * 4;
            data[offset] = 255;
            data[offset + 1] = Math.round(alpha * 255);
            data[offset + 2] = 255;
            data[offset + 3] = Math.round(alpha * 255);
        }
    }

    const texture = new THREE.DataTexture(
        data,
        POINT_TEXTURE_SIZE,
        POINT_TEXTURE_SIZE,
        THREE.RGBAFormat
    );
    texture.needsUpdate = true;
    return texture;
}

const circularPointTexture = createCircularPointTexture();

function setParticle(
    positions: Float32Array,
    colors: Float32Array,
    index: number,
    x: number,
    y: number,
    z: number,
    color: THREE.Color,
    brightness: number
) {
    const offset = index * 3;
    positions[offset] = x;
    positions[offset + 1] = y;
    positions[offset + 2] = z;
    colors[offset] = color.r * brightness;
    colors[offset + 1] = color.g * brightness;
    colors[offset + 2] = color.b * brightness;
}

function createBulge(): ParticlePopulation {
    const positions = new Float32Array(BULGE_COUNT * 3);
    const colors = new Float32Array(BULGE_COUNT * 3);
    const random = createSeededRandom(0x83d2e7ab);
    const warm = new THREE.Color("#efb878");

    for (let index = 0; index < BULGE_COUNT; index++) {
        const radius = Math.pow(random(), 2.05) * 500;
        const azimuth = random() * Math.PI * 2;
        const elevation = Math.asin(random() * 2 - 1);
        const horizontal = Math.cos(elevation) * radius;
        const densityFade = 1 - radius / 600;
        setParticle(
            positions,
            colors,
            index,
            Math.cos(azimuth) * horizontal,
            Math.sin(elevation) * radius * 0.42,
            Math.sin(azimuth) * horizontal,
            warm,
            0.26 + densityFade * 0.46
        );
    }

    return { positions, colors };
}

function createDisk(): ParticlePopulation {
    const positions = new Float32Array(DISK_COUNT * 3);
    const colors = new Float32Array(DISK_COUNT * 3);
    const random = createSeededRandom(0xa341316c);
    const inner = new THREE.Color("#f1d0ac");
    const outer = new THREE.Color("#8eb9dc");
    const color = new THREE.Color();

    for (let index = 0; index < DISK_COUNT; index++) {
        const isArmStar = random() < 0.86;
        const normalizedRadius = isArmStar
            ? 0.12 + Math.pow(random(), 0.72) * 0.88
            : Math.sqrt(random());
        const radius = normalizedRadius * milkyWayConfig.radius;
        const arm = Math.floor(random() * milkyWayConfig.armCount);
        const armAngle = (arm / milkyWayConfig.armCount) * Math.PI * 2;
        const winding = normalizedRadius * Math.PI * 3.55;
        const irregularity = Math.sin(normalizedRadius * 17 + arm * 2.1) * 0.13;
        const scatter = isArmStar
            ? randomNormal(random) * (0.045 + normalizedRadius * 0.065)
            : random() * Math.PI * 2;
        const angle = isArmStar ? armAngle + winding + irregularity + scatter : scatter;
        const radialScatter = randomNormal(random) * (18 + radius * 0.025);
        const finalRadius = Math.max(20, radius + radialScatter);
        const thickness =
            milkyWayConfig.diskThickness * (0.38 + normalizedRadius * 0.75);
        const edgeFade = Math.pow(1 - normalizedRadius, 0.22);
        const dustLaneOffset =
            0.075 + Math.sin(normalizedRadius * 23 + arm * 1.7) * 0.025;
        const fallsInDustGap =
            isArmStar &&
            Math.abs(scatter - dustLaneOffset) < 0.032 &&
            random() < 0.72;
        const populationContrast = isArmStar ? 1 : 0.72;
        const dustAttenuation = fallsInDustGap ? 0.16 : 1;

        color.copy(inner).lerp(outer, Math.min(1, normalizedRadius * 1.12));
        setParticle(
            positions,
            colors,
            index,
            Math.cos(angle) * finalRadius,
            randomNormal(random) * thickness * 0.32,
            Math.sin(angle) * finalRadius,
            color,
            (0.46 + random() * 0.54) *
                edgeFade *
                populationContrast *
                dustAttenuation
        );
    }

    return { positions, colors };
}

function createDust(): ParticlePopulation {
    const positions = new Float32Array(DUST_COUNT * 3);
    const colors = new Float32Array(DUST_COUNT * 3);
    const random = createSeededRandom(0xc8013ea4);
    const dust = new THREE.Color("#120e18");

    for (let index = 0; index < DUST_COUNT; index++) {
        const normalizedRadius = 0.18 + Math.pow(random(), 0.8) * 0.77;
        const radius = normalizedRadius * milkyWayConfig.radius;
        const arm = Math.floor(random() * milkyWayConfig.armCount);
        const brokenLaneOffset =
            0.075 + Math.sin(normalizedRadius * 23 + arm * 1.7) * 0.025;
        const angle =
            (arm / milkyWayConfig.armCount) * Math.PI * 2 +
            normalizedRadius * Math.PI * 3.55 +
            brokenLaneOffset +
            randomNormal(random) * 0.032;
        const radialJitter = randomNormal(random) * (12 + radius * 0.008);
        setParticle(
            positions,
            colors,
            index,
            Math.cos(angle) * (radius + radialJitter),
            randomNormal(random) * 13,
            Math.sin(angle) * (radius + radialJitter),
            dust,
            0.32 + random() * 0.24
        );
    }

    return { positions, colors };
}

interface GalaxyPointsProps {
    population: ParticlePopulation;
    size: number;
    opacity: number;
    blending?: THREE.Blending;
}

function GalaxyPoints({
    population,
    size,
    opacity,
    blending = THREE.AdditiveBlending,
}: GalaxyPointsProps) {
    return (
        <points frustumCulled={false}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[population.positions, 3]} />
                <bufferAttribute attach="attributes-color" args={[population.colors, 3]} />
            </bufferGeometry>
            <pointsMaterial
                size={size}
                sizeAttenuation
                vertexColors
                transparent
                opacity={opacity}
                alphaMap={circularPointTexture}
                alphaTest={0.025}
                depthWrite={false}
                blending={blending}
                toneMapped={false}
            />
        </points>
    );
}

interface MilkyWayProps {
    selectedTargetId?: string;
    activeTargetId?: string;
    isTraveling?: boolean;
    onSelectTarget?: (target: GalacticNavigationTarget) => void;
    opacityScale?: number;
    scaleProgress?: number;
}

export function MilkyWay({
    selectedTargetId,
    activeTargetId,
    isTraveling = false,
    onSelectTarget,
    opacityScale = 1,
    scaleProgress = 1,
}: MilkyWayProps) {
    const populations = useMemo(
        () => ({ bulge: createBulge(), disk: createDisk(), dust: createDust() }),
        []
    );

    const markerOpacity = opacityScale * smoothRange(scaleProgress, 0.76, 0.96);
    const anchorOffset = 1 - scaleProgress;

    return (
        <group
            position={[
                -SOLAR_SYSTEM_GALACTIC_POSITION[0] * anchorOffset,
                -SOLAR_SYSTEM_GALACTIC_POSITION[1] * anchorOffset,
                -SOLAR_SYSTEM_GALACTIC_POSITION[2] * anchorOffset,
            ]}
        >
            <group rotation={[0, -0.14, 0]}>
                <GalaxyPoints
                    population={populations.bulge}
                    size={4.8}
                    opacity={0.5 * opacityScale}
                />
                <GalaxyPoints
                    population={populations.disk}
                    size={4.1}
                    opacity={0.86 * opacityScale}
                />
                <GalaxyPoints
                    population={populations.dust}
                    size={6.8}
                    opacity={0.3 * opacityScale}
                    blending={THREE.NormalBlending}
                />
            </group>
            {milkyWayConfig.locations.map((location) => (
                <GalacticMarker
                    key={location.id}
                    location={location}
                    selected={selectedTargetId === location.id}
                    emphasized={
                        isTraveling && activeTargetId === location.id
                    }
                    onSelect={onSelectTarget}
                    opacityScale={markerOpacity}
                />
            ))}
        </group>
    );
}

export const MILKY_WAY_PARTICLE_COUNT = BULGE_COUNT + DISK_COUNT + DUST_COUNT;
