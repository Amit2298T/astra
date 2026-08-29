import {
    GALACTIC_SCENE_SCALE,
    galacticPolarPosition,
    nearbyGalacticPosition,
    type ScenePosition,
} from "@/engine/scale/CoordinateTransformer";

export type GalacticTargetType =
    | "galacticCenter"
    | "stellarNeighborhood"
    | "starSystem"
    | "nebula"
    | "starCluster"
    | "stellarNursery"
    | "blackHole"
    | "galacticRegion";

export interface GalacticTargetFact {
    label: string;
    value: string;
}

export interface GalacticNavigationTarget {
    id: string;
    name: string;
    type: GalacticTargetType;
    position: ScenePosition;
    description: string;
    markerVisible: boolean;
    navigationName: string;
    navigationRadius: number;
    facts: readonly GalacticTargetFact[];
    localSpaceDestination?: "solarSystem";
    distanceFromGalacticCenterLightYears?: number;
}

export type GalacticLocation = GalacticNavigationTarget;

export interface GalaxyConfig {
    id: string;
    name: string;
    radius: number;
    diskThickness: number;
    armCount: number;
    locations: readonly GalacticNavigationTarget[];
}

const solarSystemPosition = galacticPolarPosition(1120, -0.58, 5);

export const milkyWayConfig: GalaxyConfig = {
    id: "milky-way",
    name: "Milky Way",
    radius: GALACTIC_SCENE_SCALE.milkyWayRadius,
    diskThickness: 120,
    armCount: 4,
    locations: [
        {
            id: "galactic-center",
            name: "Galactic Center",
            type: "galacticCenter",
            position: [0, 0, 0],
            description:
                "The dense dynamical center of the Milky Way, home to the supermassive black hole Sagittarius A*.",
            markerVisible: true,
            navigationName: "Galactic Center",
            navigationRadius: 1050,
            facts: [
                { label: "Region", value: "Milky Way central region" },
                { label: "From Solar System", value: "About 26,000 ly" },
                { label: "Close-up", value: "Sagittarius A* available" },
            ],
            distanceFromGalacticCenterLightYears: 0,
        },
        {
            id: "solar-system-galactic",
            name: "Solar System",
            type: "stellarNeighborhood",
            position: solarSystemPosition,
            description:
                "Our location in the Orion Spur, between the Sagittarius and Perseus spiral arms.",
            markerVisible: true,
            navigationName: "Solar System",
            navigationRadius: 900,
            localSpaceDestination: "solarSystem",
            facts: [
                { label: "Region", value: "Orion Spur / Local Arm" },
                { label: "From Galactic Center", value: "About 27,000 ly" },
                { label: "Local Destination", value: "Solar System" },
            ],
            distanceFromGalacticCenterLightYears: 27000,
        },
        {
            id: "alpha-centauri-region-galactic",
            name: "Alpha Centauri region",
            type: "starSystem",
            position: nearbyGalacticPosition(solarSystemPosition, [1.4, 0.15, -0.9]),
            description:
                "The nearest stellar system; effectively coincident with the Solar System at galactic scale.",
            markerVisible: false,
            navigationName: "Alpha Centauri region",
            navigationRadius: 800,
            localSpaceDestination: "solarSystem",
            facts: [
                { label: "Region", value: "Solar neighborhood" },
                { label: "Scale", value: "Coincident at galaxy scale" },
            ],
            distanceFromGalacticCenterLightYears: 27000,
        },
    ],
};
