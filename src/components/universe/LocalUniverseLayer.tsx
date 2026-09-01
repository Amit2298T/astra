import { Suspense } from "react";

import { solarSystemData } from "@/data/solarSystem";
import { dwarfPlanets } from "@/data/dwarfPlanets";
import { spacecraftData } from "@/data/spacecraft";
import { getStarSystemByEntryId, starSystemsData, type StarSystemEntryId } from "@/data/starSystems";
import type { SelectedObject } from "@/engine/camera/types";
import { OrbitRing } from "./OrbitRing";
import { Planet } from "./Planet";
import { Spacecraft } from "./spacecraft/Spacecraft";
import { StarSystem } from "./stars/StarSystem";
import { Sun } from "./Sun";
import { AsteroidBelt } from "./solar/AsteroidBelt";
import { DwarfPlanet } from "./solar/DwarfPlanet";
import { KuiperBelt } from "./solar/KuiperBelt";
import {
    PERFORMANCE_PROFILES,
    type PerformanceTier,
} from "@/engine/performance/PerformanceTier";

interface LocalUniverseLayerProps {
    activeStarSystemId: StarSystemEntryId | null;
    selectedObjectId?: string;
    onSelectPlanet: (name: string) => void;
    onFocusPlanet: (name: string) => void;
    onSelectObject: (object: SelectedObject) => void;
    onFocusObject: (object: SelectedObject) => void;
    performanceTier: PerformanceTier;
}

export function LocalUniverseLayer({
    activeStarSystemId,
    selectedObjectId,
    onSelectPlanet,
    onFocusPlanet,
    onSelectObject,
    onFocusObject,
    performanceTier,
}: LocalUniverseLayerProps) {
    const activeStarSystem = getStarSystemByEntryId(activeStarSystemId);

    if (activeStarSystem) {
        return (
            <group>
                <StarSystem
                    config={activeStarSystem}
                    positionOverride={[0, 0, 0]}
                    selectedObjectId={selectedObjectId}
                    onSelect={onSelectObject}
                    onFocus={onFocusObject}
                />
            </group>
        );
    }

    return (
        <group>
            <Sun onSelect={onSelectObject} onFocus={onFocusObject} />
            <Spacecraft
                config={spacecraftData.voyager1}
                onSelect={onSelectObject}
                onFocus={onFocusObject}
            />
            <StarSystem
                config={starSystemsData.alphaCentauri}
                onSelect={onSelectObject}
                onFocus={onFocusObject}
            />
            <AsteroidBelt performanceTier={performanceTier} />
            <KuiperBelt performanceTier={performanceTier} />

            <Suspense fallback={null}>
                {solarSystemData.planets.map((planet) => (
                    <group key={planet.name}>
                        <OrbitRing
                            radius={planet.orbitRadius}
                            segments={
                                PERFORMANCE_PROFILES[performanceTier]
                                    .orbitRingSegments
                            }
                        />
                        <Planet
                            config={planet}
                            onSelect={onSelectPlanet}
                            onFocus={onFocusPlanet}
                        />
                    </group>
                ))}

                {dwarfPlanets.map((dwarfPlanet) => (
                    <group key={dwarfPlanet.id}>
                        <OrbitRing
                            radius={dwarfPlanet.orbitRadius}
                            color="#9aa8b7"
                            opacity={0.055}
                            eccentricity={dwarfPlanet.eccentricity}
                            inclination={dwarfPlanet.inclination}
                            longitudeOfAscendingNode={
                                dwarfPlanet.longitudeOfAscendingNode
                            }
                            segments={
                                PERFORMANCE_PROFILES[performanceTier]
                                    .dwarfOrbitRingSegments
                            }
                        />
                        <DwarfPlanet
                            config={dwarfPlanet}
                            onSelect={onSelectObject}
                            onFocus={onFocusObject}
                        />
                    </group>
                ))}
            </Suspense>
        </group>
    );
}
