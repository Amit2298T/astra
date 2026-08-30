import type { ScaleTransitionPhase } from "@/engine/scale/ScaleTransition";
import styles from "./ScaleTransitionIndicator.module.css";

interface ScaleTransitionIndicatorProps {
    phase: ScaleTransitionPhase;
    progress: number;
}

export function ScaleTransitionIndicator({
    phase,
    progress,
}: ScaleTransitionIndicatorProps) {
    const leaving = phase === "transitioningOut";
    return (
        <div className={styles.indicator} role="status" aria-live="polite">
            <div className={styles.label}>
                {leaving ? "Leaving Solar System" : "Entering Local Space"}
            </div>
            <div className={styles.track}>
                <div
                    className={styles.fill}
                    style={{ transform: `scaleX(${leaving ? progress : 1 - progress})` }}
                />
            </div>
        </div>
    );
}
