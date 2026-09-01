import * as THREE from "three";

let horizonGeometry: THREE.BufferGeometry | null = null;

function getHorizonGeometry(): THREE.BufferGeometry {
    if (horizonGeometry) return horizonGeometry;

    const geometry = new THREE.RingGeometry(420, 1800, 192, 18);
    geometry.rotateX(-Math.PI / 2);
    const positions = geometry.getAttribute("position");

    for (let index = 0; index < positions.count; index += 1) {
        const x = positions.getX(index);
        const z = positions.getZ(index);
        const radius = Math.hypot(x, z);
        const angle = Math.atan2(z, x);
        const curve = Math.pow(
            THREE.MathUtils.clamp((radius - 420) / 1380, 0, 1),
            1.55
        );
        const ridgeEnvelope = Math.exp(
            -Math.pow((radius - 500) / 210, 2)
        );
        const ridgeSilhouette =
            2.2 +
            Math.sin(angle * 3 + 0.8) * 1.7 +
            Math.sin(angle * 7 - 1.4) * 0.85 +
            Math.sin(angle * 13 + 0.2) * 0.35;
        positions.setY(
            index,
            -4.5 + ridgeSilhouette * ridgeEnvelope - curve * 118
        );
    }

    positions.needsUpdate = true;
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    horizonGeometry = geometry;
    return geometry;
}

export function MoonHorizon() {
    return (
        <mesh geometry={getHorizonGeometry()} receiveShadow dispose={null}>
            <meshStandardMaterial
                color="#35383b"
                roughness={1}
                metalness={0}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}
