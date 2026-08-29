import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface StarLayerData {
    positions: Float32Array;
    colors: Float32Array;
}

interface StarLayerConfig {
    count: number;
    innerRadius: number;
    outerRadius: number;
    seed: number;
}

const STELLAR_COLORS = [
    [0.82, 0.86, 0.92],
    [0.72, 0.8, 0.94],
    [0.94, 0.91, 0.82],
    [0.9, 0.78, 0.68],
] as const;

function createSeededRandom(initialSeed: number) {
    let seed = initialSeed >>> 0;

    return () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed / 0x100000000;
    };
}

function createStarLayer({
    count,
    innerRadius,
    outerRadius,
    seed,
}: StarLayerConfig): StarLayerData {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const random = createSeededRandom(seed);

    for (let index = 0; index < count; index++) {
        const longitude = random() * Math.PI * 2;
        const vertical = random() * 2 - 1;
        const horizontal = Math.sqrt(1 - vertical * vertical);
        const radius = innerRadius + random() * (outerRadius - innerRadius);
        const offset = index * 3;

        positions[offset] =
            radius * horizontal * Math.cos(longitude);
        positions[offset + 1] = radius * vertical;
        positions[offset + 2] =
            radius * horizontal * Math.sin(longitude);

        const colorRoll = random();
        const colorIndex =
            colorRoll < 0.62
                ? 0
                : colorRoll < 0.82
                  ? 1
                  : colorRoll < 0.97
                    ? 2
                    : 3;
        const color = STELLAR_COLORS[colorIndex];
        const brightness = 0.72 + random() * 0.28;

        colors[offset] = color[0] * brightness;
        colors[offset + 1] = color[1] * brightness;
        colors[offset + 2] = color[2] * brightness;
    }

    return { positions, colors };
}

const distantStars = createStarLayer({
    count: 7200,
    innerRadius: 1250,
    outerRadius: 1700,
    seed: 0x5f3759df,
});

const mediumStars = createStarLayer({
    count: 1700,
    innerRadius: 750,
    outerRadius: 1050,
    seed: 0x8da6b343,
});

const prominentStars = createStarLayer({
    count: 260,
    innerRadius: 450,
    outerRadius: 650,
    seed: 0xc2b2ae35,
});

interface StarPointsProps {
    data: StarLayerData;
    size: number;
    opacity: number;
}

function StarPoints({ data, size, opacity }: StarPointsProps) {
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
            <pointsMaterial
                size={size}
                sizeAttenuation={false}
                vertexColors
                transparent
                opacity={opacity}
                depthWrite={false}
                toneMapped={false}
            />
        </points>
    );
}

export function StarField() {
    const fieldRef = useRef<THREE.Group>(null);
    const mediumRef = useRef<THREE.Group>(null);
    const prominentRef = useRef<THREE.Group>(null);

    useFrame(({ camera }, delta) => {
        if (fieldRef.current) {
            fieldRef.current.position.copy(camera.position);
        }
        if (mediumRef.current) {
            mediumRef.current.rotation.y += delta * 0.00012;
        }
        if (prominentRef.current) {
            prominentRef.current.rotation.x += delta * 0.00008;
        }
    });

    return (
        <group ref={fieldRef}>
            <StarPoints data={distantStars} size={0.62} opacity={0.58} />
            <group ref={mediumRef}>
                <StarPoints data={mediumStars} size={0.92} opacity={0.72} />
            </group>
            <group ref={prominentRef}>
                <StarPoints
                    data={prominentStars}
                    size={1.35}
                    opacity={0.82}
                />
            </group>
        </group>
    );
}
