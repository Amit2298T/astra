export type SpacecraftMissionType =
    | "Interstellar Probe"
    | "Planetary Orbiter"
    | "Flyby Probe"
    | "Rover"
    | "Space Telescope";

export interface SpacecraftFact {
    label: string;
    value: string;
}

export interface SpacecraftConfig {
    id: string;
    name: string;
    agency: string;
    missionType: SpacecraftMissionType;
    launchDate: string;
    status: string;
    description: string;
    facts: SpacecraftFact[];
    modelScale: number;
    initialPosition: [number, number, number];
    direction: [number, number, number]; // normalized outbound travel direction
    speed: number; // visual units per second
    label: string;
    selectable: boolean;
    registryName: string;
    viewRadius: number; // optimal camera focus radius
}

export const spacecraftData: Record<string, SpacecraftConfig> = {
    voyager1: {
        id: "voyager-1",
        name: "Voyager 1",
        agency: "NASA",
        missionType: "Interstellar Probe",
        launchDate: "September 5, 1977",
        status: "Interstellar Space",
        description:
            "Launched in 1977 to explore Jupiter and Saturn, Voyager 1 became the first human-made object to cross the heliopause and enter interstellar space in 2012. It carries the Golden Record containing sounds and images of Earth.",
        facts: [
            { label: "Agency", value: "NASA / JPL" },
            { label: "Launch Date", value: "Sept 5, 1977" },
            { label: "Launch Vehicle", value: "Titan IIIE / Centaur" },
            { label: "Primary Flybys", value: "Jupiter (1979), Saturn (1980)" },
            { label: "Interstellar Entry", value: "August 25, 2012" },
            { label: "Golden Record", value: "Phonograph Gold Disc Onboard" },
        ],
        modelScale: 0.35,
        // Positioned outside Neptune (~26 units) in deep space at ~48 units from Sun
        initialPosition: [36, 12, 28],
        // Normalized outbound direction vector angling upward and outward from solar ecliptic
        direction: [0.74, 0.31, 0.59],
        speed: 0.25, // visual units per second for observable, subtle motion
        label: "Voyager 1",
        selectable: true,
        registryName: "Voyager 1",
        viewRadius: 1.5,
    },
};

export const spacecraftList: SpacecraftConfig[] = Object.values(spacecraftData);

export function getSpacecraftByName(name: string): SpacecraftConfig | undefined {
    return spacecraftList.find(
        (s) => s.name.toLowerCase() === name.toLowerCase() || s.registryName.toLowerCase() === name.toLowerCase()
    );
}

export function getSpacecraftById(id: string): SpacecraftConfig | undefined {
    return spacecraftData[id] ?? spacecraftList.find((s) => s.id === id);
}
