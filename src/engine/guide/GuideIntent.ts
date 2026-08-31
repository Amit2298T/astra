import type { GuideIntent } from "@/data/guide";

export function normalizeGuideText(input: string): string {
    return input
        .toLowerCase()
        .replace(/[*]/g, " star ")
        .replace(/[’']/g, " ")
        .replace(/[^a-z0-9]+/g, " ")
        .trim()
        .replace(/\s+/g, " ");
}

function includesAny(text: string, phrases: readonly string[]) {
    return phrases.some((phrase) => text.includes(phrase));
}

export function recognizeGuideIntent(input: string): GuideIntent {
    const text = normalizeGuideText(input);

    if (includesAny(text, ["what can i ask", "help", "how do i use", "what do you know"])) return "HELP";
    if (includesAny(text, ["source", "where does this information", "where did this", "citation"])) return "SOURCES";
    if (includesAny(text, ["compare", " versus ", " vs ", "difference between", "bigger than", "larger than", "smaller than", "how much bigger", "how much larger"])) return "COMPARISON";
    if (includesAny(text, ["recommend", "should i explore", "explore next", "after ", "which nebula", "where should i go"])) return "RECOMMENDATION";
    if (includesAny(text, ["constellation", "orions belt", "orion belt", " belt", "star map", "how bright is"])) return "STAR_MAP";
    if (includesAny(text, ["voyager", "mission", "launch", "golden record", "signal take", "spacecraft", "heliopause crossing"])) return "MISSION";
    if (includesAny(text, ["what is a ", "what are ", "difference between a "])) return "CATEGORY";
    if (includesAny(text, ["how big", "how large", "biggest", "diameter", "mass", "size"])) return "SIZE";
    if (includesAny(text, ["how far", "distance", "light years away", "au away"])) return "DISTANCE";
    if (includesAny(text, ["where is", "where does", "located", "location"])) return "LOCATION";
    if (includesAny(text, ["what is", "what was", "tell me", "explain", "why is", "show me", "who is"])) return "DEFINITION";
    return "UNSUPPORTED";
}
