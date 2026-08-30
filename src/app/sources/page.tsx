import type { Metadata } from "next";
import Link from "next/link";

import { astronomyRecords } from "@/data/astronomy";
import styles from "./sources.module.css";

export const metadata: Metadata = {
    title: "Data & Sources",
    description:
        "How ASTRA curates astronomy facts and distinguishes scientific data from compressed educational visualization.",
};

const primarySources = [
    {
        name: "NASA Science",
        role: "Solar System, missions, stars, nebulae, and educational context",
        url: "https://science.nasa.gov/",
    },
    {
        name: "NASA Jet Propulsion Laboratory",
        role: "Mission and Solar System dynamics references",
        url: "https://www.jpl.nasa.gov/",
    },
    {
        name: "NASA Exoplanet Archive",
        role: "Confirmed exoplanet and host-star parameters",
        url: "https://exoplanetarchive.ipac.caltech.edu/",
    },
    {
        name: "Event Horizon Telescope",
        role: "Sagittarius A* imaging and interpretation",
        url: "https://eventhorizontelescope.org/",
    },
    {
        name: "European Space Agency",
        role: "Gaia, Hubble, Webb, and stellar-cluster references",
        url: "https://www.esa.int/",
    },
    {
        name: "NASA / ESA Hubble",
        role: "Nebula and star-cluster observations",
        url: "https://science.nasa.gov/mission/hubble/",
    },
] as const;

export default function SourcesPage() {
    return (
        <main className={styles.page}>
            <header className={styles.header}>
                <Link className={styles.wordmark} href="/">
                    <span aria-hidden="true" /> ASTRA
                </Link>
                <nav aria-label="Sources page navigation">
                    <Link href="/">Home</Link>
                    <Link href="/explore" prefetch={false}>Explorer</Link>
                </nav>
            </header>

            <article className={styles.content}>
                <div className={styles.hero}>
                    <p className={styles.eyebrow}>Data methodology</p>
                    <h1>Scientific context, clearly separated from visualization.</h1>
                    <p>
                        ASTRA stores a curated core of astronomy facts locally. Standard object
                        information never depends on a live API, so the explorer remains fast,
                        predictable, and useful when external services are unavailable.
                    </p>
                    <div className={styles.recordCount}>
                        <strong>{astronomyRecords.length}</strong>
                        <span>source-aware astronomy records</span>
                    </div>
                </div>

                <section className={styles.method} aria-labelledby="method-title">
                    <div>
                        <p className={styles.sectionNumber}>01</p>
                        <h2 id="method-title">What the data means</h2>
                    </div>
                    <div className={styles.principles}>
                        <div>
                            <h3>Curated, not live</h3>
                            <p>Core facts are reviewed against authoritative sources and shipped with the application.</p>
                        </div>
                        <div>
                            <h3>Appropriate precision</h3>
                            <p>Rounded educational values are preferred where measurements vary or false precision would mislead.</p>
                        </div>
                        <div>
                            <h3>Visual scale is compressed</h3>
                            <p>Object sizes, distances, travel time, and population counts may be adjusted to make many scales navigable together.</p>
                        </div>
                        <div>
                            <h3>Color can be interpretive</h3>
                            <p>Telescope imagery may map non-visible wavelengths or enhance contrast. ASTRA’s procedural scenes are educational interpretations, not literal photographs.</p>
                        </div>
                    </div>
                </section>

                <section className={styles.organizations} aria-labelledby="organizations-title">
                    <div>
                        <p className={styles.sectionNumber}>02</p>
                        <h2 id="organizations-title">Primary organizations</h2>
                    </div>
                    <ul>
                        {primarySources.map((source) => (
                            <li key={source.url}>
                                <a
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`${source.name} (opens in a new tab)`}
                                >
                                    <span>
                                        <strong>{source.name}</strong>
                                        <small>{source.role}</small>
                                    </span>
                                    <span aria-hidden="true">↗</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </section>

                <aside className={styles.note}>
                    Individual explorer records expose their most relevant references through a
                    compact Sources disclosure. Those links are the provenance for the displayed
                    values; the 3D scene remains a separate visualization layer.
                </aside>
            </article>

            <footer className={styles.footer}>
                <span>ASTRA · Data & Sources</span>
                <Link href="/explore" prefetch={false}>Enter Explorer →</Link>
            </footer>
        </main>
    );
}
