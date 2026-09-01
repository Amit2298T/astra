"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import type { CameraMode, SelectedObject } from "@/engine/camera/types";
import { travelManager } from "@/engine/navigation/TravelManager";
import type { ExplorerEntryTarget } from "@/engine/navigation/ExplorerEntry";
import { galacticRegistry } from "@/engine/registry/GalacticRegistry";
import { FreeFlightHUD } from "../ui/FreeFlightHUD";
import { GalaxyHUD } from "../ui/GalaxyHUD";
import { GalacticInfoOverlay } from "../ui/GalacticInfoOverlay";
import { GalaxyTravelHUD } from "../ui/GalaxyTravelHUD";
import { BlackHoleOverlay } from "../ui/BlackHoleOverlay";
import { BlackHoleTransitionVeil } from "../ui/BlackHoleTransitionVeil";
import { NebulaOverlay } from "../ui/NebulaOverlay";
import { StarClusterOverlay } from "../ui/StarClusterOverlay";
import { MainHUD } from "../ui/MainHUD";
import { ObjectInfoOverlay } from "../ui/ObjectInfoOverlay";
import { TravelHUD } from "../ui/TravelHUD";
import { CameraController } from "./CameraController";
import { MilkyWay } from "./galaxy/MilkyWay";
import { GalaxyCameraController } from "./galaxy/GalaxyCameraController";
import { useGalaxyNavigation } from "./galaxy/useGalaxyNavigation";
import { LocalUniverseLayer } from "./LocalUniverseLayer";
import { StarField } from "./StarField";
import { MilkyWaySkyBand } from "./MilkyWaySkyBand";
import { GalacticCenterDirectionMarker } from "./GalacticCenterDirectionMarker";
import { sagittariusAStar } from "@/data/blackHoles";
import { BlackHoleCameraController } from "./galaxy/blackhole/BlackHoleCameraController";
import { NebulaCameraController } from "./galaxy/nebula/NebulaCameraController";
import { getNebulaById } from "@/data/nebulae";
import { SOLAR_SYSTEM_GALACTIC_POSITION } from "@/data/nebulae";
import { getStarClusterById } from "@/data/starClusters";
import { NebulaSkyCues } from "./NebulaSkyCues";
import { ScaleTransitionIndicator } from "../ui/ScaleTransitionIndicator";
import { FadingSceneGroup } from "./scale/FadingSceneGroup";
import { ScaleTransitionController } from "./scale/ScaleTransitionController";
import { useScaleTransition } from "./scale/useScaleTransition";
import { SolarNeighborhoodTransitionMarker } from "./scale/SolarNeighborhoodTransitionMarker";
import { ClusterCameraController } from "./galaxy/clusters/ClusterCameraController";
import { StarClusterSkyCues } from "./StarClusterSkyCues";
import {
    LOCAL_ORBIT_MAX_DISTANCE,
    smoothRange,
} from "@/engine/scale/ScaleTransition";
import {
    getStarSystemByEntryId,
    getStarSystemById,
    getStarSystemDisplayName,
    getStarSystemEntryId,
    getStarSystemRegistryName,
    type StarSystemEntryId,
} from "@/data/starSystems";
import {
    getDestinationStarSystemId,
    resolveLocalDestinationArrival,
    type LocalDestination,
} from "@/engine/navigation/LocalDestination";
import {
    PERFORMANCE_PROFILES,
    resolvePerformanceTier,
    type PerformanceSignals,
    type PerformanceTier,
} from "@/engine/performance/PerformanceTier";

const SagittariusAStar = dynamic(
    () =>
        import("./galaxy/blackhole/SagittariusAStar").then(
            (module) => module.SagittariusAStar
        ),
    { ssr: false, loading: () => null }
);
const NebulaScene = dynamic(
    () =>
        import("./galaxy/nebula/NebulaScene").then(
            (module) => module.NebulaScene
        ),
    { ssr: false, loading: () => null }
);
const StarClusterScene = dynamic(
    () =>
        import("./galaxy/clusters/StarClusterScene").then(
            (module) => module.StarClusterScene
        ),
    { ssr: false, loading: () => null }
);

