import styles from "./GalaxyHUD.module.css";

interface GalaxyHUDProps {
    onReturnToLocalSpace: () => void;
    onShowNeighborhood: () => void;
    onReturnToOverview: () => void;
    isNeighborhood: boolean;
    returnLabel?: string;
}

export function GalaxyHUD({
    onReturnToLocalSpace,
    onShowNeighborhood,
    onReturnToOverview,
    isNeighborhood,
    returnLabel = "Return to Local Space",
}: GalaxyHUDProps) {
    return (
        <div className={styles.hud}>
            <div>
                <div className={styles.eyebrow}>{isNeighborhood ? "Local stellar neighborhood" : "Galactic overview"}</div>
                <div className={styles.title}>{isNeighborhood ? "Nearby systems around the Sun" : "The Milky Way"}</div>
                {isNeighborhood && <div className={styles.subtitle}>Spacing magnified for readability</div>}
            </div>
            <div className={styles.actions}>
                {isNeighborhood ? (
                    <button className={styles.returnButton} onClick={onReturnToOverview}>Return to Galaxy Overview</button>
                ) : (
                    <>
                        <button className={styles.neighborhoodButton} onClick={onShowNeighborhood}>Nearby Stars</button>
                        <button className={styles.returnButton} onClick={onReturnToLocalSpace}>{returnLabel}</button>
                    </>
                )}
            </div>
        </div>
    );
}
