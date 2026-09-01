"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = `
    uniform float pointSize;
    uniform float pointScale;
    uniform float maximumPointSize;

    varying vec3 vColor;

    void main() {
        vColor = color;
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        float perspectiveSize = pointSize * pointScale / max(-viewPosition.z, 0.001);
        gl_PointSize = clamp(perspectiveSize, 1.0, maximumPointSize);
        gl_Position = projectionMatrix * viewPosition;
    }
`;

const fragmentShader = `
    uniform float opacity;

    varying vec3 vColor;

    void main() {
        vec2 centered = gl_PointCoord - vec2(0.5);
        float radius = length(centered);
        if (radius >= 0.5) discard;

        float softMask = 1.0 - smoothstep(0.30, 0.5, radius);
        float alpha = opacity * softMask;
        if (alpha <= 0.002) discard;

        gl_FragColor = vec4(vColor, alpha);
    }
`;

interface BeltParticleMaterialProps {
    size: number;
    opacity: number;
}

export function BeltParticleMaterial({
    size,
    opacity,
}: BeltParticleMaterialProps) {
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const viewportHeight = useThree((state) => state.size.height);
    const pixelRatio = useThree((state) => state.viewport.dpr);
    const uniforms = useMemo(
        () => ({
            pointSize: { value: size },
            pointScale: { value: viewportHeight * pixelRatio * 0.5 },
            maximumPointSize: { value: 3.25 * pixelRatio },
            opacity: { value: opacity },
        }),
        [opacity, pixelRatio, size, viewportHeight]
    );

    useFrame(() => {
        const material = materialRef.current;
        if (material) material.uniforms.opacity.value = material.opacity;
    });

    return (
        <shaderMaterial
            ref={materialRef}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={uniforms}
            vertexColors
            transparent
            opacity={opacity}
            depthTest
            depthWrite={false}
            toneMapped={false}
        />
    );
}
