import { defineAstronomyRecords } from "./define";
import { astronomySources as source } from "./sources";

export const nebulaAstronomyRecords = defineAstronomyRecords([
    {
        id: "orion-nebula", name: "Orion Nebula", objectType: "nebula", classification: "Emission nebula / stellar nursery",
        summary: "The Orion Nebula is one of the nearest large star-forming regions, where the Trapezium’s young massive stars illuminate and sculpt surrounding gas and dust.",
        factGroups: [
            { category: "Observation", facts: [
                { label: "Catalog", value: "Messier 42 / NGC 1976" },
                { label: "Constellation", value: "Orion" },
                { label: "Distance", value: "About 1,300 light-years" },
                { label: "Approximate scale", value: "About 24 light-years" },
            ] },
            { category: "Context", facts: [
                { label: "Activity", value: "Ongoing formation of thousands of young stars" },
                { label: "Famous feature", value: "The central Trapezium cluster" },
            ] },
        ], sources: [source.orionNebula],
    },
    {
        id: "eagle-nebula", name: "Eagle Nebula", objectType: "nebula", classification: "Emission nebula / stellar nursery",
        summary: "The Eagle Nebula is an active star-forming complex whose ultraviolet-lit gas and dust include the iconic Pillars of Creation.",
        factGroups: [
            { category: "Observation", facts: [
                { label: "Catalog", value: "Messier 16 / IC 4703" },
                { label: "Constellation", value: "Serpens" },
                { label: "Distance", value: "About 7,000 light-years" },
                { label: "Approximate scale", value: "About 70 × 55 light-years" },
            ] },
            { category: "Context", facts: [
                { label: "Activity", value: "Massive young stars ionize and erode the cloud" },
                { label: "Famous feature", value: "Pillars of Creation, about 4–5 light-years tall" },
            ] },
        ], sources: [source.eagleNebula],
    },
    {
        id: "carina-nebula", name: "Carina Nebula", objectType: "nebula", classification: "Giant star-forming emission region",
        summary: "The Carina Nebula is an immense stellar nursery shaped by massive stars, intense ultraviolet radiation, stellar winds, and opaque molecular clouds.",
        factGroups: [
            { category: "Observation", facts: [
                { label: "Catalog", value: "NGC 3372" },
                { label: "Constellation", value: "Carina" },
                { label: "Distance", value: "About 7,500 light-years" },
                { label: "Approximate scale", value: "More than 300 light-years" },
            ] },
            { category: "Context", facts: [
                { label: "Activity", value: "Multiple generations of massive star formation" },
                { label: "Famous feature", value: "Hosts Eta Carinae and the Mystic Mountain" },
            ] },
        ], sources: [source.carinaNebula],
    },
    {
        id: "lagoon-nebula", name: "Lagoon Nebula", objectType: "nebula", classification: "Emission nebula / stellar nursery",
        summary: "The Lagoon Nebula is a broad star-forming cloud of glowing gas, dark dust lanes, and young stars viewed toward the Milky Way’s central regions.",
        factGroups: [
            { category: "Observation", facts: [
                { label: "Catalog", value: "Messier 8 / NGC 6523" },
                { label: "Constellation", value: "Sagittarius" },
                { label: "Distance", value: "About 4,000–5,200 light-years" },
                { label: "Approximate scale", value: "About 100 × 50 light-years" },
            ] },
            { category: "Context", facts: [
                { label: "Activity", value: "Active formation of stars in dense cloud pockets" },
                { label: "Famous feature", value: "Illuminated by the young star Herschel 36" },
            ] },
        ], sources: [source.lagoonNebula],
    },
    {
        id: "helix-nebula", name: "Helix Nebula", objectType: "nebula", classification: "Planetary nebula",
        summary: "The Helix Nebula is a nearby expanding shell of gas expelled late in the life of a Sun-like star, leaving a hot white-dwarf remnant.",
        factGroups: [
            { category: "Observation", facts: [
                { label: "Catalog", value: "NGC 7293 / Caldwell 63" },
                { label: "Constellation", value: "Aquarius" },
                { label: "Distance", value: "About 650 light-years" },
                { label: "Bright ring", value: "Nearly 3 light-years across" },
            ] },
            { category: "Context", facts: [
                { label: "Origin", value: "Gas shed by a dying Sun-like star" },
                { label: "Famous feature", value: "Thousands of comet-shaped gas knots" },
            ] },
        ], sources: [source.helixNebula],
    },
] as const);
