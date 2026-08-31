import type { SourceReference } from "@/data/astronomy";

export type GuideIntent =
    | "DEFINITION"
    | "SIZE"
    | "DISTANCE"
    | "COMPARISON"
    | "MISSION"
    | "LOCATION"
    | "RECOMMENDATION"
    | "CATEGORY"
    | "STAR_MAP"
    | "SOURCES"
    | "HELP"
    | "UNSUPPORTED";

export type GuideEntityKind = "astronomyObject" | "star" | "constellation" | "concept";

export interface GuideEntityMatch {
    id: string;
    name: string;
    kind: GuideEntityKind;
}

export interface GuideFact {
    label: string;
    value: string;
}

export interface GuideAction {
    label: string;
    href: string;
    tone?: "primary" | "secondary";
}

export interface GuideSuggestion {
    label: string;
    prompt: string;
}

export interface GuideResponse {
    answer: string;
    intent: GuideIntent;
    facts?: readonly GuideFact[];
    sources?: readonly SourceReference[];
    actions?: readonly GuideAction[];
    suggestions?: readonly GuideSuggestion[];
    resolvedEntity?: GuideEntityMatch;
    resolvedEntities?: readonly GuideEntityMatch[];
    pendingEntities?: readonly GuideEntityMatch[];
    dataNote?: "ASTRA curated data" | "Calculated from ASTRA data";
}

export interface GuideContext {
    recentEntity?: GuideEntityMatch;
    recentEntities?: readonly GuideEntityMatch[];
    pendingEntities?: readonly GuideEntityMatch[];
    initialEntity?: GuideEntityMatch;
}

export interface GuideProvider {
    respond(input: string, context: GuideContext): Promise<GuideResponse>;
}

export interface GuideMessage {
    id: string;
    role: "user" | "guide";
    text: string;
    response?: GuideResponse;
}

export interface GuideConcept {
    id: string;
    name: string;
    aliases: readonly string[];
    description: string;
    sources: readonly SourceReference[];
}
