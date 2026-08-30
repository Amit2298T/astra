import type { BlackHoleConfig } from "@/data/blackHoles";
import { getAstronomyRecord } from "@/data/astronomy";
import { AstronomyRecordDetails } from "./AstronomyRecordDetails";
import styles from "./BlackHoleOverlay.module.css";

interface BlackHoleOverlayProps {
    blackHole: BlackHoleConfig;
    onRefocus: () => void;
    onReturn: () => void;
}

export function BlackHoleOverlay({
    blackHole,
    onRefocus,
    onReturn,
}: BlackHoleOverlayProps) {
    const astronomyRecord = getAstronomyRecord(blackHole.id);

    return (
        <section
            className={styles.panel}
            aria-label={`${blackHole.name} close-up information`}
        >
            <div className={styles.eyebrow}>Black hole close-up</div>
            <h1 className={styles.title}>{blackHole.name}</h1>
            <div className={styles.classification}>
                {astronomyRecord?.classification ?? blackHole.classification}
            </div>

            {astronomyRecord && (
                <AstronomyRecordDetails record={astronomyRecord} tone="warm" />
            )}

            {!astronomyRecord && <div className={styles.facts}>
                {blackHole.facts.map((fact, index) => (
                    <div
                        className={styles.fact}
                        key={`black-hole-${blackHole.id}-${fact.label}-${index}`}
                    >
                        <span>{fact.label}</span>
                        <strong>{fact.value}</strong>
                    </div>
                ))}
            </div>}

            {!astronomyRecord && (
                <p className={styles.description}>{blackHole.description}</p>
            )}
            <div className={styles.visualizationNote}>
                <span aria-hidden="true">◌</span>
                Visualized accretion environment — enhanced for clarity
            </div>

            <div className={styles.actions}>
                <button className={styles.refocusButton} onClick={onRefocus}>
                    Refocus
                </button>
                <button className={styles.returnButton} onClick={onReturn}>
                    Return to Galactic Center
                </button>
            </div>
        </section>
    );
}
