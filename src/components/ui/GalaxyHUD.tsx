import styles from "./GalaxyHUD.module.css";

interface GalaxyHUDProps {
    onReturnToLocalSpace: () => void;
}

export function GalaxyHUD({ onReturnToLocalSpace }: GalaxyHUDProps) {
    return (
        <div className={styles.hud}>
            <div>
                <div className={styles.eyebrow}>Galactic overview</div>
                <div className={styles.title}>The Milky Way</div>
            </div>
            <button className={styles.returnButton} onClick={onReturnToLocalSpace}>
                Return to Local Space
            </button>
        </div>
    );
}
