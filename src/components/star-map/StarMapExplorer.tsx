"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
    constellations,
    constellationsById,
    starMapStars,
    starsById,
    type Hemisphere,
    type StarMapStar,
    type ViewingSeason,
} from "@/data/starmap";
import styles from "./StarMapExplorer.module.css";

const WIDTH = 1200;
const HEIGHT = 600;
const ALL = "All" as const;
type HemisphereFilter = Hemisphere | typeof ALL;
type SeasonFilter = ViewingSeason | typeof ALL;

interface StarLabelPlacement {
    dx: number;
    dy: number;
    anchor?: "start" | "middle" | "end";
}

const defaultLabelPlacement: StarLabelPlacement = { dx: 10, dy: 4 };
const orionLabelPlacements: Readonly<Record<string, StarLabelPlacement>> = {
    betelgeuse: { dx: -8, dy: -8, anchor: "end" },
    bellatrix: { dx: 8, dy: -8, anchor: "start" },
    mintaka: { dx: 8, dy: 10, anchor: "start" },
    alnilam: { dx: 0, dy: 19, anchor: "middle" },
    alnitak: { dx: -8, dy: 28, anchor: "end" },
    rigel: { dx: 8, dy: 12, anchor: "start" },
    saiph: { dx: -8, dy: 12, anchor: "end" },
};

interface StarMapExplorerProps {
    initialConstellationId: string | null;
    initialStarId: string | null;
}

function project(raHours: number, decDegrees: number) {
    const longitude = ((12 - raHours) * 15 * Math.PI) / 180;
    const latitude = (decDegrees * Math.PI) / 180;
    const denominator = Math.sqrt(1 + Math.cos(latitude) * Math.cos(longitude / 2));
    const hammerX = (2 * Math.SQRT2 * Math.cos(latitude) * Math.sin(longitude / 2)) / denominator;
    const hammerY = (Math.SQRT2 * Math.sin(latitude)) / denominator;
    return {
        x: WIDTH / 2 + (hammerX / (4 * Math.SQRT2)) * WIDTH,
        y: HEIGHT / 2 - (hammerY / (2 * Math.SQRT2)) * HEIGHT,
    };
}

function coordinatePath(points: readonly { x: number; y: number }[]) {
    return points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" ");
}

function markerRadius(magnitude: number) {
    return Math.max(2.4, Math.min(6.6, 6.25 - magnitude * 0.88));
}

function spectralColor(spectralClass?: string) {
    switch (spectralClass?.charAt(0).toUpperCase()) {
        case "O": return "#dce9ff";
        case "B": return "#e2ebff";
        case "A": return "#f3f5ff";
        case "F": return "#fff8e9";
        case "G": return "#fff2d0";
        case "K": return "#ffd9ad";
        case "M": return "#ffc0a3";
        default: return "#f8f4e9";
    }
}

