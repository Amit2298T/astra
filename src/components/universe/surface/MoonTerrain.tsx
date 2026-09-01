"use client";

import * as THREE from "three";

import type { PerformanceTier } from "@/engine/performance/PerformanceTier";
import {
    getCachedMoonTerrainGrid,
    MOON_SURFACE_PROFILES,
    MOON_TERRAIN_SIZE,
} from "@/engine/surface/SurfaceTerrain";

const terrainGeometryCache = new Map<PerformanceTier, THREE.BufferGeometry>();

function getTerrainGeometry(tier: PerformanceTier): THREE.BufferGeometry {
    const cached = terrainGeometryCache.get(tier);
    if (cached) return cached;

    const resolution = MOON_SURFACE_PROFILES[tier].terrainResolution;
    const grid = getCachedMoonTerrainGrid(resolution);
    const vertexCount = resolution * resolution;
    const positions = new Float32Array(vertexCount * 3);
    const colors = new Float32Array(vertexCount * 3);
    const indices = new Uint32Array((resolution - 1) * (resolution - 1) * 6);
    const spacing = MOON_TERRAIN_SIZE / (resolution - 1);
    const halfSize = MOON_TERRAIN_SIZE * 0.5;

    for (let row = 0; row < resolution; row += 1) {
        for (let column = 0; column < resolution; column += 1) {
            const vertexIndex = row * resolution + column;
            const offset = vertexIndex * 3;
            const height = grid.heights[vertexIndex];
            const worldX = column * spacing - halfSize;
            const worldZ = row * spacing - halfSize;
            const left = grid.heights[row * resolution + Math.max(0, column - 1)];
            const right =
                grid.heights[
                    row * resolution + Math.min(resolution - 1, column + 1)
                ];
            const down =
                grid.heights[Math.max(0, row - 1) * resolution + column];
            const up =
                grid.heights[
                    Math.min(resolution - 1, row + 1) * resolution + column
                ];
            const slope = Math.hypot(
                (right - left) / (spacing * 2),
                (up - down) / (spacing * 2)
            );
            const tonalVariation =
                Math.sin(worldX * 0.37 + worldZ * 0.19) * 0.022 +
                Math.sin(worldX * 0.083 - worldZ * 0.11) * 0.016;
            const shade = THREE.MathUtils.clamp(
                0.345 + height * 0.004 + tonalVariation - slope * 0.038,
                0.235,
                0.435
            );

            positions[offset] = worldX;
            positions[offset + 1] = height;
            positions[offset + 2] = worldZ;
            colors[offset] = shade * 0.975;
            colors[offset + 1] = shade * 0.99;
            colors[offset + 2] = shade * 1.015;
        }
    }

    let indexOffset = 0;
    for (let row = 0; row < resolution - 1; row += 1) {
        for (let column = 0; column < resolution - 1; column += 1) {
            const topLeft = row * resolution + column;
            const topRight = topLeft + 1;
            const bottomLeft = topLeft + resolution;
            const bottomRight = bottomLeft + 1;
            indices[indexOffset] = topLeft;
            indices[indexOffset + 1] = bottomLeft;
            indices[indexOffset + 2] = topRight;
            indices[indexOffset + 3] = topRight;
            indices[indexOffset + 4] = bottomLeft;
            indices[indexOffset + 5] = bottomRight;
            indexOffset += 6;
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    terrainGeometryCache.set(tier, geometry);
    return geometry;
}

export function MoonTerrain({ tier }: { tier: PerformanceTier }) {
    return (
        <mesh
            geometry={getTerrainGeometry(tier)}
            castShadow={MOON_SURFACE_PROFILES[tier].shadowsEnabled}
            receiveShadow={MOON_SURFACE_PROFILES[tier].shadowsEnabled}
            dispose={null}
        >
            <meshStandardMaterial
                color="#ffffff"
                vertexColors
                roughness={1}
                metalness={0}
            />
        </mesh>
    );
}
