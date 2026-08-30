import {
    GALACTIC_SCENE_SCALE,
    nearbyGalacticPosition,
    type ScenePosition,
} from "@/engine/scale/CoordinateTransformer";
import {
    nebulae,
    SOLAR_SYSTEM_GALACTIC_POSITION,
} from "@/data/nebulae";
import { starClusters } from "@/data/starClusters";

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
    markerColor?: string;
    markerLabelOffset?: number;
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

const solarSystemPosition = SOLAR_SYSTEM_GALACTIC_POSITION;

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
        ...nebulae.map(
            (nebula, index): GalacticNavigationTarget => ({
                id: nebula.id,
                name: nebula.name,
                type: "nebula",
                position: nebula.galacticPosition,
                description: nebula.description,
                markerVisible: true,
                navigationName: nebula.name,
                navigationRadius: nebula.navigationRadius,
                markerColor: nebula.palette.marker,
                markerLabelOffset: 52 + (index % 3) * 17,
                facts: [
                    { label: "Catalog", value: nebula.catalogName },
                    { label: "Type", value: nebula.classification },
                    { label: "Constellation", value: nebula.constellation },
                    { label: "Distance", value: nebula.distanceLabel },
                    { label: "Scale", value: nebula.approximateSizeLy },
                    ...nebula.facts,
                ],
            })
        ),
        ...starClusters.map(
            (cluster, index): GalacticNavigationTarget => ({
                id: cluster.id,
                name: cluster.name,
                type: "starCluster",
                position: cluster.galacticPosition,
                description: cluster.description,
                markerVisible: true,
                navigationName: cluster.name,
                navigationRadius: cluster.navigationRadius,
                markerColor: cluster.colors.marker,
                markerLabelOffset: 44 + index * 11,
                facts: [
                    { label: "Catalog", value: cluster.catalogName },
                    { label: "Type", value: cluster.classification },
                    { label: "Constellation", value: cluster.constellation },
                    { label: "Distance", value: cluster.distanceLabel },
                    { label: "Diameter", value: cluster.approximateDiameterLy },
                    ...cluster.facts,
                ],
            })
        ),
    ],
};
