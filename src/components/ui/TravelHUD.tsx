"use client";

import { useEffect, useState } from "react";
import { travelManager } from "@/engine/navigation/TravelManager";
import type {
    TravelPhase,
    TravelTelemetry,
} from "@/engine/navigation/TravelManager";

interface TravelHUDProps {
    onCancelTravel: () => void;
}

function getPhaseBadgeStyle(phase: TravelPhase) {
    switch (phase) {
        case "aligning":
            return {
                bg: "rgba(56, 189, 248, 0.2)",
                color: "#7dd3fc",
                border: "rgba(56, 189, 248, 0.4)",
                label: "Aligning",
            };
        case "accelerating":
            return {
                bg: "rgba(234, 179, 8, 0.2)",
                color: "#fde047",
                border: "rgba(234, 179, 8, 0.4)",
                label: "Accelerating",
            };
        case "cruise":
            return {
                bg: "rgba(99, 102, 241, 0.25)",
                color: "#a5b4fc",
                border: "rgba(99, 102, 241, 0.45)",
                label: "Cruise",
            };
        case "decelerating":
            return {
                bg: "rgba(249, 115, 22, 0.2)",
                color: "#fdba74",
                border: "rgba(249, 115, 22, 0.4)",
                label: "Decelerating",
            };
        case "arriving":
            return {
                bg: "rgba(34, 197, 94, 0.25)",
                color: "#86efac",
                border: "rgba(34, 197, 94, 0.45)",
                label: "Arriving",
            };
    }
}

export function TravelHUD({ onCancelTravel }: TravelHUDProps) {
    const [telemetry, setTelemetry] = useState<TravelTelemetry>(() =>
        travelManager.getTelemetry()
    );

    useEffect(() => {
        // Throttled UI telemetry polling (~10 updates per second) to prevent 60FPS React re-renders
        const interval = setInterval(() => {
            setTelemetry({ ...travelManager.getTelemetry() });
        }, 100);

        return () => {
            clearInterval(interval);
        };
    }, []);

    const phaseStyle = getPhaseBadgeStyle(telemetry.phase);
    const progressPercent = Math.round(telemetry.progress * 100);

    return (
        <div
            style={{
                position: "absolute",
                top: 24,
                right: 24,
                background: "rgba(10, 12, 20, 0.85)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(255, 255, 255, 0.14)",
                borderRadius: 18,
                padding: "22px 26px",
                color: "white",
                fontFamily: "Inter, system-ui, sans-serif",
                width: 320,
                zIndex: 30,
                boxShadow: "0 16px 48px rgba(0, 0, 0, 0.7)",
                display: "flex",
                flexDirection: "column",
                gap: 14,
            }}
        >
            {/* Header: Destination & Autopilot Status */}
            <div>
                <div
                    style={{
                        fontSize: 11,
                        color: "rgba(255, 255, 255, 0.55)",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        fontWeight: 600,
                        marginBottom: 4,
                    }}
                >
                    TRAVELING TO
                </div>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <div
                        style={{
                            fontSize: 20,
                            fontWeight: 700,
                            letterSpacing: "0.04em",
                            color: "#ffffff",
                            textTransform: "uppercase",
                        }}
                    >
                        {telemetry.destinationName || "Target"}
                    </div>
                    <span
                        style={{
                            fontSize: 10,
                            padding: "3px 10px",
                            borderRadius: 12,
                            background: phaseStyle.bg,
                            color: phaseStyle.color,
                            border: `1px solid ${phaseStyle.border}`,
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                        }}
                    >
                        {phaseStyle.label}
                    </span>
                </div>
            </div>

            {/* Telemetry Metrics */}
            <div
                style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: 12,
                    padding: "12px 14px",
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
                    <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                        Distance Remaining
                    </span>
                    <span style={{ fontWeight: 600, fontFamily: "monospace" }}>
                        {telemetry.distanceRemaining.toFixed(2)} scene units
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
                        Current Speed
                    </span>
                    <span style={{ fontWeight: 600, fontFamily: "monospace" }}>
                        {telemetry.currentSpeed.toFixed(1)} u/s
                    </span>
                </div>

                {/* Progress bar */}
                <div style={{ marginTop: 4 }}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 6,
                            fontSize: 11,
                        }}
                    >
                        <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                            Progress
                        </span>
                        <span
                            style={{
                                fontWeight: 700,
                                fontFamily: "monospace",
                                color: "#93c5fd",
                            }}
                        >
                            {progressPercent}%
                        </span>
                    </div>
                    <div
                        style={{
                            width: "100%",
                            height: 6,
                            borderRadius: 3,
                            background: "rgba(255, 255, 255, 0.1)",
                            overflow: "hidden",
                        }}
                    >
                        <div
                            style={{
                                width: `${progressPercent}%`,
                                height: "100%",
                                background:
                                    "linear-gradient(90deg, #3b82f6, #8b5cf6, #10b981)",
                                borderRadius: 3,
                                transition: "width 0.1s linear",
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Cancel Travel Action */}
            <button
                onClick={onCancelTravel}
                style={{
                    width: "100%",
                    background: "rgba(239, 68, 68, 0.15)",
                    border: "1px solid rgba(239, 68, 68, 0.35)",
                    borderRadius: 8,
                    color: "#fca5a5",
                    padding: "9px 14px",
                    fontSize: 12,
                    cursor: "pointer",
                    letterSpacing: "0.04em",
                    fontWeight: 600,
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                }}
                onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.background = "rgba(239, 68, 68, 0.28)";
                    el.style.borderColor = "rgba(239, 68, 68, 0.55)";
                }}
                onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.background = "rgba(239, 68, 68, 0.15)";
                    el.style.borderColor = "rgba(239, 68, 68, 0.35)";
                }}
            >
                <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Cancel Travel
            </button>
        </div>
    );
}
