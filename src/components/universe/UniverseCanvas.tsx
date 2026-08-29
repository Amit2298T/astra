"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense, useState, useCallback, useRef } from "react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import { Sun } from "./Sun";
import { Planet } from "./Planet";
import { OrbitRing } from "./OrbitRing";
import { StarField } from "./StarField";
import { Spacecraft } from "./spacecraft/Spacecraft";
import { StarSystem } from "./stars/StarSystem";
import { CameraController } from "./CameraController";
import { ObjectInfoOverlay } from "../ui/ObjectInfoOverlay";
import { FreeFlightHUD } from "../ui/FreeFlightHUD";
import { MainHUD } from "../ui/MainHUD";
import { TravelHUD } from "../ui/TravelHUD";

import { solarSystemData } from "@/data/solarSystem";
import { spacecraftData } from "@/data/spacecraft";
import { starSystemsData } from "@/data/starSystems";
import type { CameraMode, SelectedObject } from "@/engine/camera/types";
import { travelManager } from "@/engine/navigation/TravelManager";

export function UniverseCanvas() {
    const [selectedObject, setSelectedObject] = useState<SelectedObject | null>(
        null
    );
    const [activeOrbitTarget, setActiveOrbitTarget] = useState<string | null>(
        null
    );
    const [cameraMode, setCameraMode] = useState<CameraMode>("freeFlight");

    const controlsRef = useRef<OrbitControlsImpl>(null);

    const isFreeFlight = cameraMode === "freeFlight";
    const isTravel = cameraMode === "travel";

    // Single click: select object only — DO NOT move camera or set active orbit target
    const handleSelectPlanet = useCallback(
        (name: string) => {
            if (isTravel) return;
            setSelectedObject({
                id: name.toLowerCase(),
                name,
                type: "planet",
            });
        },
        [isTravel]
    );

    const handleSelectObject = useCallback(
        (obj: SelectedObject) => {
            if (isTravel) return;
            setSelectedObject(obj);
        },
        [isTravel]
    );

    // Double click: trigger intentional focus view and make object the orbit center
    const handleFocusPlanet = useCallback(
        (name: string) => {
            if (isTravel) return;
            setSelectedObject({
                id: name.toLowerCase(),
                name,
                type: "planet",
            });
            setActiveOrbitTarget(name);
            setCameraMode("focus");
        },
        [isTravel]
    );

    const handleFocusObject = useCallback(
        (obj: SelectedObject) => {
            if (isTravel) return;
            setSelectedObject(obj);
            setActiveOrbitTarget(obj.name);
            setCameraMode("focus");
        },
        [isTravel]
    );

    // Explicit Focus View button on overlay
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

    // Free Roam releases every target at the exact current camera transform.
    const handleEnterFreeRoam = useCallback(() => {
        travelManager.cancelTravel();
        setActiveOrbitTarget(null);
        setCameraMode("freeFlight");
    }, []);

    // Solar System Overview: intentional return to solar system overview vantage point
    const handleSolarSystemOverview = useCallback(() => {
        travelManager.cancelTravel();
        setSelectedObject(null);
        setActiveOrbitTarget("Sun");
        setCameraMode("system");
    }, []);

    // Center on Sun: explicit object focus inspection of the Sun
    const handleCenterOnSun = useCallback(() => {
        travelManager.cancelTravel();
        setSelectedObject({
            id: "sun",
            name: "Sun",
            type: "star",
        });
        setActiveOrbitTarget("Sun");
        setCameraMode("focus");
    }, []);

    const handleCloseOverlay = useCallback(() => {
        setSelectedObject(null);
    }, []);

    // Empty space click dismisses the overlay without changing camera/input state.
    const handlePointerMissed = useCallback(() => {
        if (isTravel) return;
        if (selectedObject) {
            setSelectedObject(null);
        }
    }, [isTravel, selectedObject]);

    return (
        <>
            <Canvas
                camera={{
                    position: [0, 20, 40],
                    fov: 50,
                    far: 2500,
                }}
                gl={{
                    antialias: true,
                    toneMapping: 3 /* ACESFilmicToneMapping */,
                }}
                onPointerMissed={handlePointerMissed}
            >
                {/* Low ambient so Sun and stars are the primary luminaries */}
                <ambientLight intensity={0.08} />

                <Sun
                    onSelect={handleSelectObject}
                    onFocus={handleFocusObject}
                />

                <Spacecraft
                    config={spacecraftData.voyager1}
                    onSelect={handleSelectObject}
                    onFocus={handleFocusObject}
                />

                <StarSystem
                    config={starSystemsData.alphaCentauri}
                    onSelect={handleSelectObject}
                    onFocus={handleFocusObject}
                />

                <Suspense fallback={null}>

                    {/* Orbit rings + planets — driven from solarSystem data */}
                    {solarSystemData.planets.map((planet) => (
                        <group key={planet.name}>
                            <OrbitRing radius={planet.orbitRadius} />
                            <Planet
                                config={planet}
                                onSelect={handleSelectPlanet}
                                onFocus={handleFocusPlanet}
                            />
                        </group>
                    ))}

                </Suspense>

                <CameraController
                    selectedTarget={selectedObject?.name ?? null}
                    activeOrbitTarget={activeOrbitTarget}
                    mode={cameraMode}
                    controlsRef={controlsRef}
                    onArrival={handleArrival}
                    onTravelFailure={handleTravelFailure}
                />

                {/* Registered after camera controls so its shell follows the final frame position. */}
                <StarField />

                <OrbitControls
                    ref={controlsRef}
                    enabled={!isFreeFlight && !isTravel && activeOrbitTarget !== null}
                />
            </Canvas>

            {/* Standard-mode action for releasing the current camera target. */}
            {!isFreeFlight && !isTravel && (
                <MainHUD onEnterFreeRoam={handleEnterFreeRoam} />
            )}

            {/* Free Flight Navigation HUD (default active state) */}
            {isFreeFlight && (
                <FreeFlightHUD
                    onSolarSystemOverview={handleSolarSystemOverview}
                />
            )}

            {/* Autopilot Travel HUD */}
            {isTravel && (
                <TravelHUD onCancelTravel={handleEnterFreeRoam} />
            )}

            {/* Selection overlay (supporting Planets, Spacecraft, Stars, Exoplanets) */}
            {selectedObject && !isTravel && (
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
                    onClose={handleCloseOverlay}
                />
            )}
        </>
    );
}
