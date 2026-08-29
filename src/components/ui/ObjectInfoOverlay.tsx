"use client";

import type { CameraMode, SelectedObject } from "@/engine/camera/types";
import { getSpacecraftByName } from "@/data/spacecraft";
import { getStarByName, getExoplanetByName } from "@/data/starSystems";
import { getDwarfPlanetByName } from "@/data/dwarfPlanets";
import styles from "./ObjectInfoOverlay.module.css";

interface ObjectInfoOverlayProps {
    target: SelectedObject;
    mode: CameraMode;
    onFocus: () => void;
    onFollow: () => void;
    onStopFollow: () => void;
    onTravel?: () => void;
    onFreeRoam?: () => void;
    onSolarSystemOverview?: () => void;
    onCenterOnSun?: () => void;
    onClose?: () => void;
}

export function ObjectInfoOverlay({
    target,
    mode,
    onFocus,
    onFollow,
    onStopFollow,
    onTravel,
    onFreeRoam,
    onSolarSystemOverview,
    onCenterOnSun,
    onClose,
}: ObjectInfoOverlayProps) {
    const isFollowing = mode === "follow";
    const isFocus = mode === "focus";
    const isFreeFlight = mode === "freeFlight";

    const spacecraft =
        target.type === "spacecraft"
            ? getSpacecraftByName(target.name)
            : undefined;
    const star =
        target.type === "star" ? getStarByName(target.name) : undefined;
    const exoplanet =
        target.type === "exoplanet"
            ? getExoplanetByName(target.name)
            : undefined;
    const dwarfPlanet =
        target.type === "dwarfPlanet"
            ? getDwarfPlanetByName(target.name)
            : undefined;

    // Subtitle categorization
    let subtitle = "Planet • Solar System";
    if (spacecraft) {
        subtitle = `${spacecraft.missionType} • ${spacecraft.agency}`;
    } else if (star) {
        subtitle = `Star • ${star.systemName} System`;
    } else if (exoplanet) {
        subtitle = `Exoplanet • ${exoplanet.systemName} System`;
    }

    if (dwarfPlanet) {
        subtitle = `Dwarf Planet • ${dwarfPlanet.region}`;
    }

    return (
        <div
            role="complementary"
            aria-label={`${target.name} information and navigation controls`}
            className={`${styles.panel} ${
                isFreeFlight ? styles.freeFlightPanel : ""
            }`}
            style={{
                background: "rgba(10, 12, 20, 0.92)",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
                border: "1px solid rgba(255, 255, 255, 0.14)",
                borderRadius: 20,
                padding: "20px 24px",
                color: "white",
                fontFamily: "Inter, system-ui, sans-serif",
                zIndex: 25,
                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8)",
                display: "flex",
                flexDirection: "column",
                gap: 12,
            }}
        >
            {/* Header: Title & Badges & Close Button */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                }}
            >
                <div>
                    <div
                        style={{
                            fontSize: 20,
                            fontWeight: 700,
                            letterSpacing: "0.04em",
                            textTransform: "uppercase",
                            color: "#ffffff",
                        }}
                    >
                        {target.name}
                    </div>
                    <div
                        style={{
                            fontSize: 11,
                            color: "rgba(255, 255, 255, 0.55)",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            marginTop: 2,
                        }}
                    >
                        {subtitle}
                    </div>
                </div>

                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {isFollowing && (
                        <span
                            style={{
                                fontSize: 10,
                                padding: "3px 8px",
                                borderRadius: 10,
                                background: "rgba(59, 130, 246, 0.25)",
                                color: "#93c5fd",
                                border: "1px solid rgba(59, 130, 246, 0.45)",
                                fontWeight: 600,
                                textTransform: "uppercase",
                            }}
                        >
                            Following
                        </span>
                    )}

                    {isFocus && (
                        <span
                            style={{
                                fontSize: 10,
                                padding: "3px 8px",
                                borderRadius: 10,
                                background: "rgba(168, 85, 247, 0.25)",
                                color: "#d8b4fe",
                                border: "1px solid rgba(168, 85, 247, 0.45)",
                                fontWeight: 600,
                                textTransform: "uppercase",
                            }}
                        >
                            Focused
                        </span>
                    )}

                    {star && (
                        <span
                            style={{
                                fontSize: 10,
                                padding: "3px 8px",
                                borderRadius: 10,
                                background: "rgba(234, 179, 8, 0.2)",
                                color: "#fde047",
                                border: "1px solid rgba(234, 179, 8, 0.4)",
                                fontWeight: 600,
                                textTransform: "uppercase",
                            }}
                        >
                            {star.spectralType.split(" ")[0]}
                        </span>
                    )}

                    {exoplanet && exoplanet.habitableZone && (
                        <span
                            style={{
                                fontSize: 10,
                                padding: "3px 8px",
                                borderRadius: 10,
                                background: "rgba(34, 197, 94, 0.2)",
                                color: "#86efac",
                                border: "1px solid rgba(34, 197, 94, 0.4)",
                                fontWeight: 600,
                                textTransform: "uppercase",
                            }}
                        >
                            Habitable Zone
                        </span>
                    )}

                    {spacecraft && (
                        <span
                            style={{
                                fontSize: 10,
                                padding: "3px 8px",
                                borderRadius: 10,
                                background: "rgba(34, 197, 94, 0.2)",
                                color: "#86efac",
                                border: "1px solid rgba(34, 197, 94, 0.4)",
                                fontWeight: 600,
                                textTransform: "uppercase",
                            }}
                        >
                            {spacecraft.status}
                        </span>
                    )}

                    {/* Close / Dismiss Button */}
                    <button
                        onClick={onClose}
                        title="Close Overlay"
                        style={{
                            background: "rgba(255, 255, 255, 0.08)",
                            border: "1px solid rgba(255, 255, 255, 0.15)",
                            borderRadius: "50%",
                            width: 24,
                            height: 24,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "rgba(255, 255, 255, 0.7)",
                            cursor: "pointer",
                            padding: 0,
                            marginLeft: 4,
                            transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                            const el = e.currentTarget;
                            el.style.background = "rgba(255, 255, 255, 0.2)";
                            el.style.color = "#ffffff";
                        }}
                        onMouseLeave={(e) => {
                            const el = e.currentTarget;
                            el.style.background = "rgba(255, 255, 255, 0.08)";
                            el.style.color = "rgba(255, 255, 255, 0.7)";
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
                    </button>
                </div>
            </div>

            {/* Facts Card for Spacecraft, Star, or Exoplanet */}
            {spacecraft && (
                <div
                    style={{
                        background: "rgba(255, 255, 255, 0.04)",
                        border: "1px solid rgba(255, 255, 255, 0.07)",
                        borderRadius: 12,
                        padding: "10px 12px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                        fontSize: 11,
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "rgba(255, 255, 255, 0.55)" }}>Launched</span>
                        <span style={{ fontWeight: 500 }}>{spacecraft.launchDate}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "rgba(255, 255, 255, 0.55)" }}>Mission</span>
                        <span style={{ fontWeight: 500 }}>Outer Planets / Interstellar</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "rgba(255, 255, 255, 0.55)" }}>Key Milestones</span>
                        <span style={{ fontWeight: 500, color: "#93c5fd", textAlign: "right" }}>
                            Jupiter & Saturn Flybys, Heliopause (2012)
                        </span>
                    </div>
                </div>
            )}

            {star && (
                <div
                    style={{
                        background: "rgba(255, 255, 255, 0.04)",
                        border: "1px solid rgba(255, 255, 255, 0.07)",
                        borderRadius: 12,
                        padding: "10px 12px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                        fontSize: 11,
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "rgba(255, 255, 255, 0.55)" }}>Spectral Class</span>
                        <span style={{ fontWeight: 500, color: "#fde047" }}>{star.spectralType}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "rgba(255, 255, 255, 0.55)" }}>Surface Temp</span>
                        <span style={{ fontWeight: 500 }}>{star.temperature}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "rgba(255, 255, 255, 0.55)" }}>Luminosity / Mass</span>
                        <span style={{ fontWeight: 500 }}>{star.luminosity} • {star.mass}</span>
                    </div>
                </div>
            )}

            {exoplanet && (
                <div
                    style={{
                        background: "rgba(255, 255, 255, 0.04)",
                        border: "1px solid rgba(255, 255, 255, 0.07)",
                        borderRadius: 12,
                        padding: "10px 12px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                        fontSize: 11,
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "rgba(255, 255, 255, 0.55)" }}>Host Star</span>
                        <span style={{ fontWeight: 500, color: "#f87171" }}>{exoplanet.parentStarName}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "rgba(255, 255, 255, 0.55)" }}>Orbital Period</span>
                        <span style={{ fontWeight: 500 }}>11.186 Days (0.048 AU)</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "rgba(255, 255, 255, 0.55)" }}>Classification</span>
                        <span style={{ fontWeight: 500, color: "#86efac" }}>Earth-Mass Terrestrial</span>
                    </div>
                </div>
            )}

            {dwarfPlanet && (
                <div
                    style={{
                        background: "rgba(255, 255, 255, 0.04)",
                        border: "1px solid rgba(255, 255, 255, 0.07)",
                        borderRadius: 12,
                        padding: "10px 12px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                        fontSize: 11,
                    }}
                >
                    {dwarfPlanet.facts.map((fact, index) => (
                        <div
                            key={`dwarf-planet-${dwarfPlanet.id}-${fact.label}-${index}`}
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 16,
                            }}
                        >
                            <span
                                style={{ color: "rgba(255, 255, 255, 0.55)" }}
                            >
                                {fact.label}
                            </span>
                            <span
                                style={{
                                    fontWeight: 500,
                                    color: "#cbd5e1",
                                    textAlign: "right",
                                }}
                            >
                                {fact.value}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Description */}
            <div
                style={{
                    fontSize: 12,
                    lineHeight: 1.5,
                    color: "rgba(255, 255, 255, 0.72)",
                }}
            >
                {spacecraft?.description ??
                    star?.description ??
                    exoplanet?.description ??
                    dwarfPlanet?.description ??
                    "Selected celestial body. Engage Focus View to orbit and inspect, or Travel To via Autopilot."}
            </div>

            {/* Action Buttons Grid */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                    width: "100%",
                    marginTop: 2,
                }}
            >
                {/* 1. Travel To Autopilot Action */}
                {onTravel && (
                    <button
                        onClick={onTravel}
                        style={{
                            background:
                                "linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.3) 100%)",
                            border: "1px solid rgba(147, 197, 253, 0.5)",
                            borderRadius: 8,
                            color: "#bfdbfe",
                            padding: "9px 12px",
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
                            el.style.background =
                                "linear-gradient(135deg, rgba(59, 130, 246, 0.45) 0%, rgba(147, 51, 234, 0.45) 100%)";
                            el.style.borderColor = "rgba(147, 197, 253, 0.8)";
                            el.style.color = "#ffffff";
                        }}
                        onMouseLeave={(e) => {
                            const el = e.currentTarget;
                            el.style.background =
                                "linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.3) 100%)";
                            el.style.borderColor = "rgba(147, 197, 253, 0.5)";
                            el.style.color = "#bfdbfe";
                        }}
                    >
                        <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                        Travel To
                    </button>
                )}

                {/* 2. Focus View / Stop Following */}
                {!isFocus && !isFollowing && (
                    <button
                        onClick={onFocus}
                        style={{
                            background: "rgba(168, 85, 247, 0.2)",
                            border: "1px solid rgba(168, 85, 247, 0.4)",
                            borderRadius: 8,
                            color: "#d8b4fe",
                            padding: "9px 12px",
                            fontSize: 12,
                            cursor: "pointer",
                            letterSpacing: "0.03em",
                            fontWeight: 600,
                            transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                            const el = e.currentTarget;
                            el.style.background = "rgba(168, 85, 247, 0.35)";
                        }}
                        onMouseLeave={(e) => {
                            const el = e.currentTarget;
                            el.style.background = "rgba(168, 85, 247, 0.2)";
                        }}
                    >
                        Focus View
                    </button>
                )}

                {isFollowing && (
                    <button
                        onClick={onStopFollow}
                        style={{
                            background: "rgba(239, 68, 68, 0.15)",
                            border: "1px solid rgba(239, 68, 68, 0.35)",
                            borderRadius: 8,
                            color: "#fca5a5",
                            padding: "9px 12px",
                            fontSize: 12,
                            cursor: "pointer",
                            letterSpacing: "0.03em",
                            fontWeight: 600,
                            transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                            const el = e.currentTarget;
                            el.style.background = "rgba(239, 68, 68, 0.28)";
                            el.style.borderColor = "rgba(239, 68, 68, 0.5)";
                        }}
                        onMouseLeave={(e) => {
                            const el = e.currentTarget;
                            el.style.background = "rgba(239, 68, 68, 0.15)";
                            el.style.borderColor = "rgba(239, 68, 68, 0.35)";
                        }}
                    >
                        Stop Following
                    </button>
                )}

                {/* 3. Follow Companion Mode */}
                {!isFollowing && (
                    <button
                        onClick={onFollow}
                        style={{
                            background: "rgba(59, 130, 246, 0.18)",
                            border: "1px solid rgba(59, 130, 246, 0.4)",
                            borderRadius: 8,
                            color: "#93c5fd",
                            padding: "9px 12px",
                            fontSize: 12,
                            cursor: "pointer",
                            letterSpacing: "0.03em",
                            fontWeight: 500,
                            transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                            const el = e.currentTarget;
                            el.style.background = "rgba(59, 130, 246, 0.3)";
                            el.style.borderColor = "rgba(59, 130, 246, 0.6)";
                        }}
                        onMouseLeave={(e) => {
                            const el = e.currentTarget;
                            el.style.background = "rgba(59, 130, 246, 0.18)";
                            el.style.borderColor = "rgba(59, 130, 246, 0.4)";
                        }}
                    >
                        Follow
                    </button>
                )}

                {/* 4. Release the active target without moving the camera. */}
                {!isFreeFlight && (
                    <button
                        onClick={onFreeRoam}
                        style={{
                            background: "rgba(14, 165, 233, 0.18)",
                            border: "1px solid rgba(14, 165, 233, 0.4)",
                            borderRadius: 8,
                            color: "#7dd3fc",
                            padding: "9px 12px",
                            fontSize: 12,
                            cursor: "pointer",
                            letterSpacing: "0.03em",
                            fontWeight: 600,
                            transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                            const el = e.currentTarget;
                            el.style.background = "rgba(14, 165, 233, 0.3)";
                            el.style.borderColor = "rgba(14, 165, 233, 0.6)";
                        }}
                        onMouseLeave={(e) => {
                            const el = e.currentTarget;
                            el.style.background = "rgba(14, 165, 233, 0.18)";
                            el.style.borderColor = "rgba(14, 165, 233, 0.4)";
                        }}
                    >
                        Free Roam
                    </button>
                )}

                {/* 5. Center on Sun (Explicit Sun Focus) */}
                {target.name.toLowerCase() !== "sun" && (
                    <button
                        onClick={onCenterOnSun}
                        style={{
                            background: "rgba(255, 255, 255, 0.08)",
                            border: "1px solid rgba(255, 255, 255, 0.15)",
                            borderRadius: 8,
                            color: "white",
                            padding: "9px 12px",
                            fontSize: 12,
                            cursor: "pointer",
                            letterSpacing: "0.03em",
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
                        Center on Sun
                    </button>
                )}

                {/* 6. Solar System Overview */}
                <button
                    onClick={onSolarSystemOverview}
                    style={{
                        background: "rgba(255, 255, 255, 0.08)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        borderRadius: 8,
                        color: "white",
                        padding: "9px 12px",
                        fontSize: 12,
                        cursor: "pointer",
                        letterSpacing: "0.03em",
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
            </div>
        </div>
    );
}

// Re-export PlanetInfoOverlay for backwards compatibility
export { ObjectInfoOverlay as PlanetInfoOverlay };
