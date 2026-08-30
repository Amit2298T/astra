import { SOLAR_SYSTEM_GALACTIC_POSITION } from "@/data/nebulae";
import {
    heliocentricGalacticPosition,
    type ScenePosition,
} from "@/engine/scale/CoordinateTransformer";

export type StarClusterType =
    | "openCluster"
    | "globularCluster"
    | "massiveYoungCluster";

export type StarClusterVisualPreset =
    | "blueCompactOpen"
    | "broadMixedOpen"
    | "extendedGlobular"
    | "compactGlobular"
    | "obscuredYoungMassive";

export type ClusterLocalSkyVisibility =
    | "recognizable"
    | "subtle"
    | "guideOnly";

export interface StarClusterColorProfile {
    primary: string;
    secondary: string;
    accent: string;
    haze: string;
    marker: string;
}

export interface StarClusterVisualConfig {
    preset: StarClusterVisualPreset;
    desktopStarCount: number;
    mobileStarCount: number;
    prominentStarCount: number;
    coreDensity: number;
    spread: ScenePosition;
    hazeStrength: number;
    dustStrength: number;
    seed: number;
}

export interface StarClusterFact {
    label: string;
    value: string;
}

export interface StarClusterConfig {
    id: string;
    name: string;
    catalogName: string;
    clusterType: StarClusterType;
    classification: string;
    constellation: string;
    approximateDistanceLy: number;
    distanceLabel: string;
    approximateDiameterLy: string;
    description: string;
    galacticLongitudeDeg: number;
    galacticLatitudeDeg: number;
    galacticPosition: ScenePosition;
    navigationRadius: number;
    closeUpCameraDistance: number;
    closeUpMinDistance: number;
    closeUpMaxDistance: number;
    visual: StarClusterVisualConfig;
    colors: StarClusterColorProfile;
    facts: readonly StarClusterFact[];
    localSkyVisibility: ClusterLocalSkyVisibility;
}

type StarClusterInput = Omit<StarClusterConfig, "galacticPosition">;

/**
 * Uses approximate heliocentric Galactic coordinates and the same compressed
 * Solar-neighborhood transform as nebula targets. Positions are educational,
 * not precision astrometry.
 */
function defineStarCluster(input: StarClusterInput): StarClusterConfig {
    return {
        ...input,
        galacticPosition: heliocentricGalacticPosition(
            SOLAR_SYSTEM_GALACTIC_POSITION,
            input.approximateDistanceLy,
            input.galacticLongitudeDeg,
            input.galacticLatitudeDeg
        ),
    };
}

