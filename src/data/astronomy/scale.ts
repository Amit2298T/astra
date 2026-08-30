import type { AstronomyObjectId } from "./index";
import { astronomySources as source } from "./sources";
import type { SourceReference } from "./types";

export type ScaleMode = "size" | "distance";

export type ScaleVisualKind =
    | "human"
    | "moon"
    | "earth"
    | "jupiter"
    | "sun"
    | "star"
    | "blackHole"
    | "solarSystem"
    | "nebula"
    | "cluster"
    | "galaxy"
    | "distance";

export interface ScaleComparisonItem {
    id: string;
    name: string;
    category: string;
    numericValue: number;
    unit: "m";
    displayValue: string;
    measurementLabel: string;
    explanation: string;
    visualKind: ScaleVisualKind;
    astronomyRecordId?: AstronomyObjectId;
    supplementalSources?: readonly SourceReference[];
}

export interface ScaleStop {
    valueMeters: number;
    label: string;
}

const AU_METERS = 149_597_870_700;
const LIGHT_YEAR_METERS = 9.460_730_472_580_8e15;

export const sizeScaleItems = [
    {
        id: "human-reference",
        name: "Human reference",
        category: "Human scale",
        numericValue: 1.7,
        unit: "m",
        displayValue: "1.7 m",
        measurementLabel: "Illustrative standing height",
        explanation:
            "A simple human-height reference anchors the journey. Individual heights naturally vary.",
        visualKind: "human",
    },
    {
        id: "moon-diameter",
        name: "Moon",
        category: "Natural satellite",
        numericValue: 3_475_000,
        unit: "m",
        displayValue: "About 3,475 km",
        measurementLabel: "Diameter",
        explanation:
            "The Moon is a little more than one quarter of Earth’s diameter.",
        visualKind: "moon",
        astronomyRecordId: "moon",
    },
    {
        id: "earth-diameter",
        name: "Earth",
        category: "Terrestrial planet",
        numericValue: 12_742_000,
        unit: "m",
        displayValue: "About 12,742 km",
        measurementLabel: "Mean diameter",
        explanation:
            "Earth provides the familiar planetary reference for comparing worlds and stars.",
        visualKind: "earth",
        astronomyRecordId: "earth",
    },
    {
        id: "jupiter-diameter",
        name: "Jupiter",
        category: "Gas giant",
        numericValue: 139_800_000,
        unit: "m",
        displayValue: "About 139,800 km",
        measurementLabel: "Mean diameter",
        explanation:
            "The Solar System’s largest planet is roughly eleven Earth diameters wide.",
        visualKind: "jupiter",
        astronomyRecordId: "jupiter",
    },
    {
        id: "proxima-diameter",
        name: "Proxima Centauri",
        category: "Red dwarf star",
        numericValue: 196_000_000,
        unit: "m",
        displayValue: "About 196,000 km",
        measurementLabel: "Diameter inferred from approximate radius",
        explanation:
            "The nearest known star is a small red dwarf, only modestly wider than Jupiter.",
        visualKind: "star",
        astronomyRecordId: "proxima-centauri",
    },
    {
        id: "sun-diameter",
        name: "Sun",
        category: "Main-sequence star",
        numericValue: 1_400_000_000,
        unit: "m",
        displayValue: "About 1.4 million km",
        measurementLabel: "Approximate diameter",
        explanation:
            "The Sun spans about 109 Earth diameters, yet is ordinary in size among stars.",
        visualKind: "sun",
        astronomyRecordId: "sun",
    },
    {
        id: "alpha-a-diameter",
        name: "Alpha Centauri A",
        category: "Sun-like star",
        numericValue: 1_708_000_000,
        unit: "m",
        displayValue: "About 1.7 million km",
        measurementLabel: "Diameter inferred from approximate radius",
        explanation:
            "Alpha Centauri A is about 1.22 times the Sun’s radius and slightly wider than the Sun.",
        visualKind: "star",
        astronomyRecordId: "alpha-centauri-a",
    },
    {
        id: "sagittarius-a-event-horizon",
        name: "Sagittarius A*",
        category: "Supermassive black hole",
        numericValue: 23_600_000_000,
        unit: "m",
        displayValue: "About 24 million km",
        measurementLabel: "Approximate event-horizon diameter",
        explanation:
            "This estimate uses a Schwarzschild event horizon for roughly four million solar masses—not the accretion flow or bright EHT ring.",
        visualKind: "blackHole",
        astronomyRecordId: "sagittarius-a-star",
    },
    {
        id: "solar-system-neptune-extent",
        name: "Solar System",
        category: "Planetary system",
        numericValue: 60.2 * AU_METERS,
        unit: "m",
        displayValue: "About 60 AU",
        measurementLabel: "Representative diameter across Neptune’s orbit",
        explanation:
            "This comparison uses twice Neptune’s average orbital distance. It is not a hard boundary for the Sun’s gravitational influence.",
        visualKind: "solarSystem",
        astronomyRecordId: "solar-system-galactic",
    },
    {
        id: "orion-nebula-extent",
        name: "Orion Nebula",
        category: "Stellar nursery",
        numericValue: 24 * LIGHT_YEAR_METERS,
        unit: "m",
        displayValue: "About 24 light-years",
        measurementLabel: "Approximate physical extent",
        explanation:
            "A nebula has no hard edge; this value represents the broad observed star-forming region.",
        visualKind: "nebula",
        astronomyRecordId: "orion-nebula",
    },
    {
        id: "omega-centauri-extent",
        name: "Omega Centauri",
        category: "Globular cluster",
        numericValue: 150 * LIGHT_YEAR_METERS,
        unit: "m",
        displayValue: "About 150 light-years",
        measurementLabel: "Approximate cluster diameter",
        explanation:
            "Millions of old stars occupy a dense but gradually thinning cluster with no sharp outer surface.",
        visualKind: "cluster",
        astronomyRecordId: "omega-centauri",
    },
    {
        id: "milky-way-diameter",
        name: "Milky Way",
        category: "Barred spiral galaxy",
        numericValue: 100_000 * LIGHT_YEAR_METERS,
        unit: "m",
        displayValue: "About 100,000 light-years",
        measurementLabel: "Approximate stellar-disk diameter",
        explanation:
            "The stellar disk thins gradually rather than ending at one exact, sharp edge.",
        visualKind: "galaxy",
        supplementalSources: [source.milkyWayScale],
    },
] as const satisfies readonly ScaleComparisonItem[];

