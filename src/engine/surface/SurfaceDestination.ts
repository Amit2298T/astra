export type SurfaceDestination = "moon";

export type SurfaceModePhase =
    | "space"
    | "landing"
    | "surface"
    | "returning";

export interface SurfaceModeState {
    destination: SurfaceDestination | null;
    phase: SurfaceModePhase;
    progress: number;
}

export const SPACE_MODE_STATE: SurfaceModeState = {
    destination: null,
    phase: "space",
    progress: 0,
};

export const MOON_SURFACE_GRAVITY_M_S2 = 1.62;

/**
 * Surface movement uses one scene unit per nominal meter for readable controls.
 * Terrain dimensions and travel speed remain staged educational values rather
 * than a reconstruction of a real landing site.
 */
export const MOON_SURFACE_SCENE_UNITS_PER_METER = 1;

export function resolveSurfaceDestination(
    value: string | null | undefined
): SurfaceDestination | null {
    return value?.trim().toLowerCase() === "moon" ? "moon" : null;
}

export function isSurfaceModeActive(state: SurfaceModeState): boolean {
    return state.destination !== null && state.phase !== "space";
}