export const starClusters: readonly StarClusterConfig[] = [
    defineStarCluster({
        id: "pleiades",
        name: "Pleiades",
        catalogName: "Messier 45 / M45",
        clusterType: "openCluster",
        classification: "Young open star cluster",
        constellation: "Taurus",
        approximateDistanceLy: 440,
        distanceLabel: "About 440 light-years",
        approximateDiameterLy: "About 17 light-years",
        description:
            "A young, nearby open cluster dominated by luminous blue-white stars and recognizable to the unaided eye as a compact stellar grouping.",
        galacticLongitudeDeg: 166.57,
        galacticLatitudeDeg: -23.52,
        navigationRadius: 260,
        closeUpCameraDistance: 62,
        closeUpMinDistance: 18,
        closeUpMaxDistance: 132,
        visual: {
            preset: "blueCompactOpen",
            desktopStarCount: 900,
            mobileStarCount: 600,
            prominentStarCount: 8,
            coreDensity: 0.38,
            spread: [18, 12, 17],
            hazeStrength: 0.11,
            dustStrength: 0,
            seed: 0x4d343550,
        },
        colors: {
            primary: "#d9ebff",
            secondary: "#93c5fd",
            accent: "#ffffff",
            haze: "#6fa8dc",
            marker: "#a9d5ff",
        },
        facts: [
            { label: "Age", value: "Roughly 100 million years" },
            { label: "Identity", value: "Also called the Seven Sisters" },
            { label: "Visibility", value: "Prominent under ordinary dark skies" },
        ],
        localSkyVisibility: "recognizable",
    }),
    defineStarCluster({
        id: "hyades",
        name: "Hyades",
        catalogName: "Melotte 25 / Collinder 50",
        clusterType: "openCluster",
        classification: "Nearby open star cluster",
        constellation: "Taurus",
        approximateDistanceLy: 153,
        distanceLabel: "About 150 light-years",
        approximateDiameterLy: "Core about 20 light-years across",
        description:
            "The nearest major open cluster, forming a broad and dispersed stellar grouping in Taurus rather than a compact knot of stars.",
        galacticLongitudeDeg: 180.05,
        galacticLatitudeDeg: -22.4,
        navigationRadius: 300,
        closeUpCameraDistance: 88,
        closeUpMinDistance: 24,
        closeUpMaxDistance: 178,
        visual: {
            preset: "broadMixedOpen",
            desktopStarCount: 1100,
            mobileStarCount: 720,
            prominentStarCount: 5,
            coreDensity: 0.18,
            spread: [34, 20, 30],
            hazeStrength: 0,
            dustStrength: 0,
            seed: 0x48594144,
        },
        colors: {
            primary: "#f2ead9",
            secondary: "#cbdaf0",
            accent: "#efbd8c",
            haze: "#94a3b8",
            marker: "#e4d4b8",
        },
        facts: [
            { label: "Proximity", value: "Nearest major open cluster" },
            { label: "Structure", value: "A broad V-shaped sky grouping" },
            {
                label: "Aldebaran",
                value: "Appears nearby but is not a physical member",
            },
        ],
        localSkyVisibility: "subtle",
    }),
    defineStarCluster({
        id: "omega-centauri",
        name: "Omega Centauri",
        catalogName: "NGC 5139",
        clusterType: "globularCluster",
        classification: "Massive globular cluster",
        constellation: "Centaurus",
        approximateDistanceLy: 16700,
        distanceLabel: "About 16,700 light-years",
        approximateDiameterLy: "About 150 light-years",
        description:
            "The Milky Way's most massive known globular cluster, presenting an immense, complex spherical population containing millions of stars conceptually.",
        galacticLongitudeDeg: 309.1,
        galacticLatitudeDeg: 14.97,
        navigationRadius: 440,
        closeUpCameraDistance: 108,
        closeUpMinDistance: 34,
        closeUpMaxDistance: 230,
        visual: {
            preset: "extendedGlobular",
            desktopStarCount: 14000,
            mobileStarCount: 9000,
            prominentStarCount: 22,
            coreDensity: 0.62,
            spread: [39, 37, 39],
            hazeStrength: 0.035,
            dustStrength: 0,
            seed: 0x4e353133,
        },
        colors: {
            primary: "#ead9b5",
            secondary: "#f1eee5",
            accent: "#d8a875",
            haze: "#c8aa7d",
            marker: "#e6bd83",
        },
        facts: [
            { label: "Population", value: "Millions of stars conceptually" },
            { label: "Complexity", value: "Multiple stellar populations" },
            { label: "Scale", value: "Largest globular cluster in the Milky Way" },
        ],
        localSkyVisibility: "guideOnly",
    }),
    defineStarCluster({
        id: "47-tucanae",
        name: "47 Tucanae",
        catalogName: "NGC 104",
        clusterType: "globularCluster",
        classification: "Compact globular cluster",
        constellation: "Tucana",
        approximateDistanceLy: 14700,
        distanceLabel: "About 14,700 light-years",
        approximateDiameterLy: "About 120 light-years",
        description:
            "A bright southern globular cluster distinguished by a compact halo and a steeply concentrated, luminous stellar core.",
        galacticLongitudeDeg: 305.89,
        galacticLatitudeDeg: -44.89,
        navigationRadius: 390,
        closeUpCameraDistance: 82,
        closeUpMinDistance: 25,
        closeUpMaxDistance: 172,
        visual: {
            preset: "compactGlobular",
            desktopStarCount: 11000,
            mobileStarCount: 7000,
            prominentStarCount: 16,
            coreDensity: 0.84,
            spread: [27, 27, 27],
            hazeStrength: 0.045,
            dustStrength: 0,
            seed: 0x4e474331,
        },
        colors: {
            primary: "#f0dfbd",
            secondary: "#f5f1e8",
            accent: "#d9a76e",
            haze: "#dfc18e",
            marker: "#f0ca91",
        },
        facts: [
            { label: "Core", value: "Exceptionally dense and bright" },
            { label: "Sky", value: "One of the brightest globular clusters" },
            { label: "Population", value: "Hundreds of thousands of stars" },
        ],
        localSkyVisibility: "guideOnly",
    }),
    defineStarCluster({
        id: "westerlund-1",
        name: "Westerlund 1",
        catalogName: "Wd 1",
        clusterType: "massiveYoungCluster",
        classification: "Massive young star cluster",
        constellation: "Ara",
        approximateDistanceLy: 12000,
        distanceLabel: "About 10,000–15,000 light-years",
        approximateDiameterLy: "Roughly 10 light-years",
        description:
            "A remarkably dense young cluster containing many massive blue stars and evolved supergiants, heavily obscured at visible wavelengths by intervening dust.",
        galacticLongitudeDeg: 339.55,
        galacticLatitudeDeg: -0.4,
        navigationRadius: 370,
        closeUpCameraDistance: 76,
        closeUpMinDistance: 23,
        closeUpMaxDistance: 158,
        visual: {
            preset: "obscuredYoungMassive",
            desktopStarCount: 4200,
            mobileStarCount: 2700,
            prominentStarCount: 18,
            coreDensity: 0.72,
            spread: [25, 17, 22],
            hazeStrength: 0.035,
            dustStrength: 0.16,
            seed: 0x57443130,
        },
        colors: {
            primary: "#d8e8ff",
            secondary: "#89b8ef",
            accent: "#e6a66f",
            haze: "#7e6b60",
            marker: "#9fc6e8",
        },
        facts: [
            { label: "Population", value: "Many evolved massive stars" },
            { label: "Environment", value: "Dense and extremely young" },
            { label: "Obscuration", value: "Strongly dimmed by interstellar dust" },
        ],
        localSkyVisibility: "guideOnly",
    }),
] as const;

const starClustersById = new Map(
    starClusters.map((cluster) => [cluster.id, cluster])
);

export function getStarClusterById(id: string | null): StarClusterConfig | null {
    if (!id) return null;
    return starClustersById.get(id) ?? null;
}
