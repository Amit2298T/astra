import { defineAstronomyRecords } from "./define";
import { astronomySources as source } from "./sources";

export const exoplanetAstronomyRecords = defineAstronomyRecords([
    {
        id: "proxima-centauri-b", name: "Proxima Centauri b", objectType: "exoplanet", classification: "Earth-mass / super-Earth exoplanet",
        summary: "Proxima Centauri b is the nearest known exoplanet, orbiting within its red-dwarf host’s temperate zone; its actual surface conditions and habitability remain unknown.",
        factGroups: [
            { category: "Orbit", facts: [
                { label: "Host star", value: "Proxima Centauri" },
                { label: "Orbital period", value: "About 11.2 days" },
                { label: "Orbital distance", value: "About 0.0485 AU" },
            ] },
            { category: "Physical", facts: [
                { label: "Minimum mass", value: "About 1.06 Earth masses" },
                { label: "Discovery", value: "Announced in 2016" },
            ] },
            { category: "Environment", facts: [
                { label: "Temperate-zone context", value: "Receives roughly two-thirds of Earth’s starlight" },
                { label: "Habitability", value: "Not confirmed; atmosphere and surface are unknown" },
                { label: "Host activity", value: "Proxima Centauri produces energetic flares" },
            ] },
        ], sources: [source.proximaB],
    },
] as const);
