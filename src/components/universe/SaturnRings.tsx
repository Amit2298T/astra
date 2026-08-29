import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";

interface SaturnRingsProps {
    innerRadius: number;
    outerRadius: number;
    texturePath: string;
}

export function SaturnRings({
    innerRadius,
    outerRadius,
    texturePath,
}: SaturnRingsProps) {
    const [ringTexture] = useTexture([texturePath]);

    const geometry = useMemo(() => {
        const segments = 64;
        const geo = new THREE.RingGeometry(innerRadius, outerRadius, segments);

        // RingGeometry UVs default to a radial pattern; remap so the
        // texture stretches from inner to outer edge.
        const pos = geo.attributes.position;
        const uv = geo.attributes.uv;
        const v3 = new THREE.Vector3();
        for (let i = 0; i < pos.count; i++) {
            v3.fromBufferAttribute(pos, i);
            const len = v3.length();
            // u maps 0..1 around the ring, v maps inner..outer
            uv.setXY(
                i,
                uv.getX(i),
                (len - innerRadius) / (outerRadius - innerRadius)
            );
        }
        uv.needsUpdate = true;
        return geo;
    }, [innerRadius, outerRadius]);

    useEffect(() => {
        return () => {
            geometry.dispose();
        };
    }, [geometry]);

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <primitive object={geometry} attach="geometry" />
            <meshBasicMaterial
                map={ringTexture}
                side={THREE.DoubleSide}
                transparent
                opacity={0.85}
                depthWrite={false}
            />
        </mesh>
    );
}
