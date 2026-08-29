import {
    galacticPolarPosition,
    heliocentricGalacticPosition,
    type ScenePosition,
} from "@/engine/scale/CoordinateTransformer";

export type NebulaType =
    | "emission"
    | "planetary"
    | "reflection"
    | "dark"
    | "supernovaRemnant";

export type NebulaVisualPreset =
    | "luminousNursery"
    | "dustPillars"
    | "chaoticComplex"
    | "darkLane"
    | "expandingShell";

export type LocalSkyVisibility = "faintHaze" | "guideMarker" | "none";

export interface NebulaPalette {
    inner: string;
    primary: string;
    secondary: string;
    dust: string;
    star: string;
    marker: string;
}

export interface NebulaVisualConfig {
    preset: NebulaVisualPreset;
    scale: ScenePosition;
    cloudCount: number;
    dustCount: number;
    embeddedStarCount: number;
    density: number;
    dustStrength: number;
    seed: number;
}

export interface NebulaFact {
    label: string;
    value: string;
}

export interface NebulaConfig {
    id: string;
    name: string;
    catalogName: string;
    type: NebulaType;
    classification: string;
    constellation: string;
    approximateDistanceLy: number;
    distanceLabel: string;
    approximateSizeLy: string;
    description: string;
    galacticLongitudeDeg: number;
    galacticLatitudeDeg: number;
    galacticPosition: ScenePosition;
    navigationRadius: number;
    closeUpCameraDistance: number;
    closeUpMinDistance: number;
    closeUpMaxDistance: number;
    visual: NebulaVisualConfig;
    palette: NebulaPalette;
    facts: readonly NebulaFact[];
    localSkyVisibility: LocalSkyVisibility;
}

export const SOLAR_SYSTEM_GALACTIC_POSITION = galacticPolarPosition(
    1120,
    -0.58,
    5
);

type NebulaInput = Omit<NebulaConfig, "galacticPosition">;

