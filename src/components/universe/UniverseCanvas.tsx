"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useCallback, useRef, useState } from "react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import type { CameraMode, SelectedObject } from "@/engine/camera/types";
import { travelManager } from "@/engine/navigation/TravelManager";
import { FreeFlightHUD } from "../ui/FreeFlightHUD";
import { GalaxyHUD } from "../ui/GalaxyHUD";
import { MainHUD } from "../ui/MainHUD";
import { ObjectInfoOverlay } from "../ui/ObjectInfoOverlay";
import { TravelHUD } from "../ui/TravelHUD";
import { CameraController } from "./CameraController";
import { MilkyWay } from "./galaxy/MilkyWay";
import { LocalUniverseLayer } from "./LocalUniverseLayer";
import { StarField } from "./StarField";

export function UniverseCanvas() {
    const [selectedObject, setSelectedObject] = useState<SelectedObject | null>(null);
    const [activeOrbitTarget, setActiveOrbitTarget] = useState<string | null>(null);
    const [cameraMode, setCameraMode] = useState<CameraMode>("freeFlight");
    const controlsRef = useRef<OrbitControlsImpl>(null);

    const isFreeFlight = cameraMode === "freeFlight";
    const isTravel = cameraMode === "travel";
    const isGalaxy = cameraMode === "galaxy";

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
        setSelectedObject(null);
        setActiveOrbitTarget(null);
        setCameraMode("galaxy");
    }, []);

    const handleReturnToLocalSpace = useCallback(() => {
        setSelectedObject(null);
        setActiveOrbitTarget("Sun");
        setCameraMode("system");
    }, []);

    const handleCenterOnSun = useCallback(() => {
        travelManager.cancelTravel();
        setSelectedObject({ id: "sun", name: "Sun", type: "star" });
        setActiveOrbitTarget("Sun");
        setCameraMode("focus");
    }, []);

    const handlePointerMissed = useCallback(() => {
        if (!isTravel && selectedObject) setSelectedObject(null);
    }, [isTravel, selectedObject]);

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
                {isGalaxy && <MilkyWay />}

                <CameraController
                    selectedTarget={selectedObject?.name ?? null}
                    activeOrbitTarget={activeOrbitTarget}
                    mode={cameraMode}
                    controlsRef={controlsRef}
                    onArrival={handleArrival}
                    onTravelFailure={handleTravelFailure}
                />

                <StarField opacityScale={isGalaxy ? 0.34 : 1} />
                <OrbitControls
                    ref={controlsRef}
                    enabled={
                        isGalaxy ||
                        (!isFreeFlight && !isTravel && activeOrbitTarget !== null)
                    }
                    enablePan={false}
                    minDistance={isGalaxy ? 900 : 0}
                    maxDistance={isGalaxy ? 8500 : Infinity}
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
            {isGalaxy && (
                <GalaxyHUD onReturnToLocalSpace={handleReturnToLocalSpace} />
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
        </>
    );
}
