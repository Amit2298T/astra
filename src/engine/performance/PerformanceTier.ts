export type PerformanceTier = "high" | "medium" | "low";

export interface PerformanceSignals {
    width: number;
    height: number;
    devicePixelRatio: number;
    hardwareConcurrency?: number;
    deviceMemoryGb?: number;
    coarsePointer?: boolean;
}

export interface PerformanceProfile {
    tier: PerformanceTier;
    maxDpr: number;
    starFieldScale: number;
    skyBandScale: number;
    galaxyScale: number;
    beltScale: number;
    nebulaScale: number;
    clusterScale: number;
    orbitRingSegments: number;
    dwarfOrbitRingSegments: number;
}

export const PERFORMANCE_PROFILES: Record<PerformanceTier, PerformanceProfile> = {
    high: {
        tier: "high",
        maxDpr: 2,
        starFieldScale: 1,
        skyBandScale: 1,
        galaxyScale: 1,
        beltScale: 1,
        nebulaScale: 1,
        clusterScale: 1,
        orbitRingSegments: 128,
        dwarfOrbitRingSegments: 192,
    },
    medium: {
        tier: "medium",
        maxDpr: 1.5,
        starFieldScale: 0.82,
        skyBandScale: 0.82,
        galaxyScale: 0.76,
        beltScale: 0.8,
        nebulaScale: 0.78,
        clusterScale: 0.82,
        orbitRingSegments: 96,
        dwarfOrbitRingSegments: 128,
    },
    low: {
        tier: "low",
        maxDpr: 1.25,
        starFieldScale: 0.58,
        skyBandScale: 0.6,
        galaxyScale: 0.5,
        beltScale: 0.55,
        nebulaScale: 0.55,
        clusterScale: 0.65,
        orbitRingSegments: 72,
        dwarfOrbitRingSegments: 96,
    },
};

export function resolvePerformanceTier(
    signals: PerformanceSignals
): PerformanceTier {
    const shortEdge = Math.min(signals.width, signals.height);
    const constrainedMemory =
        signals.deviceMemoryGb !== undefined && signals.deviceMemoryGb <= 4;
    const constrainedCpu =
        signals.hardwareConcurrency !== undefined &&
        signals.hardwareConcurrency <= 4;

    if (
        shortEdge < 700 ||
        (signals.coarsePointer && signals.width < 1100) ||
        constrainedMemory ||
        (constrainedCpu && signals.devicePixelRatio > 1.5)
    ) {
        return "low";
    }

    if (
        signals.width < 1280 ||
        signals.height < 760 ||
        (signals.hardwareConcurrency !== undefined &&
            signals.hardwareConcurrency <= 8) ||
        (signals.deviceMemoryGb !== undefined && signals.deviceMemoryGb <= 8)
    ) {
        return "medium";
    }

    return "high";
}

export function scaledCount(count: number, scale: number): number {
    return Math.max(1, Math.round(count * scale));
}
