import styles from "./explore.module.css";

export default function Loading() {
    return (
        <main className={styles.loading} aria-live="polite" aria-busy="true">
            <span className={styles.loadingMark} aria-hidden="true" />
            <p>Preparing the universe</p>
        </main>
    );
}
