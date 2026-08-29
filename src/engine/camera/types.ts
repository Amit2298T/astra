/**
 * CameraMode represents the active camera state in ASTRA.
 * Currently supported: 'system' | 'focus' | 'follow' | 'freeFlight'
 * Prepared for future extensions: 'travel' | 'galaxy'
 */
export type CameraMode =
    | "system"
    | "focus"
    | "follow"
    | "freeFlight"
    | "travel"
    | "galaxy";

export type ObjectType =
    | "planet"
    | "spacecraft"
    | "star"
    | "blackHole"
    | "exoplanet"
    | "dwarfPlanet";

export interface SelectedObject {
    id: string;
    name: string;
    type: ObjectType;
}

export interface CameraState {
    mode: CameraMode;
    targetObject: string | null;
}
