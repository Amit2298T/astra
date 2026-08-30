import { Html } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

import type { GalacticNavigationTarget } from "@/data/galaxy";

const CLUSTER_SPARKLES = [
    [0, 0, 0, 4.2],
    [-7, 2, 2, 2.2],
    [6, 5, -1, 1.8],
    [4, -5, 2, 1.5],
    [-4, -4, -2, 1.35],
] as const;

interface GalacticMarkerProps {
    location: GalacticNavigationTarget;
    selected?: boolean;
    emphasized?: boolean;
    onSelect?: (location: GalacticNavigationTarget) => void;
    opacityScale?: number;
}

export function GalacticMarker({
    location,
    selected = false,
    emphasized = false,
    onSelect,
    opacityScale = 1,
}: GalacticMarkerProps) {
    if (!location.markerVisible) return null;

    const isCenter = location.type === "galacticCenter";
    const isNebula = location.type === "nebula";
    const isCluster = location.type === "starCluster";
    const markerColor =
        location.markerColor ?? (isCenter ? "#e8ad69" : "#67d5ff");
    const emphasisScale = emphasized ? 1.22 : selected ? 1.12 : 1;
    const coreRadius = isCenter ? 14 : isNebula ? 7 : 10;
    const ringInnerRadius = isCenter ? 23 : isNebula ? 14 : 17;
    const ringOuterRadius = isCenter ? 27 : isNebula ? 17 : 20;
    const stemHeight = isCenter ? 44 : isNebula ? 28 : 36;

    const handleClick = (event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        if (opacityScale < 0.55) return;
        onSelect?.(location);
    };

    return (
        <group
            position={location.position}
            scale={emphasisScale}
            onClick={handleClick}
            onPointerOver={(event) => {
                event.stopPropagation();
                if (opacityScale < 0.55) return;
                document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
                document.body.style.cursor = "auto";
            }}
        >
            {isCluster ? (
                <>
                    <mesh raycast={() => undefined}>
                        <sphereGeometry args={[17, 16, 12]} />
                        <meshBasicMaterial
                            color={markerColor}
                            transparent
                            opacity={
                                (selected || emphasized ? 0.1 : 0.045) *
                                opacityScale
                            }
                            depthWrite={false}
                            blending={THREE.AdditiveBlending}
                            toneMapped={false}
                        />
                    </mesh>
                    {CLUSTER_SPARKLES.map(([x, y, z, radius], index) => (
                        <mesh key={`cluster-sparkle-${index}`} position={[x, y, z]}>
                            <sphereGeometry args={[radius, 10, 10]} />
                            <meshBasicMaterial
                                color={markerColor}
                                transparent
                                opacity={
                                    (emphasized ? 1 : selected ? 0.92 : 0.72) *
                                    opacityScale
                                }
                                toneMapped={false}
                            />
                        </mesh>
                    ))}
                </>
            ) : (
                <>
                    {isNebula && (
                        <mesh raycast={() => undefined}>
                            <sphereGeometry args={[22, 18, 12]} />
                            <meshBasicMaterial
                                color={markerColor}
                                transparent
                                opacity={
                                    (selected || emphasized ? 0.12 : 0.065) *
                                    opacityScale
                                }
                                depthWrite={false}
                                blending={THREE.AdditiveBlending}
                                toneMapped={false}
                            />
                        </mesh>
                    )}
                    <mesh position={[0, stemHeight / 2, 0]}>
                        <cylinderGeometry
                            args={[
                                isCenter ? 1.4 : isNebula ? 0.8 : 1.2,
                                isCenter ? 2.5 : isNebula ? 1.45 : 2,
                                stemHeight,
                                10,
                            ]}
                        />
                        <meshBasicMaterial
                            color={markerColor}
                            transparent
                            opacity={
                                (emphasized
                                    ? 0.82
                                    : selected
                                      ? 0.72
                                      : 0.58) * opacityScale
                            }
                            depthWrite={false}
                            toneMapped={false}
                        />
                    </mesh>
                    <mesh>
                        <sphereGeometry args={[coreRadius, 16, 16]} />
                        <meshBasicMaterial
                            color={markerColor}
                            transparent
                            opacity={
                                (emphasized ? 1 : selected ? 0.96 : 0.88) *
                                opacityScale
                            }
                            toneMapped={false}
                        />
                    </mesh>
                    <mesh rotation-x={Math.PI / 2}>
                        <ringGeometry
                            args={[ringInnerRadius, ringOuterRadius, 48]}
                        />
                        <meshBasicMaterial
                            color={markerColor}
                            transparent
                            opacity={
                                (emphasized ? 0.9 : selected ? 0.78 : 0.62) *
                                opacityScale
                            }
                            side={2}
                            depthWrite={false}
                            toneMapped={false}
                        />
                    </mesh>
                </>
            )}
            <Html
                center
                position={[
                    0,
                    location.markerLabelOffset ?? (isCenter ? 68 : 58),
                    0,
                ]}
                distanceFactor={1500}
            >
                <div
                    title={location.description}
                    style={{
                        pointerEvents: "none",
                        opacity: opacityScale,
                        whiteSpace: "nowrap",
                        color: isCenter
                            ? "#fde7bd"
                            : isCluster
                              ? "#e5efff"
                            : isNebula
                              ? "#efe2ed"
                              : "#d6f3ff",
                        fontFamily: "Inter, system-ui, sans-serif",
                        fontSize: "clamp(10px, 1.1vw, 13px)",
                        fontWeight: 650,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        textShadow: "0 2px 10px #000, 0 0 16px #000",
                        padding: "4px 7px",
                        border: `1px solid ${
                            isCenter
                                ? "rgba(232, 173, 105, 0.2)"
                                : isCluster
                                  ? "rgba(169, 213, 255, 0.22)"
                                : isNebula
                                  ? "rgba(202, 163, 193, 0.18)"
                                : "rgba(103, 213, 255, 0.2)"
                        }`,
                        borderRadius: 5,
                        background: "rgba(3, 7, 18, 0.62)",
                        backdropFilter: "blur(5px)",
                    }}
                >
                    {location.name}
                </div>
            </Html>
        </group>
    );
}
