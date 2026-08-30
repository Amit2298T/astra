import { defineAstronomyRecords } from "./define";
import { astronomySources as source } from "./sources";

export const starAstronomyRecords = defineAstronomyRecords([
    {
        id: "sun", name: "Sun", objectType: "star", classification: "G2V main-sequence star",
        summary: "The Sun is the 4.6-billion-year-old star whose gravity organizes the Solar System and whose light and heat power most life on Earth.",
        factGroups: [
            { category: "Physical", facts: [
                { label: "Radius", value: "About 700,000 km" },
                { label: "Mass", value: "About 333,000 Earth masses" },
                { label: "Visible surface", value: "About 5,500 °C" },
                { label: "Core temperature", value: "About 15 million °C" },
            ] },
            { category: "Context", facts: [
                { label: "Age", value: "About 4.6 billion years" },
                { label: "Composition", value: "Mostly hydrogen and helium" },
                { label: "System role", value: "Contains about 99.8% of Solar System mass" },
            ] },
        ], sources: [source.sun],
    },
    {
        id: "alpha-centauri-a", name: "Alpha Centauri A", objectType: "star", classification: "G2V main-sequence star",
        summary: "Alpha Centauri A is a Sun-like star and the larger member of the close Alpha Centauri A–B binary pair.",
        factGroups: [
            { category: "Physical", facts: [
                { label: "Mass", value: "About 1.08 solar masses" },
                { label: "Radius", value: "About 1.22 solar radii" },
                { label: "Surface temperature", value: "About 5,800 K" },
            ] },
            { category: "Context", facts: [
                { label: "Distance from Sun", value: "About 4.37 light-years" },
                { label: "System", value: "Close binary with Alpha Centauri B" },
                { label: "Binary period", value: "About 80 years" },
            ] },
        ], sources: [source.alphaCentauri],
    },
    {
        id: "alpha-centauri-b", name: "Alpha Centauri B", objectType: "star", classification: "K1V main-sequence star",
        summary: "Alpha Centauri B is a slightly smaller, cooler orange star gravitationally bound to Alpha Centauri A in a close binary.",
        factGroups: [
            { category: "Physical", facts: [
                { label: "Mass", value: "About 0.91 solar masses" },
                { label: "Radius", value: "About 0.86 solar radii" },
                { label: "Surface temperature", value: "About 5,200 K" },
            ] },
            { category: "Context", facts: [
                { label: "Distance from Sun", value: "About 4.37 light-years" },
                { label: "System", value: "Close binary with Alpha Centauri A" },
                { label: "Binary period", value: "About 80 years" },
            ] },
        ], sources: [source.alphaCentauri],
    },
    {
        id: "proxima-centauri", name: "Proxima Centauri", objectType: "star", classification: "M5.5V red dwarf flare star",
        summary: "Proxima Centauri is the nearest known star to the Sun and a distant, gravitationally associated companion to the Alpha Centauri A–B binary.",
        factGroups: [
            { category: "Physical", facts: [
                { label: "Mass", value: "About 0.12 solar masses" },
                { label: "Radius", value: "About 0.14 solar radii" },
                { label: "Surface temperature", value: "About 3,000 K" },
            ] },
            { category: "Context", facts: [
                { label: "Distance from Sun", value: "About 4.24 light-years" },
                { label: "System", value: "Distant companion to Alpha Centauri A–B" },
                { label: "Activity", value: "Magnetically active flare star" },
            ] },
        ], sources: [source.alphaCentauri, source.proximaB],
    },
] as const);
