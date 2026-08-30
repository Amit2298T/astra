import type { GalacticNavigationTarget } from "@/data/galaxy";
import type { GalaxyNavigationMode } from "../universe/galaxy/useGalaxyNavigation";
import styles from "./GalaxyNavigation.module.css";

interface GalacticInfoOverlayProps {
    target: GalacticNavigationTarget;
    mode: GalaxyNavigationMode;
    isActiveTarget: boolean;
    onFocus: () => void;
    onTravel: () => void;
    onEnterLocalSpace: () => void;
    onEnterBlackHole?: () => void;
    onEnterNebula?: () => void;
    onEnterCluster?: () => void;
    onClose: () => void;
}

export function GalacticInfoOverlay({
    target,
    mode,
    isActiveTarget,
    onFocus,
    onTravel,
    onEnterLocalSpace,
    onEnterBlackHole,
    onEnterNebula,
    onEnterCluster,
    onClose,
}: GalacticInfoOverlayProps) {
    return (
        <section
            className={styles.infoPanel}
            aria-label={`${target.name} galactic information and navigation controls`}
        >
            <div className={styles.header}>
                <div>
                    <div className={styles.eyebrow}>Galactic destination</div>
                    <div className={styles.targetName}>{target.name}</div>
                </div>
                <button
                    className={styles.closeButton}
                    onClick={onClose}
                    aria-label="Close galactic information"
                >
                    ×
                </button>
            </div>

            <div className={styles.facts}>
                {target.facts.map((fact, index) => (
                    <div
                        className={styles.fact}
                        key={`galactic-${target.id}-${fact.label}-${index}`}
                    >
                        <span className={styles.factLabel}>{fact.label}</span>
                        <span className={styles.factValue}>{fact.value}</span>
                    </div>
                ))}
            </div>

            <div className={styles.description}>{target.description}</div>

            <div className={styles.actions}>
                <button className={styles.actionButton} onClick={onFocus}>
                    {mode === "focus" ? "Refocus" : "Focus"}
                </button>
                <button
                    className={styles.actionButton}
                    onClick={onTravel}
                    disabled={isActiveTarget}
                >
                    {isActiveTarget ? "At Destination" : "Travel To"}
                </button>
                {target.localSpaceDestination === "solarSystem" && (
                    <button
                        className={styles.localButton}
                        onClick={onEnterLocalSpace}
                    >
                        Enter Local Space
                    </button>
                )}
                {target.type === "galacticCenter" &&
                    isActiveTarget &&
                    onEnterBlackHole && (
                        <button
                            className={styles.localButton}
                            onClick={onEnterBlackHole}
                        >
                            Enter Sagittarius A*
                        </button>
                    )}
                {target.type === "nebula" &&
                    isActiveTarget &&
                    onEnterNebula && (
                        <button
                            className={styles.localButton}
                            onClick={onEnterNebula}
                        >
                            Enter Nebula
                        </button>
                    )}
                {target.type === "starCluster" &&
                    isActiveTarget &&
                    onEnterCluster && (
                        <button
                            className={styles.localButton}
                            onClick={onEnterCluster}
                        >
                            Enter Cluster
                        </button>
                    )}
            </div>
        </section>
    );
}
