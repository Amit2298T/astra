"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

import {
    LOCAL_MILKY_WAY_ORIENTATION,
    LOCAL_SKY_RADIUS,
} from "./MilkyWaySkyBand";

const MARKER_LONGITUDE = -0.95;
const MARKER_LATITUDE =
    Math.sin(MARKER_LONGITUDE * 2.7 + 0.35) * 0.022 + 0.05;
const MARKER_RADIUS = LOCAL_SKY_RADIUS - 12;
const MARKER_POSITION: readonly [number, number, number] = [
    Math.cos(MARKER_LATITUDE) *
        Math.cos(MARKER_LONGITUDE) *
        MARKER_RADIUS,
    Math.sin(MARKER_LATITUDE) * MARKER_RADIUS,
    Math.cos(MARKER_LATITUDE) *
        Math.sin(MARKER_LONGITUDE) *
        MARKER_RADIUS,
];

const markerFacingQuaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(...MARKER_POSITION).normalize().negate()
);

/** Informational fixed-sky direction, not an exact date/location sky solution. */
export function GalacticCenterDirectionMarker() {
    const rootRef = useRef<THREE.Group>(null);

    useFrame(({ camera }) => {
        rootRef.current?.position.copy(camera.position);
    });

    return (
        <group
            ref={rootRef}
            rotation={LOCAL_MILKY_WAY_ORIENTATION}
        >
            <group position={MARKER_POSITION}>
                <mesh
                    quaternion={markerFacingQuaternion}
                    raycast={() => undefined}
                >
                    <ringGeometry args={[3.2, 4.1, 32]} />
                    <meshBasicMaterial
                        color="#c7d7e8"
                        transparent
                        opacity={0.34}
                        depthWrite={false}
                        toneMapped={false}
                        side={THREE.DoubleSide}
                    />
                </mesh>

                <Html
                    center
                    position={[0, 13, 0]}
                    distanceFactor={900}
                    style={{ pointerEvents: "none" }}
                >
                    <div
                        title="Sagittarius A* lies in this direction, toward the center of the Milky Way, but is obscured in visible light by interstellar dust."
                        style={{
                            whiteSpace: "nowrap",
                            padding: "4px 6px",
                            border: "1px solid rgba(199, 215, 232, 0.13)",
                            borderRadius: 5,
                            background: "rgba(3, 7, 18, 0.48)",
                            color: "rgba(219, 234, 254, 0.72)",
                            fontFamily: "Inter, system-ui, sans-serif",
                            fontSize: "clamp(9px, 0.9vw, 11px)",
                            fontWeight: 600,
                            letterSpacing: "0.09em",
                            lineHeight: 1.25,
                            textAlign: "center",
                            textShadow: "0 1px 7px rgba(0, 0, 0, 0.95)",
                            textTransform: "uppercase",
                            userSelect: "none",
                        }}
                    >
                        <div>Galactic Center</div>
                        <div
                            style={{
                                marginTop: 2,
                                color: "rgba(191, 219, 254, 0.48)",
                                fontSize: "0.76em",
                                fontWeight: 500,
                                letterSpacing: "0.06em",
                            }}
                        >
                            Direction of Sagittarius A*
                        </div>
                    </div>
                </Html>
            </group>
        </group>
    );
}
