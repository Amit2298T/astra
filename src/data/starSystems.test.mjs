import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { pathToFileURL } from "node:url";
import path from "node:path";

const sourceRoot = pathToFileURL(path.resolve("src") + path.sep).href;
registerHooks({ resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) return nextResolve(`${sourceRoot}${specifier.slice(2)}.ts`, context);
    if ((specifier.startsWith("./") || specifier.startsWith("../")) && !path.extname(specifier) && context.parentURL?.endsWith(".ts")) return nextResolve(`${specifier}.ts`, context);
    return nextResolve(specifier, context);
} });
const { starSystemsList, getStarSystemByEntryId, getStarSystemDisplayName, getStarSystemEntryId, getStarSystemRegistryName } = await import("./starSystems.ts");
const { milkyWayConfig } = await import("./galaxy.ts");
const { galacticRegistry } = await import("../engine/registry/GalacticRegistry.ts");
const { calculateLocalNeighborhoodBounds, getLocalNeighborhoodCameraDistance } = await import("../engine/navigation/LocalNeighborhoodView.ts");

test("stellar-neighborhood identifiers and references are deterministic", () => {
    assert.equal(starSystemsList.length, 6);
    const ids = starSystemsList.flatMap((s) => [s.id, ...s.stars.map((x) => x.id), ...s.knownPlanets.map((x) => x.id)]);
    assert.equal(new Set(ids).size, ids.length);
    for (const system of starSystemsList) for (const planet of system.knownPlanets) {
        assert.ok(planet.orbitalPeriodDays > 0);
        assert.ok(system.stars.some((star) => star.name === planet.parentStarName));
        assert.equal(planet.systemName, system.name.replace(" System", ""));
    }
});

test("TRAPPIST-1 contains seven ordered confirmed planets", () => {
    const system = starSystemsList.find((s) => s.id === "trappist-1-system");
    assert.deepEqual(system.knownPlanets.map((p) => p.id), "bcdefgh".split("").map((x) => `trappist-1-${x}`));
    assert.ok(system.knownPlanets.every((p, i, a) => i === 0 || p.orbitalPeriodDays > a[i - 1].orbitalPeriodDays));
});

test("nearby-system action labels use concise destination display names", () => {
    const expected = {
        "alpha-centauri": "Alpha Centauri",
        "barnards-star": "Barnard's Star",
        sirius: "Sirius",
        "epsilon-eridani": "Epsilon Eridani",
        "tau-ceti": "Tau Ceti",
        "trappist-1": "TRAPPIST-1",
    };

    for (const [entryId, displayName] of Object.entries(expected)) {
        const system = getStarSystemByEntryId(entryId);
        assert.ok(system, `${entryId} resolves to a local system`);
        assert.equal(getStarSystemDisplayName(system), displayName);
        assert.equal(
            getStarSystemRegistryName(entryId),
            `Star system: ${entryId}`
        );
    }
});

test("all astronomy references are unique", () => {
    const ids = starSystemsList.flatMap((s) => [...s.stars.map((x) => x.astronomyRecordId), ...s.knownPlanets.map((x) => x.astronomyRecordId)]).filter(Boolean);
    assert.equal(new Set(ids).size, ids.length);
});

test("all nearby systems are rendered and registered Galaxy targets", () => {
    for (const system of starSystemsList) {
        const target = milkyWayConfig.locations.find((item) => item.starSystemId === getStarSystemEntryId(system));
        assert.ok(target, `${system.name} target exists`);
        assert.equal(target.markerVisible, true);
        assert.ok(target.position.every(Number.isFinite));
        assert.equal(galacticRegistry.getById(target.id), target);
    }
});

test("nearby display coordinates remain deterministic", () => {
    const expected = {
        "alpha-centauri": [913.21, 3.71, -507.63],
        "barnards-star-system": [793.05, 41.04, -608.21],
        "sirius-system": [1142.03, -28.08, -562.63],
        "epsilon-eridani-system": [1103.55, -189.37, -665.99],
        "tau-ceti-system": [1001.44, -279.13, -668.24],
        "trappist-1-system": [489.01, -841.12, -944.94],
    };
    for (const system of starSystemsList) {
        assert.deepEqual(system.galacticMarkerPosition.map((value) => Number(value.toFixed(2))), expected[system.id]);
    }
});

test("local-neighborhood camera source contains all seven finite targets", () => {
    const bounds = calculateLocalNeighborhoodBounds(milkyWayConfig.locations);
    assert.equal(bounds.targets.length, 7);
    assert.deepEqual(bounds.targets.map((target) => target.id), [
        "solar-system-galactic",
        "alpha-centauri-region-galactic",
        "barnards-star",
        "sirius",
        "epsilon-eridani",
        "tau-ceti",
        "trappist-1",
    ]);
    assert.ok(bounds.center.every(Number.isFinite));
    assert.ok(Number.isFinite(bounds.radius) && bounds.radius > 0);
    assert.ok(getLocalNeighborhoodCameraDistance(bounds.radius, 50, 16 / 9) > bounds.radius);
});

test("Galaxy star-system destinations preserve canonical local entry IDs", () => {
    const expected = [
        "alpha-centauri",
        "barnards-star",
        "sirius",
        "epsilon-eridani",
        "tau-ceti",
        "trappist-1",
    ];
    const targets = milkyWayConfig.locations.filter((target) => target.starSystemId);
    assert.deepEqual(targets.map((target) => target.starSystemId), expected);
    for (const entryId of expected) {
        const system = getStarSystemByEntryId(entryId);
        assert.ok(system, `${entryId} resolves to a local system`);
        assert.notEqual(entryId, "solar-system");
        assert.match(getStarSystemRegistryName(entryId), /^Star system: /);
    }
});
