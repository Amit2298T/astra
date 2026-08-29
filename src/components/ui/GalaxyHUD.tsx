import styles from "./GalaxyHUD.module.css";

interface GalaxyHUDProps {
    onReturnToLocalSpace: () => void;
    returnLabel?: string;
}

export function GalaxyHUD({
    onReturnToLocalSpace,
    returnLabel = "Return to Local Space",
}: GalaxyHUDProps) {
    return (
        <div className={styles.hud}>
            <div>
                <div className={styles.eyebrow}>Galactic overview</div>
                <div className={styles.title}>The Milky Way</div>
            </div>
            <button className={styles.returnButton} onClick={onReturnToLocalSpace}>
                {returnLabel}
            </button>
        </div>
    );
}
