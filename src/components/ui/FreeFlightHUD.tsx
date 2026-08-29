"use client";

import { useEffect, useState } from "react";
import { freeFlightInput } from "@/engine/input/FreeFlightInput";
import {
    FREE_ROAM_SPEED_PRESETS,
    speedManager,
} from "@/engine/navigation/SpeedManager";
import type { NavigationData } from "@/engine/navigation/SpeedManager";
import styles from "./FreeFlightHUD.module.css";

interface FreeFlightHUDProps {
    onSolarSystemOverview?: () => void;
    onReturnToSystem?: () => void;
    onEnterGalaxyView?: () => void;
}

export function FreeFlightHUD({
    onSolarSystemOverview,
    onReturnToSystem,
    onEnterGalaxyView,
}: FreeFlightHUDProps) {
    const [isLocked, setIsLocked] = useState(false);
    const [navData, setNavData] = useState<NavigationData>(() =>
        speedManager.getNavigationData()
    );

    useEffect(() => {
        freeFlightInput.setOnLockChange(setIsLocked);

        // Throttled UI state polling (~10 updates per second) to prevent 60FPS React re-renders
        const interval = setInterval(() => {
            setNavData({ ...speedManager.getNavigationData() });
        }, 100);

        return () => {
            freeFlightInput.setOnLockChange(() => {});
            clearInterval(interval);
        };
    }, []);

    const handleEnableLock = () => {
        void freeFlightInput.requestLock();
    };

    return (
        <div
            className={styles.panel}
            style={{
                background: "rgba(10, 12, 20, 0.85)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: 16,
                padding: "20px 24px",
                color: "white",
                fontFamily: "Inter, system-ui, sans-serif",
                zIndex: 30,
                boxShadow: "0 12px 40px rgba(0, 0, 0, 0.6)",
            }}
        >
            {/* Header + Mouse Lock Status */}
            <div
                className={styles.controls}
                style={{
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#60a5fa",
                    marginBottom: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <span>Free Roam</span>
                <span
                    style={{
                        fontSize: 10,
                        padding: "2px 8px",
                        borderRadius: 12,
                        background: isLocked
                            ? "rgba(34, 197, 94, 0.2)"
                            : "rgba(234, 179, 8, 0.2)",
                        color: isLocked ? "#4ade80" : "#fde047",
                        border: `1px solid ${
                            isLocked
                                ? "rgba(34, 197, 94, 0.4)"
                                : "rgba(234, 179, 8, 0.4)"
                        }`,
                    }}
                >
                    {isLocked ? "Mouse Locked" : "Mouse Unlocked"}
                </span>
            </div>

            {/* Free Roam speed and navigation readout */}
            <div
                style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: 12,
                    padding: "12px 14px",
                    marginBottom: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    fontSize: 12,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <label
                        htmlFor="free-roam-speed"
                        style={{ color: "rgba(255, 255, 255, 0.6)" }}
                    >
                        Speed
                    </label>
                    <select
                        id="free-roam-speed"
                        aria-label="Free Roam speed"
                        value={navData.selectedSpeed}
                        onChange={(event) =>
                            speedManager.setSelectedSpeed(
                                Number(event.currentTarget.value)
                            )
                        }
                        style={{
                            minWidth: 152,
                            padding: "5px 8px",
                            borderRadius: 7,
                            background: "rgb(24, 31, 48)",
                            color: "#dbeafe",
                            border: "1px solid rgba(96, 165, 250, 0.4)",
                            fontWeight: 600,
                            fontSize: 11,
                            cursor: "pointer",
                        }}
                    >
                        {FREE_ROAM_SPEED_PRESETS.map((preset) => (
                            <option key={preset.speed} value={preset.speed}>
                                {preset.speed} u/s — {preset.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                        Effective
                    </span>
                    <span style={{ fontWeight: 600, fontFamily: "monospace" }}>
                        {navData.effectiveSpeed.toFixed(0)} u/s{" "}
                        {navData.isBoosting && (
                            <span style={{ color: "#fca5a5" }}>(5×)</span>
                        )}
                    </span>
                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                        Nearest
                    </span>
                    <span style={{ fontWeight: 600, color: "#93c5fd" }}>
                        {navData.nearestObjectName}
                    </span>
                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                        Distance
                    </span>
                    <span style={{ fontWeight: 600, fontFamily: "monospace" }}>
                        {navData.nearestDistance.toFixed(1)} u
                    </span>
                </div>
            </div>

            {/* Controls Cheat Sheet */}
            <div
                style={{
                    fontSize: 11,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    color: "rgba(255, 255, 255, 0.75)",
                    marginBottom: 16,
                    lineHeight: 1.4,
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "white", fontWeight: 600 }}>WASD</span>
                    <span>Move Forward / Strafe</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "white", fontWeight: 600 }}>Mouse</span>
                    <span>Look Around</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "white", fontWeight: 600 }}>Scroll</span>
                    <span>Cycle Speed Presets</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "white", fontWeight: 600 }}>Shift</span>
                    <span>Boost Speed (5x)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "white", fontWeight: 600 }}>
                        Space / Ctrl
                    </span>
                    <span>Ascend / Descend</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "white", fontWeight: 600 }}>Esc</span>
                    <span>Exit Mouse Lock</span>
                </div>
            </div>

            {!isLocked && (
                <button
                    onClick={handleEnableLock}
                    style={{
                        width: "100%",
                        marginBottom: 8,
                        background: "rgba(59, 130, 246, 0.2)",
                        border: "1px solid rgba(59, 130, 246, 0.4)",
                        borderRadius: 8,
                        color: "#93c5fd",
                        padding: "8px 14px",
                        fontSize: 12,
                        cursor: "pointer",
                        letterSpacing: "0.04em",
                        fontWeight: 500,
                        transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                        const el = e.currentTarget;
                        el.style.background = "rgba(59, 130, 246, 0.35)";
                    }}
                    onMouseLeave={(e) => {
                        const el = e.currentTarget;
                        el.style.background = "rgba(59, 130, 246, 0.2)";
                    }}
                >
                    Enable Mouse Look
                </button>
            )}

            <button
                onClick={onSolarSystemOverview ?? onReturnToSystem}
                style={{
                    width: "100%",
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: 8,
                    color: "white",
                    padding: "8px 14px",
                    fontSize: 12,
                    cursor: "pointer",
                    letterSpacing: "0.04em",
                    fontWeight: 500,
                    transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.background = "rgba(255, 255, 255, 0.18)";
                    el.style.borderColor = "rgba(255, 255, 255, 0.3)";
                }}
                onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.background = "rgba(255, 255, 255, 0.08)";
                    el.style.borderColor = "rgba(255, 255, 255, 0.15)";
                }}
            >
                Solar System Overview
            </button>

            <button
                onClick={onEnterGalaxyView}
                style={{
                    width: "100%",
                    marginTop: 8,
                    background: "rgba(14, 116, 144, 0.18)",
                    border: "1px solid rgba(125, 211, 252, 0.3)",
                    borderRadius: 8,
                    color: "#bae6fd",
                    padding: "8px 14px",
                    fontSize: 12,
                    cursor: "pointer",
                    letterSpacing: "0.04em",
                    fontWeight: 600,
                }}
            >
                Galaxy View
            </button>
        </div>
    );
}
