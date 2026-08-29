"use client";

import { useEffect, useState } from "react";

import {
    galaxyTravelManager,
    type GalaxyTravelTelemetry,
} from "@/engine/navigation/GalaxyTravelManager";
import styles from "./GalaxyNavigation.module.css";

interface GalaxyTravelHUDProps {
    onCancel: () => void;
}

export function GalaxyTravelHUD({ onCancel }: GalaxyTravelHUDProps) {
    const [telemetry, setTelemetry] = useState<GalaxyTravelTelemetry>(() => ({
        ...galaxyTravelManager.getTelemetry(),
    }));

    useEffect(() => {
        const interval = window.setInterval(() => {
            setTelemetry({ ...galaxyTravelManager.getTelemetry() });
        }, 100);
        return () => window.clearInterval(interval);
    }, []);

    const phase = telemetry.phase.replace(/^./, (letter) =>
        letter.toUpperCase()
    );

    return (
        <div className={styles.travelHud}>
            <div className={styles.travelRow}>
                <span className={styles.eyebrow}>Travelling</span>
                <span>{Math.round(telemetry.progress * 100)}%</span>
            </div>
            <div className={styles.travelRow}>
                <strong>{telemetry.destinationName || "Galactic destination"}</strong>
                <span>{phase}</span>
            </div>
            <div className={styles.progressTrack}>
                <div
                    className={styles.progressFill}
                    style={{ width: `${telemetry.progress * 100}%` }}
                />
            </div>
            <div className={styles.travelRow}>
                <span>Distance remaining</span>
                <span>{telemetry.distanceRemaining.toFixed(0)} galactic units</span>
            </div>
            <button className={styles.cancelButton} onClick={onCancel}>
                Cancel Travel
            </button>
        </div>
    );
}