function defineNebula(input: NebulaInput): NebulaConfig {
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

export const nebulae: readonly NebulaConfig[] = [
    defineNebula({
        id: "orion-nebula",
        name: "Orion Nebula",
        catalogName: "Messier 42 / M42",
        type: "emission",
        classification: "Emission nebula / stellar nursery",
        constellation: "Orion",
        approximateDistanceLy: 1300,
        distanceLabel: "About 1,300 light-years",
        approximateSizeLy: "About 24 light-years",
        description:
            "A nearby stellar nursery whose bright central Trapezium stars illuminate a broad complex of hydrogen-rich gas and dust.",
        galacticLongitudeDeg: 209.0095,
        galacticLatitudeDeg: -19.3818,
        navigationRadius: 360,
        closeUpCameraDistance: 52,
        closeUpMinDistance: 18,
        closeUpMaxDistance: 105,
        visual: {
            preset: "luminousNursery",
            scale: [1.35, 0.78, 1],
            cloudCount: 720,
            dustCount: 110,
            embeddedStarCount: 170,
            density: 0.72,
            dustStrength: 0.28,
            seed: 0x4d34324f,
        },
        palette: {
            inner: "#efd2bd",
            primary: "#a7648b",
            secondary: "#6789ad",
            dust: "#241923",
            star: "#d9e9ff",
            marker: "#b68caf",
        },
        facts: [
            { label: "Region", value: "One of the nearest large star nurseries" },
            { label: "Core", value: "Illuminated by the Trapezium stars" },
            { label: "Visibility", value: "Faintly visible under dark skies" },
        ],
        localSkyVisibility: "faintHaze",
    }),
    defineNebula({
        id: "eagle-nebula",
        name: "Eagle Nebula",
        catalogName: "Messier 16 / M16",
        type: "emission",
        classification: "Emission nebula / stellar nursery",
        constellation: "Serpens",
        approximateDistanceLy: 7000,
        distanceLabel: "About 7,000 light-years",
        approximateSizeLy: "About 70 × 55 light-years",
        description:
            "An active star-forming complex containing towering dark gas and dust structures popularly known as the Pillars of Creation.",
        galacticLongitudeDeg: 16.9615,
        galacticLatitudeDeg: 0.8106,
        navigationRadius: 380,
        closeUpCameraDistance: 55,
        closeUpMinDistance: 19,
        closeUpMaxDistance: 110,
        visual: {
            preset: "dustPillars",
            scale: [1.05, 1.2, 0.92],
            cloudCount: 760,
            dustCount: 180,
            embeddedStarCount: 145,
            density: 0.82,
            dustStrength: 0.76,
            seed: 0x4d313645,
        },
        palette: {
            inner: "#e2ba78",
            primary: "#97584c",
            secondary: "#6b6a62",
            dust: "#17130f",
            star: "#e8edf2",
            marker: "#aa806d",
        },
        facts: [
            { label: "Landmark", value: "Home of the Pillars of Creation" },
            { label: "Pillars", value: "Cold gas and dust shelter newborn stars" },
            { label: "Scale", value: "The pillars are a small part of M16" },
        ],
        localSkyVisibility: "guideMarker",
    }),
    defineNebula({
        id: "carina-nebula",
        name: "Carina Nebula",
        catalogName: "NGC 3372",
        type: "emission",
        classification: "Giant star-forming emission region",
        constellation: "Carina",
        approximateDistanceLy: 7500,
        distanceLabel: "About 7,500 light-years",
        approximateSizeLy: "More than 300 light-years",
        description:
            "An immense and energetic complex shaped by massive stars, stellar winds, bright ionized gas, and opaque molecular clouds.",
        galacticLongitudeDeg: 287.60158,
        galacticLatitudeDeg: -0.64452,
        navigationRadius: 420,
        closeUpCameraDistance: 60,
        closeUpMinDistance: 21,
        closeUpMaxDistance: 125,
        visual: {
            preset: "chaoticComplex",
            scale: [1.55, 1.05, 1.2],
            cloudCount: 1000,
            dustCount: 240,
            embeddedStarCount: 230,
            density: 0.9,
            dustStrength: 0.82,
            seed: 0x4e333337,
        },
        palette: {
            inner: "#dfad70",
            primary: "#994852",
            secondary: "#5d7f8b",
            dust: "#141014",
            star: "#e8f1ff",
            marker: "#ad6e79",
        },
        facts: [
            { label: "Environment", value: "Hosts many extremely massive stars" },
            { label: "Structure", value: "Sculpted by winds and ultraviolet radiation" },
            { label: "Notable star", value: "Eta Carinae lies within the complex" },
        ],
        localSkyVisibility: "guideMarker",
    }),
    defineNebula({
        id: "lagoon-nebula",
        name: "Lagoon Nebula",
        catalogName: "Messier 8 / M8",
        type: "emission",
        classification: "Emission nebula / stellar nursery",
        constellation: "Sagittarius",
        approximateDistanceLy: 4500,
        distanceLabel: "About 4,000–5,000 light-years",
        approximateSizeLy: "About 100 × 50 light-years",
        description:
            "A broad star-forming cloud crossed by dark dust lanes and punctuated by luminous pockets around young embedded stars.",
        galacticLongitudeDeg: 5.9575,
        galacticLatitudeDeg: -1.1667,
        navigationRadius: 370,
        closeUpCameraDistance: 55,
        closeUpMinDistance: 19,
        closeUpMaxDistance: 112,
        visual: {
            preset: "darkLane",
            scale: [1.5, 0.72, 1],
            cloudCount: 820,
            dustCount: 190,
            embeddedStarCount: 185,
            density: 0.8,
            dustStrength: 0.68,
            seed: 0x4d384c47,
        },
        palette: {
            inner: "#efc3a1",
            primary: "#aa5b65",
            secondary: "#6f638f",
            dust: "#211a23",
            star: "#e7ecff",
            marker: "#a77083",
        },
        facts: [
            { label: "Activity", value: "An intense region of ongoing star formation" },
            { label: "Dark lane", value: "Cool dust obscures part of the glowing gas" },
            { label: "Sky", value: "Located toward the Milky Way’s central bulge" },
        ],
        localSkyVisibility: "guideMarker",
    }),
    defineNebula({
        id: "helix-nebula",
        name: "Helix Nebula",
        catalogName: "NGC 7293",
        type: "planetary",
        classification: "Planetary nebula",
        constellation: "Aquarius",
        approximateDistanceLy: 650,
        distanceLabel: "About 650 light-years",
        approximateSizeLy: "Bright ring about 3 light-years across",
        description:
            "A nearby expanding shell of glowing gas expelled by a dying Sun-like star, now exposed as a hot central stellar remnant.",
        galacticLongitudeDeg: 36.16134,
        galacticLatitudeDeg: -57.11837,
        navigationRadius: 330,
        closeUpCameraDistance: 48,
        closeUpMinDistance: 16,
        closeUpMaxDistance: 92,
        visual: {
            preset: "expandingShell",
            scale: [1.18, 0.88, 1],
            cloudCount: 460,
            dustCount: 55,
            embeddedStarCount: 65,
            density: 0.62,
            dustStrength: 0.2,
            seed: 0x4e373239,
        },
        palette: {
            inner: "#8bc7c4",
            primary: "#5b9e9e",
            secondary: "#bd715c",
            dust: "#1c2527",
            star: "#efffff",
            marker: "#74aaa5",
        },
        facts: [
            { label: "Origin", value: "Gas shed by a dying Sun-like star" },
            { label: "Central object", value: "A hot white-dwarf remnant" },
            { label: "Structure", value: "A complex expanding shell, not a solid ring" },
        ],
        localSkyVisibility: "guideMarker",
    }),
] as const;

const nebulaeById = new Map(nebulae.map((nebula) => [nebula.id, nebula]));

export function getNebulaById(id: string | null): NebulaConfig | null {
    if (!id) return null;
    return nebulaeById.get(id) ?? null;
}
