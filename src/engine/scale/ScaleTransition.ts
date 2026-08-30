export type ScaleLayer = "local" | "galaxy";

export type ScaleTransitionPhase =
    | "local"
    | "transitioningOut"
    | "galaxy"
    | "transitioningIn";

export type ScaleTransitionPace = "manual" | "shortcut";

export const LOCAL_SIMPLIFY_START_DISTANCE = 90;
export const LOCAL_EXIT_DISTANCE = 185;
export const LOCAL_ORBIT_MAX_DISTANCE = 210;

export const GALAXY_LOCAL_ENTRY_ARM_DISTANCE = 650;
export const GALAXY_LOCAL_ENTRY_DISTANCE = 520;

export const SCALE_TRANSITION_DURATION_SECONDS = {
    manual: 3.4,
    shortcut: 2.25,
    reducedMotion: 0.8,
} as const;

export function smoothRange(value: number, start: number, end: number): number {
    if (start === end) return value >= end ? 1 : 0;
    const normalized = Math.min(1, Math.max(0, (value - start) / (end - start)));
    return normalized * normalized * (3 - 2 * normalized);
}
