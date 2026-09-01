"use client";

import type { PerformanceTier } from "@/engine/performance/PerformanceTier";
import { MOON_SURFACE_PROFILES } from "@/engine/surface/SurfaceTerrain";
import { FadingSceneGroup } from "../scale/FadingSceneGroup";
import { MoonHorizon } from "./MoonHorizon";
import { MoonRocks } from "./MoonRocks";
import { MoonSky } from "./MoonSky";
import { MoonTerrain } from "./MoonTerrain";

interface MoonSurfaceSceneProps {
    tier: PerformanceTier;
    opacity: number;
}

export function MoonSurfaceScene({ tier, opacity }: MoonSurfaceSceneProps) {
    const profile = MOON_SURFACE_PROFILES[tier];
    const shadowExtent = Math.max(profile.shadowExtent, 1);

    return (
        <>
            <color attach="background" args={["#010102"]} />
            <FadingSceneGroup opacity={opacity}>
                <directionalLight
                    position={[-170, 105, 70]}
                    intensity={3.8}
                    color="#fffdf8"
                    castShadow={profile.shadowsEnabled}
                    shadow-mapSize-width={profile.shadowMapSize || 512}
                    shadow-mapSize-height={profile.shadowMapSize || 512}
                    shadow-camera-left={-shadowExtent}
                    shadow-camera-right={shadowExtent}
                    shadow-camera-top={shadowExtent}
                    shadow-camera-bottom={-shadowExtent}
                    shadow-camera-near={10}
                    shadow-camera-far={420}
                    shadow-bias={-0.00035}
                    shadow-normalBias={0.025}
                    shadow-radius={1}
                />
                <ambientLight intensity={0.038} color="#8e949d" />
                <MoonHorizon />
                <MoonTerrain tier={tier} />
                <MoonRocks tier={tier} />
                <MoonSky tier={tier} />
            </FadingSceneGroup>
        </>
    );
}
