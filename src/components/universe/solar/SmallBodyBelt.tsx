"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import type { SmallBodyRegionConfig } from "@/data/smallBodyRegions";
import { createSeededRandom, randomNormal } from "@/engine/math/seededRandom";
import {
    PERFORMANCE_PROFILES,
    scaledCount,
    type PerformanceTier,
} from "@/engine/performance/PerformanceTier";
import {
    BELT_SHAPE_COUNT,
    getCachedBeltInstancePopulation,
    type BeltInstanceData,
} from "@/engine/astronomy/BeltPopulation";
import { useSceneMaterialOpacity } from "../scale/FadingSceneGroup";
import { BeltParticleMaterial } from "./BeltParticleMaterial";
import { getIrregularBeltGeometries } from "./IrregularBeltGeometry";

interface BeltPopulation {
    positions: Float32Array;
    colors: Float32Array;
}

const particlePopulationCache = new Map<string, BeltPopulation>();

function createPopulation(
    config: SmallBodyRegionConfig,
    count: number,
    seedOffset: number
): BeltPopulation {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const random = createSeededRandom(config.seed ^ seedOffset);
    const parsedColors = config.particleColors.map((hex) => {
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
        const brightness = 0.58 + random() * 0.24;
        colors[offset] = color[0] * brightness;
        colors[offset + 1] = color[1] * brightness;
        colors[offset + 2] = color[2] * brightness;
        index += 1;
    }

    return { positions, colors };
}

function getParticlePopulation(
    config: SmallBodyRegionConfig,
    performanceTier: PerformanceTier
): BeltPopulation {
    const cacheKey = `${config.id}:${performanceTier}`;
    const cached = particlePopulationCache.get(cacheKey);
    if (cached) return cached;

    const count = scaledCount(
        config.particleCount,
        PERFORMANCE_PROFILES[performanceTier].beltScale
    );
    const population = createPopulation(config, count, 0x68bc21eb);
    particlePopulationCache.set(cacheKey, population);
    return population;
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
            <BeltParticleMaterial size={size} opacity={opacity} />
        </points>
    );
}

interface SmallBodyBeltProps {
    config: SmallBodyRegionConfig;
    performanceTier?: PerformanceTier;
}

interface InstancedRockPopulationProps {
    instances: readonly BeltInstanceData[];
    geometry: THREE.BufferGeometry;
    color: string;
    opacity: number;
    shapeIndex: number;
    onMeshReady: (shapeIndex: number, mesh: THREE.InstancedMesh | null) => void;
    onMaterialReady: (
        shapeIndex: number,
        material: THREE.MeshStandardMaterial | null
    ) => void;
}

const instanceTransform = new THREE.Object3D();
const instanceColor = new THREE.Color();
const beltCenter = new THREE.Vector3();

function InstancedRockPopulation({
    instances,
    geometry,
    color,
    opacity,
    shapeIndex,
    onMeshReady,
    onMaterialReady,
}: InstancedRockPopulationProps) {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const materialRef = useRef<THREE.MeshStandardMaterial>(null);

    useLayoutEffect(() => {
        const mesh = meshRef.current;
        if (!mesh) return;

        instances.forEach((instance, index) => {
            instanceTransform.position.set(...instance.position);
            instanceTransform.rotation.set(...instance.rotation);
            instanceTransform.scale.setScalar(instance.scale);
            instanceTransform.updateMatrix();
            mesh.setMatrixAt(index, instanceTransform.matrix);
            instanceColor.setRGB(...instance.color);
            mesh.setColorAt(index, instanceColor);
        });
        mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        mesh.computeBoundingBox();
        mesh.computeBoundingSphere();
    }, [instances]);

    useLayoutEffect(() => {
        onMeshReady(shapeIndex, meshRef.current);
        onMaterialReady(shapeIndex, materialRef.current);
        return () => {
            onMeshReady(shapeIndex, null);
            onMaterialReady(shapeIndex, null);
        };
    }, [onMaterialReady, onMeshReady, shapeIndex]);

    return (
        <instancedMesh
            ref={meshRef}
            args={[geometry, undefined, instances.length]}
            frustumCulled
            raycast={() => {}}
        >
            <meshStandardMaterial
                ref={materialRef}
                color="#ffffff"
                vertexColors
                roughness={0.94}
                metalness={0.025}
                emissive={color}
                emissiveIntensity={0.05}
                transparent
                opacity={opacity}
                depthWrite
            />
        </instancedMesh>
    );
}

