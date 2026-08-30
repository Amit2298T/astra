import {
    comparisonMetrics,
    comparisonObjectIds,
    getComparisonObject,
    type ComparableValue,
    type ComparisonMetric,
    type ComparisonMetricId,
    type ComparisonObject,
} from "@/data/astronomy/comparison";

const DEFAULT_IDS = ["earth", "jupiter"] as const;
const MAX_OBJECTS = 4;

export interface ComparisonUrlState {
    objectIds: readonly string[];
    metricId: ComparisonMetricId;
}

export function parseComparisonUrlState(
    objectsValue: string | string[] | undefined,
    metricValue: string | string[] | undefined
): ComparisonUrlState {
    const rawObjects = Array.isArray(objectsValue) ? objectsValue[0] : objectsValue;
    const requestedIds = rawObjects?.split(",").filter(Boolean) ?? [];
    const validIds = [...new Set(requestedIds)]
        .filter((id) => comparisonObjectIds.has(id))
        .slice(0, MAX_OBJECTS);
    const objectIds = validIds.length > 0 ? validIds : [...DEFAULT_IDS];
    const rawMetric = Array.isArray(metricValue) ? metricValue[0] : metricValue;
    const metricId = comparisonMetrics.some((metric) => metric.id === rawMetric)
        ? (rawMetric as ComparisonMetricId)
        : "diameter";
    return { objectIds, metricId };
}

export function getSharedMetrics(
    objects: readonly ComparisonObject[]
): readonly ComparisonMetric[] {
    if (objects.length < 2) return [];
    return comparisonMetrics.filter((metric) =>
        objects.every((object) => object.values[metric.id] !== undefined)
    );
}

export function resolveObjects(ids: readonly string[]): readonly ComparisonObject[] {
    return ids
        .map((id) => getComparisonObject(id))
        .filter((object): object is ComparisonObject => object !== null);
}

export function getComparisonRatio(
    value: ComparableValue,
    reference: ComparableValue
): number {
    return value.value / reference.value;
}

export function describeMetricComparison(
    object: ComparisonObject,
    reference: ComparisonObject,
    metric: ComparisonMetric
): string {
    const objectValue = object.values[metric.id];
    const referenceValue = reference.values[metric.id];
    if (!objectValue || !referenceValue) return "No direct quantitative comparison is available.";
    if (object.id === reference.id) return `${object.name} is the current reference.`;

    const ratio = getComparisonRatio(objectValue, referenceValue);
    const formattedRatio = formatRatio(ratio);
    const inverseRatio = formatRatio(1 / ratio);

    switch (metric.id) {
        case "diameter":
            return ratio >= 1
                ? `${object.name} is about ${formattedRatio}× wider than ${reference.name}.`
                : `${object.name} is about ${inverseRatio}× smaller in diameter than ${reference.name}.`;
        case "mass":
            return ratio >= 1
                ? `${object.name} is about ${formattedRatio}× heavier than ${reference.name}.`
                : `${object.name} is about ${inverseRatio}× lighter than ${reference.name}.`;
        case "surfaceGravity":
            return `${object.name} has about ${formattedRatio}× the surface gravity of ${reference.name}.`;
        case "temperature": {
            const difference = Math.abs(objectValue.value - referenceValue.value);
            if (difference < 0.5) {
                return `${object.name} is approximately the same temperature as ${reference.name}.`;
            }
            return `${object.name} is about ${formatNumber(difference)} K ${ratio >= 1 ? "hotter" : "cooler"} than ${reference.name}.`;
        }
        case "orbitalDistance":
            return ratio >= 1
                ? `${object.name} orbits about ${formattedRatio}× farther from its host than ${reference.name}.`
                : `${object.name} orbits about ${inverseRatio}× closer to its host than ${reference.name}.`;
        case "distanceFromEarth":
            return ratio >= 1
                ? `${object.name} is about ${formattedRatio}× farther from Earth than ${reference.name}.`
                : `${object.name} is about ${inverseRatio}× closer to Earth than ${reference.name}.`;
        case "missionDistance":
            return ratio >= 1
                ? `${object.name}’s mission distance is about ${formattedRatio}× farther than ${reference.name}’s.`
                : `${object.name}’s mission distance is about ${inverseRatio}× closer than ${reference.name}’s.`;
        case "orbitalPeriod":
            return ratio >= 1
                ? `${object.name} has an orbital period about ${formattedRatio}× longer than ${reference.name}.`
                : `${object.name} has an orbital period about ${inverseRatio}× shorter than ${reference.name}.`;
        case "physicalExtent":
            return ratio >= 1
                ? `${object.name} is about ${formattedRatio}× larger in physical extent than ${reference.name}.`
                : `${object.name} is about ${inverseRatio}× smaller in physical extent than ${reference.name}.`;
    }
}

export function getVisualProportion(
    value: number,
    values: readonly number[],
    logarithmic: boolean
): number {
    const maximum = Math.max(...values);
    if (maximum <= 0) return 0;
    if (!logarithmic) return (value / maximum) * 100;
    const minimum = Math.min(...values.filter((candidate) => candidate > 0));
    if (minimum === maximum) return 100;
    return 12 + ((Math.log10(value) - Math.log10(minimum)) /
        (Math.log10(maximum) - Math.log10(minimum))) * 88;
}

export function shouldUseLogarithmicBars(values: readonly number[]): boolean {
    const positive = values.filter((value) => value > 0);
    return positive.length > 1 && Math.max(...positive) / Math.min(...positive) > 1_000;
}

function formatRatio(value: number): string {
    if (value >= 1000 || value < 0.001) return value.toExponential(2);
    if (value >= 100) return value.toFixed(0);
    if (value >= 10) return value.toFixed(1).replace(/\.0$/, "");
    if (value >= 1) return value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
    return value.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
}

function formatNumber(value: number): string {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}
