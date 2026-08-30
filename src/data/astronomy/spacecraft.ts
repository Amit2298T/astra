import { defineAstronomyRecords } from "./define";
import { astronomySources as source } from "./sources";

export const spacecraftAstronomyRecords = defineAstronomyRecords([
    {
        id: "voyager-1", name: "Voyager 1", objectType: "spacecraft", classification: "Interstellar robotic probe",
        summary: "Voyager 1 explored Jupiter and Saturn before becoming the first spacecraft to cross the heliopause and directly sample interstellar space.",
        factGroups: [
            { category: "Mission", facts: [
                { label: "Agency", value: "NASA / Jet Propulsion Laboratory" },
                { label: "Launch", value: "September 5, 1977" },
                { label: "Jupiter encounter", value: "Closest approach in March 1979" },
                { label: "Saturn encounter", value: "Closest approach in November 1980" },
            ] },
            { category: "Context", facts: [
                { label: "Heliopause crossing", value: "August 25, 2012" },
                { label: "Mission phase", value: "Voyager Interstellar Mission" },
                { label: "Golden Record", value: "Carries sounds and images representing Earth" },
                { label: "Status wording", value: "Operating in interstellar space beyond the heliopause" },
            ] },
        ], sources: [source.voyager],
    },
] as const);
