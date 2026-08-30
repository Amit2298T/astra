import Link from "next/link";

import {
    explorerHref,
    type ExplorerEntryTarget,
} from "@/engine/navigation/ExplorerEntry";
import styles from "./LandingPage.module.css";

interface Destination {
    name: string;
    kicker: string;
    description: string;
    distance: string;
    target: ExplorerEntryTarget;
    visual: string;
}

const destinations: readonly Destination[] = [
    {
        name: "Solar System",
        kicker: "Our celestial home",
        description:
            "Orbit the Sun, meet the planets, and step outward from the one neighborhood we know firsthand.",
        distance: "8 planets · 1 star",
        target: "solar-system",
        visual: "solar",
    },
    {
        name: "Voyager 1",
        kicker: "The farthest emissary",
        description:
            "Follow a human-made traveler beyond the heliopause, still carrying Earth’s story into interstellar space.",
        distance: "Launched 1977",
        target: "voyager-1",
        visual: "voyager",
    },
    {
        name: "Alpha Centauri",
        kicker: "Our nearest stellar neighbor",
        description:
            "Cross the gulf to a three-star system and see how quickly familiar scales give way to light-years.",
        distance: "4.37 light-years",
        target: "alpha-centauri",
        visual: "alpha",
    },
    {
        name: "Milky Way",
        kicker: "A galaxy from within",
        description:
            "Pull back through a continuous change of scale until our solar neighborhood becomes one point in a spiral galaxy.",
        distance: "About 100,000 light-years wide",
        target: "milky-way",
        visual: "galaxy",
    },
    {
        name: "Sagittarius A*",
        kicker: "The heart of the galaxy",
        description:
            "Approach the compact radio source associated with the supermassive black hole at the Milky Way’s center.",
        distance: "About 26,000 light-years away",
        target: "sagittarius-a",
        visual: "blackHole",
    },
    {
        name: "Orion Nebula",
        kicker: "Stars in the making",
        description:
            "Enter a nearby stellar nursery and explore the luminous gas, dust, and young stars of Messier 42.",
        distance: "About 1,340 light-years away",
        target: "orion-nebula",
        visual: "nebula",
    },
];

const experiences = [
    ["01", "Explore", "Move freely through a spatial model built for curiosity."],
    ["02", "Observe", "Inspect worlds, spacecraft, stars, and galactic landmarks."],
    ["03", "Travel", "Choose a destination and watch distance become tangible."],
    ["04", "Learn", "Open concise context without leaving the scene."],
    ["05", "Change scale", "Move from local orbits to the structure of a galaxy."],
] as const;

