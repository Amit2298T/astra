"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useCallback, useRef, useState } from "react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import type { CameraMode, SelectedObject } from "@/engine/camera/types";
import { travelManager } from "@/engine/navigation/TravelManager";
import { FreeFlightHUD } from "../ui/FreeFlightHUD";
import { GalaxyHUD } from "../ui/GalaxyHUD";
import { GalacticInfoOverlay } from "../ui/GalacticInfoOverlay";
import { GalaxyTravelHUD } from "../ui/GalaxyTravelHUD";
import { BlackHoleOverlay } from "../ui/BlackHoleOverlay";
import { BlackHoleTransitionVeil } from "../ui/BlackHoleTransitionVeil";
import { NebulaOverlay } from "../ui/NebulaOverlay";
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
import { SagittariusAStar } from "./galaxy/blackhole/SagittariusAStar";
import { BlackHoleCameraController } from "./galaxy/blackhole/BlackHoleCameraController";
import { NebulaScene } from "./galaxy/nebula/NebulaScene";
import { NebulaCameraController } from "./galaxy/nebula/NebulaCameraController";
import { getNebulaById } from "@/data/nebulae";
import { SOLAR_SYSTEM_GALACTIC_POSITION } from "@/data/nebulae";
import { NebulaSkyCues } from "./NebulaSkyCues";
import { ScaleTransitionIndicator } from "../ui/ScaleTransitionIndicator";
import { FadingSceneGroup } from "./scale/FadingSceneGroup";
import { ScaleTransitionController } from "./scale/ScaleTransitionController";
import { useScaleTransition } from "./scale/useScaleTransition";
import { SolarNeighborhoodTransitionMarker } from "./scale/SolarNeighborhoodTransitionMarker";
import {
    LOCAL_ORBIT_MAX_DISTANCE,
    smoothRange,
} from "@/engine/scale/ScaleTransition";

