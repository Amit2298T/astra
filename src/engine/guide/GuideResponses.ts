import {
    getAstronomyRecord,
    type AstronomyRecord,
    type SourceReference,
} from "@/data/astronomy";
import {
    comparisonMetrics,
    getComparisonObject,
    type ComparisonMetricId,
} from "@/data/astronomy/comparison";
import { guideConcepts, type GuideAction, type GuideEntityMatch, type GuideFact, type GuideResponse } from "@/data/guide";
import { voyager1Mission } from "@/data/missions";
import { constellationsById, starMapSources, starsById } from "@/data/starmap";
import { describeMetricComparison } from "@/engine/comparison/SpaceComparison";
import { calculateMissionAge, calculateSignalDelay, formatSignalDelay } from "@/engine/mission/MissionMetrics";
import { explorerHref } from "@/engine/navigation/ExplorerEntry";
import { normalizeGuideText } from "./GuideIntent";

function uniqueSources(sources: readonly SourceReference[]) {
    return [...new Map(sources.map((source) => [source.url, source])).values()];
}

function flattenFacts(record: AstronomyRecord, limit = 4): readonly GuideFact[] {
    return record.factGroups.flatMap((group) => group.facts).slice(0, limit);
}

function factsMatching(record: AstronomyRecord, terms: readonly string[]) {
    return record.factGroups
        .flatMap((group) => group.facts)
        .filter((fact) => terms.some((term) => fact.label.toLowerCase().includes(term)))
        .slice(0, 4);
}

function actionsForObject(id: string): readonly GuideAction[] {
    const comparable = getComparisonObject(id);
    const actions: GuideAction[] = [];
    if (comparable?.explorerTarget) {
        actions.push({ label: "View in Explorer", href: explorerHref(comparable.explorerTarget), tone: "primary" });
    } else if (id === "galactic-center") {
        actions.push({ label: "View Galactic Center", href: explorerHref("sagittarius-a"), tone: "primary" });
    }
    if (id === "voyager-1") {
        actions.push({ label: "Open Mission Control", href: "/mission-control", tone: "secondary" });
    }
    if (id === "sagittarius-a-star") {
        actions.push({ label: "Compare with Sun", href: "/compare?objects=sagittarius-a-star,sun&metric=diameter", tone: "secondary" });
    } else if (comparable?.values.diameter && id !== "earth") {
        actions.push({ label: "Compare with Earth", href: `/compare?objects=${id},earth&metric=diameter`, tone: "secondary" });
    } else if (comparable?.values.physicalExtent && id !== "milky-way") {
        actions.push({ label: "Compare scale", href: `/compare?objects=${id},milky-way&metric=physicalExtent`, tone: "secondary" });
    }
    if (id === "milky-way") actions.push({ label: "Explore cosmic scale", href: "/scale", tone: "secondary" });
    if (["nebula", "starCluster", "galacticRegion"].includes(getAstronomyRecord(id)?.objectType ?? "")) {
        actions.push({ label: "Explore cosmic scale", href: "/scale", tone: "secondary" });
    }
    return actions;
}

export function unsupportedResponse(): GuideResponse {
    return {
        intent: "UNSUPPORTED",
        answer: "That’s outside ASTRA’s astronomy guide. Ask me about planets, stars, missions, nebulae, galaxies, constellations, or cosmic scale.",
        suggestions: [
            { label: "What can I ask?", prompt: "What can I ask?" },
            { label: "Explore a nebula", prompt: "Which nebula should I explore?" },
        ],
    };
}

export function helpResponse(): GuideResponse {
    return {
        intent: "HELP",
        answer: "Ask about objects already represented in ASTRA, compare supported objects, explore Voyager 1’s mission, learn a cosmic concept, or identify stars and constellations. I use local curated data and will say when ASTRA does not contain a requested fact.",
        suggestions: [
            { label: "Compare worlds", prompt: "Compare Earth and Jupiter" },
            { label: "Mission question", prompt: "How long does a signal take to reach Voyager 1?" },
            { label: "Star-map question", prompt: "Which constellation contains Betelgeuse?" },
        ],
    };
}

