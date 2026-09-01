import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { registerHooks } from "node:module";

const sourceRoot = pathToFileURL(path.resolve("src") + path.sep).href;
registerHooks({
    resolve(specifier, context, nextResolve) {
        if (specifier.startsWith("@/")) {
            return nextResolve(`${sourceRoot}${specifier.slice(2)}.ts`, context);
        }
        if (
            (specifier.startsWith("./") || specifier.startsWith("../")) &&
            !path.extname(specifier) &&
            context.parentURL?.endsWith(".ts")
        ) {
            return nextResolve(`${specifier}.ts`, context);
        }
        return nextResolve(specifier, context);
    },
});

const { astronomyRecords } = await import("./astronomy/index.ts");
const { comparisonMetrics, comparisonObjects } = await import(
    "./astronomy/comparison.ts"
);
const { solarSystemData } = await import("./solarSystem.ts");
const {
    starSystemsList,
    getStarSystemEntryId,
    getStarSystemRegistryName,
} = await import("./starSystems.ts");
const {
    EXPLORER_ENTRY_TARGETS,
    parseExplorerEntryTarget,
} = await import("../engine/navigation/ExplorerEntry.ts");

function assertUnique(values, label) {
    assert.equal(new Set(values).size, values.length, `${label} must be unique`);
}

test("astronomy records and source references are deployment-safe", () => {
    assertUnique(
        astronomyRecords.map((record) => record.id),
        "astronomy record IDs"
    );

    for (const record of astronomyRecords) {
        assert.ok(record.name.trim(), `${record.id} has a name`);
        assert.ok(record.sources.length > 0, `${record.id} has a source`);
        for (const source of record.sources) {
            assert.ok(source.label.trim(), `${record.id} source has a label`);
            assert.ok(
                source.organization.trim(),
                `${record.id} source has an organization`
            );
            const url = new URL(source.url);
            assert.equal(url.protocol, "https:", `${source.url} uses HTTPS`);
        }
    }
});

test("Explorer targets and star-system relationships are deterministic", () => {
    assertUnique([...EXPLORER_ENTRY_TARGETS], "Explorer targets");
    for (const target of EXPLORER_ENTRY_TARGETS) {
        assert.equal(parseExplorerEntryTarget(target), target);
    }
    assert.equal(parseExplorerEntryTarget("unsupported-target"), null);
    assert.equal(parseExplorerEntryTarget(["trappist-1", "sirius"]), "trappist-1");

    assertUnique(
        starSystemsList.map((system) => system.id),
        "star-system IDs"
    );
    assertUnique(
        starSystemsList.map(getStarSystemEntryId),
        "star-system entry IDs"
    );

    const registryNames = [];
    for (const system of starSystemsList) {
        registryNames.push(
            getStarSystemRegistryName(getStarSystemEntryId(system)),
            ...system.stars.map((star) => star.registryName),
            ...system.knownPlanets.map((planet) => planet.registryName)
        );
        for (const planet of system.knownPlanets) {
            assert.ok(planet.orbitalPeriodDays > 0);
            assert.ok(
                system.stars.some(
                    (star) => star.name === planet.parentStarName
                ),
                `${planet.id} resolves its host star`
            );
        }
    }
    assertUnique(registryNames, "navigation registry names");
});

test("comparison records and metrics contain no duplicate or dangling data", () => {
    assertUnique(
        comparisonObjects.map((object) => object.id),
        "comparison object IDs"
    );
    assertUnique(
        comparisonMetrics.map((metric) => metric.id),
        "comparison metric IDs"
    );

    const astronomyIds = new Set(astronomyRecords.map((record) => record.id));
    for (const object of comparisonObjects) {
        if (object.astronomyRecordId) {
            assert.ok(
                astronomyIds.has(object.astronomyRecordId),
                `${object.id} resolves its astronomy record`
            );
        }
        assert.ok(Object.keys(object.values).length > 0);
        for (const value of Object.values(object.values)) {
            assert.ok(value.value > 0, `${object.id} comparison values are positive`);
        }
    }
});

test("all configured texture assets exist with deployment-safe casing", () => {
    const texturePaths = [
        ...solarSystemData.planets.flatMap((planet) =>
            [planet.texturePath, planet.ringTexturePath].filter(Boolean)
        ),
        ...Object.values(solarSystemData.moons)
            .flat()
            .map((moon) => moon.texturePath),
        ...starSystemsList.flatMap((system) =>
            system.knownPlanets
                .map((planet) => planet.texturePath)
                .filter(Boolean)
        ),
    ];

    for (const texturePath of texturePaths) {
        const relativePath = texturePath.replace(/^\//, "");
        assert.ok(
            existsSync(path.join("public", relativePath)),
            `${texturePath} exists under public/ with matching case`
        );
    }
});
