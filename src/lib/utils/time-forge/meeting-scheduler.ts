import { startOfDay, addMinutes, getHours } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import type { City } from './cities';

export interface MeetingSlot {
  start: Date; // UTC date object
  end: Date;
  score: number; // 0-1, 1 being perfect overlap
  label: string; // "Perfect", "Good", "Stretch"
  cityStatuses: { cityId: string; status: 'working' | 'extended' | 'sleeping' }[];
}

export interface TimeRange {
  startHour: number;
  endHour: number;
}

const WORKING_HOURS: TimeRange = { startHour: 9, endHour: 17 };
const EXTENDED_HOURS: TimeRange = { startHour: 7, endHour: 22 };

export function getSlotStatus(date: Date, timezone: string): 'working' | 'extended' | 'sleeping' {
  const zoned = toZonedTime(date, timezone);
  const hour = getHours(zoned);

  if (hour >= WORKING_HOURS.startHour && hour < WORKING_HOURS.endHour) return 'working';
  if (hour >= EXTENDED_HOURS.startHour && hour < EXTENDED_HOURS.endHour) return 'extended';
  return 'sleeping';
}

export function findBestMeetingSlots(cities: City[], referenceDate: Date, daysToCheck: number = 3, minScore: number = 0.4): MeetingSlot[] {
  if (cities.length === 0) return [];

  const slots: MeetingSlot[] = [];
  const start = startOfDay(referenceDate);
  const totalMinutes = daysToCheck * 24 * 60;
  const interval = 30; // Check every 30 minutes

  for (let m = 0; m < totalMinutes; m += interval) {
    const current = addMinutes(start, m);
    const cityStatuses = cities.map(city => ({
      cityId: city.id,
      status: getSlotStatus(current, city.timezone)
    }));

    // Score calculation
    let workingCount = 0;
    let extendedCount = 0;
    let sleepingCount = 0;

    cityStatuses.forEach(s => {
      if (s.status === 'working') workingCount++;
      else if (s.status === 'extended') extendedCount++;
      else sleepingCount++;
    });

    let score = 0;
    let label = '';

    if (sleepingCount > 0) {
       // Allow some flexibility for difficult teams
       if (sleepingCount === 1 && cities.length > 2) {
           score = 0.3;
           label = 'Hard';
       } else {
           score = 0.1;
           label = 'Unlikely';
       }
    } else if (workingCount === cities.length) {
      score = 1.0;
      label = 'Perfect';
    } else {
      score = 0.6 + (workingCount / cities.length) * 0.3; // 0.6 to 0.9
      label = 'Good';
    }

    // Filter out bad slots
    if (score >= minScore) {
      slots.push({
        start: current,
        end: addMinutes(current, interval),
        score,
        label,
        cityStatuses
      });
    }
  }

  // Sort by score descending (best first), then by time ascending
  return slots.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.start.getTime() - b.start.getTime();
  });
}