export function ambiguityResponse(otherEntities: readonly GuideEntityMatch[] = []): GuideResponse {
    const preserved = otherEntities.slice(0, 2);
    const preservedNote = preserved.length > 0
        ? ` ${preserved.map((entity) => entity.name).join(" and ")} was also detected and I can compare or explain ${preserved.length === 1 ? "it" : "them"} once Orion is resolved.`
        : "";
    return {
        intent: "DEFINITION",
        answer: `Orion is ambiguous in ASTRA. Do you mean the Orion constellation—the sky pattern containing Betelgeuse and Rigel—or the Orion Nebula, the stellar nursery cataloged as Messier 42?${preservedNote}`,
        suggestions: [
            { label: "Orion constellation", prompt: "Tell me about the Orion constellation" },
            { label: "Orion Nebula", prompt: "Tell me about Orion Nebula" },
        ],
        pendingEntities: preserved,
        dataNote: "ASTRA curated data",
    };
}

export function propertySpecificResponse(
    input: string,
    entities: readonly GuideEntityMatch[]
): GuideResponse | null {
    const text = normalizeGuideText(input);
    const hasGreatRedSpot = ["great red spot", "red spot", "jupiter red spot", "grs"]
        .some((alias) => ` ${text} `.includes(` ${alias} `));
    if (hasGreatRedSpot) {
        return {
            intent: "COMPARISON",
            answer: "ASTRA does not currently have a sourced Great Red Spot size measurement in its curated dataset.",
            actions: [
                { label: "Jupiter overview", href: "/guide?object=jupiter", tone: "secondary" },
                { label: "Compare Jupiter and Earth", href: "/compare?objects=jupiter,earth&metric=diameter", tone: "secondary" },
                { label: "View Jupiter in Explorer", href: explorerHref("solar-system"), tone: "primary" },
            ],
            resolvedEntity: { id: "jupiter", name: "Jupiter", kind: "astronomyObject" },
            resolvedEntities: entities.slice(0, 2),
            dataNote: "ASTRA curated data",
        };
    }

    const saturnRings = text.includes("saturn") && (text.includes(" ring") || text.includes("rings"));
    if (saturnRings && entities.length >= 2) {
        return {
            intent: "COMPARISON",
            answer: "ASTRA does not currently have a sourced Saturn ring-size measurement that can be compared numerically with Earth. I won’t substitute Saturn’s planetary diameter for its rings.",
            actions: [
                { label: "Saturn overview", href: "/guide?object=saturn", tone: "secondary" },
                { label: "View Saturn in Explorer", href: explorerHref("solar-system"), tone: "primary" },
            ],
            resolvedEntity: { id: "saturn", name: "Saturn", kind: "astronomyObject" },
            resolvedEntities: entities.slice(0, 2),
            dataNote: "ASTRA curated data",
        };
    }

    const unsupportedProperty = ["atmosphere", "storm", "storms", "moons", "surface area"]
        .find((property) => text.includes(property));
    if (unsupportedProperty && entities.length >= 2) {
        const owner = entities.find((entity) => entity.kind === "astronomyObject");
        if (owner) return {
            intent: "COMPARISON",
            answer: `ASTRA does not currently have a normalized ${owner.name} ${unsupportedProperty} measurement that can be compared with the other requested object. I won’t substitute ${owner.name}’s whole-object diameter.`,
            actions: actionsForObject(owner.id),
            resolvedEntity: owner,
            resolvedEntities: entities.slice(0, 2),
            dataNote: "ASTRA curated data",
        };
    }
    return null;
}

export function multiEntityResponse(
    entities: readonly GuideEntityMatch[],
    intent: GuideResponse["intent"]
): GuideResponse {
    const selected = entities.slice(0, 2);
    const details = selected.map((entity) => {
        if (entity.kind === "astronomyObject") {
            const record = getAstronomyRecord(entity.id);
            return record ? {
                summary: record.summary,
                classification: record.classification,
                sources: record.sources,
                actions: actionsForObject(entity.id),
            } : null;
        }
        if (entity.kind === "constellation") {
            const constellation = constellationsById.get(entity.id);
            return constellation ? {
                summary: constellation.description,
                classification: "Constellation",
                sources: [starMapSources.iauConstellations],
                actions: [{ label: "Open in Star Map", href: `/star-map?constellation=${constellation.id}`, tone: "primary" as const }],
            } : null;
        }
        if (entity.kind === "star") {
            const star = starsById.get(entity.id);
            return star ? {
                summary: star.note,
                classification: "Star-map star",
                sources: star.sources,
                actions: [{ label: "Open in Star Map", href: `/star-map?constellation=${star.constellationId}&star=${star.id}`, tone: "primary" as const }],
            } : null;
        }
        return null;
    });
    if (details.some((detail) => !detail)) return unsupportedResponse();
    const supported = details.filter((detail): detail is NonNullable<typeof detail> => Boolean(detail));
    const actions = supported
        .flatMap((detail) => detail.actions)
        .filter((action, index, all) => all.findIndex((candidate) => candidate.href === action.href && candidate.label === action.label) === index)
        .slice(0, 4);
    return {
        intent: intent === "UNSUPPORTED" ? "DEFINITION" : intent,
        answer: selected.map((entity, index) => `${entity.name}: ${supported[index]?.summary}`).join(" "),
        facts: selected.map((entity, index) => ({ label: entity.name, value: supported[index]?.classification ?? "ASTRA object" })),
        sources: uniqueSources(supported.flatMap((detail) => detail.sources)),
        actions,
        resolvedEntity: selected[0],
        resolvedEntities: selected,
        pendingEntities: [],
        dataNote: "ASTRA curated data",
    };
}

