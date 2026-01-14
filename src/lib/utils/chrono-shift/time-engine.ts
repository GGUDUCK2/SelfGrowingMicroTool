import { formatInTimeZone } from 'date-fns-tz';

export interface TimeSlot {
    date: Date; // The UTC date object for the selected time
    utcOffset: number; // Offset in minutes
    isBusinessHour: boolean;
    formattedTime: string;
    formattedDate: string;
    dayNight: 'day' | 'night' | 'sunrise' | 'sunset';
}

export class TimeEngine {
    static getAvailableTimeZones(): string[] {
        // Modern browsers support this
        // @ts-ignore
        return Intl.supportedValuesOf('timeZone');
    }

    static getZoneOffset(zoneName: string, date: Date = new Date()): number {
        // Calculate offset in minutes.
        // We compare the zoned time to UTC time components

        // Hacky but reliable way:
        const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
        const tzDate = new Date(date.toLocaleString('en-US', { timeZone: zoneName }));
        return (tzDate.getTime() - utcDate.getTime()) / 60000;
    }

    static getSlotDetails(zoneName: string, utcDate: Date, businessStart = 9, businessEnd = 17): TimeSlot {
        // formatInTimeZone takes a Date (interpreted as UTC) and formats it in the target zone
        const timeStr = formatInTimeZone(utcDate, zoneName, 'HH:mm');
        const [hours, mins] = timeStr.split(':').map(Number);
        const decimalTime = hours + mins / 60;

        const isBusiness = decimalTime >= businessStart && decimalTime < businessEnd;

        // Day/Night calculation (approximate)
        let dayNight: 'day' | 'night' | 'sunrise' | 'sunset' = 'night';
        if (decimalTime >= 6 && decimalTime < 8) dayNight = 'sunrise';
        else if (decimalTime >= 8 && decimalTime < 18) dayNight = 'day';
        else if (decimalTime >= 18 && decimalTime < 20) dayNight = 'sunset';

        const offset = this.getZoneOffset(zoneName, utcDate);

        return {
            date: utcDate,
            utcOffset: offset,
            isBusinessHour: isBusiness,
            formattedTime: formatInTimeZone(utcDate, zoneName, 'h:mm a'),
            formattedDate: formatInTimeZone(utcDate, zoneName, 'MMM d, yyyy'),
            dayNight
        };
    }

    static calculateOverlapScore(zones: string[], utcDate: Date): number {
        if (zones.length === 0) return 100;
        let businessCount = 0;
        zones.forEach(zone => {
            const details = this.getSlotDetails(zone, utcDate);
            if (details.isBusinessHour) businessCount++;
        });
        return Math.round((businessCount / zones.length) * 100);
    }
}
