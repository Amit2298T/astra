import type { NebulaConfig } from "@/data/nebulae";
import { getAstronomyRecord } from "@/data/astronomy";
import { AstronomyRecordDetails } from "./AstronomyRecordDetails";
import styles from "./NebulaOverlay.module.css";

interface NebulaOverlayProps {
    nebula: NebulaConfig;
    onRefocus: () => void;
    onReturn: () => void;
}

export function NebulaOverlay({
    nebula,
    onRefocus,
    onReturn,
}: NebulaOverlayProps) {
    const astronomyRecord = getAstronomyRecord(nebula.id);

    return (
        <section
            className={styles.panel}
            aria-label={`${nebula.name} close-up information`}
        >
            <div className={styles.eyebrow}>Nebula close-up</div>
            <h1 className={styles.title}>{nebula.name}</h1>
            <div className={styles.catalog}>{nebula.catalogName}</div>

            {astronomyRecord && (
                <AstronomyRecordDetails record={astronomyRecord} tone="nebula" />
            )}

            {!astronomyRecord && <div className={styles.facts}>
                <div className={styles.fact}>
                    <span>Classification</span>
                    <strong>{nebula.classification}</strong>
                </div>
                <div className={styles.fact}>
                    <span>Constellation</span>
                    <strong>{nebula.constellation}</strong>
                </div>
                <div className={styles.fact}>
                    <span>Distance</span>
                    <strong>{nebula.distanceLabel}</strong>
                </div>
                <div className={styles.fact}>
                    <span>Approximate scale</span>
                    <strong>{nebula.approximateSizeLy}</strong>
                </div>
                {nebula.facts.map((fact, index) => (
                    <div
                        className={styles.fact}
                        key={`nebula-${nebula.id}-${fact.label}-${index}`}
                    >
                        <span>{fact.label}</span>
                        <strong>{fact.value}</strong>
                    </div>
                ))}
            </div>}

            {!astronomyRecord && (
                <p className={styles.description}>{nebula.description}</p>
            )}
            <div className={styles.visualizationNote}>
                Enhanced visualization — visible structure and colors are
                stylized for clarity.
            </div>

            <div className={styles.actions}>
                <button className={styles.refocusButton} onClick={onRefocus}>
                    Refocus
                </button>
                <button className={styles.returnButton} onClick={onReturn}>
                    Return to Galaxy View
                </button>
            </div>
        </section>
    );
}