export function sourcesResponse(entity?: GuideEntityMatch): GuideResponse {
    if (entity?.kind === "astronomyObject") {
        const record = getAstronomyRecord(entity.id);
        const comparable = getComparisonObject(entity.id);
        const sourceOwner = record ?? comparable;
        if (sourceOwner) return {
            intent: "SOURCES",
            answer: `${sourceOwner.name} is supported by ${sourceOwner.sources.length} curated source reference${sourceOwner.sources.length === 1 ? "" : "s"} in ASTRA. Open the disclosure below for the original organizations and records.`,
            sources: sourceOwner.sources,
            actions: [{ label: "ASTRA data methodology", href: "/sources", tone: "secondary" }],
            resolvedEntity: entity,
            dataNote: "ASTRA curated data",
        };
    }
    return {
        intent: "SOURCES",
        answer: "ASTRA’s guide composes answers from the local astronomy, comparison, mission, scale, and star-map registries. It does not call an external language model or live astronomy service.",
        actions: [{ label: "Read data methodology", href: "/sources", tone: "primary" }],
    };
}

export function conceptResponse(entity: GuideEntityMatch): GuideResponse {
    const concept = guideConcepts.find((candidate) => candidate.id === entity.id);
    if (!concept) return unsupportedResponse();
    return {
        intent: "CATEGORY",
        answer: concept.description,
        sources: concept.sources,
        actions: concept.id === "constellation"
            ? [{ label: "Open Star Map", href: "/star-map", tone: "primary" }]
            : [{ label: "Explore cosmic scale", href: "/scale", tone: "secondary" }],
        resolvedEntity: entity,
        dataNote: "ASTRA curated data",
    };
}

