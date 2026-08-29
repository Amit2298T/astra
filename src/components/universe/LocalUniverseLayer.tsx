import { Suspense } from "react";

import { solarSystemData } from "@/data/solarSystem";
import { dwarfPlanets } from "@/data/dwarfPlanets";
import { spacecraftData } from "@/data/spacecraft";
import { starSystemsData } from "@/data/starSystems";
import type { SelectedObject } from "@/engine/camera/types";
import { OrbitRing } from "./OrbitRing";
import { Planet } from "./Planet";
import { Spacecraft } from "./spacecraft/Spacecraft";
import { StarSystem } from "./stars/StarSystem";
import { Sun } from "./Sun";
import { AsteroidBelt } from "./solar/AsteroidBelt";
import { DwarfPlanet } from "./solar/DwarfPlanet";
import { KuiperBelt } from "./solar/KuiperBelt";

interface LocalUniverseLayerProps {
    onSelectPlanet: (name: string) => void;
    onFocusPlanet: (name: string) => void;
    onSelectObject: (object: SelectedObject) => void;
    onFocusObject: (object: SelectedObject) => void;
}

export function LocalUniverseLayer({
    onSelectPlanet,
    onFocusPlanet,
    onSelectObject,
    onFocusObject,
}: LocalUniverseLayerProps) {
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

            <AsteroidBelt />
            <KuiperBelt />

            <Suspense fallback={null}>
                {solarSystemData.planets.map((planet) => (
                    <group key={planet.name}>
                        <OrbitRing radius={planet.orbitRadius} />
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
                            segments={192}
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
