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

export function UniverseCanvas() {
    const [selectedObject, setSelectedObject] = useState<SelectedObject | null>(null);
    const [activeOrbitTarget, setActiveOrbitTarget] = useState<string | null>(null);
    const [cameraMode, setCameraMode] = useState<CameraMode>("freeFlight");
    const controlsRef = useRef<OrbitControlsImpl>(null);
    const galaxyNavigation = useGalaxyNavigation();

    const isFreeFlight = cameraMode === "freeFlight";
    const isTravel = cameraMode === "travel";
    const isGalaxy = cameraMode === "galaxy";
    const isBlackHole = isGalaxy && galaxyNavigation.mode === "blackHole";

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
        setCameraMode("galaxy");
    }, [galaxyNavigation]);

    const handleReturnToLocalSpace = useCallback(() => {
        galaxyNavigation.resetOverview();
        setSelectedObject(null);
        setActiveOrbitTarget("Sun");
        setCameraMode("system");
    }, [galaxyNavigation]);

    const handleCenterOnSun = useCallback(() => {
        travelManager.cancelTravel();
        setSelectedObject({ id: "sun", name: "Sun", type: "star" });
        setActiveOrbitTarget("Sun");
        setCameraMode("focus");
    }, []);

    const handlePointerMissed = useCallback(() => {
        if (isBlackHole) {
            return;
        } else if (isGalaxy) {
            galaxyNavigation.clearSelection();
        } else if (!isTravel && selectedObject) {
            setSelectedObject(null);
        }
    }, [galaxyNavigation, isBlackHole, isGalaxy, isTravel, selectedObject]);

    return (
        <>
            <Canvas
                camera={{ position: [0, 20, 40], fov: 50, far: 12000 }}
                gl={{ antialias: true, toneMapping: 3 }}
                onPointerMissed={handlePointerMissed}
            >
                <ambientLight intensity={0.08} />

                {!isGalaxy && (
                    <LocalUniverseLayer
                        onSelectPlanet={handleSelectPlanet}
                        onFocusPlanet={handleFocusPlanet}
                        onSelectObject={handleSelectObject}
                        onFocusObject={handleFocusObject}
                    />
                )}
                {isGalaxy && !isBlackHole && (
                    <MilkyWay
                        selectedTargetId={
                            galaxyNavigation.selectedTarget?.id
                        }
                        activeTargetId={galaxyNavigation.activeTarget?.id}
                        isTraveling={galaxyNavigation.mode === "travel"}
                        onSelectTarget={galaxyNavigation.selectTarget}
                    />
                )}

                {!isGalaxy && (
                    <CameraController
                        selectedTarget={selectedObject?.name ?? null}
                        activeOrbitTarget={activeOrbitTarget}
                        mode={cameraMode}
                        controlsRef={controlsRef}
                        onArrival={handleArrival}
                        onTravelFailure={handleTravelFailure}
                    />
                )}
                {isGalaxy && !isBlackHole && (
                    <GalaxyCameraController
                        mode={galaxyNavigation.mode}
                        activeTarget={galaxyNavigation.activeTarget}
                        focusRequestId={galaxyNavigation.focusRequestId}
                        controlsRef={controlsRef}
                        onArrival={galaxyNavigation.completeArrival}
                    />
                )}

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

                <StarField
                    opacityScale={isBlackHole ? 0.1 : isGalaxy ? 0.34 : 1}
                />
                {!isGalaxy && (
                    <>
                        <MilkyWaySkyBand />
                        <GalacticCenterDirectionMarker />
                    </>
                )}
                <OrbitControls
                    ref={controlsRef}
                    enabled={
                        isBlackHole ||
                        (isGalaxy && galaxyNavigation.mode !== "travel") ||
                        (!isFreeFlight && !isTravel && activeOrbitTarget !== null)
                    }
                    enablePan={false}
                    minDistance={isBlackHole ? 8.5 : isGalaxy ? 360 : 0}
                    maxDistance={isBlackHole ? 90 : isGalaxy ? 8500 : Infinity}
                />
            </Canvas>

            {!isFreeFlight && !isTravel && !isGalaxy && (
                <MainHUD
                    onEnterFreeRoam={handleEnterFreeRoam}
                    onEnterGalaxyView={handleEnterGalaxyView}
                />
            )}
            {isFreeFlight && (
                <FreeFlightHUD
                    onSolarSystemOverview={handleSolarSystemOverview}
                    onEnterGalaxyView={handleEnterGalaxyView}
                />
            )}
            {isGalaxy && !isBlackHole && (
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
            {isTravel && <TravelHUD onCancelTravel={handleEnterFreeRoam} />}

            {selectedObject && !isTravel && !isGalaxy && (
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
                !isBlackHole &&
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
                        onClose={galaxyNavigation.clearSelection}
                    />
                )}

            {isGalaxy && galaxyNavigation.mode === "travel" && (
                <GalaxyTravelHUD onCancel={galaxyNavigation.resetOverview} />
            )}

            {isBlackHole && (
                <BlackHoleOverlay
                    blackHole={sagittariusAStar}
                    onRefocus={galaxyNavigation.refocusBlackHole}
                    onReturn={galaxyNavigation.exitBlackHole}
                />
            )}
            {isGalaxy && (
                <BlackHoleTransitionVeil
                    phase={isBlackHole ? "closeUp" : "galaxy"}
                />
            )}
        </>
    );
}