export function objectResponse(entity: GuideEntityMatch, intent: GuideResponse["intent"], input: string): GuideResponse {
    const record = getAstronomyRecord(entity.id);
    const comparable = getComparisonObject(entity.id);
    if (!record && comparable) {
        const preferredValue = intent === "SIZE"
            ? comparable.values.diameter ?? comparable.values.physicalExtent ?? comparable.values.mass
            : intent === "DISTANCE"
                ? comparable.values.distanceFromEarth ?? comparable.values.orbitalDistance
                : undefined;
        return {
            intent,
            answer: preferredValue
                ? `${comparable.summary} ASTRA stores ${preferredValue.displayValue.toLowerCase()} for this view.`
                : comparable.summary,
            facts: preferredValue ? [{ label: preferredValue.qualifier ?? "Measurement", value: preferredValue.displayValue }] : undefined,
            sources: comparable.sources,
            actions: actionsForObject(comparable.id),
            resolvedEntity: entity,
            dataNote: "ASTRA curated data",
        };
    }
    if (!record) return unsupportedResponse();
    const text = normalizeGuideText(input);

    if (record.id === "mars" && text.includes("why") && text.includes("red")) {
        return {
            intent: "DEFINITION",
            answer: "Mars looks red because iron-bearing minerals in its rocks and dust oxidized, producing rust-like iron oxides. Fine reddish dust suspended in the atmosphere and spread across the surface gives the planet its familiar color.",
            facts: factsMatching(record, ["atmosphere", "temperature"]),
            sources: record.sources,
            actions: actionsForObject(record.id),
            resolvedEntity: entity,
            dataNote: "ASTRA curated data",
        };
    }

    if (intent === "SIZE") {
        const comparable = getComparisonObject(record.id);
        const sizeValue = comparable?.values.diameter ?? comparable?.values.physicalExtent ?? comparable?.values.mass;
        return {
            intent,
            answer: sizeValue
                ? `${record.name} is ${sizeValue.displayValue.toLowerCase()} by ${comparable?.values.diameter ? "diameter" : comparable?.values.physicalExtent ? "physical extent" : "mass"}. ${record.summary}`
                : `${record.summary} I don’t have a normalized size value for ${record.name} in ASTRA’s comparison dataset yet.`,
            facts: factsMatching(record, ["radius", "diameter", "mass", "scale"]),
            sources: record.sources,
            actions: actionsForObject(record.id),
            resolvedEntity: entity,
            dataNote: "ASTRA curated data",
        };
    }

    if (intent === "DISTANCE" || intent === "LOCATION") {
        const locationFacts = factsMatching(record, ["distance", "location", "constellation", "solar distance", "galactic region"]);
        return {
            intent,
            answer: locationFacts.length > 0
                ? `${record.summary} ASTRA’s location data is summarized in the key facts below.`
                : `${record.summary} I don’t have a more precise location or distance value for ${record.name} in ASTRA’s curated dataset yet.`,
            facts: locationFacts,
            sources: record.sources,
            actions: actionsForObject(record.id),
            resolvedEntity: entity,
            dataNote: "ASTRA curated data",
        };
    }

    return {
        intent,
        answer: record.summary,
        facts: flattenFacts(record),
        sources: record.sources,
        actions: actionsForObject(record.id),
        resolvedEntity: entity,
        dataNote: "ASTRA curated data",
    };
}

function selectMetric(input: string): ComparisonMetricId {
    const text = normalizeGuideText(input);
    if (text.includes("mass") || text.includes("heavy")) return "mass";
    if (text.includes("gravity")) return "surfaceGravity";
    if (text.includes("temperature") || text.includes("hot") || text.includes("cold")) return "temperature";
    if (text.includes("orbit") && text.includes("period")) return "orbitalPeriod";
    if (text.includes("orbit") && text.includes("distance")) return "orbitalDistance";
    if (text.includes("far") || text.includes("distance")) return "distanceFromEarth";
    if (text.includes("extent") || text.includes("wide")) return "physicalExtent";
    return "diameter";
}

export function comparisonResponse(entities: readonly GuideEntityMatch[], input: string): GuideResponse {
    const comparisonText = normalizeGuideText(input);
    const orderedEntities = [...entities].sort((first, second) => {
        const firstIndex = comparisonText.indexOf(normalizeGuideText(first.name));
        const secondIndex = comparisonText.indexOf(normalizeGuideText(second.name));
        return (firstIndex < 0 ? Number.MAX_SAFE_INTEGER : firstIndex) -
            (secondIndex < 0 ? Number.MAX_SAFE_INTEGER : secondIndex);
    });
    const objects = orderedEntities
        .filter((entity) => entity.kind === "astronomyObject")
        .map((entity) => getComparisonObject(entity.id))
        .filter((object): object is NonNullable<ReturnType<typeof getComparisonObject>> => Boolean(object));
    if (objects.length < 2) {
        const text = normalizeGuideText(input);
        if (text.includes("nebula") && text.includes("star cluster")) {
            const nebula = guideConcepts.find((concept) => concept.id === "nebula");
            const cluster = guideConcepts.find((concept) => concept.id === "star-cluster");
            return {
                intent: "COMPARISON",
                answer: "A nebula is a cloud of gas and dust; it may be a birthplace or remnant of stars. A star cluster is a real population of stars connected by common origin or gravity, so the cluster is made of stars rather than the surrounding cloud material.",
                sources: uniqueSources([...(nebula?.sources ?? []), ...(cluster?.sources ?? [])]),
                actions: [{ label: "Compare ASTRA objects", href: "/compare", tone: "secondary" }],
                dataNote: "ASTRA curated data",
            };
        }
        return {
            intent: "COMPARISON",
            answer: "Name two objects represented in ASTRA—for example, “Compare Earth and Jupiter.” I’ll only calculate a ratio when both objects have compatible normalized measurements.",
            suggestions: [{ label: "Earth and Jupiter", prompt: "How big is Jupiter compared with Earth?" }],
        };
    }
    const [first, second] = objects;
    const requestedMetric = selectMetric(input);
    const firstValue = first.values[requestedMetric];
    const secondValue = second.values[requestedMetric];
    if (!firstValue || !secondValue || firstValue.unit !== secondValue.unit) {
        return {
            intent: "COMPARISON",
            answer: `ASTRA does not have scientifically compatible ${comparisonMetrics.find((metric) => metric.id === requestedMetric)?.label.toLowerCase() ?? "numeric"} measurements for both ${first.name} and ${second.name}. I won’t calculate a ratio from unlike or missing quantities.`,
            sources: uniqueSources([...first.sources, ...second.sources]),
            actions: [{ label: "Open comparison tool", href: `/compare?objects=${first.id},${second.id}`, tone: "secondary" }],
            dataNote: "ASTRA curated data",
        };
    }
    const metric = comparisonMetrics.find((candidate) => candidate.id === requestedMetric);
    if (!metric) return unsupportedResponse();
    return {
        intent: "COMPARISON",
        answer: `${describeMetricComparison(first, second, metric)} ${firstValue.displayValue}; ${secondValue.displayValue}.`,
        facts: [
            { label: first.name, value: firstValue.displayValue },
            { label: second.name, value: secondValue.displayValue },
        ],
        sources: uniqueSources([...first.sources, ...second.sources]),
        actions: [{ label: "Open this comparison", href: `/compare?objects=${first.id},${second.id}&metric=${requestedMetric}`, tone: "primary" }],
        resolvedEntity: orderedEntities[0],
        dataNote: "Calculated from ASTRA data",
    };
}

