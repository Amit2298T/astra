const TWO_PI = Math.PI * 2;

// Keep the scene readable: Earth completes a visual orbit in about 25 seconds,
// while a power curve compresses the real 165-year Mercury-to-Neptune range.
const EARTH_ORBITAL_PERIOD_DAYS = 365.256;
const EARTH_VISUAL_ORBIT_SECONDS = TWO_PI / 0.25;
const ORBIT_PERIOD_COMPRESSION_EXPONENT = 0.415;

// Earth completes one visual spin in 20 seconds. A square-root compression
// keeps long-period terrestrial spins visible without reversing real ordering.
const EARTH_ROTATION_PERIOD_HOURS = 23.9345;
const EARTH_VISUAL_ROTATION_SECONDS = 20;
const ROTATION_PERIOD_COMPRESSION_EXPONENT = 0.5;

// SphereGeometry maps the horizontal center (u=0.5) of an equirectangular
// texture to local +X. The Moon texture centers its recognizable near side
// there, so a Moon at orbital angle 0 (+X from Earth) needs a PI phase.
export const MOON_NEAR_SIDE_LOCAL_AXIS = [1, 0, 0] as const;
export const MOON_TIDAL_LOCK_PHASE_OFFSET = Math.PI;

function assertPositivePeriod(period: number, label: string): void {
    if (!Number.isFinite(period) || period <= 0) {
        throw new RangeError(`${label} must be a positive finite number.`);
    }
}

/** Visual radians per second derived from a real sidereal orbital period. */
export function getOrbitalAngularVelocity(periodDays: number): number {
    assertPositivePeriod(periodDays, "Orbital period");

    const visualPeriodSeconds =
        EARTH_VISUAL_ORBIT_SECONDS *
        (periodDays / EARTH_ORBITAL_PERIOD_DAYS) **
            ORBIT_PERIOD_COMPRESSION_EXPONENT;

    return TWO_PI / visualPeriodSeconds;
}

/**
 * Visual radians per second derived from a sidereal rotation-period magnitude.
 * The physical axis orientation, including retrograde rotation, is represented
 * by the planet's axial tilt rather than duplicated in this local spin speed.
 */
export function getRotationAngularVelocity(periodHours: number): number {
    assertPositivePeriod(periodHours, "Rotation period");

    const visualPeriodSeconds =
        EARTH_VISUAL_ROTATION_SECONDS *
        (periodHours / EARTH_ROTATION_PERIOD_HOURS) **
            ROTATION_PERIOD_COMPRESSION_EXPONENT;

    return TWO_PI / visualPeriodSeconds;
}

/** Advance an angle from elapsed frame time and keep it numerically stable. */
export function advanceAngle(
    angle: number,
    angularVelocity: number,
    deltaSeconds: number
): number {
    const safeDelta = Math.max(
        Number.isFinite(deltaSeconds) ? deltaSeconds : 0,
        0
    );
    const nextAngle = (angle + angularVelocity * safeDelta) % TWO_PI;
    return nextAngle < 0 ? nextAngle + TWO_PI : nextAngle;
}

/**
 * Rotation around local Y that keeps the Moon texture's local +X side aimed at
 * Earth for the x=cos(angle), z=sin(angle) orbit convention.
 */
export function getTidallyLockedRotationY(orbitAngle: number): number {
    return -orbitAngle + MOON_TIDAL_LOCK_PHASE_OFFSET;
}
