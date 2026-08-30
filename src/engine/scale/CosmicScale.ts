import type {
    ScaleComparisonItem,
    ScaleMode,
    ScaleStop,
} from "@/data/astronomy/scale";

export interface LogScaleDomain {
    minLog: number;
    maxLog: number;
}

export function createLogScaleDomain(
    items: readonly ScaleComparisonItem[]
): LogScaleDomain {
    const logs = items.map((item) => Math.log10(item.numericValue));
    return {
        minLog: Math.floor(Math.min(...logs)),
        maxLog: Math.ceil(Math.max(...logs)),
    };
}

export function getLogScalePosition(
    valueMeters: number,
    domain: LogScaleDomain
): number {
    const span = domain.maxLog - domain.minLog;
    if (span === 0) return 50;
    return ((Math.log10(valueMeters) - domain.minLog) / span) * 100;
}

export function getVisibleScaleStops(
    stops: readonly ScaleStop[],
    domain: LogScaleDomain
): readonly ScaleStop[] {
    const minimum = 10 ** domain.minLog;
    const maximum = 10 ** domain.maxLog;
    return stops.filter(
        (stop) => stop.valueMeters >= minimum && stop.valueMeters <= maximum
    );
}

export function getScaleLabelOffsets(
    items: readonly ScaleComparisonItem[],
    domain: LogScaleDomain,
    collisionThresholdPercent = 3.2
): ReadonlyMap<string, number> {
    const sortedItems = [...items].sort(
        (left, right) =>
            getLogScalePosition(left.numericValue, domain) -
            getLogScalePosition(right.numericValue, domain)
    );
    const offsets = new Map<string, number>();
    let cluster: ScaleComparisonItem[] = [];

    function commitCluster() {
        const center = (cluster.length - 1) / 2;
        cluster.forEach((item, index) => {
            offsets.set(item.id, (index - center) * 44);
        });
    }

    for (const item of sortedItems) {
        const previous = cluster.at(-1);
        const isNearby = previous
            ? getLogScalePosition(item.numericValue, domain) -
                  getLogScalePosition(previous.numericValue, domain) <
              collisionThresholdPercent
            : false;

        if (!isNearby && cluster.length > 0) {
            commitCluster();
            cluster = [];
        }

        cluster.push(item);
    }

    if (cluster.length > 0) commitCluster();
    return offsets;
}

export function formatRelativeScale(
    valueMeters: number,
    referenceMeters: number,
    referenceName: string
): string {
    const ratio = valueMeters / referenceMeters;

    if (Math.abs(ratio - 1) < 0.005) {
        return `1× ${referenceName}`;
    }

    if (ratio >= 1) {
        return `${formatRatio(ratio)}× ${referenceName}`;
    }

    return `${formatRatio(ratio)}× ${referenceName}`;
}

export function describeRelativeScale(
    item: ScaleComparisonItem,
    reference: ScaleComparisonItem,
    mode: ScaleMode
): string {
    const ratio = item.numericValue / reference.numericValue;

    if (Math.abs(ratio - 1) < 0.005) {
        return `${item.name} is the current comparison reference.`;
    }

    if (mode === "distance") {
        if (ratio > 1) {
            return `${item.name} is about ${formatRatio(ratio)}× farther than ${reference.name}.`;
        }

        return `${item.name} is about ${formatRatio(1 / ratio)}× shorter than ${reference.name}.`;
    }

    if (ratio > 1) {
        const comparisonWord = isDiameterMeasurement(item) ? "wider" : "larger";
        return `${item.name} is about ${formatRatio(ratio)}× ${comparisonWord} than ${reference.name}.`;
    }

    const comparisonPhrase = isDiameterMeasurement(item)
        ? "as wide as"
        : "the scale of";
    return `${item.name} is about ${formatRatio(ratio)}× ${comparisonPhrase} ${reference.name}.`;
}

function isDiameterMeasurement(item: ScaleComparisonItem): boolean {
    return /diameter|height/i.test(item.measurementLabel);
}

function formatRatio(value: number): string {
    if (value >= 1000) return formatScientificRatio(value);
    if (value >= 100) return value.toFixed(0);
    if (value >= 10) return value.toFixed(1).replace(/\.0$/, "");
    if (value >= 1) return value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
    if (value >= 0.01) return value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
    return formatScientificRatio(value);
}

function formatScientificRatio(value: number): string {
    const [coefficient, exponent] = value.toExponential(1).split("e");
    return `${coefficient} × 10${toSuperscript(Number(exponent))}`;
}

function toSuperscript(value: number): string {
    const superscriptDigits: Record<string, string> = {
        "-": "⁻",
        "0": "⁰",
        "1": "¹",
        "2": "²",
        "3": "³",
        "4": "⁴",
        "5": "⁵",
        "6": "⁶",
        "7": "⁷",
        "8": "⁸",
        "9": "⁹",
    };

    return String(value)
        .split("")
        .map((digit) => superscriptDigits[digit])
        .join("");
}
