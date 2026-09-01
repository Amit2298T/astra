import * as THREE from "three";

import { createSeededRandom } from "@/engine/math/seededRandom";
import { BELT_SHAPE_COUNT } from "@/engine/astronomy/BeltPopulation";

let geometryCache: readonly THREE.BufferGeometry[] | null = null;

function createIrregularGeometry(seed: number): THREE.BufferGeometry {
    const geometry = new THREE.IcosahedronGeometry(1, 1);
    const positions = geometry.getAttribute("position");
    const random = createSeededRandom(seed);
    const phaseA = random() * Math.PI * 2;
    const phaseB = random() * Math.PI * 2;
    const phaseC = random() * Math.PI * 2;
    const direction = new THREE.Vector3();

    for (let index = 0; index < positions.count; index += 1) {
        direction
            .set(positions.getX(index), positions.getY(index), positions.getZ(index))
            .normalize();
        const perturbation =
            Math.sin(direction.x * 7.3 + phaseA) * 0.1 +
            Math.sin(direction.y * 9.1 + phaseB) * 0.075 +
            Math.sin(direction.z * 11.7 + phaseC) * 0.06;
        const radius = THREE.MathUtils.clamp(0.94 + perturbation, 0.72, 1.16);
        positions.setXYZ(
            index,
            direction.x * radius,
            direction.y * radius,
            direction.z * radius
        );
    }

    positions.needsUpdate = true;
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    return geometry;
}

export function getIrregularBeltGeometries(): readonly THREE.BufferGeometry[] {
    if (geometryCache) return geometryCache;

    geometryCache = Array.from({ length: BELT_SHAPE_COUNT }, (_, index) =>
        createIrregularGeometry(0x34a2f197 ^ Math.imul(index + 1, 0x45d9f3b))
    );
    return geometryCache;
}
