import * as THREE from "three";
import { useEffect, useMemo } from "react";

interface OrbitRingProps {
    radius: number;
    color?: string;
    opacity?: number;
}

export function OrbitRing({
    radius,
    color = "#ffffff",
    opacity = 0.12,
}: OrbitRingProps) {
    const lineObj = useMemo(() => {
        const segments = 128;
        const points: THREE.Vector3[] = [];
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            points.push(
                new THREE.Vector3(
                    Math.cos(angle) * radius,
                    0,
                    Math.sin(angle) * radius
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
    }, [radius, color, opacity]);

    useEffect(() => {
        return () => {
            lineObj.geometry.dispose();
            lineObj.material.dispose();
        };
    }, [lineObj]);

    return <primitive object={lineObj} />;
}
