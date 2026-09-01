import { astronomyRecords, getAstronomyRecord } from "@/data/astronomy";
import { comparisonObjects, getComparisonObject } from "@/data/astronomy/comparison";
import { guideConcepts, type GuideEntityMatch } from "@/data/guide";
import { constellations, constellationsById, starMapStars, starsById } from "@/data/starmap";
import { normalizeGuideText } from "./GuideIntent";

const explicitAliases: Readonly<Record<string, readonly string[]>> = {
    "sagittarius-a-star": ["sagittarius a", "sagittarius a star", "sgr a", "sag a", "galactic black hole"],
    "voyager-1": ["voyager", "voyager 1", "voyager one"],
    "proxima-centauri": ["proxima centauri", "proxima"],
    "proxima-centauri-b": ["proxima centauri b", "proxima b"],
    "alpha-centauri-a": ["alpha centauri a"],
    "alpha-centauri-b": ["alpha centauri b"],
    "orion-nebula": ["orion nebula", "m42", "messier 42"],
    "helix-nebula": ["helix nebula", "helix"],
    "47-tucanae": ["47 tucanae", "47 tuc"],
    "solar-system-galactic": ["solar system"],
    "alpha-centauri-region-galactic": ["alpha centauri", "alpha centauri system"],
    "sirius": ["sirius", "sirius system"],
};

function containsPhrase(text: string, phrase: string) {
    return ` ${text} `.includes(` ${normalizeGuideText(phrase)} `);
}

function unique(matches: readonly GuideEntityMatch[]) {
    const seen = new Set<string>();
    return matches.filter((match) => {
        const key = `${match.kind}:${match.id}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

export function resolveGuideEntities(input: string): readonly GuideEntityMatch[] {
    const text = normalizeGuideText(input);
    const matches: GuideEntityMatch[] = [];

    for (const record of astronomyRecords) {
        const aliases = explicitAliases[record.id] ?? [record.name];
        if (aliases.some((alias) => containsPhrase(text, alias))) {
            matches.push({ id: record.id, name: record.name, kind: "astronomyObject" });
        }
    }

    for (const object of comparisonObjects) {
        if (!getAstronomyRecord(object.id) && containsPhrase(text, object.name)) {
            matches.push({ id: object.id, name: object.name, kind: "astronomyObject" });
        }
    }

    const hasOrionNebula = matches.some((match) => match.id === "orion-nebula");
    for (const constellation of constellations) {
        if (constellation.id === "orion" && hasOrionNebula && !text.includes("constellation")) continue;
        const safeAbbreviation = constellation.abbreviation.toLowerCase() !== "and" &&
            containsPhrase(text, constellation.abbreviation);
        if (containsPhrase(text, constellation.name) || safeAbbreviation) {
            matches.push({ id: constellation.id, name: constellation.name, kind: "constellation" });
        }
    }

    for (const star of starMapStars) {
        if (containsPhrase(text, star.name)) {
            matches.push({ id: star.id, name: star.name, kind: "star" });
        }
    }

    let resolved = unique(matches);
    if (text.includes("proxima b")) {
        resolved = resolved.filter((match) => match.id !== "proxima-centauri");
    }
    if (resolved.some((match) => match.id === "sagittarius-a-star") && !text.includes("constellation")) {
        resolved = resolved.filter((match) => !(match.kind === "constellation" && match.id === "sagittarius"));
    }
    if (resolved.some((match) => match.id === "alpha-centauri-a" || match.id === "alpha-centauri-b")) {
        resolved = resolved.filter((match) => match.id !== "alpha-centauri-region-galactic");
    }
    return resolved.slice(0, 4);
}

export function resolveGuideConcept(input: string): GuideEntityMatch | null {
    const text = normalizeGuideText(input);
    const ordered = [...guideConcepts].sort((a, b) => b.name.length - a.name.length);
    const concept = ordered.find((candidate) =>
        candidate.aliases.some((alias) => containsPhrase(text, alias))
    );
    return concept ? { id: concept.id, name: concept.name, kind: "concept" } : null;
}

export function getGuideEntityByContext(
    kind: GuideEntityMatch["kind"],
    id: string
): GuideEntityMatch | null {
    if (kind === "astronomyObject") {
        const record = getAstronomyRecord(id);
        const comparable = getComparisonObject(id);
        return record
            ? { id: record.id, name: record.name, kind }
            : comparable
                ? { id: comparable.id, name: comparable.name, kind }
                : null;
    }
    if (kind === "star") {
        const star = starsById.get(id);
        return star ? { id: star.id, name: star.name, kind } : null;
    }
    if (kind === "constellation") {
        const constellation = constellationsById.get(id);
        return constellation ? { id: constellation.id, name: constellation.name, kind } : null;
    }
    const concept = guideConcepts.find((candidate) => candidate.id === id);
    return concept ? { id: concept.id, name: concept.name, kind } : null;
}
