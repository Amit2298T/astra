"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

import { nebulae, type NebulaConfig } from "@/data/nebulae";
import {
    LOCAL_MILKY_WAY_ORIENTATION,
    LOCAL_SKY_RADIUS,
} from "./MilkyWaySkyBand";
import { useSceneLayerOpacity } from "./scale/FadingSceneGroup";

const GALACTIC_CENTER_SKY_LONGITUDE = -0.95;
const SKY_CUE_RADIUS = LOCAL_SKY_RADIUS - 15;

const cueVertexShader = /* glsl */ `
    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const cueFragmentShader = /* glsl */ `
    uniform vec3 uColor;
    uniform float uOpacity;
    varying vec2 vUv;

    void main() {
        float radius = length(vUv - vec2(0.5)) * 2.0;
        float haze = 1.0 - smoothstep(0.18, 1.0, radius);
        float ring = smoothstep(0.58, 0.7, radius) * (1.0 - smoothstep(0.7, 0.82, radius));
        gl_FragColor = vec4(uColor, (haze * 0.42 + ring) * uOpacity);
    }
`;

interface CuePlacement {
    config: NebulaConfig;
    position: readonly [number, number, number];
    quaternion: THREE.Quaternion;
}

const cuePlacements: readonly CuePlacement[] = nebulae
    .filter((nebula) => nebula.localSkyVisibility !== "none")
    .map((config) => {
        const longitude =
            GALACTIC_CENTER_SKY_LONGITUDE +
            (config.galacticLongitudeDeg * Math.PI) / 180;
        const latitude = (config.galacticLatitudeDeg * Math.PI) / 180;
        const horizontal = Math.cos(latitude) * SKY_CUE_RADIUS;
        const position: readonly [number, number, number] = [
            Math.cos(longitude) * horizontal,
            Math.sin(latitude) * SKY_CUE_RADIUS,
            Math.sin(longitude) * horizontal,
        ];
        const quaternion = new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 0, 1),
            new THREE.Vector3(...position).normalize().negate()
        );
        return { config, position, quaternion };
    });

export function NebulaSkyCues() {
    const rootRef = useRef<THREE.Group>(null);
    const layerOpacity = useSceneLayerOpacity();

    useFrame(({ camera }) => {
        rootRef.current?.position.copy(camera.position);
    });

    return (
        <group ref={rootRef} rotation={LOCAL_MILKY_WAY_ORIENTATION}>
            {cuePlacements.map(({ config, position, quaternion }) => {
                const isOrion = config.localSkyVisibility === "faintHaze";
                return (
                    <group key={config.id} position={position}>
                        <mesh quaternion={quaternion} raycast={() => undefined}>
                            <circleGeometry args={[isOrion ? 7 : 3.2, 32]} />
                            <shaderMaterial
                                vertexShader={cueVertexShader}
                                fragmentShader={cueFragmentShader}
                                uniforms={{
                                    uColor: {
                                        value: new THREE.Color(
                                            config.palette.marker
                                        ),
                                    },
                                    uOpacity: {
                                        value:
                                            (isOrion ? 0.16 : 0.09) *
                                            layerOpacity,
                                    },
                                }}
                                transparent
                                depthWrite={false}
                                side={THREE.DoubleSide}
                                toneMapped={false}
                            />
                        </mesh>
                        {isOrion && (
                            <Html
                                center
                                position={[0, 10, 0]}
                                distanceFactor={1000}
                                style={{ pointerEvents: "none" }}
                            >
                                <div
                                    title="Very faint local-sky astronomy guide cue; not a naked-eye color representation."
                                    style={{
                                        whiteSpace: "nowrap",
                                        color: "rgba(225, 213, 226, 0.42)",
                                        fontFamily: "Inter, system-ui, sans-serif",
                                        fontSize: "clamp(8px, 0.8vw, 10px)",
                                        fontWeight: 550,
                                        letterSpacing: "0.08em",
                                        textShadow: "0 1px 7px #000",
                                        textTransform: "uppercase",
                                        userSelect: "none",
                                        opacity: layerOpacity,
                                    }}
                                >
                                    Orion Nebula · guide
                                </div>
                            </Html>
                        )}
                    </group>
                );
            })}
        </group>
    );
}
