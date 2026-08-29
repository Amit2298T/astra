import * as THREE from "three";
import { useEffect, useMemo } from "react";

interface OrbitRingProps {
    radius: number;
    color?: string;
    opacity?: number;
    eccentricity?: number;
    inclination?: number;
    longitudeOfAscendingNode?: number;
    segments?: number;
}

export function OrbitRing({
    radius,
    color = "#ffffff",
    opacity = 0.12,
    eccentricity = 0,
    inclination = 0,
    longitudeOfAscendingNode = 0,
    segments = 128,
}: OrbitRingProps) {
    const lineObj = useMemo(() => {
        const points: THREE.Vector3[] = [];
        const semiMinorAxis = radius * Math.sqrt(1 - eccentricity ** 2);
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            points.push(
                new THREE.Vector3(
                    (Math.cos(angle) - eccentricity) * radius,
                    0,
                    Math.sin(angle) * semiMinorAxis
                )
            );
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color,
            transparent: true,
            opacity,
            depthWrite: false,
        });
        return new THREE.Line(geometry, material);
    }, [radius, color, opacity, eccentricity, segments]);

    useEffect(() => {
        return () => {
            lineObj.geometry.dispose();
            lineObj.material.dispose();
        };
    }, [lineObj]);

    return (
        <group rotation-y={THREE.MathUtils.degToRad(longitudeOfAscendingNode)}>
            <group rotation-x={THREE.MathUtils.degToRad(inclination)}>
                <primitive object={lineObj} />
            </group>
        </group>
    );
}
