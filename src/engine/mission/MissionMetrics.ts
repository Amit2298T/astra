const ASTRONOMICAL_UNIT_METERS = 149_597_870_700;
const SPEED_OF_LIGHT_METERS_PER_SECOND = 299_792_458;

export interface MissionAge {
    years: number;
    months: number;
    days: number;
}

export interface SignalDelay {
    totalSeconds: number;
    hours: number;
    minutes: number;
}

export function calculateMissionAge(
    launchDateTime: string,
    now = new Date()
): MissionAge {
    const launch = new Date(launchDateTime);
    let years = now.getUTCFullYear() - launch.getUTCFullYear();
    let months = now.getUTCMonth() - launch.getUTCMonth();
    let days = now.getUTCDate() - launch.getUTCDate();

    if (days < 0) {
        const previousMonthLastDay = new Date(Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            0
        )).getUTCDate();
        days += previousMonthLastDay;
        months -= 1;
    }

    if (months < 0) {
        months += 12;
        years -= 1;
    }

    return { years, months, days };
}

export function calculateSignalDelay(distanceAu: number): SignalDelay {
    const totalSeconds = Math.round(
        (distanceAu * ASTRONOMICAL_UNIT_METERS) / SPEED_OF_LIGHT_METERS_PER_SECOND
    );
    return {
        totalSeconds,
        hours: Math.floor(totalSeconds / 3_600),
        minutes: Math.floor((totalSeconds % 3_600) / 60),
    };
}

export function formatSignalDelay(delay: SignalDelay): string {
    return `${delay.hours}h ${String(delay.minutes).padStart(2, "0")}m`;
}

export function getCompressedDistancePosition(
    valueAu: number,
    maximumAu: number
): number {
    if (valueAu <= 0 || maximumAu <= 0) return 0;
    return (Math.log10(valueAu + 1) / Math.log10(maximumAu + 1)) * 100;
}