export function missionResponse(entity: GuideEntityMatch | undefined, input: string): GuideResponse {
    const text = normalizeGuideText(input);
    const voyagerEntity = entity?.id === "voyager-1"
        ? entity
        : { id: "voyager-1", name: "Voyager 1", kind: "astronomyObject" as const };

    if (text.includes("signal") && voyager1Mission.snapshot.distanceFromEarthAu) {
        const oneWay = calculateSignalDelay(voyager1Mission.snapshot.distanceFromEarthAu);
        const roundTrip = calculateSignalDelay(voyager1Mission.snapshot.distanceFromEarthAu * 2);
        return {
            intent: "MISSION",
            answer: `At ASTRA’s ${voyager1Mission.snapshot.displayDate} distance snapshot, a radio signal takes about ${formatSignalDelay(oneWay)} one way between Earth and Voyager 1—roughly ${formatSignalDelay(roundTrip)} for a round trip. This is calculated from the stored ${voyager1Mission.snapshot.distanceFromEarthAu} AU snapshot, not live telemetry.`,
            facts: [
                { label: "Snapshot distance", value: `${voyager1Mission.snapshot.distanceFromEarthAu} AU` },
                { label: "One-way light time", value: `About ${formatSignalDelay(oneWay)}` },
                { label: "Round trip", value: `About ${formatSignalDelay(roundTrip)}` },
            ],
            sources: voyager1Mission.snapshot.sources,
            actions: actionsForObject("voyager-1"),
            resolvedEntity: voyagerEntity,
            dataNote: "Calculated from ASTRA data",
        };
    }

    if (text.includes("how long") || text.includes("traveling") || text.includes("mission age")) {
        const age = calculateMissionAge(voyager1Mission.launch.dateTime);
        return {
            intent: "MISSION",
            answer: `Voyager 1 has been traveling for about ${age.years} years and ${age.months} months since its ${voyager1Mission.launch.displayDate} launch. The elapsed time is calculated locally from the stored launch timestamp.`,
            facts: [{ label: "Launch", value: voyager1Mission.launch.displayDate }, { label: "Mission age", value: `${age.years}y ${age.months}m ${age.days}d` }],
            sources: voyager1Mission.sources,
            actions: actionsForObject("voyager-1"),
            resolvedEntity: voyagerEntity,
            dataNote: "Calculated from ASTRA data",
        };
    }

    if (text.includes("golden record")) {
        return {
            intent: "MISSION",
            answer: `${voyager1Mission.goldenRecord.purpose} ${voyager1Mission.goldenRecord.context}`,
            sources: voyager1Mission.sources,
            actions: actionsForObject("voyager-1"),
            resolvedEntity: voyagerEntity,
            dataNote: "ASTRA curated data",
        };
    }

    if (text.includes("discover") || text.includes("did voyager")) {
        return {
            intent: "MISSION",
            answer: `${voyager1Mission.summary} ${voyager1Mission.encounters.map((encounter) => encounter.outcome).join(" ")}`,
            facts: voyager1Mission.encounters.map((encounter) => ({ label: `${encounter.name} encounter`, value: encounter.displayDate })),
            sources: voyager1Mission.sources,
            actions: actionsForObject("voyager-1"),
            resolvedEntity: voyagerEntity,
            dataNote: "ASTRA curated data",
        };
    }

    const record = getAstronomyRecord("voyager-1");
    return {
        intent: "MISSION",
        answer: voyager1Mission.summary,
        facts: [
            { label: "Launch", value: voyager1Mission.launch.displayDate },
            { label: "Jupiter encounter", value: voyager1Mission.encounters[0]?.displayDate ?? "Not available" },
            { label: "Saturn encounter", value: voyager1Mission.encounters[1]?.displayDate ?? "Not available" },
            { label: "Heliopause crossing", value: voyager1Mission.milestones.find((milestone) => milestone.id === "heliopause")?.displayDate ?? "Not available" },
        ],
        sources: uniqueSources([...(record?.sources ?? []), ...voyager1Mission.sources]),
        actions: actionsForObject("voyager-1"),
        resolvedEntity: voyagerEntity,
        dataNote: "ASTRA curated data",
    };
}