function formatRa(raHours: number) {
    const hours = Math.floor(raHours);
    const minutes = Math.round((raHours - hours) * 60);
    return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

function formatDec(decDegrees: number) {
    return `${decDegrees >= 0 ? "+" : "−"}${Math.abs(decDegrees).toFixed(1)}°`;
}

function updateUrl(constellationId: string | null, starId: string | null) {
    const params = new URLSearchParams();
    if (constellationId) params.set("constellation", constellationId);
    if (starId) params.set("star", starId);
    const query = params.toString();
    window.history.replaceState(null, "", query ? `/star-map?${query}` : "/star-map");
}

export function StarMapExplorer({ initialConstellationId, initialStarId }: StarMapExplorerProps) {
    const [search, setSearch] = useState("");
    const [hemisphere, setHemisphere] = useState<HemisphereFilter>(ALL);
    const [season, setSeason] = useState<SeasonFilter>(ALL);
    const [selectedConstellationId, setSelectedConstellationId] = useState(initialConstellationId);
    const [selectedStarId, setSelectedStarId] = useState(initialStarId);
    const [showLines, setShowLines] = useState(true);
    const [showLabels, setShowLabels] = useState(true);
    const [showGrid, setShowGrid] = useState(true);

    const selectedConstellation = selectedConstellationId
        ? constellationsById.get(selectedConstellationId) ?? null
        : null;
    const filteredConstellations = useMemo(() => {
        const needle = search.trim().toLowerCase();
        return constellations.filter((constellation) =>
            (hemisphere === ALL || constellation.hemisphere === hemisphere) &&
            (season === ALL || constellation.season === season) &&
            (!needle || constellation.name.toLowerCase().includes(needle) ||
                constellation.abbreviation.toLowerCase().includes(needle))
        );
    }, [hemisphere, search, season]);

    const visibleIds = useMemo(
        () => new Set(filteredConstellations.map((constellation) => constellation.id)),
        [filteredConstellations]
    );

    const focusTransform = useMemo(() => {
        if (!selectedConstellation) return "translate(0 0) scale(1)";
        const positions = selectedConstellation.starIds
            .map((id) => starsById.get(id))
            .filter((star): star is StarMapStar => Boolean(star))
            .map((star) => project(star.raHours, star.decDegrees));
        const xs = positions.map((position) => position.x);
        const ys = positions.map((position) => position.y);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);
        const scale = Math.min(2.85, WIDTH / (maxX - minX + 220), HEIGHT / (maxY - minY + 170));
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        return `translate(${WIDTH * 0.53} ${HEIGHT / 2}) scale(${scale}) translate(${-centerX} ${-centerY})`;
    }, [selectedConstellation]);

    function selectConstellation(id: string) {
        setSelectedConstellationId(id);
        setSelectedStarId(null);
        updateUrl(id, null);
    }

    function selectStar(star: StarMapStar) {
        setSelectedConstellationId(star.constellationId);
        setSelectedStarId(star.id);
        updateUrl(star.constellationId, star.id);
    }

    function resetSky() {
        setSearch("");
        setHemisphere(ALL);
        setSeason(ALL);
        setSelectedConstellationId(null);
        setSelectedStarId(null);
        updateUrl(null, null);
    }

    function changeHemisphere(value: HemisphereFilter) {
        setHemisphere(value);
        if (selectedConstellation && value !== ALL && selectedConstellation.hemisphere !== value) {
            setSelectedConstellationId(null);
            setSelectedStarId(null);
            updateUrl(null, null);
        }
    }

    function changeSeason(value: SeasonFilter) {
        setSeason(value);
        if (selectedConstellation && value !== ALL && selectedConstellation.season !== value) {
            setSelectedConstellationId(null);
            setSelectedStarId(null);
            updateUrl(null, null);
        }
    }

    return (
        <main className={styles.page}>
            <header className={styles.header}>
                <Link className={styles.wordmark} href="/"><span aria-hidden="true" /> ASTRA</Link>
                <div className={styles.titleBlock}>
                    <p>Celestial atlas · J2000 equatorial coordinates</p>
                    <h1>Star Map</h1>
                </div>
                <nav aria-label="Star map navigation">
                    <Link href="/sources">Sources</Link>
                    <Link href="/explore" prefetch={false}>3D Explorer</Link>
                </nav>
            </header>

            <section className={styles.workspace}>
                <aside className={styles.selector} aria-label="Constellation controls">
                    <div className={styles.selectorHeading}>
                        <div><span>01</span><h2>Constellations</h2></div>
                        <button type="button" onClick={resetSky}>Reset Sky</button>
                    </div>
                    <label className={styles.searchLabel}>
                        <span>Search</span>
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Name or abbreviation"
                        />
                    </label>
                    <div className={styles.filterGrid}>
                        <label>Hemisphere
                            <select value={hemisphere} onChange={(event) => changeHemisphere(event.target.value as HemisphereFilter)}>
                                <option>All</option><option>Northern</option><option>Southern</option>
                            </select>
                        </label>
                        <label>Season <small>N. Hemisphere</small>
                            <select value={season} onChange={(event) => changeSeason(event.target.value as SeasonFilter)}>
                                <option>All</option><option>Winter</option><option>Spring</option><option>Summer</option><option>Autumn</option>
                            </select>
                        </label>
                    </div>
                    <div className={styles.constellationList} aria-live="polite">
                        {filteredConstellations.map((constellation) => (
                            <button
                                type="button"
                                key={constellation.id}
                                className={selectedConstellationId === constellation.id ? styles.activeConstellation : ""}
                                onClick={() => selectConstellation(constellation.id)}
                                aria-pressed={selectedConstellationId === constellation.id}
                            >
                                <span>{constellation.name}<small>{constellation.hemisphere} · {constellation.season}</small></span>
                                <b>{constellation.abbreviation}</b>
                            </button>
                        ))}
                        {filteredConstellations.length === 0 && <p className={styles.empty}>No constellations match.</p>}
                    </div>
                </aside>

                <div className={styles.mapColumn}>
                    <div className={styles.mapToolbar} aria-label="Map display options">
                        <span>{selectedConstellation ? `Focused · ${selectedConstellation.name}` : `${filteredConstellations.length} constellations · All sky`}</span>
                        <div>
                            <Toggle label="Lines" checked={showLines} onChange={setShowLines} />
                            <Toggle label="Labels" checked={showLabels} onChange={setShowLabels} />
                            <Toggle label="Grid" checked={showGrid} onChange={setShowGrid} />
                        </div>
                    </div>
                    <div className={styles.mapFrame}>
                        <svg
                            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                            role="img"
                            aria-label="Curated full-sky constellation map"
                            aria-describedby="sky-description"
                        >
                            <desc id="sky-description">Stars are positioned from right ascension and declination. Selectable stars and text summaries provide a non-visual equivalent to the plotted constellation connections.</desc>
                            <defs>
                                <radialGradient id="sky-glow"><stop offset="0" stopColor="#17203a" /><stop offset="1" stopColor="#070a12" /></radialGradient>
                                <filter id="star-glow" x="-200%" y="-200%" width="400%" height="400%"><feGaussianBlur stdDeviation="2" /></filter>
                                <clipPath id="sky-clip"><rect width={WIDTH} height={HEIGHT} rx="10" /></clipPath>
                            </defs>
                            <rect width={WIDTH} height={HEIGHT} rx="10" fill="url(#sky-glow)" />
                            <g clipPath="url(#sky-clip)">
                                {showGrid && <SkyGrid />}
                                <g className={styles.celestialLayer} transform={focusTransform}>
                                    {constellations.map((constellation) => {
                                        const visible = visibleIds.has(constellation.id);
                                        const selected = selectedConstellationId === constellation.id;
                                        const dimmed = Boolean(selectedConstellationId) && !selected;
                                        const points = constellation.starIds.map((id) => starsById.get(id)).filter((star): star is StarMapStar => Boolean(star));
                                        const center = points.reduce((sum, star) => {
                                            const point = project(star.raHours, star.decDegrees);
                                            return { x: sum.x + point.x / points.length, y: sum.y + point.y / points.length };
                                        }, { x: 0, y: 0 });
                                        const projectedPoints = points.map((star) => project(star.raHours, star.decDegrees));
                                        const lowestPoint = Math.max(...projectedPoints.map((point) => point.y));
                                        const [offsetX, offsetY] = constellation.labelOffset ?? [0, -14];
                                        const titleX = selected && constellation.id === "orion" ? center.x : center.x + offsetX;
                                        const titleY = selected && constellation.id === "orion" ? lowestPoint + 24 : center.y + offsetY;
                                        return (
                                            <g key={constellation.id} className={`${styles.constellation} ${selected ? styles.selected : ""} ${dimmed ? styles.dimmed : ""} ${visible ? "" : styles.hidden}`}>
                                                {showLines && constellation.lineSegments.map((line) => {
                                                    const from = starsById.get(line.from);
                                                    const to = starsById.get(line.to);
                                                    if (!from || !to) return null;
                                                    const a = project(from.raHours, from.decDegrees);
                                                    const b = project(to.raHours, to.decDegrees);
                                                    return <line key={`${line.from}-${line.to}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} vectorEffect="non-scaling-stroke" />;
                                                })}
                                                {showLabels && <text className={styles.constellationLabel} x={titleX} y={titleY}>{constellation.name.toUpperCase()}</text>}
                                            </g>
                                        );
                                    })}
                                    {starMapStars.map((star) => {
                                        const point = project(star.raHours, star.decDegrees);
                                        const constellationVisible = visibleIds.has(star.constellationId);
                                        const inFocus = !selectedConstellationId || star.constellationId === selectedConstellationId;
                                        const active = selectedStarId === star.id;
                                        const radius = markerRadius(star.magnitude);
                                        const placement = star.constellationId === "orion"
                                            ? orionLabelPlacements[star.id] ?? defaultLabelPlacement
                                            : defaultLabelPlacement;
                                        const labelClass = active
                                            ? styles.selectedStarLabel
                                            : star.magnitude <= 2.2
                                                ? styles.majorStarLabel
                                                : styles.secondaryStarLabel;
                                        return (
                                            <g
                                                key={star.id}
                                                role="button"
                                                tabIndex={constellationVisible && inFocus ? 0 : -1}
                                                aria-label={`${star.name}, magnitude ${star.magnitude}, ${formatRa(star.raHours)} right ascension, ${formatDec(star.decDegrees)} declination`}
                                                aria-pressed={active}
                                                className={`${styles.star} ${constellationVisible ? "" : styles.hidden} ${inFocus ? "" : styles.dimmed} ${active ? styles.activeStar : ""}`}
                                                transform={`translate(${point.x} ${point.y})`}
                                                onClick={() => selectStar(star)}
                                                onKeyDown={(event) => {
                                                    if (event.key === "Enter" || event.key === " ") {
                                                        event.preventDefault();
                                                        selectStar(star);
                                                    }
                                                }}
                                            >
                                                <circle className={styles.starGlow} r={radius * 2.3} fill={spectralColor(star.spectralClass)} />
                                                <circle r={active ? radius * 1.35 : radius} fill={spectralColor(star.spectralClass)} />
                                                {selectedConstellationId === star.constellationId && (
                                                    <text
                                                        className={labelClass}
                                                        x={placement.dx}
                                                        y={placement.dy}
                                                        textAnchor={placement.anchor ?? "start"}
                                                    >
                                                        {star.name}
                                                    </text>
                                                )}
                                            </g>
                                        );
                                    })}
                                </g>
                            </g>
                        </svg>
                        <div className={styles.orientation} aria-hidden="true"><span>NCP</span><i /><span>SCP</span></div>
                        <p className={styles.mapNote}>RA increases ← · Declination +90° to −90°</p>
                    </div>
                    <aside className={styles.distanceNote} aria-label="Important constellation distance note">
                        <strong>Pattern, not proximity</strong>
                        <p>Constellation patterns are apparent alignments as seen from Earth; the stars are generally at very different physical distances.</p>
                    </aside>
                </div>

                <InfoPanel constellationId={selectedConstellationId} starId={selectedStarId} onSelectStar={selectStar} />
            </section>
        </main>
    );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
    return <label className={styles.toggle}><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><span aria-hidden="true" />{label}</label>;
}

function SkyGrid() {
    const declinations = [-60, -30, 0, 30, 60];
    const rightAscensions = [0, 4, 8, 12, 16, 20];
    return (
        <g className={styles.grid} aria-hidden="true">
            <ellipse cx={WIDTH / 2} cy={HEIGHT / 2} rx={WIDTH / 2 - 1} ry={HEIGHT / 2 - 1} />
            {declinations.map((dec) => (
                <path
                    key={`d${dec}`}
                    className={dec === 0 ? styles.equator : undefined}
                    d={coordinatePath(Array.from({ length: 49 }, (_, index) => project(24 - index / 2, dec)))}
                />
            ))}
            {rightAscensions.map((ra) => (
                <path
                    key={`r${ra}`}
                    d={coordinatePath(Array.from({ length: 37 }, (_, index) => project(ra, -90 + index * 5)))}
                />
            ))}
            {rightAscensions.map((ra) => {
                const label = project(ra, 0);
                return <text key={`label${ra}`} x={label.x + 6} y={label.y - 8}>{ra}h</text>;
            })}
            <text x="13" y={HEIGHT / 2 - 9}>CELESTIAL EQUATOR · DEC 0°</text>
            <text x="13" y="44">NORTH CELESTIAL POLE · +90°</text>
            <text x="13" y={HEIGHT - 16}>SOUTH CELESTIAL POLE · −90°</text>
        </g>
    );
}

function InfoPanel({ constellationId, starId, onSelectStar }: { constellationId: string | null; starId: string | null; onSelectStar: (star: StarMapStar) => void }) {
    const constellation = constellationId ? constellationsById.get(constellationId) ?? null : null;
    const selectedStar = starId ? starsById.get(starId) ?? null : null;

    if (selectedStar && constellation) {
        return (
            <aside className={styles.infoPanel} aria-live="polite">
                <p className={styles.panelIndex}>03 · Selected star</p>
                <div className={styles.panelTitle}><div><span>{constellation.name}</span><h2>{selectedStar.name}</h2></div><i style={{ background: spectralColor(selectedStar.spectralClass) }} /></div>
                <p className={styles.description}>{selectedStar.note}</p>
                <dl className={styles.facts}>
                    <div><dt>Apparent magnitude</dt><dd>{selectedStar.magnitude.toFixed(2)}</dd></div>
                    {selectedStar.distanceLy && <div><dt>Approx. distance</dt><dd>{selectedStar.distanceLy.toLocaleString()} ly</dd></div>}
                    {selectedStar.spectralClass && <div><dt>Spectral class</dt><dd>{selectedStar.spectralClass}</dd></div>}
                    <div><dt>Coordinates</dt><dd>{formatRa(selectedStar.raHours)} · {formatDec(selectedStar.decDegrees)}</dd></div>
                </dl>
                <details className={styles.sources}>
                    <summary>Sources</summary>
                    <ul>{selectedStar.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.label} ↗</a><small>{source.organization}</small></li>)}</ul>
                </details>
                <Link className={styles.guideLink} href={`/guide?star=${selectedStar.id}`}>
                    Ask AI Guide <span aria-hidden="true">→</span>
                </Link>
            </aside>
        );
    }

    if (constellation) {
        const stars = constellation.starIds.map((id) => starsById.get(id)).filter((star): star is StarMapStar => Boolean(star));
        return (
            <aside className={styles.infoPanel} aria-live="polite">
                <p className={styles.panelIndex}>03 · Constellation</p>
                <div className={styles.panelTitle}><div><span>{constellation.abbreviation}</span><h2>{constellation.name}</h2></div></div>
                <div className={styles.badges}><span>{constellation.hemisphere}</span><span>Best in {constellation.season.toLowerCase()}*</span></div>
                <p className={styles.description}>{constellation.description}</p>
                {constellation.visibilityNotes && <p className={styles.secondary}>{constellation.visibilityNotes}</p>}
                {constellation.mythologySummary && <div className={styles.mythology}><span>Sky lore</span><p>{constellation.mythologySummary}</p></div>}
                <div className={styles.majorStars}><h3>Major stars</h3><ul>{stars.map((star) => <li key={star.id}><button type="button" onClick={() => onSelectStar(star)}><span>{star.name}</span><small>mag {star.magnitude.toFixed(2)}</small></button></li>)}</ul></div>
                <p className={styles.seasonNote}>* Broad Northern Hemisphere viewing guidance.</p>
                <Link className={styles.guideLink} href={`/guide?constellation=${constellation.id}`}>
                    Ask AI Guide <span aria-hidden="true">→</span>
                </Link>
            </aside>
        );
    }

    return (
        <aside className={styles.infoPanel}>
            <p className={styles.panelIndex}>03 · Orientation</p>
            <h2>The celestial sphere</h2>
            <p className={styles.description}>This full-sky atlas unwraps the sky into right ascension and declination—the celestial equivalents of longitude and latitude.</p>
            <dl className={styles.facts}>
                <div><dt>Horizontal axis</dt><dd>Right ascension</dd></div>
                <div><dt>Vertical axis</dt><dd>Declination</dd></div>
                <div><dt>Reference epoch</dt><dd>J2000</dd></div>
            </dl>
            <p className={styles.secondary}>Choose a constellation to focus the map, then select any highlighted star for physical details and source links.</p>
        </aside>
    );
}
