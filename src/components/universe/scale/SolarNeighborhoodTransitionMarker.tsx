import * as THREE from "three";

import type { ScenePosition } from "@/engine/scale/CoordinateTransformer";

interface SolarNeighborhoodTransitionMarkerProps {
    progress: number;
    localGalacticAnchor: ScenePosition;
}

export function SolarNeighborhoodTransitionMarker({
    progress,
    localGalacticAnchor,
}: SolarNeighborhoodTransitionMarkerProps) {
    const visibility = Math.sin(Math.PI * progress);
    const radius = THREE.MathUtils.lerp(1.45, 6.5, progress);

    return (
        <group
            position={[
                localGalacticAnchor[0] * progress,
                localGalacticAnchor[1] * progress,
                localGalacticAnchor[2] * progress,
            ]}
        >
            <mesh raycast={() => undefined}>
                <sphereGeometry args={[radius, 18, 18]} />
                <meshBasicMaterial
                    color="#bcecff"
                    transparent
                    opacity={visibility * 0.58}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    toneMapped={false}
                />
            </mesh>
            <mesh raycast={() => undefined}>
                <sphereGeometry args={[radius * 2.2, 18, 18]} />
                <meshBasicMaterial
                    color="#49bce8"
                    transparent
                    opacity={visibility * 0.055}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    side={THREE.BackSide}
                    toneMapped={false}
                />
            </mesh>
        </group>
    );
}
