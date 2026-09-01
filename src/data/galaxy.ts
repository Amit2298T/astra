import {
    GALACTIC_SCENE_SCALE,
    type ScenePosition,
} from "@/engine/scale/CoordinateTransformer";
import {
    nebulae,
    SOLAR_SYSTEM_GALACTIC_POSITION,
} from "@/data/nebulae";
import { starClusters } from "@/data/starClusters";
import { getStarSystemEntryId, starSystemsList, type StarSystemEntryId } from "@/data/starSystems";

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
    markerLabelOffsetX?: number;
    markerLabelScreenOffset?: readonly [number, number];
    markerSizeScale?: number;
    localSpaceDestination?: "solarSystem";
    starSystemId?: StarSystemEntryId;
    markerLabelPriority?: number;
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
const nearbySystemLabelOffsets = [
    [-75, -55], [-90, 25], [90, -50], [115, 15], [35, 70], [-80, 30],
] as const;

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
            markerLabelPriority: 5,
            facts: [
                { label: "Region", value: "Orion Spur / Local Arm" },
                { label: "From Galactic Center", value: "About 27,000 ly" },
                { label: "Local Destination", value: "Solar System" },
            ],
            distanceFromGalacticCenterLightYears: 27000,
        },
        ...starSystemsList.map((system, index): GalacticNavigationTarget => ({
            id: system.astronomyRecordId,
            name: system.name,
            type: "starSystem",
            position: system.galacticMarkerPosition,
            description: system.summary,
            markerVisible: true,
            navigationName: system.name,
            navigationRadius: 180,
            starSystemId: getStarSystemEntryId(system),
            markerLabelPriority: system.id === "sirius-system" ? 4 : Math.max(3, system.markerLabelPriority ?? 0),
            markerColor: system.id === "sirius-system" ? "#f4fbff" : system.id === "trappist-1-system" ? "#f07b68" : system.id === "barnards-star-system" ? "#c96a5c" : "#ffe2a8",
            markerSizeScale: system.id === "sirius-system" ? 1.15 : system.id === "barnards-star-system" ? 0.86 : 1,
            markerLabelOffset: [92, 58, 78, 54, 84, 62][index],
            markerLabelOffsetX: [-48, 46, 58, -62, 52, -48][index],
            markerLabelScreenOffset: nearbySystemLabelOffsets[index],
            facts: [
                { label: "System", value: system.systemType },
                { label: "Distance", value: system.distanceLightYears },
                { label: "Coordinates", value: `l ${system.galacticLongitudeDeg.toFixed(2)}°, b ${system.galacticLatitudeDeg.toFixed(2)}°` },
                { label: "Display scale", value: "Nearby offsets magnified equally for readability" },
            ],
            distanceFromGalacticCenterLightYears: 27000,
        })),
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
