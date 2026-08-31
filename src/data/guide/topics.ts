import { astronomySources } from "@/data/astronomy/sources";
import { starMapSources } from "@/data/starmap";
import type { GuideConcept } from "./types";

export const guideConcepts = [
    {
        id: "planet", name: "Planet", aliases: ["planet", "planets"],
        description: "A planet is a large, nearly round body that orbits a star and has cleared most other bodies from its orbital neighborhood.",
        sources: [astronomySources.planets],
    },
    {
        id: "dwarf-planet", name: "Dwarf planet", aliases: ["dwarf planet", "dwarf planets"],
        description: "A dwarf planet orbits the Sun and is massive enough to be nearly round, but it has not cleared its orbital neighborhood and is not a moon.",
        sources: [astronomySources.dwarfPlanets],
    },
    {
        id: "moon", name: "Moon", aliases: ["moon", "natural satellite"],
        description: "A moon, or natural satellite, is a body that orbits a planet, dwarf planet, or another small Solar System body.",
        sources: [astronomySources.moon],
    },
    {
        id: "star", name: "Star", aliases: ["star", "stars"],
        description: "A star is a self-gravitating sphere of hot plasma that produces energy through nuclear fusion in its interior.",
        sources: [astronomySources.sun],
    },
    {
        id: "exoplanet", name: "Exoplanet", aliases: ["exoplanet", "extrasolar planet"],
        description: "An exoplanet is a planet orbiting a star beyond the Solar System. ASTRA currently includes Proxima Centauri b.",
        sources: [astronomySources.proximaB],
    },
    {
        id: "black-hole", name: "Black hole", aliases: ["black hole", "black holes"],
        description: "A black hole is a region where gravity is so strong that, beyond its event horizon, not even light can escape.",
        sources: [astronomySources.sagittariusA, astronomySources.ehtSagittariusA],
    },
    {
        id: "nebula", name: "Nebula", aliases: ["nebula", "nebulae"],
        description: "A nebula is an interstellar cloud of gas and dust. Some form stars, while others are material expelled by aging or exploded stars.",
        sources: [astronomySources.orionNebula, astronomySources.helixNebula],
    },
    {
        id: "star-cluster", name: "Star cluster", aliases: ["star cluster", "star clusters", "cluster"],
        description: "A star cluster is a physical group of stars linked by common origin or gravity. Open clusters are loose and often young; globular clusters are dense and ancient.",
        sources: [astronomySources.pleiades, astronomySources.omegaCentauri],
    },
    {
        id: "galaxy", name: "Galaxy", aliases: ["galaxy", "galaxies"],
        description: "A galaxy is a gravitationally bound system of stars, gas, dust, dark matter, and compact objects. The Solar System belongs to the Milky Way.",
        sources: [astronomySources.milkyWayScale],
    },
    {
        id: "constellation", name: "Constellation", aliases: ["constellation", "constellations"],
        description: "A constellation is one of 88 officially recognized regions of the sky. Its familiar pattern is an apparent alignment from Earth, not a physical group of nearby stars.",
        sources: [starMapSources.iauConstellations],
    },
    {
        id: "heliopause", name: "Heliopause", aliases: ["heliopause"],
        description: "The heliopause is the outer boundary where the outward pressure of the solar wind balances the surrounding interstellar medium.",
        sources: [astronomySources.voyager, astronomySources.voyagerHeliopause],
    },
    {
        id: "light-year", name: "Light-year", aliases: ["light year", "light-year", "light years"],
        description: "A light-year is a unit of distance: how far light travels through a vacuum in one year, about 9.46 trillion kilometers.",
        sources: [astronomySources.milkyWayScale],
    },
    {
        id: "astronomical-unit", name: "Astronomical unit", aliases: ["astronomical unit", "au"],
        description: "An astronomical unit, or AU, is the average Earth–Sun distance: about 149.6 million kilometers.",
        sources: [astronomySources.solarSystem],
    },
] as const satisfies readonly GuideConcept[];

export const starterPrompts = [
    { label: "Why is Mars red?", category: "Explore" },
    { label: "Compare Earth and Jupiter", category: "Compare" },
    { label: "What is Sagittarius A*?", category: "Cosmic concepts" },
    { label: "Tell me about Voyager 1", category: "Missions" },
    { label: "What is Proxima b?", category: "Explore" },
    { label: "Which nebula should I explore?", category: "Explore" },
    { label: "What is a star cluster?", category: "Cosmic concepts" },
    { label: "Show me Orion", category: "Star map" },
] as const;
