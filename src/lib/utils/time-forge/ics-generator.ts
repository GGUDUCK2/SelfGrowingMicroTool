import { format, addMinutes, startOfHour } from 'date-fns';
import type { City } from './cities';
import { toZonedTime } from 'date-fns-tz';

export function generateICS(date: Date, cities: City[]): string {
    const startTime = date;
    const endTime = addMinutes(date, 60); // Default 1 hour meeting

    const formatDate = (d: Date) => format(d, "yyyyMMdd'T'HHmmss'Z'");

    const now = new Date();
    const uid = `${now.getTime()}@time-forge.microfactory.dev`;

    // Construct description with times for all participants
    const description = cities.map(city => {
        const localTime = toZonedTime(startTime, city.timezone);
        return `${city.name}: ${format(localTime, 'HH:mm')} (${city.timezone})`;
    }).join('\\n');

    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Time Forge//MicroFactory//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${formatDate(now)}`,
        `DTSTART:${formatDate(startTime)}`,
        `DTEND:${formatDate(endTime)}`,
        'SUMMARY:Global Sync (Time Forge)',
        `DESCRIPTION:${description}`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR'
    ];

    return lines.join('\r\n');
}

export function downloadICS(content: string, filename: string = 'meeting.ics') {
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
