export const EXPLORER_ENTRY_TARGETS = [
    "solar-system",
    "voyager-1",
    "alpha-centauri",
    "barnards-star",
    "sirius",
    "epsilon-eridani",
    "tau-ceti",
    "trappist-1",
    "milky-way",
    "sagittarius-a",
    "orion-nebula",
] as const;

export type ExplorerEntryTarget = (typeof EXPLORER_ENTRY_TARGETS)[number];

const explorerEntryTargets = new Set<string>(EXPLORER_ENTRY_TARGETS);

export function parseExplorerEntryTarget(
    value: string | string[] | undefined
): ExplorerEntryTarget | null {
    const candidate = Array.isArray(value) ? value[0] : value;
    return candidate && explorerEntryTargets.has(candidate)
        ? (candidate as ExplorerEntryTarget)
        : null;
}

export function explorerHref(target?: ExplorerEntryTarget): string {
    return target ? `/explore?target=${target}` : "/explore";
}
