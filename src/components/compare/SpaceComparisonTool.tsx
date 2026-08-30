"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";

import {
    comparisonObjects,
    formatComparisonObjectType,
    type ComparisonMetric,
    type ComparisonObject,
} from "@/data/astronomy/comparison";
import {
    describeMetricComparison,
    getSharedMetrics,
    getVisualProportion,
    resolveObjects,
    shouldUseLogarithmicBars,
    type ComparisonUrlState,
} from "@/engine/comparison/SpaceComparison";
import { explorerHref } from "@/engine/navigation/ExplorerEntry";
import styles from "./SpaceComparisonTool.module.css";

interface SpaceComparisonToolProps {
    initialState: ComparisonUrlState;
}

type VisualStyle = CSSProperties & {
    "--visual-size"?: string;
    "--visual-width"?: string;
    "--comparison-count"?: string;
};

const MAX_OBJECTS = 4;

export function SpaceComparisonTool({ initialState }: SpaceComparisonToolProps) {
    const [selectedIds, setSelectedIds] = useState<readonly string[]>(initialState.objectIds);
    const [requestedMetricId, setRequestedMetricId] = useState(initialState.metricId);
    const [referenceState, setReferenceState] = useState(initialState.objectIds[0] ?? "");
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [replaceTargetId, setReplaceTargetId] = useState<string | null>(null);

    const selectedObjects = resolveObjects(selectedIds);
    const sharedMetrics = getSharedMetrics(selectedObjects);
    const activeMetric =
        sharedMetrics.find((metric) => metric.id === requestedMetricId) ??
        sharedMetrics[0] ??
        null;
    const reference =
        selectedObjects.find((object) => object.id === referenceState) ??
        selectedObjects[0] ??
        null;
    const categoryOptions = [...new Set(comparisonObjects.map((object) => object.objectType))];
    const normalizedSearch = search.trim().toLowerCase();
    const filteredObjects = comparisonObjects.filter((object) => {
        const matchesCategory = category === "all" || object.objectType === category;
        const matchesSearch =
            normalizedSearch.length === 0 ||
            object.name.toLowerCase().includes(normalizedSearch) ||
            object.category.toLowerCase().includes(normalizedSearch);
        return matchesCategory && matchesSearch;
    });

    useEffect(() => {
        const url = new URL(window.location.href);
        url.searchParams.set("objects", selectedIds.join(","));
        if (activeMetric) url.searchParams.set("metric", activeMetric.id);
        else url.searchParams.delete("metric");
        window.history.replaceState(null, "", `${url.pathname}${url.search}`);
    }, [activeMetric, selectedIds]);

    function chooseObject(objectId: string) {
        if (selectedIds.includes(objectId)) return;
        if (replaceTargetId) {
            setSelectedIds((current) =>
                current.map((id) => (id === replaceTargetId ? objectId : id))
            );
            if (referenceState === replaceTargetId) setReferenceState(objectId);
            setReplaceTargetId(null);
            return;
        }
        if (selectedIds.length >= MAX_OBJECTS) return;
        setSelectedIds((current) => [...current, objectId]);
    }

    function removeObject(objectId: string) {
        setSelectedIds((current) => current.filter((id) => id !== objectId));
        if (replaceTargetId === objectId) setReplaceTargetId(null);
    }

    return (
        <main className={styles.page}>
            <header className={styles.header}>
                <Link className={styles.wordmark} href="/"><span aria-hidden="true" /> ASTRA</Link>
                <div className={styles.routeTitle}>Space Comparison</div>
                <nav aria-label="Comparison page navigation">
                    <Link href="/">Back Home</Link>
                    <Link href="/scale">Cosmic Scale</Link>
                    <Link href="/explore" prefetch={false}>Launch Explorer ↗</Link>
                </nav>
            </header>

            <section className={styles.intro} aria-labelledby="comparison-heading">
                <p className={styles.eyebrow}>Deliberate scientific comparison</p>
                <h1 id="comparison-heading">Put worlds and cosmic structures side by side.</h1>
                <p>
                    Choose two to four objects. ASTRA shows only measurements they can meaningfully share,
                    using normalized local data rather than formatted-text calculations.
                </p>
            </section>

            <section className={styles.selector} aria-labelledby="selector-title">
                <div className={styles.sectionHeading}>
                    <div>
                        <span>01</span>
                        <h2 id="selector-title">Choose objects</h2>
                    </div>
                    <p>
                        {replaceTargetId
                            ? `Choose a replacement for ${selectedObjects.find((object) => object.id === replaceTargetId)?.name ?? "the selected object"}.`
                            : `${selectedIds.length} of ${MAX_OBJECTS} selected`}
                        {replaceTargetId && (
                            <button type="button" onClick={() => setReplaceTargetId(null)}>Cancel</button>
                        )}
                    </p>
                </div>

                <div className={styles.searchRow}>
                    <label>
                        <span>Search astronomy objects</span>
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search Earth, Proxima, Orion…"
                        />
                    </label>
                    <div className={styles.categoryFilters} aria-label="Filter by category">
                        <button type="button" aria-pressed={category === "all"} onClick={() => setCategory("all")}>All</button>
                        {categoryOptions.map((option) => (
                            <button
                                type="button"
                                key={option}
                                aria-pressed={category === option}
                                onClick={() => setCategory(option)}
                            >
                                {formatComparisonObjectType(option)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.objectResults} aria-live="polite">
                    {filteredObjects.map((object) => {
                        const isSelected = selectedIds.includes(object.id);
                        const disabled = isSelected || (selectedIds.length >= MAX_OBJECTS && !replaceTargetId);
                        return (
                            <button
                                type="button"
                                key={object.id}
                                disabled={disabled}
                                aria-pressed={isSelected}
                                onClick={() => chooseObject(object.id)}
                            >
                                <span className={styles.selectorMotif} data-kind={object.visualKind} aria-hidden="true" />
                                <span><strong>{object.name}</strong><small>{formatComparisonObjectType(object.objectType)}</small></span>
                                <em>{isSelected ? "Selected" : replaceTargetId ? "Replace" : "Add"}</em>
                            </button>
                        );
                    })}
                    {filteredObjects.length === 0 && <p className={styles.emptySearch}>No matching astronomy objects.</p>}
                </div>
            </section>

            <section className={styles.selectedSection} aria-labelledby="selected-title">
                <div className={styles.sectionHeading}>
                    <div><span>02</span><h2 id="selected-title">Selected objects</h2></div>
                    <p>First selection is the default reference.</p>
                </div>

                {selectedObjects.length === 0 ? (
                    <p className={styles.emptyState}>Choose at least two objects to begin comparing.</p>
                ) : (
                    <div className={styles.selectedGrid}>
                        {selectedObjects.map((object) => (
                            <article className={styles.objectCard} key={object.id} data-reference={reference?.id === object.id}>
                                <div className={styles.cardTopline}>
                                    <span>{formatComparisonObjectType(object.objectType)}</span>
                                    {reference?.id === object.id && <em>Reference</em>}
                                </div>
                                <div className={styles.cardIdentity}>
                                    <span className={styles.cardMotif} data-kind={object.visualKind} aria-hidden="true" />
                                    <div><h3>{object.name}</h3><p>{object.category}</p></div>
                                </div>
                                <p className={styles.cardSummary}>{object.summary}</p>
                                <div className={styles.cardActions}>
                                    <button type="button" disabled={reference?.id === object.id} onClick={() => setReferenceState(object.id)}>Set as reference</button>
                                    <button type="button" onClick={() => setReplaceTargetId(object.id)}>Change</button>
                                    <button type="button" onClick={() => removeObject(object.id)}>Remove</button>
                                </div>
                                <div className={styles.cardLinks}>
                                    {object.explorerTarget && (
                                        <Link href={explorerHref(object.explorerTarget)} prefetch={false}>View in Explorer ↗</Link>
                                    )}
                                    <details>
                                        <summary>Sources <span>{object.sources.length}</span></summary>
                                        <ul>
                                            {object.sources.map((source) => (
                                                <li key={source.url}>
                                                    <a href={source.url} target="_blank" rel="noopener noreferrer" aria-label={`${source.label}, ${source.organization} (opens in a new tab)`}>
                                                        {source.label} <span aria-hidden="true">↗</span>
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </details>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            <section className={styles.comparisonSection} aria-labelledby="comparison-title">
                <div className={styles.sectionHeading}>
                    <div><span>03</span><h2 id="comparison-title">Compare measurements</h2></div>
                    <p>Only metrics supported by every selected object appear.</p>
                </div>

                {selectedObjects.length < 2 ? (
                    <p className={styles.emptyState}>Choose at least two objects to begin comparing.</p>
                ) : sharedMetrics.length === 0 || !activeMetric || !reference ? (
                    <p className={styles.emptyState}>These objects have limited directly comparable quantitative data. Replace one object or choose a closer category match.</p>
                ) : (
                    <>
                        <div className={styles.metricControls} role="group" aria-label="Comparison metric">
                            {sharedMetrics.map((metric) => (
                                <button
                                    type="button"
                                    key={metric.id}
                                    aria-pressed={activeMetric.id === metric.id}
                                    onClick={() => setRequestedMetricId(metric.id)}
                                >
                                    {metric.label}
                                </button>
                            ))}
                        </div>

                        <ComparisonVisual objects={selectedObjects} reference={reference} metric={activeMetric} />

                        <div className={styles.matrixWrap}>
                            <table>
                                <caption>Shared scientific measurements for selected objects</caption>
                                <thead>
                                    <tr><th scope="col">Measurement</th>{selectedObjects.map((object) => <th scope="col" key={object.id}>{object.name}</th>)}</tr>
                                </thead>
                                <tbody>
                                    {sharedMetrics.slice(0, 8).map((metric) => (
                                        <tr key={metric.id} data-active={metric.id === activeMetric.id}>
                                            <th scope="row">{metric.label}</th>
                                            {selectedObjects.map((object) => {
                                                const measurement = object.values[metric.id];
                                                return <td key={object.id}><strong>{measurement?.displayValue}</strong>{measurement?.qualifier && <small>{measurement.qualifier}</small>}</td>;
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </section>

            <footer className={styles.footer}>
                <p>Want the guided journey across orders of magnitude?</p>
                <Link href="/scale">Explore cosmic scale →</Link>
            </footer>
        </main>
    );
}

function ComparisonVisual({
    objects,
    reference,
    metric,
}: {
    objects: readonly ComparisonObject[];
    reference: ComparisonObject;
    metric: ComparisonMetric;
}) {
    const measurements = objects.map((object) => object.values[metric.id]).filter((entry) => entry !== undefined);
    const values = measurements.map((entry) => entry.value);
    const logarithmic = metric.visual !== "diameter" && shouldUseLogarithmicBars(values);
    const usesMinimumMarker = metric.visual === "diameter" && values.some((entry) => entry / Math.max(...values) < 0.12);
    const usesMinimumBar = metric.visual !== "diameter" && !logarithmic &&
        values.some((entry) => (entry / Math.max(...values)) * 100 < 4);

    return (
        <div className={styles.visualBlock}>
            <div className={styles.visualHeader}>
                <div><span>{metric.category}</span><h3>{metric.label}</h3></div>
                <p>Reference: <strong>{reference.name}</strong></p>
            </div>
            <div
                className={styles.visualGrid}
                data-visual={metric.visual}
                style={{ "--comparison-count": String(objects.length) } as VisualStyle}
            >
                {objects.map((object) => {
                    const measurement = object.values[metric.id];
                    const referenceMeasurement = reference.values[metric.id];
                    if (!measurement || !referenceMeasurement) return null;
                    const proportion = getVisualProportion(measurement.value, values, logarithmic);
                    const visualSize = Math.max(18, proportion * 1.45);
                    return (
                        <article key={object.id} data-reference={object.id === reference.id}>
                            <div className={styles.visualStage}>
                                {metric.visual === "diameter" ? (
                                    <span
                                        className={styles.diameterMark}
                                        data-kind={object.visualKind}
                                        style={{ "--visual-size": `${visualSize}px` } as VisualStyle}
                                        aria-hidden="true"
                                    />
                                ) : (
                                    <span className={styles.barTrack} aria-hidden="true">
                                        <span
                                            className={styles.barFill}
                                            data-kind={metric.visual}
                                            style={{ "--visual-width": `${Math.max(4, proportion)}%` } as VisualStyle}
                                        />
                                    </span>
                                )}
                            </div>
                            <h4>{object.name}</h4>
                            <p className={styles.visualValue}>{measurement.displayValue}</p>
                            {measurement.qualifier && <p className={styles.qualifier}>{measurement.qualifier}</p>}
                            <p className={styles.comparisonSentence}>{describeMetricComparison(object, reference, metric)}</p>
                        </article>
                    );
                })}
            </div>
            {usesMinimumMarker && (
                <p className={styles.minimumMarkerNote}>Smallest marker enlarged for visibility.</p>
            )}
            {(logarithmic || usesMinimumMarker || usesMinimumBar) && (
                <p className={styles.visualDisclosure}>
                    {logarithmic
                        ? "Bar lengths use logarithmic scaling because the values span more than three orders of magnitude."
                        : usesMinimumMarker
                            ? "Numeric ratios are exact to the displayed precision; very small objects use a minimum visible marker."
                            : "Numeric ratios are exact to the displayed precision; very small values use a minimum visible bar."}
                </p>
            )}
        </div>
    );
}
