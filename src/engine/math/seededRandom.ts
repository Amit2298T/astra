export type SeededRandom = () => number;

/** Deterministic 32-bit generator for stable procedural scene geometry. */
export function createSeededRandom(initialSeed: number): SeededRandom {
    let seed = initialSeed >>> 0;

    return () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed / 0x100000000;
    };
}

export function randomNormal(random: SeededRandom): number {
    const first = Math.max(random(), Number.EPSILON);
    const second = random();
    return Math.sqrt(-2 * Math.log(first)) * Math.cos(Math.PI * 2 * second);
}