interface UniverseCanvasProps {
    initialTarget?: ExplorerEntryTarget | null;
}

type PendingGalaxyEntry = Extract<
    ExplorerEntryTarget,
    "milky-way" | "sagittarius-a" | "orion-nebula"
>;

export function UniverseCanvas({ initialTarget = null }: UniverseCanvasProps) {
    const [selectedObject, setSelectedObject] = useState<SelectedObject | null>(null);
    const [activeOrbitTarget, setActiveOrbitTarget] = useState<string | null>(null);
    const [cameraMode, setCameraMode] = useState<CameraMode>("freeFlight");
    const controlsRef = useRef<OrbitControlsImpl>(null);
    const hasHandledInitialTargetRef = useRef(false);
    const pendingGalaxyEntryRef = useRef<PendingGalaxyEntry | null>(null);
    const pendingGalaxySystemRef = useRef<StarSystemEntryId | null>(null);
    const pendingLocalDestinationRef = useRef<LocalDestination | null>(null);
    const [pendingLocalDestination, setPendingLocalDestination] =
        useState<LocalDestination | null>(null);
    const [activeStarSystemId, setActiveStarSystemId] =
        useState<StarSystemEntryId | null>(null);
    const [performanceTier, setPerformanceTier] =
        useState<PerformanceTier>("medium");
    const galaxyNavigation = useGalaxyNavigation();
    const scaleTransition = useScaleTransition();
    const performanceProfile = PERFORMANCE_PROFILES[performanceTier];

    useEffect(() => {
        const coarsePointer = window.matchMedia("(pointer: coarse)");
        const updateTier = () => {
            const navigatorWithMemory = navigator as Navigator & {
                deviceMemory?: number;
            };
            const signals: PerformanceSignals = {
                width: window.innerWidth,
                height: window.innerHeight,
                devicePixelRatio: window.devicePixelRatio,
                hardwareConcurrency: navigator.hardwareConcurrency,
                deviceMemoryGb: navigatorWithMemory.deviceMemory,
                coarsePointer: coarsePointer.matches,
            };
            setPerformanceTier(resolvePerformanceTier(signals));
        };

        updateTier();
        window.addEventListener("resize", updateTier);
        coarsePointer.addEventListener("change", updateTier);
        return () => {
            window.removeEventListener("resize", updateTier);
            coarsePointer.removeEventListener("change", updateTier);
        };
    }, []);

    const isFreeFlight = cameraMode === "freeFlight";
    const isTravel = cameraMode === "travel";
    const isGalaxy = cameraMode === "galaxy";
    const isNeighborhood = isGalaxy && galaxyNavigation.mode === "neighborhood";
    const isBlackHole = isGalaxy && galaxyNavigation.mode === "blackHole";
    const activeNebula = getNebulaById(galaxyNavigation.activeNebulaId);
    const isNebula =
        isGalaxy && galaxyNavigation.mode === "nebula" && activeNebula !== null;
    const activeCluster = getStarClusterById(galaxyNavigation.activeClusterId);
    const isCluster =
        isGalaxy && galaxyNavigation.mode === "cluster" && activeCluster !== null;
    const isGalaxyCloseUp = isBlackHole || isNebula || isCluster;
    const isScaleLocal = scaleTransition.phase === "local";
    const isScaleGalaxy = scaleTransition.phase === "galaxy";
    const showLocalLayer = !isScaleGalaxy;
    const showGalaxyExterior = !isScaleLocal && !isGalaxyCloseUp;
    const renderedStarSystemId = pendingLocalDestination
        ? getDestinationStarSystemId(pendingLocalDestination)
        : activeStarSystemId;
    const activeStarSystem = getStarSystemByEntryId(renderedStarSystemId);
    const systemCenterName = activeStarSystem
        ? getStarSystemDisplayName(activeStarSystem)
        : "Sun";
    const localGalacticAnchor =
        activeStarSystem?.galacticMarkerPosition ??
        SOLAR_SYSTEM_GALACTIC_POSITION;
    const transitionAnchorPosition = isScaleLocal
        ? ([0, 0, 0] as const)
        : ([
              localGalacticAnchor[0] * scaleTransition.progress,
              localGalacticAnchor[1] * scaleTransition.progress,
              localGalacticAnchor[2] * scaleTransition.progress,
          ] as const);
    const preTransitionLocalOpacity =
        1 - scaleTransition.localZoomProgress * 0.42;
    const preTransitionSkyOpacity =
        1 - scaleTransition.localZoomProgress * 0.3;
    const preTransitionLabelOpacity =
        1 - smoothRange(scaleTransition.localZoomProgress, 0.12, 0.72);
    const localLayerOpacity = isScaleLocal
        ? preTransitionLocalOpacity
        : (scaleTransition.phase === "transitioningOut"
              ? preTransitionLocalOpacity
              : 1) *
          (1 - smoothRange(scaleTransition.progress, 0.03, 0.6));
    const localSkyOpacity = isScaleLocal
        ? preTransitionSkyOpacity
        : (scaleTransition.phase === "transitioningOut"
              ? preTransitionSkyOpacity
              : 1) *
          (1 - smoothRange(scaleTransition.progress, 0.36, 0.9));
    const galaxyLayerOpacity = isScaleGalaxy
        ? 1
        : smoothRange(scaleTransition.progress, 0, 0.82);
    const localLabelOpacity = isScaleLocal
        ? preTransitionLabelOpacity
        : (scaleTransition.phase === "transitioningOut"
              ? preTransitionLabelOpacity
              : 1) *
          (1 - smoothRange(scaleTransition.progress, 0.02, 0.42));

    const handleSelectPlanet = useCallback(
        (name: string) => {
            if (isTravel) return;
            setSelectedObject({ id: name.toLowerCase(), name, type: "planet" });
        },
        [isTravel]
    );

    const handleSelectObject = useCallback(
        (object: SelectedObject) => {
            if (isTravel) return;
            setSelectedObject(object);
        },
        [isTravel]
    );

    const handleFocusPlanet = useCallback(
        (name: string) => {
            if (isTravel) return;
            setSelectedObject({ id: name.toLowerCase(), name, type: "planet" });
            setActiveOrbitTarget(name);
            setCameraMode("focus");
        },
        [isTravel]
    );

    const handleFocusObject = useCallback(
        (object: SelectedObject) => {
            if (isTravel) return;
            setSelectedObject(object);
            setActiveOrbitTarget(object.name);
            setCameraMode("focus");
        },
        [isTravel]
    );

    const handleFocusActive = useCallback(() => {
        if (!selectedObject) return;
        setActiveOrbitTarget(selectedObject.name);
        setCameraMode("focus");
    }, [selectedObject]);

    const handleFollow = useCallback(() => {
        if (!selectedObject) return;
        setActiveOrbitTarget(selectedObject.name);
        setCameraMode("follow");
    }, [selectedObject]);

    const handleStopFollow = useCallback(() => {
        if (!selectedObject) return;
        setActiveOrbitTarget(selectedObject.name);
        setCameraMode("focus");
    }, [selectedObject]);

    const handleStartTravel = useCallback(() => {
        if (!selectedObject) return;
        setActiveOrbitTarget(null);
        setCameraMode("travel");
    }, [selectedObject]);

    const handleArrival = useCallback((destinationName: string) => {
        setActiveOrbitTarget(destinationName);
        setCameraMode("focus");
    }, []);

    const handleTravelFailure = useCallback(() => {
        setActiveOrbitTarget(null);
        setCameraMode("freeFlight");
    }, []);

    const handleEnterFreeRoam = useCallback(() => {
        travelManager.cancelTravel();
        setActiveOrbitTarget(null);
        setCameraMode("freeFlight");
    }, []);

    const handleSolarSystemOverview = useCallback(() => {
        travelManager.cancelTravel();
        setActiveStarSystemId(null);
        setSelectedObject(null);
        setActiveOrbitTarget("Sun");
        setCameraMode("system");
    }, []);

    const handleSystemOverview = useCallback(() => {
        if (!activeStarSystemId) {
            handleSolarSystemOverview();
            return;
        }

        travelManager.cancelTravel();
        setSelectedObject(null);
        setActiveOrbitTarget(getStarSystemRegistryName(activeStarSystemId));
        setCameraMode("system");
    }, [activeStarSystemId, handleSolarSystemOverview]);

    const handleEnterGalaxyView = useCallback(() => {
        travelManager.cancelTravel();
        pendingLocalDestinationRef.current = null;
        setPendingLocalDestination(null);
        pendingGalaxySystemRef.current = activeStarSystemId;
        galaxyNavigation.resetOverview();
        setSelectedObject(null);
        setActiveOrbitTarget(null);
        scaleTransition.beginOut("shortcut");
    }, [activeStarSystemId, galaxyNavigation, scaleTransition]);

    const enterLocalDestination = useCallback(
        (destination: LocalDestination, pace: "shortcut" | "manual") => {
            pendingLocalDestinationRef.current = destination;
            setPendingLocalDestination(destination);
            galaxyNavigation.resetOverview();
            setSelectedObject(null);
            setActiveOrbitTarget(null);
            scaleTransition.beginIn(pace);
        },
        [galaxyNavigation, scaleTransition]
    );

    const handleReturnToLocalSpace = useCallback(() => {
        enterLocalDestination({ kind: "solar-system" }, "shortcut");
    }, [enterLocalDestination]);

    const handleEnterStarSystem = useCallback(
        (systemId: StarSystemEntryId) => {
            enterLocalDestination(
                { kind: "star-system", systemId },
                "shortcut"
            );
        },
        [enterLocalDestination]
    );

    const handleManualGalaxyTransition = useCallback(() => {
        galaxyNavigation.resetOverview();
        setSelectedObject(null);
        setActiveOrbitTarget(null);
        scaleTransition.beginOut("manual");
    }, [galaxyNavigation, scaleTransition]);

    const handleManualLocalTransition = useCallback(() => {
        const systemId = galaxyNavigation.activeTarget?.starSystemId;
        const destination: LocalDestination = systemId
            ? { kind: "star-system", systemId }
            : { kind: "solar-system" };
        enterLocalDestination(destination, "manual");
    }, [enterLocalDestination, galaxyNavigation.activeTarget]);

    const handleCompleteGalaxyTransition = useCallback(() => {
        setCameraMode("galaxy");
        scaleTransition.finishOut();

        const returningSystemId = pendingGalaxySystemRef.current;
        pendingGalaxySystemRef.current = null;
        setActiveStarSystemId(null);
        if (returningSystemId) {
            const returningSystem = getStarSystemByEntryId(returningSystemId);
            const returningTarget = returningSystem
                ? galacticRegistry.getById(returningSystem.astronomyRecordId)
                : null;
            if (returningTarget) {
                galaxyNavigation.focusTarget(returningTarget);
                return;
            }
        }

        const pendingEntry = pendingGalaxyEntryRef.current;
        if (pendingEntry === "milky-way") {
            pendingGalaxyEntryRef.current = null;
            return;
        }

        const targetId =
            pendingEntry === "sagittarius-a"
                ? "galactic-center"
                : pendingEntry === "orion-nebula"
                  ? "orion-nebula"
                  : null;
        const target = targetId ? galacticRegistry.getById(targetId) : null;
        if (target) {
            galaxyNavigation.focusTarget(target);
        } else {
            pendingGalaxyEntryRef.current = null;
        }
    }, [galaxyNavigation, scaleTransition]);

    const handleCompleteLocalTransition = useCallback(() => {
        const destination = pendingLocalDestinationRef.current;
        if (!destination) {
            throw new Error("Local transition completed without a destination");
        }

        const arrival = resolveLocalDestinationArrival(destination);
        setActiveStarSystemId(arrival.activeStarSystemId);
        setSelectedObject(arrival.selectedObject);
        setActiveOrbitTarget(arrival.activeOrbitTarget);
        setCameraMode("system");
        scaleTransition.finishIn();
        pendingLocalDestinationRef.current = null;
        setPendingLocalDestination(null);
    }, [scaleTransition]);

    const handleCenterOnSun = useCallback(() => {
        travelManager.cancelTravel();
        setActiveStarSystemId(null);
        setSelectedObject({ id: "sun", name: "Sun", type: "star" });
        setActiveOrbitTarget("Sun");
        setCameraMode("focus");
    }, []);

    const handleCenterOnSystem = useCallback(() => {
        if (!activeStarSystemId) {
            handleCenterOnSun();
            return;
        }

        travelManager.cancelTravel();
        setActiveOrbitTarget(getStarSystemRegistryName(activeStarSystemId));
        setCameraMode("focus");
    }, [activeStarSystemId, handleCenterOnSun]);

    const handlePointerMissed = useCallback(() => {
        if (isGalaxyCloseUp) {
            return;
        } else if (isGalaxy) {
            galaxyNavigation.clearSelection();
        } else if (!isTravel && selectedObject) {
            setSelectedObject(null);
        }
    }, [galaxyNavigation, isGalaxyCloseUp, isGalaxy, isTravel, selectedObject]);

    useEffect(() => {
        if (hasHandledInitialTargetRef.current || !initialTarget) return;
        hasHandledInitialTargetRef.current = true;

        const entryFrame = window.requestAnimationFrame(() => {
            if (initialTarget === "solar-system") {
                handleSolarSystemOverview();
                return;
            }

            if (initialTarget === "voyager-1") {
                setSelectedObject({
                    id: "voyager-1",
                    name: "Voyager 1",
                    type: "spacecraft",
                });
                setActiveOrbitTarget("Voyager 1");
                setCameraMode("focus");
                return;
            }

            const system = getStarSystemById(initialTarget);
            if (system) {
                const entryId = getStarSystemEntryId(system);
                const arrival = resolveLocalDestinationArrival({
                    kind: "star-system",
                    systemId: entryId,
                });
                setActiveStarSystemId(arrival.activeStarSystemId);
                setSelectedObject(arrival.selectedObject);
                setActiveOrbitTarget(arrival.activeOrbitTarget);
                setCameraMode("system");
                return;
            }

            pendingGalaxyEntryRef.current = initialTarget as PendingGalaxyEntry;
            handleEnterGalaxyView();
        });

        return () => window.cancelAnimationFrame(entryFrame);
    }, [handleEnterGalaxyView, handleSolarSystemOverview, initialTarget]);

    useEffect(() => {
        const pendingEntry = pendingGalaxyEntryRef.current;
        if (
            (pendingEntry !== "sagittarius-a" &&
                pendingEntry !== "orion-nebula") ||
            cameraMode !== "galaxy" ||
            scaleTransition.phase !== "galaxy" ||
            galaxyNavigation.mode !== "focus" ||
            galaxyNavigation.selectedTarget?.id !==
                (pendingEntry === "sagittarius-a"
                    ? "galactic-center"
                    : "orion-nebula")
        ) {
            return;
        }

        pendingGalaxyEntryRef.current = null;
        if (pendingEntry === "sagittarius-a") {
            galaxyNavigation.enterBlackHole();
        } else {
            galaxyNavigation.enterNebula();
        }
    }, [cameraMode, galaxyNavigation, scaleTransition.phase]);

    return (
        <>
            <Canvas
                camera={{ position: [0, 20, 40], fov: 50, far: 12000 }}
                dpr={[1, performanceProfile.maxDpr]}
                gl={{
                    antialias: performanceTier !== "low",
                    toneMapping: 3,
                    powerPreference: "high-performance",
                }}
                onPointerMissed={handlePointerMissed}
            >
                <ambientLight intensity={0.08} />

                {showLocalLayer && (
                    <group position={transitionAnchorPosition}>
                        <FadingSceneGroup
                            opacity={localLayerOpacity}
                            labelOpacity={localLabelOpacity}
                        >
                            <LocalUniverseLayer
                                activeStarSystemId={renderedStarSystemId}
                                selectedObjectId={selectedObject?.id}
                                onSelectPlanet={handleSelectPlanet}
                                onFocusPlanet={handleFocusPlanet}
                                onSelectObject={handleSelectObject}
                                onFocusObject={handleFocusObject}
                                performanceTier={performanceTier}
                            />
                        </FadingSceneGroup>
                    </group>
                )}
                {showGalaxyExterior && (
                    <MilkyWay
                        selectedTargetId={
                            galaxyNavigation.selectedTarget?.id
                        }
                        activeTargetId={galaxyNavigation.activeTarget?.id}
                        isTraveling={galaxyNavigation.mode === "travel"}
                        onSelectTarget={galaxyNavigation.selectTarget}
                        opacityScale={galaxyLayerOpacity}
                        scaleProgress={scaleTransition.progress}
                        showNeighborhoodLabels={isNeighborhood}
                        showNeighborhoodCue={!isNeighborhood}
                        performanceTier={performanceTier}
                    />
                )}
                {scaleTransition.isTransitioning && (
                    <SolarNeighborhoodTransitionMarker
                        progress={scaleTransition.progress}
                        localGalacticAnchor={localGalacticAnchor}
                    />
                )}

                {!isGalaxy && isScaleLocal && (
                    <CameraController
                        selectedTarget={selectedObject?.name ?? null}
                        activeOrbitTarget={activeOrbitTarget}
                        mode={cameraMode}
                        controlsRef={controlsRef}
                        onArrival={handleArrival}
                        onTravelFailure={handleTravelFailure}
                    />
                )}
                {isGalaxy && isScaleGalaxy && !isGalaxyCloseUp && (
                    <GalaxyCameraController
                        mode={galaxyNavigation.mode}
                        activeTarget={galaxyNavigation.activeTarget}
                        focusRequestId={galaxyNavigation.focusRequestId}
                        controlsRef={controlsRef}
                        onArrival={galaxyNavigation.completeArrival}
                    />
                )}

                <ScaleTransitionController
                    phase={scaleTransition.phase}
                    pace={scaleTransition.pace}
                    controlsRef={controlsRef}
                    canExitLocal={
                        isScaleLocal &&
                        (cameraMode === "system" ||
                            (cameraMode === "focus" && activeOrbitTarget === "Sun"))
                    }
                    canEnterLocal={
                        isScaleGalaxy &&
                        isGalaxy &&
                        galaxyNavigation.mode === "focus" &&
                        (galaxyNavigation.selectedTarget?.id === "solar-system-galactic" || Boolean(galaxyNavigation.selectedTarget?.starSystemId)) &&
                        galaxyNavigation.activeTarget?.id === galaxyNavigation.selectedTarget?.id
                    }
                    prefersReducedMotion={scaleTransition.prefersReducedMotion}
                    preserveCameraLookDirection={isFreeFlight}
                    onRequestOut={handleManualGalaxyTransition}
                    onRequestIn={handleManualLocalTransition}
                    onProgress={scaleTransition.setProgress}
                    onLocalZoomProgress={scaleTransition.setLocalZoomProgress}
                    onCompleteOut={handleCompleteGalaxyTransition}
                    onCompleteIn={handleCompleteLocalTransition}
                    localGalacticAnchor={localGalacticAnchor}
                />

                {isBlackHole && (
                    <>
                        <SagittariusAStar config={sagittariusAStar} />
                        <BlackHoleCameraController
                            config={sagittariusAStar}
                            focusRequestId={
                                galaxyNavigation.blackHoleFocusRequestId
                            }
                            controlsRef={controlsRef}
                        />
                    </>
                )}

                {isNebula && activeNebula && (
                    <>
                        <NebulaScene
                            config={activeNebula}
                            performanceTier={performanceTier}
                        />
                        <NebulaCameraController
                            config={activeNebula}
                            focusRequestId={
                                galaxyNavigation.nebulaFocusRequestId
                            }
                            controlsRef={controlsRef}
                        />
                    </>
                )}

                {isCluster && activeCluster && (
                    <>
                        <StarClusterScene
                            config={activeCluster}
                            performanceTier={performanceTier}
                        />
                        <ClusterCameraController
                            config={activeCluster}
                            focusRequestId={
                                galaxyNavigation.clusterFocusRequestId
                            }
                            controlsRef={controlsRef}
                        />
                    </>
                )}

                <StarField
                    performanceTier={performanceTier}
                    opacityScale={
                        isGalaxyCloseUp
                            ? 0.12
                            : 1 -
                              smoothRange(
                                  scaleTransition.progress,
                                  0.08,
                                  0.95
                              ) *
                                  0.66
                    }
                />
                {showLocalLayer && (
                    <>
                        <MilkyWaySkyBand
                            opacityScale={localSkyOpacity}
                            performanceTier={performanceTier}
                        />
                        <FadingSceneGroup opacity={localSkyOpacity}>
                            <GalacticCenterDirectionMarker />
                            <NebulaSkyCues />
                            <StarClusterSkyCues />
                        </FadingSceneGroup>
                    </>
                )}
                <OrbitControls
                    ref={controlsRef}
                    enabled={
                        !scaleTransition.isTransitioning &&
                        (isGalaxyCloseUp ||
                            (isGalaxy && galaxyNavigation.mode !== "travel") ||
                            (!isFreeFlight && !isTravel && activeOrbitTarget !== null))
                    }
                    enablePan={false}
                    minDistance={
                        isBlackHole
                            ? 8.5
                            : isNebula && activeNebula
                              ? activeNebula.closeUpMinDistance
                              : isCluster && activeCluster
                                ? activeCluster.closeUpMinDistance
                              : isScaleGalaxy
                                ? 360
                                : 0
                    }
                    maxDistance={
                        isBlackHole
                            ? 90
                            : isNebula && activeNebula
                              ? activeNebula.closeUpMaxDistance
                              : isCluster && activeCluster
                                ? activeCluster.closeUpMaxDistance
                              : isScaleGalaxy
                                ? 8500
                                : LOCAL_ORBIT_MAX_DISTANCE
                    }
                />
            </Canvas>

            {!isFreeFlight && !isTravel && !isGalaxy && isScaleLocal && (
                <MainHUD
                    onEnterFreeRoam={handleEnterFreeRoam}
                    onEnterGalaxyView={handleEnterGalaxyView}
                />
            )}
            {isFreeFlight && isScaleLocal && (
                <FreeFlightHUD
                    onSystemOverview={handleSystemOverview}
                    systemOverviewLabel={
                        activeStarSystemId
                            ? "System Overview"
                            : "Solar System Overview"
                    }
                    onEnterGalaxyView={handleEnterGalaxyView}
                />
            )}
            {isGalaxy && isScaleGalaxy && !isGalaxyCloseUp && (
                <GalaxyHUD
                    onReturnToLocalSpace={handleReturnToLocalSpace}
                    onShowNeighborhood={galaxyNavigation.enterNeighborhood}
                    onReturnToOverview={galaxyNavigation.resetOverview}
                    isNeighborhood={isNeighborhood}
                    returnLabel={
                        galaxyNavigation.selectedTarget
                            ?.localSpaceDestination === "solarSystem"
                            ? "Enter Local Space"
                            : "Return to Local Space"
                    }
                />
            )}
            {isTravel && isScaleLocal && (
                <TravelHUD onCancelTravel={handleEnterFreeRoam} />
            )}

            {selectedObject && !isTravel && !isGalaxy && isScaleLocal && (
                <ObjectInfoOverlay
                    target={selectedObject}
                    mode={cameraMode}
                    onFocus={handleFocusActive}
                    onFollow={handleFollow}
                    onStopFollow={handleStopFollow}
                    onTravel={handleStartTravel}
                    onFreeRoam={handleEnterFreeRoam}
                    onSystemOverview={handleSystemOverview}
                    onCenterOnSystem={handleCenterOnSystem}
                    systemCenterName={systemCenterName}
                    systemOverviewLabel={
                        activeStarSystemId
                            ? "System Overview"
                            : "Solar System Overview"
                    }
                    onClose={() => setSelectedObject(null)}
                />
            )}

            {isGalaxy &&
                isScaleGalaxy &&
                !isBlackHole &&
                !isNebula &&
                !isCluster &&
                galaxyNavigation.selectedTarget &&
                galaxyNavigation.mode !== "travel" && (
                    <GalacticInfoOverlay
                        target={galaxyNavigation.selectedTarget}
                        mode={galaxyNavigation.mode}
                        isActiveTarget={
                            galaxyNavigation.activeTarget?.id ===
                            galaxyNavigation.selectedTarget.id
                        }
                        onFocus={galaxyNavigation.focusSelected}
                        onTravel={galaxyNavigation.travelToSelected}
                        onEnterLocalSpace={handleReturnToLocalSpace}
                        onEnterStarSystem={handleEnterStarSystem}
                        onEnterBlackHole={galaxyNavigation.enterBlackHole}
                        onEnterNebula={galaxyNavigation.enterNebula}
                        onEnterCluster={galaxyNavigation.enterCluster}
                        onClose={galaxyNavigation.clearSelection}
                    />
                )}

            {isGalaxy && isScaleGalaxy && galaxyNavigation.mode === "travel" && (
                <GalaxyTravelHUD onCancel={galaxyNavigation.resetOverview} />
            )}

            {isBlackHole && (
                <BlackHoleOverlay
                    blackHole={sagittariusAStar}
                    onRefocus={galaxyNavigation.refocusBlackHole}
                    onReturn={galaxyNavigation.exitBlackHole}
                />
            )}
            {isNebula && activeNebula && (
                <NebulaOverlay
                    nebula={activeNebula}
                    onRefocus={galaxyNavigation.refocusNebula}
                    onReturn={galaxyNavigation.exitNebula}
                />
            )}
            {isCluster && activeCluster && (
                <StarClusterOverlay
                    cluster={activeCluster}
                    onRefocus={galaxyNavigation.refocusCluster}
                    onReturn={galaxyNavigation.exitCluster}
                />
            )}
            {isGalaxy && isScaleGalaxy && (
                <BlackHoleTransitionVeil
                    phase={
                        isCluster
                            ? "cluster"
                            : isNebula
                            ? "nebula"
                            : isBlackHole
                              ? "closeUp"
                              : "galaxy"
                    }
                />
            )}
            {scaleTransition.isTransitioning && (
                <ScaleTransitionIndicator
                    phase={scaleTransition.phase}
                    progress={scaleTransition.progress}
                />
            )}
        </>
    );
}
