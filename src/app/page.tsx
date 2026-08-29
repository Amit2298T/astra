"use client";

import { UniverseCanvas } from "@/components/universe/UniverseCanvas";

export default function Home() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-black">
      <UniverseCanvas />
    </main>
  );
}