export function starMapResponse(entity: GuideEntityMatch, input: string): GuideResponse {
    const text = normalizeGuideText(input);
    if (entity.kind === "star") {
        const star = starsById.get(entity.id);
        if (!star) return unsupportedResponse();
        const constellation = constellationsById.get(star.constellationId);
        return {
            intent: "STAR_MAP",
            answer: text.includes("constellation")
                ? `${star.name} belongs to ${constellation?.name ?? "a constellation not available in ASTRA"}. Its plotted position comes from right ascension and declination.`
                : `${star.name} is a magnitude ${star.magnitude.toFixed(2)} star in ${constellation?.name ?? "its constellation"}. ${star.note}`,
            facts: [
                { label: "Constellation", value: constellation?.name ?? "Unavailable" },
                { label: "Apparent magnitude", value: star.magnitude.toFixed(2) },
                ...(star.distanceLy ? [{ label: "Approx. distance", value: `${star.distanceLy.toLocaleString()} light-years` }] : []),
            ],
            sources: star.sources,
            actions: [{ label: "Open in Star Map", href: `/star-map?constellation=${star.constellationId}&star=${star.id}`, tone: "primary" }],
            resolvedEntity: entity,
            dataNote: "ASTRA curated data",
        };
    }
    const constellation = constellationsById.get(entity.id);
    if (!constellation) return unsupportedResponse();
    const beltNames = ["mintaka", "alnilam", "alnitak"]
        .map((id) => starsById.get(id)?.name)
        .filter((name): name is string => Boolean(name));
    return {
        intent: "STAR_MAP",
        answer: text.includes("belt") && constellation.id === "orion"
            ? `Orion’s Belt is formed by ${beltNames.join(", ")}. It is an asterism within the Orion constellation, and its stars lie at very different physical distances.`
            : constellation.description,
        facts: [
            { label: "Abbreviation", value: constellation.abbreviation },
            { label: "Hemisphere", value: constellation.hemisphere },
            { label: "Broad viewing season", value: constellation.season },
        ],
        sources: uniqueSources([
            starMapSources.iauConstellations,
            ...constellation.starIds.flatMap((id) => starsById.get(id)?.sources ?? []),
        ]),
        actions: [{ label: "Open in Star Map", href: `/star-map?constellation=${constellation.id}`, tone: "primary" }],
        resolvedEntity: entity,
        dataNote: "ASTRA curated data",
    };
}

