import * as THREE from "three";

import { createSeededRandom } from "@/engine/math/seededRandom";

const STAR_COUNT = 1250;
const DUST_COUNT = 220;

interface ParticleData {
    positions: Float32Array;
    colors: Float32Array;
}

const softPointVertexShader = /* glsl */ `
    uniform float uSize;
    varying vec3 vColor;

    void main() {
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        vColor = color;
        gl_PointSize = max(1.0, uSize * (420.0 / max(1.0, -viewPosition.z)));
        gl_Position = projectionMatrix * viewPosition;
    }
`;

const softPointFragmentShader = /* glsl */ `
    uniform float uOpacity;
    varying vec3 vColor;

    void main() {
        float radius = length(gl_PointCoord - vec2(0.5));
        if (radius > 0.5) discard;
        float softEdge = 1.0 - smoothstep(0.18, 0.5, radius);
        float core = 1.0 - smoothstep(0.0, 0.22, radius);
        gl_FragColor = vec4(vColor * (0.86 + core * 0.2), softEdge * uOpacity);
    }
`;

interface SoftParticlePointsProps {
    data: ParticleData;
    size: number;
    opacity: number;
}

function SoftParticlePoints({ data, size, opacity }: SoftParticlePointsProps) {
    return (
        <points frustumCulled={false}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[data.positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-color"
                    args={[data.colors, 3]}
                />
            </bufferGeometry>
            <shaderMaterial
                vertexShader={softPointVertexShader}
                fragmentShader={softPointFragmentShader}
                uniforms={{
                    uSize: { value: size },
                    uOpacity: { value: opacity },
                }}
                vertexColors
                transparent
                depthWrite={false}
                toneMapped={false}
            />
        </points>
    );
}

function createCentralStars() {
    const positions = new Float32Array(STAR_COUNT * 3);
    const colors = new Float32Array(STAR_COUNT * 3);
    const random = createSeededRandom(0x4c534147);
    const cool = new THREE.Color("#91b9e8");
    const warm = new THREE.Color("#f1c9a2");
    const color = new THREE.Color();

    for (let index = 0; index < STAR_COUNT; index++) {
        const radius = 32 + Math.pow(random(), 0.72) * 82;
        const azimuth = random() * Math.PI * 2;
        const vertical = random() * 2 - 1;
        const horizontal = Math.sqrt(1 - vertical * vertical);
        const offset = index * 3;

        positions[offset] = radius * horizontal * Math.cos(azimuth);
        positions[offset + 1] = radius * vertical * 0.72;
        positions[offset + 2] = radius * horizontal * Math.sin(azimuth);

        color.copy(cool).lerp(warm, random() * 0.72);
        const brightness = 0.4 + random() * 0.6;
        colors[offset] = color.r * brightness;
        colors[offset + 1] = color.g * brightness;
        colors[offset + 2] = color.b * brightness;
    }

    return { positions, colors };
}

const centralStars = createCentralStars();

function createCentralDust() {
    const positions = new Float32Array(DUST_COUNT * 3);
    const colors = new Float32Array(DUST_COUNT * 3);
    const random = createSeededRandom(0x44555354);
    const dustColor = new THREE.Color("#6b3942");

    for (let index = 0; index < DUST_COUNT; index++) {
        const radius = 25 + random() * 78;
        const angle = random() * Math.PI * 2;
        const offset = index * 3;
        positions[offset] = Math.cos(angle) * radius;
        positions[offset + 1] = (random() * 2 - 1) * 24;
        positions[offset + 2] = Math.sin(angle) * radius;
        const brightness = 0.48 + random() * 0.52;
        colors[offset] = dustColor.r * brightness;
        colors[offset + 1] = dustColor.g * brightness;
        colors[offset + 2] = dustColor.b * brightness;
    }

    return { positions, colors };
}

const centralDust = createCentralDust();

export function BlackHoleEnvironment() {
    return (
        <group>
            <SoftParticlePoints
                data={centralStars}
                size={0.11}
                opacity={0.76}
            />
            <SoftParticlePoints
                data={centralDust}
                size={2.15}
                opacity={0.048}
            />
        </group>
    );
}
