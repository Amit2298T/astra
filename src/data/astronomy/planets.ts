import { defineAstronomyRecords } from "./define";
import { astronomySources as source } from "./sources";

export const planetAstronomyRecords = defineAstronomyRecords([
    {
        id: "mercury",
        name: "Mercury",
        objectType: "planet",
        classification: "Terrestrial planet",
        summary:
            "The smallest and innermost planet, Mercury is a cratered rocky world with extreme temperature swings and only a tenuous exosphere.",
        factGroups: [
            { category: "Physical", facts: [
                { label: "Mean radius", value: "About 2,440 km" },
                { label: "Mass", value: "0.055 Earth masses" },
                { label: "Surface gravity", value: "About 3.7 m/s²" },
            ] },
            { category: "Orbit", facts: [
                { label: "Average solar distance", value: "0.39 AU" },
                { label: "Orbital period", value: "88 Earth days" },
                { label: "Rotation period", value: "About 59 Earth days" },
                { label: "Known moons", value: "None" },
            ] },
            { category: "Environment", facts: [
                { label: "Temperature", value: "About −180 to 430 °C" },
                { label: "Atmosphere", value: "A very thin surface-bound exosphere" },
            ] },
        ],
        sources: [source.planets],
    },
    {
        id: "venus",
        name: "Venus",
        objectType: "planet",
        classification: "Terrestrial planet",
        summary:
            "Venus is an Earth-sized rocky planet wrapped in a dense carbon-dioxide atmosphere that drives an extreme greenhouse effect.",
        factGroups: [
            { category: "Physical", facts: [
                { label: "Mean radius", value: "About 6,052 km" },
                { label: "Mass", value: "0.815 Earth masses" },
                { label: "Surface gravity", value: "About 8.9 m/s²" },
            ] },
            { category: "Orbit", facts: [
                { label: "Average solar distance", value: "0.72 AU" },
                { label: "Orbital period", value: "225 Earth days" },
                { label: "Rotation period", value: "243 Earth days, retrograde" },
                { label: "Known moons", value: "None" },
            ] },
            { category: "Environment", facts: [
                { label: "Surface temperature", value: "About 467 °C" },
                { label: "Atmosphere", value: "Mostly CO₂; sulfuric-acid clouds" },
            ] },
        ],
        sources: [source.planets],
    },
    {
        id: "earth",
        name: "Earth",
        objectType: "planet",
        classification: "Terrestrial planet",
        summary:
            "Earth is the only world known to host confirmed life, with long-lived surface oceans and an atmosphere that supports liquid water at the surface.",
        factGroups: [
            { category: "Physical", facts: [
                { label: "Mean radius", value: "About 6,371 km" },
                { label: "Mass", value: "1 Earth mass" },
                { label: "Surface gravity", value: "About 9.8 m/s²" },
            ] },
            { category: "Orbit", facts: [
                { label: "Average solar distance", value: "1 AU" },
                { label: "Orbital period", value: "About 365.25 days" },
                { label: "Rotation period", value: "23 h 56 min" },
                { label: "Known moons", value: "One — the Moon" },
            ] },
            { category: "Environment", facts: [
                { label: "Atmosphere", value: "About 78% nitrogen, 21% oxygen" },
                { label: "Surface water", value: "Global ocean covers about 71%" },
                { label: "Life", value: "Only known world with confirmed life" },
            ] },
        ],
        sources: [source.planets, source.moon],
    },
    {
        id: "mars",
        name: "Mars",
        objectType: "planet",
        classification: "Terrestrial planet",
        summary:
            "Mars is a cold desert world with a thin carbon-dioxide atmosphere, polar ice, and abundant evidence that liquid water shaped its ancient surface.",
        factGroups: [
            { category: "Physical", facts: [
                { label: "Mean radius", value: "About 3,390 km" },
                { label: "Mass", value: "0.107 Earth masses" },
                { label: "Surface gravity", value: "About 3.7 m/s²" },
            ] },
            { category: "Orbit", facts: [
                { label: "Average solar distance", value: "1.52 AU" },
                { label: "Orbital period", value: "687 Earth days" },
                { label: "Rotation period", value: "24 h 37 min" },
                { label: "Known moons", value: "Two — Phobos and Deimos" },
            ] },
            { category: "Environment", facts: [
                { label: "Temperature", value: "About −153 to 20 °C" },
                { label: "Atmosphere", value: "Thin; mostly CO₂ with N₂ and argon" },
            ] },
        ],
        sources: [source.planets],
    },
    {
        id: "jupiter",
        name: "Jupiter",
        objectType: "planet",
        classification: "Gas giant",
        summary:
            "Jupiter is the Solar System’s largest planet, a rapidly rotating hydrogen-helium world with powerful storms and an extensive satellite system.",
        factGroups: [
            { category: "Physical", facts: [
                { label: "Mean radius", value: "About 69,900 km" },
                { label: "Mass", value: "About 318 Earth masses" },
                { label: "Cloud-top gravity", value: "About 24.8 m/s²" },
            ] },
            { category: "Orbit", facts: [
                { label: "Average solar distance", value: "5.2 AU" },
                { label: "Orbital period", value: "About 11.9 Earth years" },
                { label: "Rotation period", value: "About 9.9 hours" },
                { label: "Known satellites", value: "115 (JPL/IAU count, Aug 2026)" },
            ] },
            { category: "Environment", facts: [
                { label: "Cloud-top temperature", value: "About −110 °C" },
                { label: "Atmosphere", value: "Mostly hydrogen and helium" },
                { label: "Surface", value: "No solid surface" },
            ] },
        ],
        sources: [source.planets, source.planetarySatellites],
    },
    {
        id: "saturn",
        name: "Saturn",
        objectType: "planet",
        classification: "Gas giant",
        summary:
            "Saturn is a low-density hydrogen-helium giant surrounded by an intricate ring system made primarily of ice particles and rocky debris.",
        factGroups: [
            { category: "Physical", facts: [
                { label: "Mean radius", value: "About 58,200 km" },
                { label: "Mass", value: "About 95 Earth masses" },
                { label: "Cloud-top gravity", value: "About 10.4 m/s²" },
            ] },
            { category: "Orbit", facts: [
                { label: "Average solar distance", value: "9.5 AU" },
                { label: "Orbital period", value: "About 29.5 Earth years" },
                { label: "Rotation period", value: "About 10.7 hours" },
                { label: "Known satellites", value: "293 (JPL/IAU count, Aug 2026)" },
            ] },
            { category: "Environment", facts: [
                { label: "Cloud-top temperature", value: "About −140 °C" },
                { label: "Atmosphere", value: "Mostly hydrogen and helium" },
                { label: "Rings", value: "Ice-rich rings with many gaps and ringlets" },
            ] },
        ],
        sources: [source.planets, source.planetarySatellites],
    },
    {
        id: "uranus",
        name: "Uranus",
        objectType: "planet",
        classification: "Ice giant",
        summary:
            "Uranus is a cold ice giant whose extreme axial tilt makes it appear to roll around the Sun, producing unusually long seasons.",
        factGroups: [
            { category: "Physical", facts: [
                { label: "Mean radius", value: "About 25,400 km" },
                { label: "Mass", value: "About 14.5 Earth masses" },
                { label: "Cloud-top gravity", value: "About 8.7 m/s²" },
            ] },
            { category: "Orbit", facts: [
                { label: "Average solar distance", value: "19.2 AU" },
                { label: "Orbital period", value: "About 84 Earth years" },
                { label: "Rotation period", value: "About 17 hours, retrograde" },
                { label: "Known satellites", value: "29 (JPL/IAU count, Aug 2026)" },
            ] },
            { category: "Environment", facts: [
                { label: "Minimum temperature", value: "About 49 K (−224 °C)" },
                { label: "Atmosphere", value: "Hydrogen, helium, and methane" },
                { label: "Axial tilt", value: "About 98°" },
            ] },
        ],
        sources: [source.planets, source.planetarySatellites],
    },
    {
        id: "neptune",
        name: "Neptune",
        objectType: "planet",
        classification: "Ice giant",
        summary:
            "Neptune is the outermost major planet, an ice giant with supersonic winds, dark storms, faint rings, and the captured moon Triton.",
        factGroups: [
            { category: "Physical", facts: [
                { label: "Mean radius", value: "About 24,600 km" },
                { label: "Mass", value: "About 17.1 Earth masses" },
                { label: "Cloud-top gravity", value: "About 11.2 m/s²" },
            ] },
            { category: "Orbit", facts: [
                { label: "Average solar distance", value: "30.1 AU" },
                { label: "Orbital period", value: "About 165 Earth years" },
                { label: "Rotation period", value: "About 16 hours" },
                { label: "Known satellites", value: "16 (JPL/IAU count, Aug 2026)" },
            ] },
            { category: "Environment", facts: [
                { label: "Cloud-top temperature", value: "About −200 °C" },
                { label: "Atmosphere", value: "Hydrogen, helium, and methane" },
                { label: "Winds", value: "Fastest measured planetary winds" },
            ] },
        ],
        sources: [source.planets, source.planetarySatellites],
    },
    {
        id: "moon",
        name: "Moon",
        objectType: "moon",
        classification: "Natural satellite",
        summary:
            "Earth’s only permanent natural satellite is an airless, cratered world whose gravity drives ocean tides and whose rotation keeps nearly the same face toward Earth.",
        factGroups: [
            { category: "Physical", facts: [
                { label: "Diameter", value: "About 3,475 km" },
                { label: "Surface gravity", value: "About one-sixth of Earth’s" },
                { label: "Surface", value: "Rocky highlands, basaltic plains, and craters" },
            ] },
            { category: "Orbit", facts: [
                { label: "Average Earth distance", value: "About 384,400 km" },
                { label: "Orbital period", value: "About 27.3 days" },
                { label: "Phase cycle", value: "About 29.5 days" },
            ] },
            { category: "Environment", facts: [
                { label: "Atmosphere", value: "Extremely tenuous exosphere" },
                { label: "Water", value: "Ice occurs in permanently shadowed regions" },
            ] },
        ],
        sources: [source.moon],
    },
] as const);
