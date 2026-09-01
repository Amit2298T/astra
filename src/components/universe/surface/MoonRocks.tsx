"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { createSeededRandom } from "@/engine/math/seededRandom";
import type { PerformanceTier } from "@/engine/performance/PerformanceTier";
import {
    getCachedMoonRockPlacements,
    MOON_SURFACE_PROFILES,
    type MoonRockPlacement,
} from "@/engine/surface/SurfaceTerrain";

let rockGeometryCache: readonly THREE.BufferGeometry[] | null = null;
const transform = new THREE.Object3D();
const color = new THREE.Color();

function getRockGeometries(): readonly THREE.BufferGeometry[] {
    if (rockGeometryCache) return rockGeometryCache;

    rockGeometryCache = Array.from({ length: 3 }, (_, shapeIndex) => {
        const geometry = new THREE.IcosahedronGeometry(1, 1);
        const positions = geometry.getAttribute("position");
        const random = createSeededRandom(0x4c756e61 ^ (shapeIndex + 1) * 7919);
        const phaseA = random() * Math.PI * 2;
        const phaseB = random() * Math.PI * 2;
        const direction = new THREE.Vector3();

        for (let index = 0; index < positions.count; index += 1) {
            direction
                .set(
                    positions.getX(index),
                    positions.getY(index),
                    positions.getZ(index)
                )
                .normalize();
            const radius = THREE.MathUtils.clamp(
                0.9 +
                    Math.sin(direction.x * 8.1 + phaseA) * 0.13 +
                    Math.sin(direction.z * 10.7 + phaseB) * 0.09,
                0.68,
                1.15
            );
            positions.setXYZ(
                index,
                direction.x * radius,
                direction.y * radius * (0.72 + shapeIndex * 0.07),
                direction.z * radius
            );
        }

        positions.needsUpdate = true;
        geometry.computeVertexNormals();
        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();
        return geometry;
    });
    return rockGeometryCache;
}

interface MoonRockGroupProps {
    placements: readonly MoonRockPlacement[];
    geometry: THREE.BufferGeometry;
    castShadow: boolean;
}

function MoonRockGroup({
    placements,
    geometry,
    castShadow,
}: MoonRockGroupProps) {
    const meshRef = useRef<THREE.InstancedMesh>(null);

    useLayoutEffect(() => {
        const mesh = meshRef.current;
        if (!mesh) return;

        placements.forEach((placement, index) => {
            transform.position.set(...placement.position);
            transform.rotation.set(...placement.rotation);
            transform.scale.setScalar(placement.scale);
            transform.updateMatrix();
            mesh.setMatrixAt(index, transform.matrix);
            color.setRGB(
                placement.shade * 0.97,
                placement.shade * 0.99,
                placement.shade * 1.02
            );
            mesh.setColorAt(index, color);
        });
        mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        mesh.computeBoundingBox();
        mesh.computeBoundingSphere();
    }, [placements]);

    return (
        <instancedMesh
            ref={meshRef}
            args={[geometry, undefined, placements.length]}
            castShadow={castShadow}
            receiveShadow
            raycast={() => {}}
        >
            <meshStandardMaterial
                color="#ffffff"
                vertexColors
                roughness={0.91}
                metalness={0.005}
                emissive="#101216"
                emissiveIntensity={0.18}
            />
        </instancedMesh>
    );
}

export function MoonRocks({ tier }: { tier: PerformanceTier }) {
    const placements = getCachedMoonRockPlacements(tier);
    const geometries = getRockGeometries();
    const shapePlacements = useMemo(
        () =>
            geometries.map((_, shapeIndex) =>
                placements.filter(
                    (placement) => placement.shapeIndex === shapeIndex
                )
            ),
        [geometries, placements]
    );

    return shapePlacements.map((population, shapeIndex) => (
        <MoonRockGroup
            key={`moon-rock-shape-${shapeIndex}`}
            placements={population}
            geometry={geometries[shapeIndex]}
            castShadow={MOON_SURFACE_PROFILES[tier].rockShadows}
        />
    ));
}
