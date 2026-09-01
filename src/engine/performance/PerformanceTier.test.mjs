import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { pathToFileURL } from "node:url";
import path from "node:path";

const sourceRoot = pathToFileURL(path.resolve("src") + path.sep).href;
registerHooks({
    resolve(specifier, context, nextResolve) {
        if (specifier.startsWith("@/")) {
            return nextResolve(`${sourceRoot}${specifier.slice(2)}.ts`, context);
        }
        return nextResolve(specifier, context);
    },
});

const { PERFORMANCE_PROFILES, resolvePerformanceTier, scaledCount } =
    await import("./PerformanceTier.ts");

test("performance tiers resolve deterministically from device signals", () => {
    assert.equal(
        resolvePerformanceTier({
            width: 1920,
            height: 1080,
            devicePixelRatio: 1,
            hardwareConcurrency: 12,
            deviceMemoryGb: 16,
            coarsePointer: false,
        }),
        "high"
    );
    assert.equal(
        resolvePerformanceTier({
            width: 1180,
            height: 820,
            devicePixelRatio: 1.5,
            hardwareConcurrency: 8,
            deviceMemoryGb: 8,
            coarsePointer: false,
        }),
        "medium"
    );
    assert.equal(
        resolvePerformanceTier({
            width: 390,
            height: 844,
            devicePixelRatio: 3,
            hardwareConcurrency: 6,
            deviceMemoryGb: 6,
            coarsePointer: true,
        }),
        "low"
    );
});

test("quality profiles preserve desktop and reduce constrained workloads", () => {
    assert.equal(PERFORMANCE_PROFILES.high.galaxyScale, 1);
    assert.ok(
        PERFORMANCE_PROFILES.low.galaxyScale <
            PERFORMANCE_PROFILES.medium.galaxyScale
    );
    assert.ok(
        PERFORMANCE_PROFILES.medium.galaxyScale <
            PERFORMANCE_PROFILES.high.galaxyScale
    );
    assert.deepEqual(
        ["high", "medium", "low"].map(
            (tier) => PERFORMANCE_PROFILES[tier].maxDpr
        ),
        [2, 1.5, 1.25]
    );
    assert.equal(scaledCount(55_000, 0.5), 27_500);
});
