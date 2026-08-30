import { defineAstronomyRecords } from "./define";
import { astronomySources as source } from "./sources";

export const dwarfPlanetAstronomyRecords = defineAstronomyRecords([
    {
        id: "ceres", name: "Ceres", objectType: "dwarfPlanet", classification: "Dwarf planet",
        summary: "Ceres is the largest object in the main asteroid belt and the only recognized dwarf planet in the inner Solar System.",
        factGroups: [
            { category: "Physical", facts: [
                { label: "Approximate diameter", value: "940 km" },
                { label: "Notable material", value: "Water ice and hydrated minerals" },
                { label: "Known moons", value: "None" },
            ] },
            { category: "Orbit", facts: [
                { label: "Region", value: "Main asteroid belt" },
                { label: "Average solar distance", value: "About 2.8 AU" },
                { label: "Orbital period", value: "About 4.6 Earth years" },
            ] },
            { category: "Observation", facts: [
                { label: "Exploration", value: "Orbited by NASA’s Dawn spacecraft" },
                { label: "Notable feature", value: "Bright deposits in Occator Crater" },
            ] },
        ], sources: [source.dwarfPlanets],
    },
    {
        id: "pluto", name: "Pluto", objectType: "dwarfPlanet", classification: "Dwarf planet",
        summary: "Pluto is a complex icy dwarf planet in the Kuiper Belt, with mountains, glaciers, a thin atmosphere, and a large companion moon, Charon.",
        factGroups: [
            { category: "Physical", facts: [
                { label: "Approximate diameter", value: "2,377 km" },
                { label: "Known moons", value: "Five" },
                { label: "Atmosphere", value: "Thin nitrogen, methane, and carbon monoxide" },
            ] },
            { category: "Orbit", facts: [
                { label: "Region", value: "Kuiper Belt" },
                { label: "Average solar distance", value: "About 39 AU" },
                { label: "Orbital period", value: "About 248 Earth years" },
            ] },
            { category: "Observation", facts: [
                { label: "Exploration", value: "New Horizons flyby in 2015" },
                { label: "Notable feature", value: "Sputnik Planitia nitrogen-ice plain" },
            ] },
        ], sources: [source.dwarfPlanets, source.planetarySatellites],
    },
    {
        id: "haumea", name: "Haumea", objectType: "dwarfPlanet", classification: "Dwarf planet",
        summary: "Haumea is a rapidly rotating, elongated dwarf planet in the Kuiper Belt with a ring and two known moons.",
        factGroups: [
            { category: "Physical", facts: [
                { label: "Equatorial diameter", value: "About 1,740 km" },
                { label: "Rotation period", value: "About 4 hours" },
                { label: "Known moons", value: "Two — Hiʻiaka and Namaka" },
                { label: "Ring", value: "A narrow ring surrounds Haumea" },
            ] },
            { category: "Orbit", facts: [
                { label: "Region", value: "Kuiper Belt" },
                { label: "Average solar distance", value: "About 43 AU" },
                { label: "Orbital period", value: "About 285 Earth years" },
            ] },
        ], sources: [source.dwarfPlanets],
    },
    {
        id: "makemake", name: "Makemake", objectType: "dwarfPlanet", classification: "Dwarf planet",
        summary: "Makemake is a bright, methane-rich Kuiper Belt dwarf planet with a reddish surface and one known small moon.",
        factGroups: [
            { category: "Physical", facts: [
                { label: "Approximate diameter", value: "About 1,430 km" },
                { label: "Surface", value: "Rich in frozen methane and ethane" },
                { label: "Known moons", value: "One confirmed" },
            ] },
            { category: "Orbit", facts: [
                { label: "Region", value: "Kuiper Belt" },
                { label: "Average solar distance", value: "About 46 AU" },
                { label: "Orbital period", value: "About 305 Earth years" },
            ] },
        ], sources: [source.dwarfPlanets],
    },
    {
        id: "eris", name: "Eris", objectType: "dwarfPlanet", classification: "Dwarf planet",
        summary: "Eris is a massive, distant dwarf planet on a highly inclined orbit in the scattered disc, accompanied by the moon Dysnomia.",
        factGroups: [
            { category: "Physical", facts: [
                { label: "Approximate diameter", value: "About 2,326 km" },
                { label: "Mass", value: "More massive than Pluto" },
                { label: "Known moons", value: "One — Dysnomia" },
            ] },
            { category: "Orbit", facts: [
                { label: "Region", value: "Scattered disc" },
                { label: "Average solar distance", value: "About 68 AU" },
                { label: "Orbital period", value: "About 557 Earth years" },
            ] },
        ], sources: [source.dwarfPlanets],
    },
] as const);
