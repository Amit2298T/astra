import type { SourceReference } from "./types";

const ACCESSED_AT = "2026-08-30";

function reference(
    label: string,
    organization: string,
    url: string
): SourceReference {
    return { label, organization, url, accessedAt: ACCESSED_AT };
}

export const astronomySources = {
    planets: reference(
        "Solar System planets",
        "NASA Science",
        "https://science.nasa.gov/solar-system/planets/"
    ),
    planetarySatellites: reference(
        "Planetary satellite discovery circumstances",
        "NASA/JPL Solar System Dynamics",
        "https://ssd.jpl.nasa.gov/sats/discovery.html"
    ),
    dwarfPlanets: reference(
        "Pluto and dwarf planets",
        "NASA Science",
        "https://science.nasa.gov/dwarf-planets/"
    ),
    sun: reference(
        "Our Sun: Facts",
        "NASA Science",
        "https://science.nasa.gov/sun/facts/"
    ),
    moon: reference(
        "Moon Facts",
        "NASA Science",
        "https://science.nasa.gov/moon/facts/"
    ),
    voyager: reference(
        "Voyager 1 mission",
        "NASA Science / JPL",
        "https://science.nasa.gov/mission/voyager/voyager-1/"
    ),
    alphaCentauri: reference(
        "Hubble’s best image of Alpha Centauri A and B",
        "NASA / ESA Hubble",
        "https://science.nasa.gov/missions/hubble/hubbles-best-image-of-alpha-centauri-a-and-b/"
    ),
    proximaB: reference(
        "Proxima Centauri b",
        "NASA Exoplanet Archive",
        "https://exoplanetarchive.ipac.caltech.edu/overview/Proxima"
    ),
    sagittariusA: reference(
        "The Milky Way’s Galactic Center",
        "NASA Science",
        "https://science.nasa.gov/mission/webb/science-overview/science-explainers/what-is-the-center-of-our-galaxy-like/"
    ),
    ehtSagittariusA: reference(
        "First image of Sagittarius A*",
        "Event Horizon Telescope Collaboration",
        "https://eventhorizontelescope.org/blog/astronomers-reveal-first-image-black-hole-heart-our-galaxy"
    ),
    orionNebula: reference(
        "Orion Nebula",
        "NASA / ESA Hubble",
        "https://science.nasa.gov/asset/hubble/orion-nebula-3/"
    ),
    eagleNebula: reference(
        "Messier 16 — Eagle Nebula",
        "NASA / ESA Hubble",
        "https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-16/"
    ),
    carinaNebula: reference(
        "Carina Nebula",
        "NASA / ESA Hubble",
        "https://science.nasa.gov/asset/hubble/carina-nebula-2/"
    ),
    lagoonNebula: reference(
        "Messier 8 — Lagoon Nebula",
        "NASA / ESA Hubble",
        "https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-8/"
    ),
    helixNebula: reference(
        "Caldwell 63 — Helix Nebula",
        "NASA / ESA Hubble",
        "https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-caldwell-catalog/caldwell-63/"
    ),
    pleiades: reference(
        "Messier 45 — Pleiades",
        "NASA / ESA Hubble",
        "https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-45/"
    ),
    hyades: reference(
        "The Hyades cluster",
        "European Space Agency / Gaia",
        "https://www.esa.int/ESA_Multimedia/Videos/2018/04/The_Hyades_cluster/(lang)/en"
    ),
    omegaCentauri: reference(
        "The majestic globular Omega Centauri",
        "ESA / Hubble",
        "https://esahubble.org/images/heic0809a/"
    ),
    fortySevenTucanae: reference(
        "Stellar populations in 47 Tucanae",
        "NASA / ESA Hubble",
        "https://science.nasa.gov/missions/hubble/hubble-shows-link-between-stars-ages-and-their-orbits-in-dense-cluster/"
    ),
    westerlundOne: reference(
        "The stellar population of Westerlund 1",
        "European Space Agency / Webb",
        "https://www.esa.int/ESA_Multimedia/Images/2024/10/The_exotic_stellar_population_of_Westerlund_1"
    ),
    solarSystem: reference(
        "Solar System Facts",
        "NASA Science",
        "https://science.nasa.gov/solar-system/solar-system-facts/"
    ),
} as const satisfies Record<string, SourceReference>;