const recommendationMap: Readonly<Record<string, readonly { id: string; label: string; href: string }[]>> = {
    earth: [
        { id: "moon", label: "The Moon", href: explorerHref("solar-system") },
        { id: "jupiter", label: "Jupiter", href: explorerHref("solar-system") },
        { id: "voyager-1", label: "Voyager 1", href: explorerHref("voyager-1") },
    ],
    "orion-nebula": [
        { id: "eagle-nebula", label: "Eagle Nebula", href: "/compare?objects=orion-nebula,eagle-nebula&metric=physicalExtent" },
        { id: "pleiades", label: "Pleiades", href: "/compare?objects=orion-nebula,pleiades&metric=distanceFromEarth" },
        { id: "orion", label: "Orion constellation", href: "/star-map?constellation=orion" },
    ],
    "sagittarius-a-star": [
        { id: "milky-way", label: "Milky Way", href: explorerHref("milky-way") },
        { id: "omega-centauri", label: "Omega Centauri", href: "/compare?objects=sagittarius-a-star,omega-centauri&metric=distanceFromEarth" },
        { id: "galactic-center", label: "Galactic Center", href: explorerHref("sagittarius-a") },
    ],
};

export function recommendationResponse(entity?: GuideEntityMatch, input = ""): GuideResponse {
    const text = normalizeGuideText(input);
    if (text.includes("nebula") && !entity) {
        const records = ["orion-nebula", "eagle-nebula", "helix-nebula"]
            .map((id) => getAstronomyRecord(id))
            .filter((record): record is NonNullable<ReturnType<typeof getAstronomyRecord>> => Boolean(record));
        return {
            intent: "RECOMMENDATION",
            answer: "Start with the Orion Nebula for a nearby stellar nursery, then contrast it with the Eagle Nebula’s massive star-forming pillars and the Helix Nebula’s dying-star shell.",
            sources: uniqueSources(records.flatMap((record) => record.sources)),
            actions: [
                { label: "Explore Orion Nebula", href: explorerHref("orion-nebula"), tone: "primary" },
                { label: "Compare nebulae", href: "/compare?objects=orion-nebula,eagle-nebula,helix-nebula&metric=physicalExtent", tone: "secondary" },
            ],
            resolvedEntity: { id: "orion-nebula", name: "Orion Nebula", kind: "astronomyObject" },
            dataNote: "ASTRA curated data",
        };
    }
    const key = entity?.id ?? "earth";
    const recommendations = recommendationMap[key] ?? recommendationMap.earth;
    const sourceRecord = entity?.kind === "astronomyObject" ? getAstronomyRecord(entity.id) : null;
    return {
        intent: "RECOMMENDATION",
        answer: entity
            ? `After ${entity.name}, follow one of these related paths through ASTRA. Each stays within the objects and views currently supported by the atlas.`
            : "Begin close to home, then widen the scale: visit the Moon, compare Earth with Jupiter, and follow Voyager 1 toward interstellar space.",
        actions: recommendations.map((item, index) => ({ label: item.label, href: item.href, tone: index === 0 ? "primary" : "secondary" })),
        sources: sourceRecord?.sources,
        resolvedEntity: entity,
        dataNote: "ASTRA curated data",
    };
}

export function specialKnowledgeResponse(input: string): GuideResponse | null {
    const text = normalizeGuideText(input);
    if (text.includes("biggest planet") || text.includes("largest planet")) {
        const entity = { id: "jupiter", name: "Jupiter", kind: "astronomyObject" as const };
        return objectResponse(entity, "SIZE", input);
    }
    if (text.includes("nearest star system") || (text.includes("nearest star") && text.includes("sun"))) {
        const record = getAstronomyRecord("proxima-centauri");
        return {
            intent: "DISTANCE",
            answer: "Alpha Centauri is the nearest star system to the Sun. Its closest member, Proxima Centauri, is the nearest individual known star at about 4.24 light-years; Alpha Centauri A and B are about 4.37 light-years away.",
            facts: record ? factsMatching(record, ["distance", "system"]) : undefined,
            sources: record?.sources,
            actions: [{ label: "Explore Alpha Centauri", href: explorerHref("alpha-centauri"), tone: "primary" }],
            resolvedEntity: { id: "proxima-centauri", name: "Proxima Centauri", kind: "astronomyObject" },
            dataNote: "ASTRA curated data",
        };
    }
    if (text.includes("outside") && text.includes("milky way")) {
        return {
            intent: "LOCATION",
            answer: "None of ASTRA’s currently supported destinations are outside the Milky Way. The Solar System, nearby Alpha Centauri system, nebulae, clusters, Galactic Center, and Sagittarius A* are all within our galaxy; ASTRA does not yet include an extragalactic destination.",
            actions: [{ label: "Explore the Milky Way", href: explorerHref("milky-way"), tone: "primary" }],
            dataNote: "ASTRA curated data",
        };
    }
    return null;
}