export const distanceScaleItems = [
    {
        id: "earth-to-moon",
        name: "Earth → Moon",
        category: "Planet–moon distance",
        numericValue: 384_400_000,
        unit: "m",
        displayValue: "About 384,400 km",
        measurementLabel: "Average center-to-center distance",
        explanation:
            "Light crosses the average Earth–Moon distance in about 1.3 seconds.",
        visualKind: "distance",
        astronomyRecordId: "moon",
    },
    {
        id: "earth-to-sun",
        name: "Earth → Sun",
        category: "Planet–star distance",
        numericValue: AU_METERS,
        unit: "m",
        displayValue: "1 AU · about 150 million km",
        measurementLabel: "Average orbital distance",
        explanation:
            "One astronomical unit is the reference distance based on Earth’s average orbit around the Sun.",
        visualKind: "distance",
        astronomyRecordId: "sun",
    },
    {
        id: "sun-to-neptune",
        name: "Sun → Neptune",
        category: "Planetary-system distance",
        numericValue: 30.1 * AU_METERS,
        unit: "m",
        displayValue: "About 30.1 AU",
        measurementLabel: "Average orbital distance",
        explanation:
            "Neptune’s orbit provides a durable reference for the outer major-planet system.",
        visualKind: "distance",
        astronomyRecordId: "neptune",
    },
    {
        id: "sun-to-voyager-heliopause",
        name: "Sun → Voyager 1 heliopause crossing",
        category: "Mission-scale distance",
        numericValue: 121 * AU_METERS,
        unit: "m",
        displayValue: "About 121 AU",
        measurementLabel: "Distance at the 2012 heliopause crossing",
        explanation:
            "This fixed mission milestone is used instead of a volatile current-distance reading.",
        visualKind: "distance",
        astronomyRecordId: "voyager-1",
        supplementalSources: [source.voyagerHeliopause],
    },
    {
        id: "sun-to-proxima",
        name: "Sun → Proxima Centauri",
        category: "Interstellar distance",
        numericValue: 4.24 * LIGHT_YEAR_METERS,
        unit: "m",
        displayValue: "About 4.24 light-years",
        measurementLabel: "Distance to the nearest known star",
        explanation:
            "Even the nearest stellar neighbor lies more than two thousand times beyond Voyager 1’s heliopause-crossing distance.",
        visualKind: "distance",
        astronomyRecordId: "proxima-centauri",
    },
    {
        id: "earth-to-orion",
        name: "Earth → Orion Nebula",
        category: "Galactic distance",
        numericValue: 1_300 * LIGHT_YEAR_METERS,
        unit: "m",
        displayValue: "About 1,300 light-years",
        measurementLabel: "Approximate distance",
        explanation:
            "The Orion Nebula is nearby on galactic scales, yet its light began traveling toward us many centuries ago.",
        visualKind: "distance",
        astronomyRecordId: "orion-nebula",
    },
    {
        id: "earth-to-galactic-center",
        name: "Earth → Galactic Center",
        category: "Galactic distance",
        numericValue: 26_000 * LIGHT_YEAR_METERS,
        unit: "m",
        displayValue: "About 26,000 light-years",
        measurementLabel: "Approximate distance",
        explanation:
            "We view the Milky Way’s center through the dusty plane of the galaxy from the Orion Spur.",
        visualKind: "distance",
        astronomyRecordId: "galactic-center",
    },
    {
        id: "milky-way-span",
        name: "Across the Milky Way",
        category: "Galactic span",
        numericValue: 100_000 * LIGHT_YEAR_METERS,
        unit: "m",
        displayValue: "About 100,000 light-years",
        measurementLabel: "Approximate stellar-disk diameter",
        explanation:
            "This representative span describes the stellar disk, whose edge is gradual rather than sharply bounded.",
        visualKind: "distance",
        supplementalSources: [source.milkyWayScale],
    },
] as const satisfies readonly ScaleComparisonItem[];

export const scaleStops: readonly ScaleStop[] = [
    { valueMeters: 1, label: "10⁰ m" },
    { valueMeters: 1_000_000, label: "10³ km" },
    { valueMeters: 1_000_000_000, label: "10⁶ km" },
    { valueMeters: AU_METERS, label: "1 AU" },
    { valueMeters: LIGHT_YEAR_METERS, label: "1 light-year" },
    { valueMeters: 100 * LIGHT_YEAR_METERS, label: "100 light-years" },
    { valueMeters: 100_000 * LIGHT_YEAR_METERS, label: "100,000 light-years" },
];

export function getScaleItems(mode: ScaleMode): readonly ScaleComparisonItem[] {
    return mode === "size" ? sizeScaleItems : distanceScaleItems;
}