function smoothstep(edge0: number, edge1: number, value: number): number {
    const normalized = THREE.MathUtils.clamp(
        (value - edge0) / (edge1 - edge0),
        0,
        1
    );
    return normalized * normalized * (3 - 2 * normalized);
}

export function SmallBodyBelt({
    config,
    performanceTier = "high",
}: SmallBodyBeltProps) {
    const groupRef = useRef<THREE.Group>(null);
    const meshRefs = useRef<Array<THREE.InstancedMesh | null>>([]);
    const materialRefs = useRef<Array<THREE.MeshStandardMaterial | null>>([]);
    const sceneOpacity = useSceneMaterialOpacity();
    const particlePopulation = getParticlePopulation(config, performanceTier);
    const instancePopulation = getCachedBeltInstancePopulation(
        config,
        performanceTier
    );
    const geometries = getIrregularBeltGeometries();
    const shapePopulations = useMemo(
        () =>
            Array.from({ length: BELT_SHAPE_COUNT }, (_, shapeIndex) =>
                instancePopulation.filter(
                    (instance) => instance.shapeIndex === shapeIndex
                )
            ),
        [instancePopulation]
    );
    const setMeshRef = useMemo(
        () =>
            (shapeIndex: number, mesh: THREE.InstancedMesh | null) => {
                meshRefs.current[shapeIndex] = mesh;
            },
        []
    );
    const setMaterialRef = useMemo(
        () =>
            (
                shapeIndex: number,
                material: THREE.MeshStandardMaterial | null
            ) => {
                materialRefs.current[shapeIndex] = material;
            },
        []
    );

    useFrame(({ camera }, delta) => {
        const group = groupRef.current;
        if (!group) return;

        group.getWorldPosition(beltCenter);
        const offsetX = camera.position.x - beltCenter.x;
        const offsetY = camera.position.y - beltCenter.y;
        const offsetZ = camera.position.z - beltCenter.z;
        const radialDistance = Math.hypot(offsetX, offsetZ);
        const radialGap =
            radialDistance < config.innerRadius
                ? config.innerRadius - radialDistance
                : radialDistance > config.outerRadius
                  ? radialDistance - config.outerRadius
                  : 0;
        const verticalGap = Math.max(
            0,
            Math.abs(offsetY) - config.verticalThickness * 2
        );
        const distanceToBelt = Math.hypot(radialGap, verticalGap);
        const proximity =
            1 -
            smoothstep(
                config.instanceFadeNear,
                config.instanceFadeFar,
                distanceToBelt
            );
        const opacity = config.instanceOpacity * proximity * sceneOpacity;

        meshRefs.current.forEach((mesh, shapeIndex) => {
            if (!mesh) return;
            mesh.visible = opacity > 0.008;
            mesh.rotation.y +=
                delta * (0.0014 + shapeIndex * 0.00055) *
                (config.id === "kuiper-belt" ? 0.62 : 1);
        });
        materialRefs.current.forEach((material) => {
            if (material) material.opacity = opacity;
        });
    });

    return (
        <group ref={groupRef}>
            <BeltPoints
                population={particlePopulation}
                size={config.basePointSize}
                opacity={config.opacity}
            />
            {shapePopulations.map((instances, shapeIndex) => (
                <InstancedRockPopulation
                    key={`${config.id}-shape-${shapeIndex}`}
                    instances={instances}
                    geometry={geometries[shapeIndex]}
                    color={config.colors[shapeIndex]}
                    opacity={config.instanceOpacity}
                    shapeIndex={shapeIndex}
                    onMeshReady={setMeshRef}
                    onMaterialReady={setMaterialRef}
                />
            ))}
        </group>
    );
}
