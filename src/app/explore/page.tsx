import type { Metadata } from "next";
import Link from "next/link";

import { UniverseCanvas } from "@/components/universe/UniverseCanvas";
import { parseExplorerEntryTarget } from "@/engine/navigation/ExplorerEntry";
import styles from "./explore.module.css";

export const metadata: Metadata = {
    title: "3D Universe Explorer",
    description:
        "Navigate the Solar System, nearby stars, the Milky Way, and galactic destinations in ASTRA’s interactive 3D explorer.",
};

interface ExplorePageProps {
    searchParams: Promise<{
        target?: string | string[];
    }>;
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
    const query = await searchParams;
    const initialTarget = parseExplorerEntryTarget(query.target);

    return (
        <main className={styles.explorer}>
            <UniverseCanvas initialTarget={initialTarget} />
            <Link className={styles.homeLink} href="/" aria-label="Return to ASTRA home">
                <span aria-hidden="true">←</span> Home
            </Link>
        </main>
    );
}
