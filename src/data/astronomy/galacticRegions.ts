import { defineAstronomyRecords } from "./define";
import { astronomySources as source } from "./sources";

export const galacticRegionAstronomyRecords = defineAstronomyRecords([
    {
        id: "solar-system-galactic", name: "Solar System", objectType: "galacticRegion", classification: "Stellar neighborhood in the Orion Spur",
        summary: "The Solar System lies in the Orion Spur, a minor spiral structure between the Milky Way’s Sagittarius and Perseus arms.",
        factGroups: [
            { category: "Context", facts: [
                { label: "Galactic region", value: "Orion Spur / Local Arm" },
                { label: "Galactic-center distance", value: "About 27,000 light-years" },
                { label: "Galactic orbit", value: "About 230 million years per revolution" },
            ] },
        ], sources: [source.solarSystem],
    },
    {
        id: "galactic-center", name: "Galactic Center", objectType: "galacticRegion", classification: "Dense central region of the Milky Way",
        summary: "The Milky Way’s central bulge is an exceptionally dense stellar environment whose dynamical center contains Sagittarius A*.",
        factGroups: [
            { category: "Context", facts: [
                { label: "From Earth", value: "About 26,000 light-years" },
                { label: "Central object", value: "Sagittarius A*" },
                { label: "Environment", value: "Dense stars, molecular clouds, and energetic gas" },
            ] },
        ], sources: [source.sagittariusA],
    },
    {
        id: "alpha-centauri-region-galactic", name: "Alpha Centauri region", objectType: "galacticRegion", classification: "Nearby stellar system",
        summary: "Alpha Centauri is effectively coincident with the Solar System at galactic scale, despite lying more than four light-years away locally.",
        factGroups: [
            { category: "Context", facts: [
                { label: "Local distance", value: "About 4.3 light-years" },
                { label: "Components", value: "Alpha Centauri A, B, and Proxima Centauri" },
                { label: "At galactic scale", value: "Shares the Solar neighborhood marker" },
            ] },
        ], sources: [source.alphaCentauri],
    },
] as const);
