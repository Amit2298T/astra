import type { SourceReference } from "@/data/astronomy";

const ACCESSED_AT = "2026-08-31";

export const starMapSources = {
    brightStarCatalogue: {
        label: "Bright Star Catalogue, 5th Revised Edition (V/50)",
        organization: "CDS / VizieR",
        url: "https://cdsarc.cds.unistra.fr/viz-bin/cat/V/50",
        accessedAt: ACCESSED_AT,
    },
    simbad: {
        label: "SIMBAD Astronomical Database",
        organization: "CDS, Strasbourg",
        url: "https://simbad.u-strasbg.fr/simbad/",
        accessedAt: ACCESSED_AT,
    },
    iauConstellations: {
        label: "The Constellations",
        organization: "International Astronomical Union",
        url: "https://iauarchive.eso.org/public/themes/constellations/",
        accessedAt: ACCESSED_AT,
    },
} as const satisfies Record<string, SourceReference>;

export const stellarDataSources = [
    starMapSources.brightStarCatalogue,
    starMapSources.simbad,
] as const;
