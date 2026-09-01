import { defineAstronomyRecords } from "./define";
import { astronomySources as source } from "./sources";

export const exoplanetAstronomyRecords = defineAstronomyRecords([
    ...([
        ["b",1.116,1.374,.01154,1.510826],["c",1.097,1.308,.0158,2.421937],["d",.788,.388,.02227,4.049219],["e",.92,.692,.02925,6.101013],["f",1.045,1.039,.03849,9.20754],["g",1.129,1.321,.04683,12.352446],["h",.755,.326,.06189,18.772866],
    ] as const).map(([letter,radius,mass,axis,period]) => ({id:`trappist-1-${letter}`,name:`TRAPPIST-1 ${letter}`,objectType:"exoplanet" as const,classification:"Terrestrial exoplanet",summary:`TRAPPIST-1 ${letter} is one of seven confirmed, roughly Earth-sized planets in the system. Habitable-zone placement alone does not establish habitability or life.`,factGroups:[{category:"Orbit" as const,facts:[{label:"Host",value:"TRAPPIST-1"},{label:"Orbital period",value:`${period} days`},{label:"Semi-major axis",value:`${axis} AU`}]},{category:"Physical" as const,facts:[{label:"Radius",value:`${radius} Earth radii`},{label:"Mass",value:`${mass} Earth masses`}]}],sources:[source.trappist1]})),
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
