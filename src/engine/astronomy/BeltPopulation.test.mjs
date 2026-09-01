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

const { smallBodyRegions } = await import("../../data/smallBodyRegions.ts");
const {
    createBeltInstancePopulation,
    getBeltInstanceCount,
    getCachedBeltInstancePopulation,
} = await import("./BeltPopulation.ts");

const tiers = ["high", "medium", "low"];

function radialDistance(instance) {
    return Math.hypot(instance.position[0], instance.position[2]);
}

function meanAbsoluteHeight(population) {
    return (
        population.reduce(
            (total, instance) => total + Math.abs(instance.position[1]),
            0
        ) / population.length
    );
}

test("same seed produces the same deterministic instance population", () => {
    const first = createBeltInstancePopulation(
        smallBodyRegions.asteroidBelt,
        "low",
        0x1a2b3c4d
    );
    const second = createBeltInstancePopulation(
        smallBodyRegions.asteroidBelt,
        "low",
        0x1a2b3c4d
    );

    assert.deepEqual(first, second);
    assert.strictEqual(
        getCachedBeltInstancePopulation(smallBodyRegions.asteroidBelt, "low"),
        getCachedBeltInstancePopulation(smallBodyRegions.asteroidBelt, "low")
    );
});

test("Asteroid Belt instances remain inside configured radial bounds", () => {
    const config = smallBodyRegions.asteroidBelt;
    const population = createBeltInstancePopulation(config, "high");

    population.forEach((instance) => {
        const radius = radialDistance(instance);
        assert.ok(radius >= config.innerRadius - 1e-9);
        assert.ok(radius <= config.outerRadius + 1e-9);
    });
});

test("Kuiper Belt instances remain inside configured radial bounds", () => {
    const config = smallBodyRegions.kuiperBelt;
    const population = createBeltInstancePopulation(config, "high");

    population.forEach((instance) => {
        const radius = radialDistance(instance);
        assert.ok(radius >= config.innerRadius - 1e-9);
        assert.ok(radius <= config.outerRadius + 1e-9);
    });
});

test("Kuiper Belt has greater vertical spread than the Asteroid Belt", () => {
    const asteroidPopulation = createBeltInstancePopulation(
        smallBodyRegions.asteroidBelt,
        "high"
    );
    const kuiperPopulation = createBeltInstancePopulation(
        smallBodyRegions.kuiperBelt,
        "high"
    );

    assert.ok(
        meanAbsoluteHeight(kuiperPopulation) >
            meanAbsoluteHeight(asteroidPopulation)
    );
});

test("instance counts respect every quality tier", () => {
    for (const tier of tiers) {
        assert.equal(
            createBeltInstancePopulation(
                smallBodyRegions.asteroidBelt,
                tier
            ).length,
            getBeltInstanceCount(smallBodyRegions.asteroidBelt, tier)
        );
        assert.equal(
            createBeltInstancePopulation(smallBodyRegions.kuiperBelt, tier)
                .length,
            getBeltInstanceCount(smallBodyRegions.kuiperBelt, tier)
        );
    }

    assert.deepEqual(
        tiers.map((tier) =>
            getBeltInstanceCount(smallBodyRegions.asteroidBelt, tier)
        ),
        [1000, 640, 320]
    );
    assert.deepEqual(
        tiers.map((tier) =>
            getBeltInstanceCount(smallBodyRegions.kuiperBelt, tier)
        ),
        [1200, 720, 340]
    );
});

test("instance scales remain inside configured visual safety bounds", () => {
    for (const config of Object.values(smallBodyRegions)) {
        for (const tier of tiers) {
            const population = createBeltInstancePopulation(config, tier);
            population.forEach((instance) => {
                assert.ok(instance.scale >= config.minInstanceScale);
                assert.ok(instance.scale <= config.maxInstanceScale);
            });
        }
    }
});

test("large generic bodies remain a rare tail of each belt", () => {
    for (const config of Object.values(smallBodyRegions)) {
        const population = createBeltInstancePopulation(config, "high");
        const largeBodyThreshold =
            config.minInstanceScale +
            (config.maxInstanceScale - config.minInstanceScale) * 0.85;
        const largeBodyCount = population.filter(
            (instance) => instance.scale >= largeBodyThreshold
        ).length;

        assert.ok(
            largeBodyCount / population.length < 0.03,
            `${config.name} large-body tail exceeded 3%`
        );
    }
});

test("all generated instance values are finite", () => {
    for (const config of Object.values(smallBodyRegions)) {
        const population = createBeltInstancePopulation(config, "high");
        population.forEach((instance) => {
            const values = [
                ...instance.position,
                instance.scale,
                ...instance.rotation,
                ...instance.color,
                instance.shapeIndex,
                instance.orbitalRadius,
                instance.eccentricity,
                instance.inclination,
                instance.phase,
            ];
            assert.ok(values.every(Number.isFinite));
        });
    }
});
