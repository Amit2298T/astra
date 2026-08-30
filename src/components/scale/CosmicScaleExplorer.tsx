"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";

import { getAstronomyRecord } from "@/data/astronomy";
import {
    getScaleItems,
    scaleStops,
    type ScaleComparisonItem,
    type ScaleMode,
} from "@/data/astronomy/scale";
import {
    createLogScaleDomain,
    describeRelativeScale,
    formatRelativeScale,
    getLogScalePosition,
    getScaleLabelOffsets,
    getVisibleScaleStops,
} from "@/engine/scale/CosmicScale";
import styles from "./CosmicScaleExplorer.module.css";

type PositionedStyle = CSSProperties & {
    "--position": string;
    "--label-offset"?: string;
};

const DEFAULT_SELECTION: Record<ScaleMode, string> = {
    size: "earth-diameter",
    distance: "earth-to-moon",
};

const DEFAULT_REFERENCE: Record<ScaleMode, string> = {
    size: "earth-diameter",
    distance: "earth-to-sun",
};

export function CosmicScaleExplorer() {
    const [mode, setMode] = useState<ScaleMode>("size");
    const [selectedIds, setSelectedIds] = useState(DEFAULT_SELECTION);
    const [referenceIds, setReferenceIds] = useState(DEFAULT_REFERENCE);

    const items = getScaleItems(mode);
    const selected = findItem(items, selectedIds[mode]);
    const reference = findItem(items, referenceIds[mode]);
    const domain = createLogScaleDomain(items);
    const visibleStops = getVisibleScaleStops(scaleStops, domain);
    const labelOffsets = getScaleLabelOffsets(items, domain);
    const astronomyRecord = selected.astronomyRecordId
        ? getAstronomyRecord(selected.astronomyRecordId)
        : null;
    const sources = [
        ...(astronomyRecord?.sources ?? []),
        ...(selected.supplementalSources ?? []),
    ].filter(
        (source, index, allSources) =>
            allSources.findIndex((candidate) => candidate.url === source.url) === index
    );

    function changeMode(nextMode: ScaleMode) {
        setMode(nextMode);
    }

    function selectItem(id: string) {
        setSelectedIds((current) => ({ ...current, [mode]: id }));
    }

    function selectReference(id: string) {
        setReferenceIds((current) => ({ ...current, [mode]: id }));
    }

    return (
        <main className={styles.page}>
            <header className={styles.header}>
                <Link className={styles.wordmark} href="/">
                    <span aria-hidden="true" /> ASTRA
                </Link>
                <div className={styles.routeTitle}>Scale of the Universe</div>
                <nav aria-label="Scale page navigation">
                    <Link href="/">Back Home</Link>
                    <Link href="/explore" prefetch={false}>Launch Explorer ↗</Link>
                </nav>
            </header>

            <section className={styles.intro} aria-labelledby="scale-heading">
                <div>
                    <p className={styles.eyebrow}>A journey through magnitude</p>
                    <h1 id="scale-heading">See how quickly the universe outgrows intuition.</h1>
                </div>
                <div className={styles.introCopy}>
                    <p>
                        Move from familiar dimensions to planetary, stellar, and galactic scales.
                        Visual spacing uses logarithmic scale so many orders of magnitude can share one view.
                    </p>
                    <p>
                        Objects are symbolic; the labeled values carry the actual comparison.
                    </p>
                </div>
            </section>

            <section className={styles.experience} aria-label="Cosmic scale comparison">
                <div className={styles.controls}>
                    <div className={styles.modeToggle} role="group" aria-label="Comparison mode">
                        {(["size", "distance"] as const).map((option) => (
                            <button
                                key={option}
                                type="button"
                                aria-pressed={mode === option}
                                onClick={() => changeMode(option)}
                            >
                                {option === "size" ? "Size" : "Distance"}
                            </button>
                        ))}
                    </div>

                    <label className={styles.referenceControl}>
                        <span>Compare everything to</span>
                        <select
                            value={reference.id}
                            onChange={(event) => selectReference(event.target.value)}
                        >
                            {items.map((item) => (
                                <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                        </select>
                    </label>
                </div>

                <div className={styles.workspace}>
                    <div className={styles.trackRegion}>
                        <div className={styles.trackHeading}>
                            <div>
                                <span>{mode === "size" ? "Physical extent" : "Representative separation"}</span>
                                <strong>{items.length} selected scale stops</strong>
                            </div>
                            <span>Log₁₀ spacing</span>
                        </div>

                        <div
                            className={styles.track}
                            data-mode={mode}
                            aria-label={`${mode === "size" ? "Size" : "Distance"} scale items`}
                        >
                            <div className={styles.axis} aria-hidden="true" />

                            {visibleStops.map((stop) => (
                                <div
                                    className={styles.scaleStop}
                                    key={stop.label}
                                    style={{
                                        "--position": `${getLogScalePosition(stop.valueMeters, domain)}%`,
                                    } as PositionedStyle}
                                    aria-hidden="true"
                                >
                                    <span>{stop.label}</span>
                                </div>
                            ))}

                            {items.map((item, index) => (
                                <button
                                    className={styles.scaleItem}
                                    data-kind={item.visualKind}
                                    data-side={index % 2 === 0 ? "left" : "right"}
                                    aria-pressed={selected.id === item.id}
                                    key={item.id}
                                    onClick={() => selectItem(item.id)}
                                    style={{
                                        "--position": `${getLogScalePosition(item.numericValue, domain)}%`,
                                        "--label-offset": `${labelOffsets.get(item.id) ?? 0}px`,
                                    } as PositionedStyle}
                                >
                                    <span className={styles.itemCopy}>
                                        <strong>{item.name}</strong>
                                        <small>{item.displayValue}</small>
                                        <em>{formatRelativeScale(item.numericValue, reference.numericValue, reference.name)}</em>
                                    </span>
                                    <span className={styles.motif} aria-hidden="true">
                                        {item.visualKind === "human" && <span className={styles.humanFigure} />}
                                        {item.visualKind === "solarSystem" && <span className={styles.orbitFigure} />}
                                        {item.visualKind === "galaxy" && <span className={styles.galaxyFigure} />}
                                        {item.visualKind === "distance" && <span className={styles.distanceFigure} />}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <aside className={styles.detail} aria-live="polite">
                        <div className={styles.detailHeader}>
                            <span>{selected.category}</span>
                            <span>{mode === "size" ? "Size mode" : "Distance mode"}</span>
                        </div>
                        <h2>{selected.name}</h2>

                        <div className={styles.primaryMeasurement}>
                            <p className={styles.measurementLabel}>{selected.measurementLabel}</p>
                            <p className={styles.primaryValue}>{selected.displayValue}</p>
                        </div>

                        <div className={styles.relativeStatement}>
                            <span>Compared with {reference.name}</span>
                            <strong>{describeRelativeScale(selected, reference, mode)}</strong>
                        </div>

                        <div className={styles.supportingCopy}>
                            <p className={styles.explanation}>{selected.explanation}</p>
                            {astronomyRecord && (
                                <p className={styles.recordSummary}>{astronomyRecord.summary}</p>
                            )}
                        </div>

                        <button
                            className={styles.referenceButton}
                            type="button"
                            disabled={selected.id === reference.id}
                            onClick={() => selectReference(selected.id)}
                        >
                            {selected.id === reference.id
                                ? "Current reference"
                                : `Use ${selected.name} as reference`}
                        </button>

                        {sources.length > 0 ? (
                            <details className={styles.sources}>
                                <summary>Sources <span>{sources.length}</span></summary>
                                <ul>
                                    {sources.map((source) => (
                                        <li key={source.url}>
                                            <a
                                                href={source.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label={`${source.label}, ${source.organization} (opens in a new tab)`}
                                            >
                                                <span>{source.label}<small>{source.organization}</small></span>
                                                <span aria-hidden="true">↗</span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </details>
                        ) : (
                            <p className={styles.referenceNote}>
                                Illustrative human reference; no fixed astronomical measurement is implied.
                            </p>
                        )}
                    </aside>
                </div>
            </section>

            <footer className={styles.footer}>
                <p>
                    Representative extents are labeled where cosmic structures have no hard edge.
                    Read the full <Link href="/sources">data methodology</Link>.
                </p>
                <Link href="/explore" prefetch={false}>Open the spatial explorer →</Link>
            </footer>
        </main>
    );
}

function findItem(
    items: readonly ScaleComparisonItem[],
    id: string
): ScaleComparisonItem {
    return items.find((item) => item.id === id) ?? items[0];
}
