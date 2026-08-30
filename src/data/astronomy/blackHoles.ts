import { defineAstronomyRecords } from "./define";
import { astronomySources as source } from "./sources";

export const blackHoleAstronomyRecords = defineAstronomyRecords([
    {
        id: "sagittarius-a-star",
        name: "Sagittarius A*",
        objectType: "blackHole",
        classification: "Supermassive black hole",
        summary:
            "Sagittarius A* is the relatively quiet supermassive black hole at the dynamical center of the Milky Way.",
        factGroups: [
            { category: "Physical", facts: [
                { label: "Mass", value: "About 4 million solar masses" },
                { label: "Location", value: "Milky Way Galactic Center" },
                { label: "Distance from Earth", value: "About 26,000 light-years" },
                { label: "Activity", value: "Relatively calm compared with active galactic nuclei" },
            ] },
            { category: "Observation", facts: [
                { label: "Evidence", value: "Stellar orbits and multiwavelength emission" },
                { label: "EHT image", value: "First image released in May 2022" },
                { label: "Image meaning", value: "Radio emission around the black hole’s shadow" },
            ] },
        ],
        sources: [source.sagittariusA, source.ehtSagittariusA],
    },
] as const);
