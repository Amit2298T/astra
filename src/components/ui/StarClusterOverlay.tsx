import type { StarClusterConfig } from "@/data/starClusters";
import styles from "./StarClusterOverlay.module.css";

interface StarClusterOverlayProps {
    cluster: StarClusterConfig;
    onRefocus: () => void;
    onReturn: () => void;
}

export function StarClusterOverlay({
    cluster,
    onRefocus,
    onReturn,
}: StarClusterOverlayProps) {
    return (
        <section
            className={styles.panel}
            aria-label={`${cluster.name} star cluster close-up information`}
        >
            <div className={styles.eyebrow}>Star cluster close-up</div>
            <h1 className={styles.title}>{cluster.name}</h1>
            <div className={styles.catalog}>{cluster.catalogName}</div>

            <div className={styles.facts}>
                <div className={styles.fact}>
                    <span>Classification</span>
                    <strong>{cluster.classification}</strong>
                </div>
                <div className={styles.fact}>
                    <span>Constellation</span>
                    <strong>{cluster.constellation}</strong>
                </div>
                <div className={styles.fact}>
                    <span>Distance</span>
                    <strong>{cluster.distanceLabel}</strong>
                </div>
                <div className={styles.fact}>
                    <span>Approximate diameter</span>
                    <strong>{cluster.approximateDiameterLy}</strong>
                </div>
                {cluster.facts.map((fact, index) => (
                    <div
                        className={styles.fact}
                        key={`cluster-${cluster.id}-${fact.label}-${index}`}
                    >
                        <span>{fact.label}</span>
                        <strong>{fact.value}</strong>
                    </div>
                ))}
            </div>

            <p className={styles.description}>{cluster.description}</p>
            <div className={styles.visualizationNote}>
                Visualization uses representative star populations and
                compressed scale.
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
