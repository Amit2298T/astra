import * as THREE from "three";

export interface ClusterPopulation {
    positions: Float32Array;
    colors: Float32Array;
    sizes: Float32Array;
}

interface ClusterPointsProps {
    population: ClusterPopulation;
    opacity?: number;
}

const vertexShader = /* glsl */ `
    attribute float aSize;
    varying vec3 vColor;

    void main() {
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        vColor = color;
        gl_PointSize = clamp(
            aSize * (260.0 / max(1.0, -viewPosition.z)),
            1.0,
            13.0
        );
        gl_Position = projectionMatrix * viewPosition;
    }
`;

const fragmentShader = /* glsl */ `
    uniform float uOpacity;
    varying vec3 vColor;

    void main() {
        float radius = length(gl_PointCoord - vec2(0.5));
        if (radius > 0.5) discard;
        float halo = 1.0 - smoothstep(0.15, 0.5, radius);
        float core = 1.0 - smoothstep(0.0, 0.12, radius);
        gl_FragColor = vec4(vColor * (0.82 + core * 0.5), halo * uOpacity);
    }
`;

export function ClusterPoints({
    population,
    opacity = 0.9,
}: ClusterPointsProps) {
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
            </bufferGeometry>
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={{ uOpacity: { value: opacity } }}
                vertexColors
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                toneMapped={false}
            />
        </points>
    );
}
