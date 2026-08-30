import { defineAstronomyRecords } from "./define";
import { astronomySources as source } from "./sources";

export const starClusterAstronomyRecords = defineAstronomyRecords([
    {
        id: "pleiades", name: "Pleiades", objectType: "starCluster", classification: "Young open star cluster",
        summary: "The Pleiades is a nearby open cluster whose loosely bound, young blue-white stars formed together and are gradually dispersing through the Galaxy.",
        factGroups: [
            { category: "Observation", facts: [
                { label: "Catalog", value: "Messier 45" },
                { label: "Constellation", value: "Taurus" },
                { label: "Distance", value: "About 445 light-years" },
                { label: "Approximate diameter", value: "About 17 light-years" },
            ] },
            { category: "Context", facts: [
                { label: "Age", value: "Roughly 100 million years" },
                { label: "Population", value: "More than 1,000 loosely bound stars" },
                { label: "Common name", value: "The Seven Sisters" },
            ] },
        ], sources: [source.pleiades],
    },
    {
        id: "hyades", name: "Hyades", objectType: "starCluster", classification: "Nearby open star cluster",
        summary: "The Hyades is the nearest major open cluster, a broad gravitationally related population whose stars are much older and more dispersed than the Pleiades.",
        factGroups: [
            { category: "Observation", facts: [
                { label: "Catalog", value: "Melotte 25 / Collinder 50" },
                { label: "Constellation", value: "Taurus" },
                { label: "Distance", value: "About 150 light-years" },
                { label: "Core diameter", value: "About 20 light-years" },
            ] },
            { category: "Context", facts: [
                { label: "Age", value: "About 625 million years" },
                { label: "Structure", value: "Open cluster with extended tidal tails" },
                { label: "Aldebaran", value: "Foreground star; not a physical member" },
            ] },
        ], sources: [source.hyades],
    },
    {
        id: "omega-centauri", name: "Omega Centauri", objectType: "starCluster", classification: "Massive globular cluster",
        summary: "Omega Centauri is the Milky Way’s largest and most massive globular cluster, with several stellar populations that may preserve the history of a disrupted dwarf galaxy.",
        factGroups: [
            { category: "Observation", facts: [
                { label: "Catalog", value: "NGC 5139" },
                { label: "Constellation", value: "Centaurus" },
                { label: "Distance", value: "About 17,000 light-years" },
                { label: "Approximate diameter", value: "About 150 light-years" },
            ] },
            { category: "Context", facts: [
                { label: "Age", value: "Roughly 12 billion years" },
                { label: "Population", value: "Millions of densely packed old stars" },
                { label: "Complexity", value: "Multiple ages and chemical populations" },
            ] },
        ], sources: [source.omegaCentauri],
    },
    {
        id: "47-tucanae", name: "47 Tucanae", objectType: "starCluster", classification: "Globular cluster",
        summary: "47 Tucanae is a luminous ancient globular cluster whose dense core contains multiple generations of old stars and many compact stellar remnants.",
        factGroups: [
            { category: "Observation", facts: [
                { label: "Catalog", value: "NGC 104 / Caldwell 106" },
                { label: "Constellation", value: "Tucana" },
                { label: "Distance", value: "About 16,700 light-years" },
                { label: "Approximate diameter", value: "About 120 light-years" },
            ] },
            { category: "Context", facts: [
                { label: "Age", value: "About 10.5 billion years" },
                { label: "Population", value: "Hundreds of thousands to about a million stars" },
                { label: "Structure", value: "Very dense, bright central core" },
            ] },
        ], sources: [source.fortySevenTucanae],
    },
    {
        id: "westerlund-1", name: "Westerlund 1", objectType: "starCluster", classification: "Massive young star cluster",
        summary: "Westerlund 1 is a compact, dust-obscured young cluster containing an exceptional concentration of massive and evolved stars.",
        factGroups: [
            { category: "Observation", facts: [
                { label: "Catalog", value: "Wd 1" },
                { label: "Constellation", value: "Ara" },
                { label: "Distance", value: "About 12,000 light-years" },
                { label: "Compact region", value: "Less than about 6 light-years across" },
            ] },
            { category: "Context", facts: [
                { label: "Age", value: "About 3.5–5 million years" },
                { label: "Mass", value: "Roughly 50,000–100,000 solar masses" },
                { label: "Population", value: "Hundreds of very massive evolved stars" },
            ] },
        ], sources: [source.westerlundOne],
    },
] as const);
