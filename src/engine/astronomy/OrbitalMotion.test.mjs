import assert from "node:assert/strict";
import test from "node:test";
import * as THREE from "three";

import { solarSystemData } from "../../data/solarSystem.ts";
import {
    advanceAngle,
    MOON_NEAR_SIDE_LOCAL_AXIS,
    MOON_TIDAL_LOCK_PHASE_OFFSET,
    getOrbitalAngularVelocity,
    getRotationAngularVelocity,
    getTidallyLockedRotationY,
} from "./OrbitalMotion.ts";

const planet = (name) => {
    const match = solarSystemData.planets.find((item) => item.name === name);
    assert.ok(match, `Missing ${name} configuration`);
    return match;
};

test("planetary source data uses the audited sidereal periods and tilts", () => {
    assert.deepEqual(
        solarSystemData.planets.map(
            ({ name, orbitalPeriodDays, rotationPeriodHours, axialTiltDeg }) =>
                [name, orbitalPeriodDays, rotationPeriodHours, axialTiltDeg]
        ),
        [
            ["Mercury", 87.969, 1407.5, 0.034],
            ["Venus", 224.701, 5832.5, 177.36],
            ["Earth", 365.256, 23.9345, 23.44],
            ["Mars", 686.98, 24.6229, 25.19],
            ["Jupiter", 4332.59, 9.925, 3.13],
            ["Saturn", 10759.22, 10.7, 26.73],
            ["Uranus", 30688.5, 17.24, 97.77],
            ["Neptune", 60182, 16.11, 28.32],
        ]
    );
});

test("shorter orbital periods always produce faster visual revolution", () => {
    const speeds = solarSystemData.planets.map(({ orbitalPeriodDays }) =>
        getOrbitalAngularVelocity(orbitalPeriodDays)
    );

    for (let index = 1; index < speeds.length; index += 1) {
        assert.ok(speeds[index - 1] > speeds[index]);
    }
});

test("spin rates follow period magnitude", () => {
    assert.ok(
        Math.abs(getRotationAngularVelocity(planet("Jupiter").rotationPeriodHours)) >
            Math.abs(getRotationAngularVelocity(planet("Earth").rotationPeriodHours))
    );
    assert.ok(getRotationAngularVelocity(planet("Venus").rotationPeriodHours) > 0);
    assert.throws(() => getRotationAngularVelocity(-1), RangeError);
});

test("world-space spin direction is encoded once by physical axial tilt", () => {
    for (const config of solarSystemData.planets) {
        const localSpinSpeed = getRotationAngularVelocity(
            config.rotationPeriodHours
        );
        const eclipticNormalComponent =
            Math.cos((config.axialTiltDeg * Math.PI) / 180) * localSpinSpeed;

        if (config.name === "Venus" || config.name === "Uranus") {
            assert.ok(
                eclipticNormalComponent < 0,
                `${config.name} must rotate retrograde in world space`
            );
        } else {
            assert.ok(
                eclipticNormalComponent > 0,
                `${config.name} must rotate prograde in world space`
            );
        }
    }
});

test("delta-time angle integration is frame-rate independent", () => {
    const speed = getOrbitalAngularVelocity(planet("Earth").orbitalPeriodDays);
    let sixtyFpsAngle = 0;
    for (let frame = 0; frame < 60; frame += 1) {
        sixtyFpsAngle = advanceAngle(sixtyFpsAngle, speed, 1 / 60);
    }

    let thirtyFpsAngle = 0;
    for (let frame = 0; frame < 30; frame += 1) {
        thirtyFpsAngle = advanceAngle(thirtyFpsAngle, speed, 1 / 30);
    }

    assert.ok(Math.abs(sixtyFpsAngle - thirtyFpsAngle) < 1e-12);
});

test("Earth surface spin advances by its angular speed and keeps accumulating", () => {
    const earthSpinSpeed = getRotationAngularVelocity(
        planet("Earth").rotationPeriodHours
    );
    const afterOneSecond = advanceAngle(0, earthSpinSpeed, 1);
    assert.ok(Math.abs(afterOneSecond - earthSpinSpeed) < 1e-12);

    let accumulatedAngle = 0;
    for (let second = 0; second < 25; second += 1) {
        accumulatedAngle = advanceAngle(accumulatedAngle, earthSpinSpeed, 1);
    }
    const expectedWrappedAngle = (earthSpinSpeed * 25) % (Math.PI * 2);
    assert.ok(Math.abs(accumulatedAngle - expectedWrappedAngle) < 1e-12);
});

test("Moon orbital angle advances from delta using its sidereal period", () => {
    const moon = solarSystemData.moons.Earth[0];
    const moonOrbitSpeed = getOrbitalAngularVelocity(moon.orbitalPeriodDays);
    assert.ok(
        Math.abs(advanceAngle(0, moonOrbitSpeed, 1) - moonOrbitSpeed) < 1e-12
    );
});

test("Moon source data is synchronous and its textured near side stays Earth-facing", () => {
    const moon = solarSystemData.moons.Earth[0];
    assert.equal(moon.averageDistanceKm, 384400);
    assert.equal(moon.orbitalPeriodDays, 27.3217);
    assert.equal(moon.rotationPeriodDays, moon.orbitalPeriodDays);
    assert.equal(moon.inclinationDeg, 5.145);

    assert.deepEqual(MOON_NEAR_SIDE_LOCAL_AXIS, [1, 0, 0]);
    assert.equal(MOON_TIDAL_LOCK_PHASE_OFFSET, Math.PI);

    const earth = new THREE.Object3D();
    earth.position.set(4, -2, 7);
    const inclinationGroup = new THREE.Group();
    inclinationGroup.rotation.x = THREE.MathUtils.degToRad(
        moon.inclinationDeg
    );
    earth.add(inclinationGroup);

    const moonMesh = new THREE.Object3D();
    inclinationGroup.add(moonMesh);
    const directionToEarth = new THREE.Vector3();
    const nearSideWorldDirection = new THREE.Vector3();
    const earthWorldPosition = new THREE.Vector3();
    const moonWorldPosition = new THREE.Vector3();
    const moonWorldQuaternion = new THREE.Quaternion();
    const nearSideLocalDirection = new THREE.Vector3(
        ...MOON_NEAR_SIDE_LOCAL_AXIS
    );

    for (const orbitAngle of [
        0,
        Math.PI / 2,
        Math.PI,
        Math.PI * 1.5,
        Math.PI * 2,
    ]) {
        moonMesh.position.set(
            Math.cos(orbitAngle) * moon.orbitRadius,
            0,
            Math.sin(orbitAngle) * moon.orbitRadius
        );
        moonMesh.rotation.y = getTidallyLockedRotationY(orbitAngle);
        earth.updateMatrixWorld(true);

        earth.getWorldPosition(earthWorldPosition);
        moonMesh.getWorldPosition(moonWorldPosition);
        moonMesh.getWorldQuaternion(moonWorldQuaternion);
        directionToEarth
            .subVectors(earthWorldPosition, moonWorldPosition)
            .normalize();
        nearSideWorldDirection
            .copy(nearSideLocalDirection)
            .applyQuaternion(moonWorldQuaternion)
            .normalize();

        assert.ok(directionToEarth.dot(nearSideWorldDirection) >= 0.999999);
    }

    const oneOrbitRotation =
        getTidallyLockedRotationY(Math.PI * 2) - getTidallyLockedRotationY(0);
    assert.ok(Math.abs(oneOrbitRotation + Math.PI * 2) < 1e-12);
});
