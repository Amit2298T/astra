import { Suspense } from "react";

import { solarSystemData } from "@/data/solarSystem";
import { spacecraftData } from "@/data/spacecraft";
import { starSystemsData } from "@/data/starSystems";
import type { SelectedObject } from "@/engine/camera/types";
import { OrbitRing } from "./OrbitRing";
import { Planet } from "./Planet";
import { Spacecraft } from "./spacecraft/Spacecraft";
import { StarSystem } from "./stars/StarSystem";
import { Sun } from "./Sun";

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
            </Suspense>
        </group>
    );
}
