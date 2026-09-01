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

const { resolveLocalDestinationArrival } = await import("./LocalDestination.ts");

const starSystemIds = [
    "alpha-centauri",
    "sirius",
    "barnards-star",
    "epsilon-eridani",
    "tau-ceti",
    "trappist-1",
];

test("Galaxy star-system entry preserves every explicit system ID", () => {
    for (const systemId of starSystemIds) {
        const arrival = resolveLocalDestinationArrival({
            kind: "star-system",
            systemId,
        });

        assert.equal(arrival.activeStarSystemId, systemId);
        assert.equal(arrival.activeOrbitTarget, `Star system: ${systemId}`);
        assert.notEqual(arrival.activeStarSystemId, null);
        assert.notEqual(arrival.activeStarSystemId, "solar-system");
    }
});

test("TRAPPIST-1 entry resolves its local scene and camera anchor", () => {
    const arrival = resolveLocalDestinationArrival({
        kind: "star-system",
        systemId: "trappist-1",
    });

    assert.equal(arrival.activeStarSystemId, "trappist-1");
    assert.equal(arrival.activeOrbitTarget, "Star system: trappist-1");
    assert.equal(arrival.selectedObject?.id, "trappist-1");
});

test("Return to Local Space remains a Solar System entry", () => {
    const arrival = resolveLocalDestinationArrival({ kind: "solar-system" });

    assert.equal(arrival.activeStarSystemId, null);
    assert.equal(arrival.activeOrbitTarget, "Sun");
    assert.equal(arrival.selectedObject, null);
});
