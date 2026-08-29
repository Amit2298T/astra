import {
    GALACTIC_SCENE_SCALE,
    galacticPolarPosition,
    nearbyGalacticPosition,
    type ScenePosition,
} from "@/engine/scale/CoordinateTransformer";

export type GalacticLocationType =
    | "galacticCenter"
    | "stellarNeighborhood"
    | "starSystem";

export interface GalacticLocation {
    id: string;
    name: string;
    type: GalacticLocationType;
    position: ScenePosition;
    description: string;
    markerVisible: boolean;
    navigationName: string;
    distanceFromGalacticCenterLightYears?: number;
}

export interface GalaxyConfig {
    id: string;
    name: string;
    radius: number;
    diskThickness: number;
    armCount: number;
    locations: readonly GalacticLocation[];
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
                "The dense dynamical center of the Milky Way. A future milestone will provide its close-up view.",
            markerVisible: true,
            navigationName: "Galactic Center",
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
            distanceFromGalacticCenterLightYears: 27000,
        },
    ],
};
