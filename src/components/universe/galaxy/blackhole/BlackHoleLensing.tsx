"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

interface BlackHoleLensingProps {
    eventHorizonRadius: number;
}

const lensVertexShader = /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vViewDirection;
    varying vec3 vLocalPosition;

    void main() {
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vViewDirection = normalize(-viewPosition.xyz);
        vLocalPosition = position;
        gl_Position = projectionMatrix * viewPosition;
    }
`;

const lensFragmentShader = /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vViewDirection;
    varying vec3 vLocalPosition;

    void main() {
        float fresnel = pow(1.0 - abs(dot(vNormal, vViewDirection)), 3.8);
        float variation = 0.84 + 0.16 * sin(
            atan(vLocalPosition.y, vLocalPosition.x) * 7.0
            + vLocalPosition.z * 2.4
        );
        float alpha = fresnel * variation * 0.34;
        vec3 color = mix(vec3(0.16, 0.31, 0.5), vec3(1.0, 0.5, 0.12), fresnel);
        gl_FragColor = vec4(color, alpha);
    }
`;

const photonVertexShader = /* glsl */ `
    varying vec3 vLocalPosition;

    void main() {
        vLocalPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const photonFragmentShader = /* glsl */ `
    uniform float uTime;
    varying vec3 vLocalPosition;

    void main() {
        float angle = atan(vLocalPosition.y, vLocalPosition.x);
        float broadVariation = sin(angle * 5.0 - uTime * 0.32) * 0.12;
        float fineVariation = sin(angle * 17.0 + uTime * 0.19) * 0.055;
        float shimmer = 0.79 + broadVariation + fineVariation;
        vec3 warm = vec3(1.0, 0.54, 0.18);
        vec3 pale = vec3(1.0, 0.84, 0.56);
        vec3 color = mix(warm, pale, 0.52 + broadVariation * 1.4);
        gl_FragColor = vec4(color * shimmer, 0.68 + shimmer * 0.19);
    }
`;

export function BlackHoleLensing({ eventHorizonRadius }: BlackHoleLensingProps) {
    const photonMaterialRef = useRef<THREE.ShaderMaterial>(null);

    useFrame((_, delta) => {
        if (photonMaterialRef.current) {
            photonMaterialRef.current.uniforms.uTime.value += delta;
        }
    });

    return (
        <group>
            <mesh renderOrder={4}>
                <sphereGeometry args={[eventHorizonRadius * 1.34, 64, 40]} />
                <shaderMaterial
                    vertexShader={lensVertexShader}
                    fragmentShader={lensFragmentShader}
                    transparent
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    side={THREE.FrontSide}
                    toneMapped={false}
                />
            </mesh>
            <group
                rotation={[-0.88, 0.1, -0.16]}
                scale={[1, 0.76, 1]}
                renderOrder={4}
            >
                <mesh rotation={[0, 0, 0.08]}>
                    <torusGeometry
                        args={[
                            eventHorizonRadius * 1.55,
                            0.075,
                            8,
                            72,
                            Math.PI * 0.9,
                        ]}
                    />
                    <meshBasicMaterial
                        color="#ff8a35"
                        transparent
                        opacity={0.2}
                        depthWrite={false}
                        blending={THREE.AdditiveBlending}
                        toneMapped={false}
                    />
                </mesh>
                <mesh rotation={[0, 0, Math.PI + 0.08]}>
                    <torusGeometry
                        args={[
                            eventHorizonRadius * 1.55,
                            0.075,
                            8,
                            72,
                            Math.PI * 0.9,
                        ]}
                    />
                    <meshBasicMaterial
                        color="#ffd08a"
                        transparent
                        opacity={0.16}
                        depthWrite={false}
                        blending={THREE.AdditiveBlending}
                        toneMapped={false}
                    />
                </mesh>
            </group>
            <mesh rotation={[-1.03, 0.13, -0.18]} renderOrder={5}>
                <torusGeometry
                    args={[eventHorizonRadius * 1.23, 0.055, 10, 160]}
                />
                <shaderMaterial
                    ref={photonMaterialRef}
                    vertexShader={photonVertexShader}
                    fragmentShader={photonFragmentShader}
                    uniforms={{ uTime: { value: 0 } }}
                    transparent
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    toneMapped={false}
                />
            </mesh>
        </group>
    );
}
