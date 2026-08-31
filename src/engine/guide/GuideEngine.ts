import type { GuideContext, GuideEntityMatch, GuideResponse } from "@/data/guide";
import { ambiguityResponse, comparisonResponse, conceptResponse, helpResponse, missionResponse, multiEntityResponse, objectResponse, propertySpecificResponse, recommendationResponse, sourcesResponse, specialKnowledgeResponse, starMapResponse, unsupportedResponse } from "./GuideResponses";
import { getGuideEntityByContext, resolveGuideConcept, resolveGuideEntities } from "./GuideEntities";
import { normalizeGuideText, recognizeGuideIntent } from "./GuideIntent";

function isOrionAmbiguous(input: string) {
    const text = normalizeGuideText(input);
    return text.includes("orion") && !text.includes("nebula") && !text.includes("constellation") && !text.includes("belt");
}

function inferRecentEntity(input: string, context: GuideContext): GuideEntityMatch | undefined {
    const text = normalizeGuideText(input);
    if (/\b(it|its|that|this object|this star|this planet|this mission)\b/.test(text)) {
        return context.recentEntity ?? context.initialEntity;
    }
    return undefined;
}

export function createGuideResponse(input: string, context: GuideContext = {}): GuideResponse {
    const trimmed = input.trim().slice(0, 500);
    if (!trimmed) return helpResponse();
    const intent = recognizeGuideIntent(trimmed);
    const matches = resolveGuideEntities(trimmed);
    const inferredEntity = matches[0] ?? inferRecentEntity(trimmed, context);

    if (intent === "HELP") return helpResponse();
    if (isOrionAmbiguous(trimmed)) {
        const otherEntities = matches.filter((entity) => !(entity.kind === "constellation" && entity.id === "orion"));
        return ambiguityResponse(otherEntities);
    }
    if (intent === "SOURCES") return sourcesResponse(inferredEntity ?? context.recentEntity ?? context.initialEntity);

    const propertyResponse = propertySpecificResponse(trimmed, matches);
    if (propertyResponse) return propertyResponse;

    const orionChoice = matches.find((entity) =>
        entity.id === "orion-nebula" || (entity.kind === "constellation" && entity.id === "orion")
    );
    if (orionChoice && context.pendingEntities && context.pendingEntities.length > 0) {
        const resumedEntities = [
            orionChoice,
            ...context.pendingEntities.filter((entity) => entity.id !== orionChoice.id),
        ].slice(0, 2);
        return multiEntityResponse(resumedEntities, intent);
    }

    const special = specialKnowledgeResponse(trimmed);
    if (special) return special;

    if (intent === "COMPARISON") {
        const comparisonEntities = matches.length >= 2
            ? matches
            : context.recentEntities && context.recentEntities.length >= 2
                ? context.recentEntities
                : inferredEntity
                    ? [inferredEntity]
                    : [];
        return comparisonResponse(comparisonEntities, trimmed);
    }
    if (intent === "MISSION") return missionResponse(inferredEntity, trimmed);
    if (intent === "RECOMMENDATION") return recommendationResponse(inferredEntity, trimmed);

    if (matches.length >= 2) return multiEntityResponse(matches, intent);

    if (intent === "CATEGORY") {
        const concept = resolveGuideConcept(trimmed);
        if (concept) return conceptResponse(concept);
    }

    const starMapEntity = matches.find((entity) => entity.kind === "star" || entity.kind === "constellation");
    if (starMapEntity && (intent === "STAR_MAP" || !matches.some((entity) => entity.kind === "astronomyObject"))) {
        return starMapResponse(starMapEntity, trimmed);
    }

    if (inferredEntity?.kind === "astronomyObject") {
        return objectResponse(inferredEntity, intent === "UNSUPPORTED" ? "DEFINITION" : intent, trimmed);
    }
    if (inferredEntity?.kind === "star" || inferredEntity?.kind === "constellation") {
        return starMapResponse(inferredEntity, trimmed);
    }

    const concept = resolveGuideConcept(trimmed);
    if (concept) return conceptResponse(concept);
    return unsupportedResponse();
}

export function resolveInitialGuideContext(
    objectId?: string | null,
    starId?: string | null,
    constellationId?: string | null
): GuideEntityMatch | null {
    if (objectId) return getGuideEntityByContext("astronomyObject", objectId);
    if (starId) return getGuideEntityByContext("star", starId);
    if (constellationId) return getGuideEntityByContext("constellation", constellationId);
    return null;
}
