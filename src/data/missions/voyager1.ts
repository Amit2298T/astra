import type { SourceReference } from "@/data/astronomy";

import type { MissionRecord } from "./types";

const ACCESSED_AT = "2026-08-30";

function missionSource(
    label: string,
    organization: string,
    url: string
): SourceReference {
    return { label, organization, url, accessedAt: ACCESSED_AT };
}

const voyagerMission = missionSource(
    "Voyager 1 mission profile",
    "NASA Science / JPL",
    "https://science.nasa.gov/mission/voyager/voyager-1/"
);
const voyagerSpacecraft = missionSource(
    "Voyager spacecraft and systems",
    "NASA Science / JPL",
    "https://science.nasa.gov/mission/voyager/spacecraft/"
);
const voyagerScience = missionSource(
    "Voyager science and power management",
    "NASA Science / JPL",
    "https://science.nasa.gov/mission/voyager/science/"
);
const voyagerRtg = missionSource(
    "Radioisotope power systems missions",
    "NASA Science",
    "https://science.nasa.gov/planetary-science/programs/radioisotope-power-systems/missions/"
);
const voyagerPowerReport = missionSource(
    "Voyager RTG flight performance report",
    "NASA Technical Reports Server",
    "https://ntrs.nasa.gov/api/citations/19850005601/downloads/19850005601.pdf"
);

