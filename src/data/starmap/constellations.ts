import type { ConstellationRecord } from "./types";

const segment = (from: string, to: string) => ({ from, to });

export const constellations: readonly ConstellationRecord[] = [
    {
        id: "orion", name: "Orion", abbreviation: "Ori", hemisphere: "Northern", season: "Winter",
        description: "A bright equatorial constellation recognized by three nearly aligned Belt stars between two contrasting supergiants.",
        starIds: ["betelgeuse", "rigel", "bellatrix", "saiph", "alnitak", "alnilam", "mintaka"],
        lineSegments: [segment("bellatrix", "betelgeuse"), segment("bellatrix", "mintaka"), segment("betelgeuse", "alnitak"), segment("mintaka", "alnilam"), segment("alnilam", "alnitak"), segment("mintaka", "rigel"), segment("alnitak", "saiph"), segment("rigel", "saiph")],
        mythologySummary: "Often identified with a prominent hunter figure in Greek mythology.",
        visibilityNotes: "Straddles the celestial equator and is visible from much of Earth.", labelOffset: [8, -18],
    },
    {
        id: "ursa-major", name: "Ursa Major", abbreviation: "UMa", hemisphere: "Northern", season: "Spring",
        description: "The Great Bear contains the seven-star Big Dipper, one of the northern sky’s most recognizable asterisms.",
        starIds: ["dubhe", "merak", "phecda", "megrez", "alioth", "mizar", "alkaid"],
        lineSegments: [segment("dubhe", "merak"), segment("merak", "phecda"), segment("phecda", "megrez"), segment("megrez", "dubhe"), segment("megrez", "alioth"), segment("alioth", "mizar"), segment("mizar", "alkaid")],
        mythologySummary: "The Great Bear appears in several traditions; its familiar seven-star pattern is the Big Dipper asterism, not a separate constellation.", labelOffset: [0, -20],
    },
    {
        id: "ursa-minor", name: "Ursa Minor", abbreviation: "UMi", hemisphere: "Northern", season: "Summer",
        description: "The Little Bear curls around the north celestial pole, with Polaris marking the end of its handle.",
        starIds: ["polaris", "yildun", "epsilon-umi", "zeta-umi", "eta-umi", "pherkad", "kochab"],
        lineSegments: [segment("polaris", "yildun"), segment("yildun", "epsilon-umi"), segment("epsilon-umi", "zeta-umi"), segment("zeta-umi", "eta-umi"), segment("eta-umi", "pherkad"), segment("pherkad", "kochab"), segment("kochab", "zeta-umi")],
        mythologySummary: "Often represented as the Lesser Bear in Greek sky lore.",
        visibilityNotes: "Circumpolar for many northern observers; broad seasonal labels are less meaningful here.", labelOffset: [6, 20],
    },
    {
        id: "cassiopeia", name: "Cassiopeia", abbreviation: "Cas", hemisphere: "Northern", season: "Autumn",
        description: "Five bright stars form a compact W or M opposite the Big Dipper across Polaris.",
        starIds: ["caph", "schedar", "gamma-cas", "ruchbah", "segin"],
        lineSegments: [segment("caph", "schedar"), segment("schedar", "gamma-cas"), segment("gamma-cas", "ruchbah"), segment("ruchbah", "segin")],
        mythologySummary: "Named for the queen Cassiopeia in Greek mythology.", labelOffset: [0, -20],
    },
    {
        id: "cygnus", name: "Cygnus", abbreviation: "Cyg", hemisphere: "Northern", season: "Summer",
        description: "The Swan follows the Milky Way; its central stars also form the Northern Cross asterism.",
        starIds: ["deneb", "sadr", "albireo", "gienah-cyg", "delta-cyg"],
        lineSegments: [segment("deneb", "sadr"), segment("sadr", "albireo"), segment("delta-cyg", "sadr"), segment("sadr", "gienah-cyg")],
        mythologySummary: "A swan in Greek tradition, though cultures have imagined other figures here.", labelOffset: [8, -16],
    },
    {
        id: "scorpius", name: "Scorpius", abbreviation: "Sco", hemisphere: "Southern", season: "Summer",
        description: "A sweeping hooked constellation with red Antares at its heart and Shaula at its stinger.",
        starIds: ["acraber", "dschubba", "antares", "sargas", "lesath", "shaula"],
        lineSegments: [segment("acraber", "dschubba"), segment("dschubba", "antares"), segment("antares", "sargas"), segment("sargas", "lesath"), segment("lesath", "shaula")],
        mythologySummary: "The scorpion associated with Orion’s story in Greek mythology.",
        visibilityNotes: "Best placed for southern and low-northern latitudes.", labelOffset: [8, 22],
    },
    {
        id: "leo", name: "Leo", abbreviation: "Leo", hemisphere: "Northern", season: "Spring",
        description: "A prominent zodiac constellation whose Sickle pattern rises from Regulus toward the Lion’s mane.",
        starIds: ["regulus", "algieba", "zosma", "chertan", "denebola"],
        lineSegments: [segment("regulus", "algieba"), segment("algieba", "zosma"), segment("zosma", "chertan"), segment("chertan", "regulus"), segment("zosma", "denebola"), segment("chertan", "denebola")],
        mythologySummary: "Traditionally linked to the Nemean Lion in Greek mythology.", labelOffset: [0, -18],
    },
    {
        id: "taurus", name: "Taurus", abbreviation: "Tau", hemisphere: "Northern", season: "Winter",
        description: "The Bull is anchored by orange Aldebaran and a V-shaped face, with two horns extending eastward.",
        starIds: ["aldebaran", "ain", "elnath", "zeta-tau"],
        lineSegments: [segment("ain", "aldebaran"), segment("ain", "elnath"), segment("aldebaran", "zeta-tau")],
        mythologySummary: "A bull figure with roots extending well beyond the later Greek tradition.", labelOffset: [-6, 22],
    },
    {
        id: "gemini", name: "Gemini", abbreviation: "Gem", hemisphere: "Northern", season: "Winter",
        description: "Twin parallel chains descend from Castor and Pollux toward the feet of the celestial twins.",
        starIds: ["castor", "pollux", "wasat", "mekbuda", "alhena"],
        lineSegments: [segment("castor", "mekbuda"), segment("mekbuda", "alhena"), segment("pollux", "wasat"), segment("wasat", "alhena")],
        mythologySummary: "The twins Castor and Pollux, known together as the Dioscuri.", labelOffset: [5, -18],
    },
    {
        id: "sagittarius", name: "Sagittarius", abbreviation: "Sgr", hemisphere: "Southern", season: "Summer",
        description: "A zodiac constellation toward the Milky Way’s center, often found through its compact Teapot asterism.",
        starIds: ["kaus-borealis", "kaus-media", "kaus-australis", "nunki", "ascella"],
        lineSegments: [segment("kaus-borealis", "kaus-media"), segment("kaus-media", "kaus-australis"), segment("kaus-australis", "ascella"), segment("ascella", "nunki"), segment("nunki", "kaus-borealis"), segment("kaus-media", "ascella")],
        mythologySummary: "Usually depicted as an archer, often a centaur-like figure.", labelOffset: [0, 24],
    },
    {
        id: "andromeda", name: "Andromeda", abbreviation: "And", hemisphere: "Northern", season: "Autumn",
        description: "A long chain of stars extending from Alpheratz, near the Great Square of Pegasus, through Mirach to Almach.",
        starIds: ["alpheratz", "delta-and", "mirach", "almach"],
        lineSegments: [segment("alpheratz", "delta-and"), segment("delta-and", "mirach"), segment("mirach", "almach")],
        mythologySummary: "Named for the princess Andromeda in Greek mythology.", labelOffset: [0, -18],
    },
    {
        id: "crux", name: "Crux", abbreviation: "Cru", hemisphere: "Southern", season: "Spring",
        description: "The compact Southern Cross uses four bright stars to mark a distinctive cross near the south celestial pole.",
        starIds: ["gacrux", "acrux", "delta-cru", "mimosa"],
        lineSegments: [segment("gacrux", "acrux"), segment("delta-cru", "mimosa")],
        mythologySummary: "Known as a cross in European navigation traditions and interpreted differently by southern cultures.",
        visibilityNotes: "A southern-sky landmark; it does not itself sit on the south celestial pole.", labelOffset: [12, 12],
    },
] as const;