export function UniverseCanvas() {
    const [selectedObject, setSelectedObject] = useState<SelectedObject | null>(null);
    const [activeOrbitTarget, setActiveOrbitTarget] = useState<string | null>(null);
    const [cameraMode, setCameraMode] = useState<CameraMode>("freeFlight");
    const controlsRef = useRef<OrbitControlsImpl>(null);
    const galaxyNavigation = useGalaxyNavigation();
    const scaleTransition = useScaleTransition();

    const isFreeFlight = cameraMode === "freeFlight";
    const isTravel = cameraMode === "travel";
    const isGalaxy = cameraMode === "galaxy";
    const isBlackHole = isGalaxy && galaxyNavigation.mode === "blackHole";
    const activeNebula = getNebulaById(galaxyNavigation.activeNebulaId);
    const isNebula =
        isGalaxy && galaxyNavigation.mode === "nebula" && activeNebula !== null;
    const isGalaxyCloseUp = isBlackHole || isNebula;
    const isScaleLocal = scaleTransition.phase === "local";
    const isScaleGalaxy = scaleTransition.phase === "galaxy";
    const showLocalLayer = !isScaleGalaxy;
    const showGalaxyExterior = !isScaleLocal && !isGalaxyCloseUp;
    const transitionAnchorPosition = isScaleLocal
        ? ([0, 0, 0] as const)
        : ([
              SOLAR_SYSTEM_GALACTIC_POSITION[0] * scaleTransition.progress,
              SOLAR_SYSTEM_GALACTIC_POSITION[1] * scaleTransition.progress,
              SOLAR_SYSTEM_GALACTIC_POSITION[2] * scaleTransition.progress,
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
        setSelectedObject(null);
        setActiveOrbitTarget("Sun");
        setCameraMode("system");
    }, []);

    const handleEnterGalaxyView = useCallback(() => {
        travelManager.cancelTravel();
        galaxyNavigation.resetOverview();
        setSelectedObject(null);
        setActiveOrbitTarget(null);
        scaleTransition.beginOut("shortcut");
    }, [galaxyNavigation, scaleTransition]);

    const handleReturnToLocalSpace = useCallback(() => {
        galaxyNavigation.resetOverview();
        setSelectedObject(null);
        setActiveOrbitTarget("Sun");
        scaleTransition.beginIn("shortcut");
    }, [galaxyNavigation, scaleTransition]);

    const handleManualGalaxyTransition = useCallback(() => {
        galaxyNavigation.resetOverview();
        setSelectedObject(null);
        setActiveOrbitTarget(null);
        scaleTransition.beginOut("manual");
    }, [galaxyNavigation, scaleTransition]);

    const handleManualLocalTransition = useCallback(() => {
        galaxyNavigation.resetOverview();
        setSelectedObject(null);
        setActiveOrbitTarget("Sun");
        scaleTransition.beginIn("manual");
    }, [galaxyNavigation, scaleTransition]);

    const handleCompleteGalaxyTransition = useCallback(() => {
        setCameraMode("galaxy");
        scaleTransition.finishOut();
    }, [scaleTransition]);

    const handleCompleteLocalTransition = useCallback(() => {
        setCameraMode("system");
        scaleTransition.finishIn();
    }, [scaleTransition]);

    const handleCenterOnSun = useCallback(() => {
        travelManager.cancelTravel();
        setSelectedObject({ id: "sun", name: "Sun", type: "star" });
        setActiveOrbitTarget("Sun");
        setCameraMode("focus");
    }, []);

    const handlePointerMissed = useCallback(() => {
        if (isGalaxyCloseUp) {
            return;
        } else if (isGalaxy) {
            galaxyNavigation.clearSelection();
        } else if (!isTravel && selectedObject) {
            setSelectedObject(null);
        }
    }, [galaxyNavigation, isGalaxyCloseUp, isGalaxy, isTravel, selectedObject]);

    return (
        <>
            <Canvas
                camera={{ position: [0, 20, 40], fov: 50, far: 12000 }}
                gl={{ antialias: true, toneMapping: 3 }}
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
                                onSelectPlanet={handleSelectPlanet}
                                onFocusPlanet={handleFocusPlanet}
                                onSelectObject={handleSelectObject}
                                onFocusObject={handleFocusObject}
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
                    />
                )}
                {scaleTransition.isTransitioning && (
                    <SolarNeighborhoodTransitionMarker
                        progress={scaleTransition.progress}
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
                        galaxyNavigation.selectedTarget?.id === "solar-system-galactic" &&
                        galaxyNavigation.activeTarget?.id === "solar-system-galactic"
                    }
                    prefersReducedMotion={scaleTransition.prefersReducedMotion}
                    preserveCameraLookDirection={isFreeFlight}
                    onRequestOut={handleManualGalaxyTransition}
                    onRequestIn={handleManualLocalTransition}
                    onProgress={scaleTransition.setProgress}
                    onLocalZoomProgress={scaleTransition.setLocalZoomProgress}
                    onCompleteOut={handleCompleteGalaxyTransition}
                    onCompleteIn={handleCompleteLocalTransition}
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
                        <NebulaScene config={activeNebula} />
                        <NebulaCameraController
                            config={activeNebula}
                            focusRequestId={
                                galaxyNavigation.nebulaFocusRequestId
                            }
                            controlsRef={controlsRef}
                        />
                    </>
                )}

                <StarField
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
                        <MilkyWaySkyBand opacityScale={localSkyOpacity} />
                        <FadingSceneGroup opacity={localSkyOpacity}>
                            <GalacticCenterDirectionMarker />
                            <NebulaSkyCues />
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
                              : isScaleGalaxy
                                ? 360
                                : 0
                    }
                    maxDistance={
                        isBlackHole
                            ? 90
                            : isNebula && activeNebula
                              ? activeNebula.closeUpMaxDistance
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
                    onSolarSystemOverview={handleSolarSystemOverview}
                    onEnterGalaxyView={handleEnterGalaxyView}
                />
            )}
            {isGalaxy && isScaleGalaxy && !isGalaxyCloseUp && (
                <GalaxyHUD
                    onReturnToLocalSpace={handleReturnToLocalSpace}
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
                    onSolarSystemOverview={handleSolarSystemOverview}
                    onCenterOnSun={handleCenterOnSun}
                    onClose={() => setSelectedObject(null)}
                />
            )}

            {isGalaxy &&
                isScaleGalaxy &&
                !isBlackHole &&
                !isNebula &&
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
                        onEnterBlackHole={galaxyNavigation.enterBlackHole}
                        onEnterNebula={galaxyNavigation.enterNebula}
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
            {isGalaxy && isScaleGalaxy && (
                <BlackHoleTransitionVeil
                    phase={
                        isNebula
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
