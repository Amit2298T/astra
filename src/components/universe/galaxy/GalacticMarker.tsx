import { Html } from "@react-three/drei";

import type { GalacticLocation } from "@/data/galaxy";

interface GalacticMarkerProps {
    location: GalacticLocation;
}

export function GalacticMarker({ location }: GalacticMarkerProps) {
    if (!location.markerVisible) return null;

    const isCenter = location.type === "galacticCenter";
    const markerColor = isCenter ? "#e8ad69" : "#67d5ff";

    return (
        <group position={location.position}>
            <mesh position={[0, isCenter ? 22 : 18, 0]}>
                <cylinderGeometry
                    args={[isCenter ? 1.4 : 1.2, isCenter ? 2.5 : 2, isCenter ? 44 : 36, 10]}
                />
                <meshBasicMaterial
                    color={markerColor}
                    transparent
                    opacity={0.58}
                    depthWrite={false}
                    toneMapped={false}
                />
            </mesh>
            <mesh>
                <sphereGeometry args={[isCenter ? 14 : 10, 16, 16]} />
                <meshBasicMaterial
                    color={markerColor}
                    transparent
                    opacity={0.88}
                    toneMapped={false}
                />
            </mesh>
            <mesh rotation-x={Math.PI / 2}>
                <ringGeometry args={[isCenter ? 23 : 17, isCenter ? 27 : 20, 48]} />
                <meshBasicMaterial
                    color={markerColor}
                    transparent
                    opacity={0.62}
                    side={2}
                    depthWrite={false}
                    toneMapped={false}
                />
            </mesh>
            <Html center position={[0, isCenter ? 68 : 58, 0]} distanceFactor={1500}>
                <div
                    title={location.description}
                    style={{
                        pointerEvents: "none",
                        whiteSpace: "nowrap",
                        color: isCenter ? "#fde7bd" : "#d6f3ff",
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
