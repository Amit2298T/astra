"use client";

import { useEffect, useState } from "react";

import { freeFlightInput } from "@/engine/input/FreeFlightInput";
import {
    MOON_SURFACE_GRAVITY_M_S2,
    type SurfaceModePhase,
} from "@/engine/surface/SurfaceDestination";
import styles from "./SurfaceHUD.module.css";

interface SurfaceHUDProps {
    phase: SurfaceModePhase;
    progress: number;
    onReturnToOrbit: () => void;
}

export function SurfaceHUD({
    phase,
    progress,
    onReturnToOrbit,
}: SurfaceHUDProps) {
    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
        if (phase !== "surface") return;
        freeFlightInput.setOnLockChange(setIsLocked);
        return () => freeFlightInput.setOnLockChange(() => {});
    }, [phase]);

    if (phase === "landing" || phase === "returning") {
        return (
            <div className={styles.transition} aria-live="polite">
                {phase === "landing" ? "Lunar descent" : "Returning to orbit"}
                {` ${Math.round(progress * 100)}%`}
            </div>
        );
    }

    if (phase !== "surface") return null;

    return (
        <aside className={styles.panel} aria-label="Moon Surface controls">
            <div className={styles.titleRow}>
                <span className={styles.title}>Moon Surface</span>
                <span className={styles.status}>
                    {isLocked ? "Mouse locked" : "Mouse free"}
                </span>
            </div>

            <div className={styles.details}>
                <div className={styles.detailRow}>
                    <span>Movement</span>
                    <strong>WASD / Shift boost</strong>
                </div>
                <div className={styles.detailRow}>
                    <span>Gravity</span>
                    <strong>{MOON_SURFACE_GRAVITY_M_S2.toFixed(2)} m/s^2</strong>
                </div>
                <div className={styles.detailRow}>
                    <span>Mouse look</span>
                    <strong>Esc unlocks</strong>
                </div>
            </div>

            <p className={styles.note}>
                Procedurally generated educational terrain, not a reconstruction
                of a specific landing site. Local distances, features, and sky
                orientation are compressed or staged for exploration.
            </p>

            {!isLocked && (
                <button
                    type="button"
                    className={`${styles.button} ${styles.mouseButton}`}
                    onClick={() => void freeFlightInput.requestLock()}
                >
                    Enable mouse look
                </button>
            )}
            <button
                type="button"
                className={styles.button}
                onClick={onReturnToOrbit}
            >
                Return to Orbit
            </button>
        </aside>
    );
}
