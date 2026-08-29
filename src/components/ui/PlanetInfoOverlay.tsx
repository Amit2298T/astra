"use client";

import { ObjectInfoOverlay } from "./ObjectInfoOverlay";
import type { CameraMode, SelectedObject } from "@/engine/camera/types";

interface PlanetInfoOverlayProps {
    name?: string;
    target?: SelectedObject;
    mode: CameraMode;
    onFocus?: () => void;
    onFollow: () => void;
    onStopFollow: () => void;
    onBackToSystem: () => void;
}

export function PlanetInfoOverlay({
    name,
    target,
    mode,
    onFocus = () => {},
    onFollow,
    onStopFollow,
    onBackToSystem,
}: PlanetInfoOverlayProps) {
    const selectedObj: SelectedObject = target ?? {
        id: name?.toLowerCase().replace(/\s+/g, "-") ?? "unknown",
        name: name ?? "Unknown Object",
        type: "planet",
    };

    return (
        <ObjectInfoOverlay
            target={selectedObj}
            mode={mode}
            onFocus={onFocus}
            onFollow={onFollow}
            onStopFollow={onStopFollow}
            onSolarSystemOverview={onBackToSystem}
        />
    );
}
