"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";

import type { MissionRecord } from "@/data/missions";
import {
    calculateMissionAge,
    calculateSignalDelay,
    formatSignalDelay,
    getCompressedDistancePosition,
} from "@/engine/mission/MissionMetrics";
import { explorerHref } from "@/engine/navigation/ExplorerEntry";

import styles from "./MissionControlDashboard.module.css";

interface MissionControlDashboardProps {
    mission: MissionRecord;
    canonicalSummary: string;
}

type DistanceStyle = CSSProperties & { "--distance-position": string };

export function MissionControlDashboard({
    mission,
    canonicalSummary,
}: MissionControlDashboardProps) {
    const [selectedMilestoneId, setSelectedMilestoneId] = useState(
        mission.milestones[0]?.id ?? ""
    );
    const [missionAge, setMissionAge] = useState(() =>
        calculateMissionAge(mission.launch.dateTime)
    );

    useEffect(() => {
        const interval = window.setInterval(() => {
            setMissionAge(calculateMissionAge(mission.launch.dateTime));
        }, 60 * 60 * 1000);
        return () => window.clearInterval(interval);
    }, [mission.launch.dateTime]);

    const selectedMilestone =
        mission.milestones.find((milestone) => milestone.id === selectedMilestoneId) ??
        mission.milestones[0] ??
        null;
    const signalDelay = mission.snapshot.distanceFromEarthAu
        ? calculateSignalDelay(mission.snapshot.distanceFromEarthAu)
        : null;
    const roundTripDelay = mission.snapshot.distanceFromEarthAu
        ? calculateSignalDelay(mission.snapshot.distanceFromEarthAu * 2)
        : null;
    const maximumDistance = Math.max(
        ...mission.distanceReferences.map((reference) => reference.valueAu),
        1
    );
    const powerPolyline = useMemo(
        () => createPowerPolyline(mission.powerHistory),
        [mission.powerHistory]
    );

    return (
        <main className={styles.page}>
            <header className={styles.header}>
                <Link className={styles.wordmark} href="/">
                    <span aria-hidden="true" /> ASTRA
                </Link>
                <span className={styles.routeTitle}>Mission Control</span>
                <nav aria-label="Mission Control navigation">
                    <Link href="/">Home</Link>
                    <Link href={explorerHref("voyager-1")} prefetch={false}>Launch Explorer</Link>
                    <Link href="/sources">Data &amp; Sources</Link>
                </nav>
            </header>

            <section className={styles.commandHero} aria-labelledby="mission-title">
                <div className={styles.commandCopy}>
                    <p className={styles.eyebrow}>Mission 01 · Deep-space operations</p>
                    <h1 id="mission-title">{mission.name}</h1>
                    <p className={styles.phase}>{mission.phase}</p>
                    <p className={styles.summary}>{canonicalSummary}</p>
                    <dl className={styles.commandFacts}>
                        <div><dt>Launched</dt><dd>{mission.launch.displayDate}</dd></div>
                        <div><dt>Vehicle</dt><dd>{mission.launch.vehicle}</dd></div>
                        <div><dt>Mission status</dt><dd>{mission.status} / {mission.phase}</dd></div>
                        <div><dt>Data snapshot</dt><dd>{mission.snapshot.displayDate}</dd></div>
                    </dl>
                    <div className={styles.heroActions}>
                        <Link href="/guide?object=voyager-1">
                            Ask about Voyager 1 <span aria-hidden="true">→</span>
                        </Link>
                        <Link href={explorerHref("voyager-1")} prefetch={false}>
                            View Voyager 1 in Explorer <span aria-hidden="true">↗</span>
                        </Link>
                        <a href="#timeline">Mission timeline <span aria-hidden="true">↓</span></a>
                    </div>
                </div>

                <SpacecraftDiagram />
            </section>

            <section className={styles.statusStrip} aria-label="Mission status snapshot">
                <StatusMetric label="Mission" value={mission.name} />
                <StatusMetric label="Phase" value="Interstellar" qualifier="Beyond heliopause" />
                <StatusMetric
                    label="Time since launch"
                    value={`${missionAge.years}y ${missionAge.months}m ${missionAge.days}d`}
                    qualifier="Calculated locally"
                />
                <StatusMetric
                    label="Distance class"
                    value="Interstellar space"
                    qualifier="Beyond the heliopause"
                />
                <StatusMetric
                    label="One-way signal"
                    value={signalDelay ? `~${formatSignalDelay(signalDelay)}` : "Unavailable"}
                    qualifier="Derived from snapshot"
                />
                <StatusMetric
                    label="Velocity"
                    value={mission.snapshot.heliocentricVelocityKmS
                        ? `~${mission.snapshot.heliocentricVelocityKmS} km/s`
                        : "Unavailable"}
                    qualifier="Relative to the Sun"
                />
            </section>

            <aside className={styles.staticDisclosure} aria-label="Static mission data disclosure">
                <span>Snapshot protocol</span>
                <p>Mission data shown here is a curated static snapshot, not live telemetry.</p>
                <time dateTime={mission.snapshot.capturedAt}>{mission.snapshot.displayDate}</time>
            </aside>

            <div className={styles.dashboardGrid}>
                <section className={`${styles.panel} ${styles.distancePanel}`} aria-labelledby="distance-title">
                    <SectionHeading index="01" title="Distance context" id="distance-title" />
                    <p className={styles.panelIntro}>
                        A compressed view from familiar planetary distances to Voyager 1’s snapshot position.
                    </p>
                    <ol className={styles.distanceScale} aria-label="Compressed distance references from the Sun">
                        <li className={styles.sunOrigin}><span aria-hidden="true" /><strong>Sun</strong><small>Origin</small></li>
                        {mission.distanceReferences.map((reference) => (
                            <li
                                key={reference.id}
                                data-emphasis={reference.emphasis}
                                style={{
                                    "--distance-position": `${getCompressedDistancePosition(reference.valueAu, maximumDistance)}%`,
                                } as DistanceStyle}
                            >
                                <span aria-hidden="true" />
                                <strong>{reference.label}</strong>
                                <small>{reference.displayValue}{reference.qualifier ? ` · ${reference.qualifier}` : ""}</small>
                            </li>
                        ))}
                    </ol>
                    <p className={styles.chartDisclosure}>Distance visualization is compressed using a logarithmic scale.</p>
                </section>

                <section className={`${styles.panel} ${styles.signalPanel}`} aria-labelledby="signal-title">
                    <SectionHeading index="02" title="Signal delay" id="signal-title" />
                    <div className={styles.signalReadout}>
                        <span>One-way signal time</span>
                        <strong>{signalDelay ? `~${formatSignalDelay(signalDelay)}` : "Unavailable"}</strong>
                        <small>Distance ÷ speed of light</small>
                    </div>
                    <dl className={styles.signalFacts}>
                        <div><dt>Round trip</dt><dd>{roundTripDelay ? `~${formatSignalDelay(roundTripDelay)}` : "Unavailable"}</dd></div>
                        <div><dt>Distance input</dt><dd>{mission.snapshot.distanceFromEarthAu ? `${mission.snapshot.distanceFromEarthAu} AU` : "Unavailable"}</dd></div>
                        <div><dt>Snapshot</dt><dd>{mission.snapshot.displayDate}</dd></div>
                    </dl>
                    <p>A command sent from Earth takes many hours to reach Voyager 1.</p>
                </section>
            </div>

            <section className={`${styles.panel} ${styles.timelinePanel}`} id="timeline" aria-labelledby="timeline-title">
                <SectionHeading index="03" title="Mission timeline" id="timeline-title" />
                <div className={styles.timelineLayout}>
                    <ol className={styles.timeline}>
                        {mission.milestones.map((milestone) => (
                            <li key={milestone.id}>
                                <button
                                    type="button"
                                    aria-pressed={selectedMilestone?.id === milestone.id}
                                    onClick={() => setSelectedMilestoneId(milestone.id)}
                                >
                                    <span>{milestone.yearLabel}</span>
                                    <strong>{milestone.title}</strong>
                                    <small>{milestone.category}</small>
                                </button>
                            </li>
                        ))}
                    </ol>
                    {selectedMilestone && (
                        <article className={styles.timelineDetail} aria-live="polite">
                            <div>
                                <span>{selectedMilestone.category}</span>
                                <time dateTime={selectedMilestone.date}>{selectedMilestone.displayDate}</time>
                            </div>
                            <h3>{selectedMilestone.title}</h3>
                            <p>{selectedMilestone.detail}</p>
                            {selectedMilestone.explorerTarget && (
                                <Link href={explorerHref(selectedMilestone.explorerTarget)} prefetch={false}>
                                    Open context in Explorer <span aria-hidden="true">↗</span>
                                </Link>
                            )}
                        </article>
                    )}
                </div>
            </section>

            <div className={styles.dashboardGrid}>
                <section className={`${styles.panel} ${styles.systemsPanel}`} aria-labelledby="systems-title">
                    <SectionHeading index="04" title="Spacecraft systems" id="systems-title" />
                    <p className={styles.panelIntro}>Educational operational context — not a live system-health display.</p>
                    <ul className={styles.systemList}>
                        {mission.systems.map((system) => (
                            <li key={system.id}>
                                <div><strong>{system.name}</strong><span>{system.state}</span></div>
                                <p>{system.context}</p>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className={`${styles.panel} ${styles.powerPanel}`} aria-labelledby="power-title">
                    <SectionHeading index="05" title="RTG power history" id="power-title" />
                    <p className={styles.panelIntro}>Supported historical points show the long decline in available electrical power.</p>
                    <svg className={styles.powerChart} viewBox="0 0 600 260" role="img" aria-labelledby="power-chart-title power-chart-desc">
                        <title id="power-chart-title">Voyager 1 RTG electrical power history</title>
                        <desc id="power-chart-desc">Power declines from approximately 470 watts after launch to 430 watts around Saturn and 225 watts in 2023.</desc>
                        <path d="M52 30 V210 H568" className={styles.chartAxes} />
                        <path d="M52 90 H568 M52 150 H568" className={styles.chartGrid} />
                        <polyline points={powerPolyline} className={styles.powerLine} />
                        {mission.powerHistory.map((point, index) => {
                            const coordinate = getPowerCoordinate(point, mission.powerHistory);
                            return (
                                <g key={point.year}>
                                    <circle cx={coordinate.x} cy={coordinate.y} r="5" />
                                    <text x={coordinate.x} y={coordinate.y - 17} textAnchor={index === 0 ? "start" : index === mission.powerHistory.length - 1 ? "end" : "middle"}>{point.watts} W</text>
                                    <text
                                        x={coordinate.x}
                                        y={index === 1 ? 247 : 232}
                                        textAnchor={index === 0 ? "start" : index === mission.powerHistory.length - 1 ? "end" : "middle"}
                                    >
                                        {point.year}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>
                    <dl className={styles.powerFacts}>
                        {mission.powerHistory.map((point) => (
                            <div key={point.year}><dt>{point.label}</dt><dd>{point.watts} W <small>{point.qualifier}</small></dd></div>
                        ))}
                    </dl>
                    <p className={styles.chartDisclosure}>Historical points only; intervening curve segments are illustrative.</p>
                </section>
            </div>

            <div className={styles.dashboardGrid}>
                <section className={`${styles.panel} ${styles.encountersPanel}`} aria-labelledby="encounters-title">
                    <SectionHeading index="06" title="Planetary encounters" id="encounters-title" />
                    <div className={styles.encounterList}>
                        {mission.encounters.map((encounter) => (
                            <article key={encounter.id}>
                                <span>{encounter.year}</span>
                                <h3>{encounter.name}</h3>
                                <time dateTime={encounter.date}>{encounter.displayDate}</time>
                                <p>{encounter.context}</p>
                                <small>{encounter.outcome}</small>
                            </article>
                        ))}
                    </div>
                </section>

                <section className={`${styles.panel} ${styles.trajectoryPanel}`} aria-labelledby="trajectory-title">
                    <SectionHeading index="07" title="Trajectory context" id="trajectory-title" />
                    <svg className={styles.trajectory} viewBox="0 0 600 300" role="img" aria-labelledby="trajectory-chart-title trajectory-chart-desc">
                        <title id="trajectory-chart-title">Schematic Voyager 1 trajectory</title>
                        <desc id="trajectory-chart-desc">Voyager 1 travels outward from the Sun, past Jupiter and Saturn, across the heliopause, and into interstellar space.</desc>
                        <path d="M74 232 C173 230 188 159 281 164 S383 112 536 58" />
                        <circle cx="74" cy="232" r="18" />
                        <circle cx="201" cy="179" r="8" />
                        <circle cx="313" cy="153" r="11" />
                        <circle cx="442" cy="95" r="7" />
                        <circle cx="536" cy="58" r="5" />
                        <text x="74" y="270" textAnchor="middle">Sun</text>
                        <text x="201" y="210" textAnchor="middle">Jupiter</text>
                        <text x="313" y="190" textAnchor="middle">Saturn</text>
                        <text x="442" y="72" textAnchor="middle">Heliopause</text>
                        <text x="536" y="35" textAnchor="end">Voyager 1</text>
                    </svg>
                    <p className={styles.chartDisclosure}>Schematic trajectory — not to scale.</p>
                </section>
            </div>

            <section className={`${styles.panel} ${styles.recordPanel}`} aria-labelledby="record-title">
                <div className={styles.recordMotif} aria-hidden="true"><span /></div>
                <div>
                    <p className={styles.eyebrow}>Earth archive · Interstellar message</p>
                    <h2 id="record-title">Golden Record</h2>
                    <strong>{mission.goldenRecord.purpose}</strong>
                    <p>{mission.goldenRecord.context}</p>
                    <a href={mission.sources[0]?.url} target="_blank" rel="noopener noreferrer">
                        NASA mission reference <span aria-hidden="true">↗</span>
                    </a>
                </div>
            </section>

            <section className={styles.sourcesSection} aria-labelledby="mission-sources-title">
                <details>
                    <summary id="mission-sources-title">Mission Sources <span>{mission.sources.length}</span></summary>
                    <ul>
                        {mission.sources.map((source) => (
                            <li key={source.url}>
                                <a href={source.url} target="_blank" rel="noopener noreferrer">
                                    <strong>{source.label}</strong>
                                    <span>{source.organization} · Accessed {source.accessedAt}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </details>
                <Link href="/sources">Read ASTRA’s data methodology <span aria-hidden="true">→</span></Link>
            </section>

            <footer className={styles.footer}>
                <div><span>Mission phase</span><strong>{mission.phase}</strong></div>
                <Link href={explorerHref("voyager-1")} prefetch={false}>View Voyager 1 in Explorer <span aria-hidden="true">↗</span></Link>
            </footer>
        </main>
    );
}

function StatusMetric({
    label,
    value,
    qualifier,
}: {
    label: string;
    value: string;
    qualifier?: string;
}) {
    return (
        <div>
            <span>{label}</span>
            <strong>{value}</strong>
            {qualifier && <small>{qualifier}</small>}
        </div>
    );
}

function SectionHeading({ index, title, id }: { index: string; title: string; id: string }) {
    return (
        <header className={styles.sectionHeading}>
            <span>{index}</span>
            <h2 id={id}>{title}</h2>
        </header>
    );
}

function SpacecraftDiagram() {
    return (
        <div className={styles.spacecraftVisual}>
            <div className={styles.visualReadout}><span>VGR 01</span><span>INTERSTELLAR VECTOR</span></div>
            <svg
                viewBox="0 0 640 500"
                role="img"
                aria-label="Voyager spacecraft schematic. Line-art diagram showing Voyager 1’s dish antenna, spacecraft bus, booms, and instrument structures."
            >
                <g className={styles.spacecraftLines}>
                    <ellipse cx="286" cy="218" rx="110" ry="42" transform="rotate(-18 286 218)" />
                    <path d="M183 249 L387 186 M201 260 L372 204" />
                    <path d="M286 218 L327 316 L383 333 L426 301 L394 245 Z" />
                    <path d="M386 282 L532 364 M410 299 L544 344" />
                    <path d="M325 316 L244 427 M347 324 L270 442" />
                    <path d="M397 246 L501 181 L574 185 M503 181 L539 133" />
                    <circle cx="286" cy="218" r="12" />
                    <circle cx="539" cy="133" r="8" />
                    <rect x="531" y="337" width="29" height="20" transform="rotate(-23 545 347)" />
                    <rect x="245" y="425" width="31" height="18" transform="rotate(-37 260 434)" />
                </g>
                <g className={styles.spacecraftLabels}>
                    <text x="125" y="151">HIGH-GAIN ANTENNA</text>
                    <path d="M240 177 L177 153" />
                    <text x="412" y="281">MISSION MODULE</text>
                    <path d="M393 288 L447 283" />
                    <text x="449" y="403">RTG BOOM</text>
                    <path d="M477 382 L487 397" />
                </g>
            </svg>
            <div className={styles.signalRings} aria-hidden="true"><span /><span /><span /></div>
        </div>
    );
}

function createPowerPolyline(points: MissionRecord["powerHistory"]): string {
    return points.map((point) => {
        const coordinate = getPowerCoordinate(point, points);
        return `${coordinate.x},${coordinate.y}`;
    }).join(" ");
}

function getPowerCoordinate(
    point: MissionRecord["powerHistory"][number],
    points: MissionRecord["powerHistory"]
) {
    const years = points.map((entry) => entry.year);
    const watts = points.map((entry) => entry.watts);
    const minimumYear = Math.min(...years);
    const maximumYear = Math.max(...years);
    const minimumWatts = Math.min(...watts) - 25;
    const maximumWatts = Math.max(...watts) + 25;
    return {
        x: 52 + ((point.year - minimumYear) / Math.max(maximumYear - minimumYear, 1)) * 516,
        y: 30 + ((maximumWatts - point.watts) / Math.max(maximumWatts - minimumWatts, 1)) * 180,
    };
}
