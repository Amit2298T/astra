import styles from "./BlackHoleTransitionVeil.module.css";

interface BlackHoleTransitionVeilProps {
    phase: "galaxy" | "closeUp";
}

export function BlackHoleTransitionVeil({ phase }: BlackHoleTransitionVeilProps) {
    return <div key={phase} className={styles.veil} aria-hidden="true" />;
}
