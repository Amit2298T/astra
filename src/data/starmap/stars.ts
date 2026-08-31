import type { StarMapStar } from "./types";
import { stellarDataSources as sources } from "./sources";

const star = (
    id: string,
    name: string,
    constellationId: string,
    raHours: number,
    decDegrees: number,
    magnitude: number,
    spectralClass: string,
    distanceLy: number | undefined,
    note: string
): StarMapStar => ({ id, name, constellationId, raHours, decDegrees, magnitude, spectralClass, distanceLy, note, sources });

export const starMapStars = [
    star("betelgeuse", "Betelgeuse", "orion", 5.9195, 7.407, 0.42, "M1–M2 Ia–Iab", 548, "A variable red supergiant marking Orion’s shoulder."),
    star("rigel", "Rigel", "orion", 5.2423, -8.202, 0.13, "B8 Ia", 860, "A luminous blue-white supergiant at Orion’s foot."),
    star("bellatrix", "Bellatrix", "orion", 5.4189, 6.35, 1.64, "B2 III", 250, "The blue-white star at Orion’s western shoulder."),
    star("saiph", "Saiph", "orion", 5.7959, -9.67, 2.06, "B0.5 Ia", 650, "A hot supergiant outlining Orion’s eastern knee."),
    star("alnitak", "Alnitak", "orion", 5.6793, -1.943, 1.77, "O9.5 Iab", 1260, "The eastern star of Orion’s Belt, seen as a multiple-star system."),
    star("alnilam", "Alnilam", "orion", 5.6036, -1.202, 1.69, "B0 Ia", 2000, "The central Belt star and an exceptionally luminous supergiant."),
    star("mintaka", "Mintaka", "orion", 5.5334, -0.299, 2.23, "O9.5 II", 1200, "The westernmost of Orion’s three Belt stars."),

    star("dubhe", "Dubhe", "ursa-major", 11.0621, 61.751, 1.79, "K0 III", 123, "One of the two Big Dipper pointer stars leading toward Polaris."),
    star("merak", "Merak", "ursa-major", 11.0307, 56.382, 2.37, "A1 V", 80, "The lower pointer star in the bowl of the Big Dipper."),
    star("phecda", "Phecda", "ursa-major", 11.8972, 53.695, 2.44, "A0 V", 83, "Forms the lower inner corner of the Big Dipper’s bowl."),
    star("megrez", "Megrez", "ursa-major", 12.257, 57.033, 3.31, "A3 V", 81, "The faint hinge joining the Dipper’s bowl and handle."),
    star("alioth", "Alioth", "ursa-major", 12.9005, 55.96, 1.77, "A1 III–IV", 81, "The brightest star in Ursa Major’s familiar Dipper pattern."),
    star("mizar", "Mizar", "ursa-major", 13.3987, 54.925, 2.23, "A2 V", 83, "A celebrated visual double with Alcor, and itself a multiple system."),
    star("alkaid", "Alkaid", "ursa-major", 13.7923, 49.313, 1.86, "B3 V", 104, "The blue-white star at the end of the Big Dipper’s handle."),

    star("polaris", "Polaris", "ursa-minor", 2.5303, 89.264, 1.98, "F7 Ib", 448, "The North Star lies very close to the north celestial pole."),
    star("yildun", "Yildun", "ursa-minor", 17.5369, 86.586, 4.35, "A1 V", 172, "A star along the Little Dipper’s handle."),
    star("epsilon-umi", "Epsilon Ursae Minoris", "ursa-minor", 16.7662, 82.037, 4.21, "G5 III", 346, "A giant star tracing the Little Dipper’s handle."),
    star("zeta-umi", "Akhfa al Farkadain", "ursa-minor", 15.7343, 77.794, 4.32, "A3 V", 376, "One corner of the Little Dipper’s bowl."),
    star("eta-umi", "Anwar al Farkadain", "ursa-minor", 16.2918, 75.755, 4.95, "F5 V", 97, "The faint corner opposite Kochab in the Little Dipper’s bowl."),
    star("pherkad", "Pherkad", "ursa-minor", 15.3455, 71.834, 3.05, "A3 II–III", 487, "One of the two Guardians of the Pole."),
    star("kochab", "Kochab", "ursa-minor", 14.8451, 74.155, 2.08, "K4 III", 131, "A warm giant and the brighter Guardian of the Pole."),

    star("schedar", "Schedar", "cassiopeia", 0.6751, 56.537, 2.24, "K0 III", 228, "The brightest orange giant in Cassiopeia’s W."),
    star("caph", "Caph", "cassiopeia", 0.1529, 59.15, 2.28, "F2 III–IV", 55, "The western end of Cassiopeia’s W-shaped pattern."),
    star("gamma-cas", "Gamma Cassiopeiae", "cassiopeia", 0.9451, 60.717, 2.47, "B0.5 IVe", 550, "A rapidly rotating variable star at the center of the W."),
    star("ruchbah", "Ruchbah", "cassiopeia", 1.4303, 60.235, 2.68, "A5 IV", 100, "A white subgiant forming the next bend in the W."),
    star("segin", "Segin", "cassiopeia", 1.9066, 63.67, 3.35, "B3 III", 440, "The eastern tip of Cassiopeia’s W."),

    star("deneb", "Deneb", "cygnus", 20.6905, 45.28, 1.25, "A2 Ia", 2615, "A distant luminous supergiant and one vertex of the Summer Triangle."),
    star("sadr", "Sadr", "cygnus", 20.3705, 40.257, 2.23, "F8 Ib", 1800, "Marks the crossing point of the Northern Cross."),
    star("albireo", "Albireo", "cygnus", 19.512, 27.96, 3.05, "K2 II + B", 430, "A contrasting gold-and-blue double star at the Swan’s beak."),
    star("gienah-cyg", "Gienah", "cygnus", 20.7702, 33.97, 2.46, "K0 III", 73, "Forms the eastern wing of Cygnus."),
    star("delta-cyg", "Delta Cygni", "cygnus", 19.7496, 45.131, 2.87, "B9 III", 165, "Forms the western wing of Cygnus."),

    star("antares", "Antares", "scorpius", 16.4901, -26.432, 0.96, "M1.5 Iab", 550, "A red supergiant whose name means rival of Mars."),
    star("dschubba", "Dschubba", "scorpius", 16.0056, -22.622, 2.29, "B0.3 IV", 490, "A hot star marking the Scorpion’s forehead."),
    star("acraber", "Acrab", "scorpius", 16.0906, -19.806, 2.56, "B1 V", 400, "A multiple-star system in the Scorpion’s head."),
    star("sargas", "Sargas", "scorpius", 17.6219, -42.998, 1.86, "F1 II", 300, "A bright giant along the curve of the Scorpion’s tail."),
    star("lesath", "Lesath", "scorpius", 17.5127, -37.296, 2.7, "B2 IV", 580, "Together with Shaula, forms the Scorpion’s stinger."),
    star("shaula", "Shaula", "scorpius", 17.5601, -37.104, 1.62, "B2 IV", 570, "A blue-white multiple system at the tip of the stinger."),

    star("regulus", "Regulus", "leo", 10.1395, 11.967, 1.35, "B8 IV", 79, "A multiple-star system marking the Lion’s heart."),
    star("algieba", "Algieba", "leo", 10.3329, 19.842, 2.08, "K0 III", 130, "A golden double star in Leo’s sickle."),
    star("zosma", "Zosma", "leo", 11.2351, 20.524, 2.56, "A4 V", 58, "Marks the Lion’s hip."),
    star("chertan", "Chertan", "leo", 11.2373, 15.43, 3.34, "A2 V", 165, "Forms part of Leo’s hindquarters."),
    star("denebola", "Denebola", "leo", 11.8177, 14.572, 2.14, "A3 V", 36, "The star at the tip of the Lion’s tail."),

    star("aldebaran", "Aldebaran", "taurus", 4.5987, 16.509, 0.87, "K5 III", 65, "An orange giant appearing in front of the more distant Hyades cluster."),
    star("elnath", "Elnath", "taurus", 5.4382, 28.608, 1.65, "B7 III", 134, "Marks the tip of Taurus’s northern horn."),
    star("zeta-tau", "Tianguan", "taurus", 5.6274, 21.143, 3.0, "B2 IIIe", 440, "Marks the tip of Taurus’s southern horn near the Crab Nebula."),
    star("ain", "Ain", "taurus", 4.4769, 19.18, 3.53, "K0 III", 147, "A giant star in the Hyades face of Taurus."),

    star("castor", "Castor", "gemini", 7.5767, 31.888, 1.58, "A1 V", 51, "A six-star system that marks the head of one twin."),
    star("pollux", "Pollux", "gemini", 7.7553, 28.026, 1.14, "K0 III", 34, "The brighter, warmer head star of the twins."),
    star("alhena", "Alhena", "gemini", 6.6285, 16.399, 1.93, "A1 IV", 109, "A white subgiant marking one twin’s foot."),
    star("wasat", "Wasat", "gemini", 7.3354, 21.982, 3.5, "F0 IV", 59, "A multiple system near the body of Pollux’s twin."),
    star("mekbuda", "Mekbuda", "gemini", 7.0685, 20.57, 3.79, "G0 Ib", 1200, "A pulsating Cepheid supergiant in Gemini."),

    star("kaus-australis", "Kaus Australis", "sagittarius", 18.4029, -34.385, 1.79, "B9.5 III", 143, "The brightest star in Sagittarius’s Teapot asterism."),
    star("nunki", "Nunki", "sagittarius", 18.9211, -26.297, 2.05, "B2.5 V", 228, "A hot blue star on the Teapot’s handle."),
    star("kaus-media", "Kaus Media", "sagittarius", 18.3499, -29.828, 2.7, "K3 III", 348, "The middle star of the Archer’s bow."),
    star("kaus-borealis", "Kaus Borealis", "sagittarius", 18.4662, -25.422, 2.82, "K1 III", 77, "The northern star of the Archer’s bow."),
    star("ascella", "Ascella", "sagittarius", 19.0435, -29.88, 2.6, "A2.5 V", 89, "A multiple system forming the Teapot’s lower handle."),

    star("alpheratz", "Alpheratz", "andromeda", 0.1398, 29.09, 2.06, "B8 IVp", 97, "The bright star shared historically with Pegasus, marking Andromeda’s head."),
    star("mirach", "Mirach", "andromeda", 1.1622, 35.621, 2.05, "M0 III", 197, "A red giant along Andromeda’s main chain."),
    star("almach", "Almach", "andromeda", 2.0649, 42.33, 2.1, "K3 II + B", 350, "A colorful multiple star at the end of Andromeda’s chain."),
    star("delta-and", "Delta Andromedae", "andromeda", 0.6555, 30.861, 3.27, "K3 III", 105, "An orange giant between Alpheratz and Mirach."),

    star("acrux", "Acrux", "crux", 12.4433, -63.099, 0.77, "B0.5 IV + B1 V", 321, "A blue-white multiple system at the foot of the Southern Cross."),
    star("mimosa", "Mimosa", "crux", 12.7953, -59.689, 1.25, "B0.5 III", 280, "A hot blue giant forming the eastern arm of the Cross."),
    star("gacrux", "Gacrux", "crux", 12.5194, -57.113, 1.63, "M3.5 III", 89, "A red giant at the top of the Southern Cross."),
    star("delta-cru", "Imai", "crux", 12.2524, -58.749, 2.79, "B2 IV", 345, "The western arm of the Southern Cross."),
] as const satisfies readonly StarMapStar[];
