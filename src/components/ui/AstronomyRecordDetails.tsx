import Link from "next/link";

import type { AstronomyRecord } from "@/data/astronomy";
import styles from "./AstronomyRecordDetails.module.css";

type AstronomyDetailsTone = "neutral" | "galactic" | "warm" | "nebula" | "cluster";

interface AstronomyRecordDetailsProps {
    record: AstronomyRecord;
    tone?: AstronomyDetailsTone;
}

export function AstronomyRecordDetails({
    record,
    tone = "neutral",
}: AstronomyRecordDetailsProps) {
    return (
        <div className={styles.details} data-tone={tone}>
            <p className={styles.summary}>{record.summary}</p>

            <Link className={styles.guideLink} href={`/guide?object=${record.id}`}>
                Ask AI Guide <span aria-hidden="true">→</span>
            </Link>

            <div className={styles.groups}>
                {record.factGroups.map((group) => (
                    <section className={styles.group} key={group.category}>
                        <h3>{group.category}</h3>
                        <dl>
                            {group.facts.map((fact) => (
                                <div key={`${group.category}-${fact.label}`}>
                                    <dt>{fact.label}</dt>
                                    <dd>{fact.value}</dd>
                                </div>
                            ))}
                        </dl>
                    </section>
                ))}
            </div>

            <details className={styles.sources}>
                <summary>
                    Sources <span>{record.sources.length}</span>
                </summary>
                <ul>
                    {record.sources.map((source) => (
                        <li key={source.url}>
                            <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${source.label}, ${source.organization} (opens in a new tab)`}
                            >
                                <span>
                                    {source.label}
                                    <small>{source.organization}</small>
                                </span>
                                <span aria-hidden="true">↗</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </details>
        </div>
    );
}
