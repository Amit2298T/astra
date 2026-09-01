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

const {
    MOON_EXPLORE_RADIUS,
    MOON_LANDING_SAFE_RADIUS,
    MOON_SURFACE_PROFILES,
    MOON_TERRAIN_SEED,
    MOON_TERRAIN_SIZE,
    createMoonCraters,
    createMoonRockPlacements,
    createMoonTerrainGrid,
    getCachedMoonTerrainGrid,
    getMoonTerrainHeight,
} = await import("./SurfaceTerrain.ts");
const {
    MOON_SURFACE_GRAVITY_M_S2,
    resolveSurfaceDestination,
} = await import("./SurfaceDestination.ts");

const tiers = ["high", "medium", "low"];

test("Moon terrain is deterministic for a given seed", () => {
    const first = createMoonTerrainGrid(33, MOON_TERRAIN_SEED);
    const second = createMoonTerrainGrid(33, MOON_TERRAIN_SEED);

    assert.deepEqual(first, second);
    assert.strictEqual(
        getCachedMoonTerrainGrid(33),
        getCachedMoonTerrainGrid(33)
    );
});

test("Moon terrain samples are finite", () => {
    const grid = createMoonTerrainGrid(65);
    assert.ok([...grid.heights].every(Number.isFinite));
    const minimum = Math.min(...grid.heights);
    const maximum = Math.max(...grid.heights);
    assert.ok(maximum - minimum > 12);
});

test("landmark crater has a readable depressed center and raised rim", () => {
    const landmark = createMoonCraters().find((crater) => crater.landmark);
    assert.ok(landmark);
    const centerHeight = getMoonTerrainHeight(landmark.x, landmark.z);
    const rimSamples = [
        getMoonTerrainHeight(landmark.x + landmark.radius, landmark.z),
        getMoonTerrainHeight(landmark.x - landmark.radius, landmark.z),
        getMoonTerrainHeight(landmark.x, landmark.z + landmark.radius),
        getMoonTerrainHeight(landmark.x, landmark.z - landmark.radius),
    ];
    assert.ok(Math.max(...rimSamples) - centerHeight > 5);
});

test("landing zone remains clear and gently sloped", () => {
    const sampleStep = 6;
    for (
        let x = -MOON_LANDING_SAFE_RADIUS;
        x <= MOON_LANDING_SAFE_RADIUS;
        x += sampleStep
    ) {
        for (
            let z = -MOON_LANDING_SAFE_RADIUS;
            z <= MOON_LANDING_SAFE_RADIUS;
            z += sampleStep
        ) {
            if (Math.hypot(x, z) > MOON_LANDING_SAFE_RADIUS) continue;
            const height = getMoonTerrainHeight(x, z);
            const slopeX = Math.abs(getMoonTerrainHeight(x + 1, z) - height);
            const slopeZ = Math.abs(getMoonTerrainHeight(x, z + 1) - height);

            assert.ok(Number.isFinite(height));
            assert.ok(Math.abs(height) < 2.5);
            assert.ok(Math.max(slopeX, slopeZ) < 0.18);
        }
    }
});

test("craters remain in terrain bounds and outside the landing zone", () => {
    const halfSize = MOON_TERRAIN_SIZE * 0.5;
    for (const crater of createMoonCraters()) {
        assert.ok(Math.abs(crater.x) + crater.radius * 1.42 <= halfSize);
        assert.ok(Math.abs(crater.z) + crater.radius * 1.42 <= halfSize);
        assert.ok(
            Math.hypot(crater.x, crater.z) >=
                MOON_LANDING_SAFE_RADIUS + crater.radius
        );
        assert.ok(crater.depth / crater.radius >= 0.07);
        assert.ok(crater.depth / crater.radius <= 0.17);
        assert.ok(crater.rimHeight / crater.radius >= 0.03);
        assert.ok(crater.rimHeight / crater.radius <= 0.075);
    }
});

test("rock populations respect quality tiers and placement safety", () => {
    assert.deepEqual(
        tiers.map((tier) => MOON_SURFACE_PROFILES[tier].rockCount),
        [720, 440, 220]
    );
    assert.deepEqual(
        tiers.map((tier) => MOON_SURFACE_PROFILES[tier].shadowExtent),
        [180, 110, 0]
    );

    for (const tier of tiers) {
        const first = createMoonRockPlacements(tier);
        const second = createMoonRockPlacements(tier);
        assert.deepEqual(first, second);
        assert.equal(first.length, MOON_SURFACE_PROFILES[tier].rockCount);

        for (const rock of first) {
            const [x, y, z] = rock.position;
            assert.ok(Math.hypot(x, z) >= MOON_LANDING_SAFE_RADIUS + 14);
            assert.ok(Math.hypot(x, z) <= MOON_EXPLORE_RADIUS);
            assert.ok(
                [
                    ...rock.position,
                    ...rock.rotation,
                    rock.scale,
                    rock.shapeIndex,
                    rock.shade,
                ].every(Number.isFinite)
            );
            assert.ok(y >= getMoonTerrainHeight(x, z));
        }

        const tinyCount = first.filter((rock) => rock.scale < 0.5).length;
        const largeCount = first.filter((rock) => rock.scale > 1.5).length;
        assert.ok(tinyCount > first.length * 0.6);
        assert.ok(largeCount < first.length * 0.12);
    }
});

test("surface routing admits Moon only and exposes lunar gravity", () => {
    assert.equal(resolveSurfaceDestination("Moon"), "moon");
    assert.equal(resolveSurfaceDestination("moon"), "moon");
    assert.equal(resolveSurfaceDestination("Mars"), null);
    assert.equal(resolveSurfaceDestination(null), null);
    assert.equal(MOON_SURFACE_GRAVITY_M_S2, 1.62);
});