export function LandingPage() {
    return (
        <main className={styles.page} id="top">
            <header className={styles.header}>
                <Link className={styles.wordmark} href="#top" aria-label="ASTRA home">
                    <span className={styles.brandMark} aria-hidden="true" />
                    ASTRA
                </Link>

                <nav className={styles.desktopNav} aria-label="Primary navigation">
                    <a href="#destinations">Destinations</a>
                    <a href="#experience">Experience</a>
                    <a href="#mission">Mission</a>
                    <Link className={styles.navCta} href={explorerHref()} prefetch={false}>
                        Open Explorer
                    </Link>
                </nav>

                <details className={styles.mobileNav}>
                    <summary>Menu</summary>
                    <nav aria-label="Mobile navigation">
                        <a href="#destinations">Destinations</a>
                        <a href="#experience">Experience</a>
                        <a href="#mission">Mission</a>
                        <Link href={explorerHref()} prefetch={false}>Open Explorer</Link>
                    </nav>
                </details>
            </header>

            <section className={styles.hero} aria-labelledby="hero-title">
                <div className={styles.heroGlow} aria-hidden="true" />
                <div className={styles.heroCopy}>
                    <p className={styles.eyebrow}>An interactive atlas of our cosmic address</p>
                    <h1 id="hero-title">Explore the Universe in 3D</h1>
                    <p className={styles.heroLead}>
                        From the orbit of Earth to the center of the Milky Way,
                        ASTRA turns impossible distance into a journey you can navigate.
                    </p>
                    <div className={styles.heroActions}>
                        <Link className={styles.primaryButton} href={explorerHref()} prefetch={false}>
                            Launch Explorer <span aria-hidden="true">↗</span>
                        </Link>
                        <Link
                            className={styles.secondaryButton}
                            href={explorerHref("solar-system")}
                            prefetch={false}
                        >
                            Explore Solar System
                        </Link>
                    </div>
                    <a className={styles.discoverLink} href="#destinations">
                        Discover the journey <span aria-hidden="true">↓</span>
                    </a>
                </div>

                <div className={styles.heroVisual} aria-hidden="true">
                    <div className={styles.orbitRingOne} />
                    <div className={styles.orbitRingTwo} />
                    <div className={styles.heroPlanet}>
                        <span className={styles.planetSurface} />
                        <span className={styles.planetClouds} />
                    </div>
                    <div className={styles.heroMoon} />
                    <span className={styles.coordinate}>03h 12m · +41° 19′</span>
                </div>
            </section>

            <section className={styles.intro}>
                <p className={styles.sectionIndex}>01 — Field notes</p>
                <div>
                    <h2>Your place in something larger.</h2>
                    <p>
                        Begin with recognizable worlds. Follow a spacecraft into the dark.
                        Then keep pulling back until the Sun is a quiet marker on one spiral arm.
                    </p>
                </div>
            </section>

            <section
                className={styles.destinationsSection}
                id="destinations"
                aria-labelledby="destinations-title"
            >
                <div className={styles.sectionHeading}>
                    <div>
                        <p className={styles.sectionIndex}>02 — Featured destinations</p>
                        <h2 id="destinations-title">Choose a point of departure.</h2>
                    </div>
                    <p>
                        Each route opens the explorer in its intended spatial context—local space,
                        the galactic overview, or a focused destination.
                    </p>
                </div>

                <div className={styles.destinationList}>
                    {destinations.map((destination, index) => (
                        <article className={styles.destination} key={destination.name}>
                            <div
                                className={`${styles.destinationVisual} ${styles[destination.visual]}`}
                                aria-hidden="true"
                            >
                                <span>{String(index + 1).padStart(2, "0")}</span>
                                <div />
                            </div>
                            <div className={styles.destinationCopy}>
                                <p className={styles.destinationKicker}>{destination.kicker}</p>
                                <h3>{destination.name}</h3>
                                <p>{destination.description}</p>
                                <div className={styles.destinationMeta}>
                                    <span>{destination.distance}</span>
                                    <Link href={explorerHref(destination.target)} prefetch={false}>
                                        Explore <span className={styles.srOnly}>{destination.name}</span>
                                        <span aria-hidden="true">↗</span>
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section className={styles.experienceSection} id="experience">
                <div className={styles.experienceIntro}>
                    <p className={styles.sectionIndex}>03 — The experience</p>
                    <h2>Not a slideshow. A place to move through.</h2>
                    <p>
                        ASTRA keeps the controls close and the information quiet until you ask for it.
                        The universe stays center stage.
                    </p>
                    <div className={styles.navigationVisual} aria-hidden="true">
                        <div className={styles.navigationReadout}>
                            <span>FREE ROAM</span>
                            <span>VECTOR 04.37 LY</span>
                        </div>
                        <svg viewBox="0 0 520 240" role="presentation">
                            <path
                                className={styles.navigationGrid}
                                d="M18 188 C112 126 152 204 235 142 S370 46 502 72"
                            />
                            <path
                                className={styles.navigationPath}
                                d="M18 188 C112 126 152 204 235 142 S370 46 502 72"
                            />
                            <circle cx="18" cy="188" r="4" />
                            <circle cx="235" cy="142" r="5" />
                            <circle cx="502" cy="72" r="7" />
                        </svg>
                        <span className={styles.navigationNodeOne}>ORBIT</span>
                        <span className={styles.navigationNodeTwo}>FOCUS</span>
                        <span className={styles.navigationNodeThree}>TRAVEL</span>
                    </div>
                </div>
                <ol className={styles.experienceList}>
                    {experiences.map(([number, title, description]) => (
                        <li key={number}>
                            <span>{number}</span>
                            <h3>{title}</h3>
                            <p>{description}</p>
                        </li>
                    ))}
                </ol>
            </section>

            <section className={styles.scaleSection} aria-labelledby="scale-title">
                <div className={styles.scaleCopy}>
                    <p className={styles.sectionIndex}>04 — A sense of scale</p>
                    <h2 id="scale-title">One continuous story, across impossible distances.</h2>
                    <p>
                        The shift from planetary space to galactic space is staged as a single visual
                        journey, so your changing point of view remains understandable.
                    </p>
                    <Link className={styles.textLink} href={explorerHref("milky-way")} prefetch={false}>
                        Make the transition <span aria-hidden="true">→</span>
                    </Link>
                    <Link className={styles.scaleLink} href="/scale">
                        Explore Cosmic Scale <span aria-hidden="true">→</span>
                    </Link>
                    <Link className={styles.compareLink} href="/compare">
                        Compare Worlds <span aria-hidden="true">→</span>
                    </Link>
                </div>
                <div className={styles.scaleTrack} aria-label="Scale progression">
                    <div><span>01</span><strong>Earth</strong><small>12,742 km</small></div>
                    <div><span>02</span><strong>Solar System</strong><small>Planetary neighborhood</small></div>
                    <div><span>03</span><strong>Local stars</strong><small>Measured in light-years</small></div>
                    <div><span>04</span><strong>Milky Way</strong><small>Galactic structure</small></div>
                </div>
            </section>

            <section className={styles.missionSection} id="mission">
                <div className={styles.missionSignal} aria-hidden="true">
                    <span />
                    <span />
                    <span />
                    <div>VGR 01</div>
                </div>
                <div className={styles.missionCopy}>
                    <p className={styles.sectionIndex}>05 — Mission profile</p>
                    <h2>Voyager 1: a message moving between the stars.</h2>
                    <p>
                        Launched in 1977, Voyager 1 became the first human-made object to enter
                        interstellar space. In ASTRA, its route is more than a fact—it is a direction
                        you can follow.
                    </p>
                    <dl>
                        <div><dt>Launch</dt><dd>September 5, 1977</dd></div>
                        <div><dt>Mission</dt><dd>Interstellar probe</dd></div>
                        <div><dt>Archive</dt><dd>The Golden Record</dd></div>
                    </dl>
                    <Link className={styles.primaryButton} href={explorerHref("voyager-1")} prefetch={false}>
                        Follow Voyager 1 <span aria-hidden="true">↗</span>
                    </Link>
                </div>
            </section>

            <aside className={styles.disclaimer} aria-label="Educational scale note">
                <span>Scale note</span>
                <p>
                    ASTRA is an educational visualization. Sizes, distances, motion, and travel time
                    are selectively compressed so very different cosmic scales can be explored in one
                    coherent experience.
                </p>
            </aside>

            <section className={styles.finalCta}>
                <p className={styles.eyebrow}>The next perspective is yours</p>
                <h2>The universe is ready. Start exploring.</h2>
                <Link className={styles.primaryButton} href={explorerHref()} prefetch={false}>
                    Launch Explorer <span aria-hidden="true">↗</span>
                </Link>
            </section>

            <footer className={styles.footer}>
                <Link className={styles.wordmark} href="#top">
                    <span className={styles.brandMark} aria-hidden="true" /> ASTRA
                </Link>
                <p>An interactive 3D universe for exploration and learning.</p>
                <nav aria-label="Footer navigation">
                    <Link href="/sources">Data & Sources</Link>
                    <Link href={explorerHref()} prefetch={false}>Enter Explorer</Link>
                </nav>
            </footer>
        </main>
    );
}