export const voyager1Mission = {
    id: "voyager-1",
    canonicalAstronomyRecordId: "voyager-1",
    name: "Voyager 1",
    program: "Voyager",
    phase: "Interstellar Mission",
    status: "Active mission",
    launch: {
        dateTime: "1977-09-05T12:56:00Z",
        displayDate: "September 5, 1977",
        vehicle: "Titan IIIE–Centaur",
    },
    summary:
        "Voyager 1 explored Jupiter and Saturn, then continued beyond the heliopause as humanity’s most distant spacecraft.",
    snapshot: {
        capturedAt: "2024-08-21",
        displayDate: "August 21, 2024",
        distanceFromEarthAu: 164.7,
        heliocentricVelocityKmS: 17,
        phase: "Interstellar Mission",
        qualifier: "Curated historical snapshot; values are not live telemetry.",
        sources: [voyagerMission],
    },
    milestones: [
        {
            id: "launch",
            date: "1977-09-05",
            displayDate: "September 5, 1977",
            yearLabel: "1977",
            title: "Launch",
            category: "Launch",
            summary: "Voyager 1 begins its journey aboard a Titan IIIE–Centaur.",
            detail: "The spacecraft launched from Cape Canaveral on a fast trajectory toward the outer planets.",
            explorerTarget: "voyager-1",
        },
        {
            id: "jupiter",
            date: "1979-03-05",
            displayDate: "March 5, 1979",
            yearLabel: "1979",
            title: "Jupiter encounter",
            category: "Encounter",
            summary: "A close flyby transforms the view of Jupiter and its moons.",
            detail: "Voyager 1 returned detailed observations of Jupiter’s atmosphere, rings, magnetic environment, and major moons.",
            explorerTarget: "solar-system",
        },
        {
            id: "saturn",
            date: "1980-11-12",
            displayDate: "November 12, 1980",
            yearLabel: "1980",
            title: "Saturn encounter",
            category: "Encounter",
            summary: "Saturn’s rings and moons become the mission’s final planetary study.",
            detail: "The Saturn flyby completed Voyager 1’s planetary tour and carried its trajectory out of the planetary plane.",
            explorerTarget: "solar-system",
        },
        {
            id: "family-portrait",
            date: "1990-02-14",
            displayDate: "February 14, 1990",
            yearLabel: "1990",
            title: "Family Portrait",
            category: "Observation",
            summary: "The spacecraft looks back toward the Solar System.",
            detail: "Voyager 1 captured its final imaging mosaic, including the frame later known as the Pale Blue Dot.",
            explorerTarget: "solar-system",
        },
        {
            id: "heliopause",
            date: "2012-08-25",
            displayDate: "August 25, 2012",
            yearLabel: "2012",
            title: "Heliopause crossing",
            category: "Boundary",
            summary: "Voyager 1 enters interstellar space beyond the heliopause.",
            detail: "Measurements showed that the spacecraft had crossed the boundary of the Sun’s heliosphere and begun sampling the interstellar environment.",
            explorerTarget: "voyager-1",
        },
        {
            id: "interstellar-era",
            date: "2024-08-21",
            displayDate: "Snapshot: August 21, 2024",
            yearLabel: "Current era",
            title: "Interstellar Mission",
            category: "Mission phase",
            summary: "Long-duration science continues under increasingly limited power.",
            detail: "The mission team manages power, communications, and the remaining science capability across an immense radio link to Earth.",
            explorerTarget: "voyager-1",
        },
    ],
    systems: [
        {
            id: "communications",
            name: "Communications",
            state: "Operational context",
            context: "The high-gain antenna and NASA Deep Space Network support the long-distance radio link.",
        },
        {
            id: "power",
            name: "Power",
            state: "Degraded over time",
            context: "Three RTGs provide diminishing electrical power, requiring deliberate load reductions.",
        },
        {
            id: "guidance",
            name: "Guidance",
            state: "Mission-limited",
            context: "Attitude control keeps the spacecraft’s antenna pointed toward Earth using finite spacecraft resources.",
        },
        {
            id: "science",
            name: "Scientific instruments",
            state: "Mission-limited",
            context: "Instrument operations are progressively reduced as the available power margin declines.",
        },
        {
            id: "thermal",
            name: "Thermal control",
            state: "Mission-limited",
            context: "Heaters and spacecraft loads are carefully managed to protect essential hardware.",
        },
        {
            id: "propulsion",
            name: "Propulsion",
            state: "Operational context",
            context: "Small thruster pulses support spacecraft orientation rather than planetary-course propulsion.",
        },
    ],
    instruments: [
        { name: "Magnetometer", context: "Measures magnetic fields in the interstellar environment." },
        { name: "Plasma Wave Subsystem", context: "Detects plasma-wave activity beyond the heliopause." },
    ],
    distanceReferences: [
        { id: "earth-orbit", label: "Earth orbit", valueAu: 1, displayValue: "1 AU" },
        { id: "jupiter", label: "Jupiter", valueAu: 5.2, displayValue: "~5.2 AU" },
        { id: "saturn", label: "Saturn", valueAu: 9.5, displayValue: "~9.5 AU" },
        {
            id: "heliopause",
            label: "Heliopause crossing",
            valueAu: 121,
            displayValue: "~121 AU",
            emphasis: "boundary",
        },
        {
            id: "voyager-snapshot",
            label: "Voyager 1 snapshot",
            valueAu: 164.7,
            displayValue: "164.7 AU from Earth",
            qualifier: "August 21, 2024",
            emphasis: "mission",
        },
    ],
    powerHistory: [
        { year: 1977, watts: 470, label: "After launch", qualifier: "Approximate total RTG output" },
        { year: 1980, watts: 430, label: "Saturn era", qualifier: "Reported flight value" },
        { year: 2023, watts: 225, label: "Interstellar era", qualifier: "Stable operating level reported for 2023" },
    ],
    encounters: [
        {
            id: "jupiter",
            name: "Jupiter",
            year: "1979",
            date: "1979-03-05",
            displayDate: "March 5, 1979",
            context: "The first planetary encounter of Voyager 1’s outer-planet tour.",
            outcome: "Detailed observations expanded knowledge of Jupiter’s atmosphere, ring, moons, and magnetic environment.",
        },
        {
            id: "saturn",
            name: "Saturn",
            year: "1980",
            date: "1980-11-12",
            displayDate: "November 12, 1980",
            context: "The spacecraft’s final close planetary encounter.",
            outcome: "Observations characterized Saturn’s rings, atmosphere, and moons before Voyager 1 departed the planetary plane.",
        },
    ],
    goldenRecord: {
        purpose: "A message representing Earth, carried aboard Voyager 1.",
        context: "The gold-plated copper record preserves selected sounds, images, music, and greetings as a symbolic account of life and culture on Earth.",
    },
    sources: [
        voyagerMission,
        voyagerSpacecraft,
        voyagerScience,
        voyagerRtg,
        voyagerPowerReport,
    ],
} as const satisfies MissionRecord;
