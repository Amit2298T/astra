"use client";

import { useCallback, useState } from "react";

import type { GalacticNavigationTarget } from "@/data/galaxy";
import { getNebulaById } from "@/data/nebulae";
import { getStarClusterById } from "@/data/starClusters";
import { galaxyTravelManager } from "@/engine/navigation/GalaxyTravelManager";
import { galacticRegistry } from "@/engine/registry/GalacticRegistry";

export type GalaxyNavigationMode =
    | "overview"
    | "neighborhood"
    | "focus"
    | "travel"
    | "blackHole"
    | "nebula"
    | "cluster";

export function useGalaxyNavigation() {
    const [mode, setMode] = useState<GalaxyNavigationMode>("overview");
    const [selectedTarget, setSelectedTarget] =
        useState<GalacticNavigationTarget | null>(null);
    const [activeTarget, setActiveTarget] =
        useState<GalacticNavigationTarget | null>(null);
    const [focusRequestId, setFocusRequestId] = useState(0);
    const [blackHoleFocusRequestId, setBlackHoleFocusRequestId] = useState(0);
    const [activeNebulaId, setActiveNebulaId] = useState<string | null>(null);
    const [nebulaFocusRequestId, setNebulaFocusRequestId] = useState(0);
    const [activeClusterId, setActiveClusterId] = useState<string | null>(null);
    const [clusterFocusRequestId, setClusterFocusRequestId] = useState(0);

    const selectTarget = useCallback(
        (target: GalacticNavigationTarget) => {
            if (mode === "travel") return;
            setSelectedTarget(target);
        },
        [mode]
    );

    const clearSelection = useCallback(() => {
        if (mode !== "travel") setSelectedTarget(null);
    }, [mode]);

    const focusSelected = useCallback(() => {
        if (!selectedTarget || mode === "travel") return;
        galaxyTravelManager.cancelTravel();
        setActiveTarget(selectedTarget);
        setMode("focus");
        setFocusRequestId((requestId) => requestId + 1);
    }, [mode, selectedTarget]);

    const focusTarget = useCallback((target: GalacticNavigationTarget) => {
        galaxyTravelManager.cancelTravel();
        setSelectedTarget(target);
        setActiveTarget(target);
        setMode("focus");
        setFocusRequestId((requestId) => requestId + 1);
    }, []);

    const enterNeighborhood = useCallback(() => {
        galaxyTravelManager.cancelTravel();
        setSelectedTarget(null);
        setActiveTarget(null);
        setMode("neighborhood");
        setFocusRequestId((requestId) => requestId + 1);
    }, []);

    const travelToSelected = useCallback(() => {
        if (!selectedTarget || mode === "travel") return;
        setActiveTarget(selectedTarget);
        setMode("travel");
    }, [mode, selectedTarget]);

    const completeArrival = useCallback((targetName: string) => {
        const arrivedTarget = galacticRegistry.getByName(targetName);
        if (!arrivedTarget) return;
        setSelectedTarget(arrivedTarget);
        setActiveTarget(arrivedTarget);
        setMode("focus");
        setFocusRequestId((requestId) => requestId + 1);
    }, []);

    const enterBlackHole = useCallback(() => {
        if (
            mode !== "focus" ||
            !selectedTarget ||
            selectedTarget.type !== "galacticCenter"
        ) {
            return;
        }
        setMode("blackHole");
        setBlackHoleFocusRequestId((requestId) => requestId + 1);
    }, [mode, selectedTarget]);

    const refocusBlackHole = useCallback(() => {
        if (mode !== "blackHole") return;
        setBlackHoleFocusRequestId((requestId) => requestId + 1);
    }, [mode]);

    const exitBlackHole = useCallback(() => {
        if (mode !== "blackHole") return;
        setMode("focus");
        setFocusRequestId((requestId) => requestId + 1);
    }, [mode]);

    const enterNebula = useCallback(() => {
        if (
            mode !== "focus" ||
            !selectedTarget ||
            selectedTarget.type !== "nebula" ||
            activeTarget?.id !== selectedTarget.id ||
            !getNebulaById(selectedTarget.id)
        ) {
            return;
        }
        setActiveNebulaId(selectedTarget.id);
        setMode("nebula");
        setNebulaFocusRequestId((requestId) => requestId + 1);
    }, [activeTarget, mode, selectedTarget]);

    const refocusNebula = useCallback(() => {
        if (mode !== "nebula") return;
        setNebulaFocusRequestId((requestId) => requestId + 1);
    }, [mode]);

    const exitNebula = useCallback(() => {
        if (mode !== "nebula") return;
        setMode("focus");
        setActiveNebulaId(null);
        setFocusRequestId((requestId) => requestId + 1);
    }, [mode]);

    const enterCluster = useCallback(() => {
        if (
            mode !== "focus" ||
            !selectedTarget ||
            selectedTarget.type !== "starCluster" ||
            activeTarget?.id !== selectedTarget.id ||
            !getStarClusterById(selectedTarget.id)
        ) {
            return;
        }
        setActiveClusterId(selectedTarget.id);
        setMode("cluster");
        setClusterFocusRequestId((requestId) => requestId + 1);
    }, [activeTarget, mode, selectedTarget]);

    const refocusCluster = useCallback(() => {
        if (mode !== "cluster") return;
        setClusterFocusRequestId((requestId) => requestId + 1);
    }, [mode]);

    const exitCluster = useCallback(() => {
        if (mode !== "cluster") return;
        setMode("focus");
        setActiveClusterId(null);
        setFocusRequestId((requestId) => requestId + 1);
    }, [mode]);

    const resetOverview = useCallback(() => {
        galaxyTravelManager.cancelTravel();
        setSelectedTarget(null);
        setActiveTarget(null);
        setActiveNebulaId(null);
        setActiveClusterId(null);
        setMode("overview");
    }, []);

    return {
        mode,
        selectedTarget,
        activeTarget,
        focusRequestId,
        blackHoleFocusRequestId,
        activeNebulaId,
        nebulaFocusRequestId,
        activeClusterId,
        clusterFocusRequestId,
        selectTarget,
        clearSelection,
        focusSelected,
        focusTarget,
        enterNeighborhood,
        travelToSelected,
        completeArrival,
        enterBlackHole,
        refocusBlackHole,
        exitBlackHole,
        enterNebula,
        refocusNebula,
        exitNebula,
        enterCluster,
        refocusCluster,
        exitCluster,
        resetOverview,
    };
}
