"use client";

import { useCallback, useEffect, useState } from "react";

import type {
    ScaleTransitionPace,
    ScaleTransitionPhase,
} from "@/engine/scale/ScaleTransition";

export function useScaleTransition() {
    const [phase, setPhase] = useState<ScaleTransitionPhase>("local");
    const [pace, setPace] = useState<ScaleTransitionPace>("manual");
    const [progress, setProgress] = useState(0);
    const [localZoomProgress, setLocalZoomProgress] = useState(0);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
        updatePreference();
        mediaQuery.addEventListener("change", updatePreference);
        return () => mediaQuery.removeEventListener("change", updatePreference);
    }, []);

    const beginOut = useCallback((nextPace: ScaleTransitionPace) => {
        setPace(nextPace);
        setProgress(0);
        setPhase("transitioningOut");
    }, []);

    const beginIn = useCallback((nextPace: ScaleTransitionPace) => {
        setPace(nextPace);
        setProgress(1);
        setPhase("transitioningIn");
    }, []);

    const finishOut = useCallback(() => {
        setProgress(1);
        setLocalZoomProgress(0);
        setPhase("galaxy");
    }, []);

    const finishIn = useCallback(() => {
        setProgress(0);
        setLocalZoomProgress(0);
        setPhase("local");
    }, []);

    return {
        phase,
        pace,
        progress,
        localZoomProgress,
        prefersReducedMotion,
        isTransitioning:
            phase === "transitioningOut" || phase === "transitioningIn",
        beginOut,
        beginIn,
        finishOut,
        finishIn,
        setProgress,
        setLocalZoomProgress,
    };
}
