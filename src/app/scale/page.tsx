import type { Metadata } from "next";

import { CosmicScaleExplorer } from "@/components/scale/CosmicScaleExplorer";

export const metadata: Metadata = {
    title: "Scale of the Universe",
    description:
        "Compare cosmic sizes and distances across a logarithmic scale, from a human reference to the Milky Way.",
};

export default function ScalePage() {
    return <CosmicScaleExplorer />;
}
