"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

interface AccretionDiskProps {
    innerRadius: number;
    outerRadius: number;
}

const vertexShader = /* glsl */ `
    varying vec3 vLocalPosition;

    void main() {
        vLocalPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragmentShader = /* glsl */ `
    uniform float uTime;
    uniform float uInnerRadius;
    uniform float uOuterRadius;
    varying vec3 vLocalPosition;

    float hash21(vec2 point) {
        point = fract(point * vec2(123.34, 456.21));
        point += dot(point, point + 45.32);
        return fract(point.x * point.y);
    }

    float valueNoise(vec2 point) {
        vec2 cell = floor(point);
        vec2 local = fract(point);
        local = local * local * (3.0 - 2.0 * local);
        float a = hash21(cell);
        float b = hash21(cell + vec2(1.0, 0.0));
        float c = hash21(cell + vec2(0.0, 1.0));
        float d = hash21(cell + vec2(1.0, 1.0));
        return mix(mix(a, b, local.x), mix(c, d, local.x), local.y);
    }

    float flowNoise(vec2 point) {
        float value = 0.0;
        float amplitude = 0.58;
        for (int octave = 0; octave < 3; octave++) {
            value += valueNoise(point) * amplitude;
            point = point * 2.03 + vec2(7.1, 3.7);
            amplitude *= 0.48;
        }
        return value;
    }

    void main() {
        float radius = length(vLocalPosition.xy);
        float radial = clamp(
            (radius - uInnerRadius) / (uOuterRadius - uInnerRadius),
            0.0,
            1.0
        );
        float angle = atan(vLocalPosition.y, vLocalPosition.x);
        float innerRate = mix(0.34, 0.08, smoothstep(0.0, 1.0, radial));
        float advectedAngle = angle - uTime * innerRate;

        float broadFlow = flowNoise(vec2(advectedAngle * 1.45, radial * 6.2 - uTime * 0.035));
        float fineFlow = flowNoise(vec2(advectedAngle * 4.1 + broadFlow * 1.8, radial * 14.0 + uTime * 0.06));
        float edgeNoise = valueNoise(vec2(angle * 2.25 - uTime * 0.025, radial * 8.0));
        float warpedRadial = radial
            + (broadFlow - 0.52) * 0.11
            + sin(advectedAngle * 5.0 + radial * 9.0) * 0.012;

        float heat = 1.0 - smoothstep(0.02, 0.86, warpedRadial);
        vec3 outerColor = vec3(0.39, 0.025, 0.012);
        vec3 middleColor = vec3(0.98, 0.24, 0.025);
        vec3 innerColor = vec3(1.0, 0.78, 0.42);
        vec3 color = mix(outerColor, middleColor, smoothstep(0.0, 0.68, heat));
        color = mix(color, innerColor, smoothstep(0.68, 1.0, heat) * 0.88);

        // A restrained asymmetric brightness suggests relativistic beaming.
        float beaming = 0.65 + 0.43 * (0.5 + 0.5 * cos(angle - 0.55));
        float innerFade = smoothstep(0.0, 0.055 + broadFlow * 0.018, radial);
        float irregularOuterLimit = 0.69 + edgeNoise * 0.27;
        float outerFade = 1.0 - smoothstep(irregularOuterLimit - 0.24, irregularOuterLimit, radial);
        outerFade *= 1.0 - smoothstep(0.64, 1.0, radial);

        float streaks = smoothstep(0.25, 0.82, fineFlow + broadFlow * 0.22);
        float knots = pow(smoothstep(0.62, 0.94, broadFlow * 0.58 + fineFlow * 0.55), 1.7);
        float laneOpacity = mix(0.34, 0.94, streaks) + knots * 0.24;
        float alpha = innerFade * outerFade * laneOpacity * beaming * (0.34 + heat * 0.48);

        gl_FragColor = vec4(color * beaming * (0.86 + knots * 0.2), alpha);
    }
`;

export function AccretionDisk({ innerRadius, outerRadius }: AccretionDiskProps) {
    const diskRef = useRef<THREE.Group>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    useFrame((_, delta) => {
        if (diskRef.current) diskRef.current.rotation.z += delta * 0.012;
        if (materialRef.current) materialRef.current.uniforms.uTime.value += delta;
    });

    return (
        <group ref={diskRef} rotation={[-1.03, 0.13, -0.18]}>
            <mesh renderOrder={3}>
                <ringGeometry args={[innerRadius, outerRadius, 256, 5]} />
                <shaderMaterial
                    ref={materialRef}
                    vertexShader={vertexShader}
                    fragmentShader={fragmentShader}
                    uniforms={{
                        uTime: { value: 0 },
                        uInnerRadius: { value: innerRadius },
                        uOuterRadius: { value: outerRadius },
                    }}
                    side={THREE.DoubleSide}
                    transparent
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    toneMapped={false}
                />
            </mesh>
        </group>
    );
}
