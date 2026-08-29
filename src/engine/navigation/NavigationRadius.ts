import { getPlanetByName } from "@/data/solarSystem";
import { getSpacecraftByName } from "@/data/spacecraft";
import { getStarByName, getExoplanetByName } from "@/data/starSystems";

/**
 * Reusable celestial, stellar, and spacecraft navigation radius utility.
 * Calculates optimal focus, follow, and autopilot arrival thresholds generically.
 */

/** Calculate optimal camera focus distance generically for any celestial object */
export function getFocusRadius(targetName: string): number {
    const planetConfig = getPlanetByName(targetName);
    if (planetConfig) {
        if (planetConfig.hasRings && planetConfig.ringOuterRadius) {
            return Math.max(
                planetConfig.radius * planetConfig.ringOuterRadius * 2.8,
                3.5
            );
        }
        return Math.max(planetConfig.radius * 4.5, 1.8);
    }

    const starConfig = getStarByName(targetName);
    if (starConfig) {
        return Math.max(
            starConfig.visualRadius * 6,
            starConfig.navigationRadius * 2
        );
    }

    const exoplanetConfig = getExoplanetByName(targetName);
    if (exoplanetConfig) {
        return exoplanetConfig.navigationRadius;
    }

    const spacecraftConfig = getSpacecraftByName(targetName);
    if (spacecraftConfig) {
        return spacecraftConfig.viewRadius ?? 1.5;
    }

    if (targetName.toLowerCase() === "sun") {
        return 4.5;
    }

    return 3.0;
}

/** Calculate trailing companion distance for follow mode */
export function getFollowRadius(targetName: string): number {
    const planetConfig = getPlanetByName(targetName);
    if (planetConfig) {
        if (planetConfig.hasRings && planetConfig.ringOuterRadius) {
            return Math.max(
                planetConfig.radius * planetConfig.ringOuterRadius * 2.6,
                3.2
            );
        }
        return Math.max(planetConfig.radius * 4.2, 1.8);
    }

    const starConfig = getStarByName(targetName);
    if (starConfig) {
        return starConfig.navigationRadius * 1.25;
    }

    const exoplanetConfig = getExoplanetByName(targetName);
    if (exoplanetConfig) {
        return exoplanetConfig.navigationRadius * 1.25;
    }

    const spacecraftConfig = getSpacecraftByName(targetName);
    if (spacecraftConfig) {
        return (spacecraftConfig.viewRadius ?? 1.5) * 1.25;
    }

    if (targetName.toLowerCase() === "sun") {
        return 5.5;
    }

    return 3.0;
}

/** Calculate arrival radius for travel / autopilot mode */
export function getArrivalRadius(targetName: string): number {
    const starConfig = getStarByName(targetName);
    if (starConfig) {
        return starConfig.navigationRadius;
    }

    return getFocusRadius(targetName);
}
