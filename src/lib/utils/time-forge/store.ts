import { writable, derived } from 'svelte/store';
import { type City, POPULAR_CITIES } from './cities';
import { startOfHour } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

// --- State Interfaces ---

export interface TimeState {
  referenceTime: Date; // The "master" time (usually UTC or local, but treated as the slider value)
  selectedCities: City[];
  isMeetingMode: boolean;
  homeCityId: string | null; // The city that "referenceTime" is relative to (defaults to first in list or local)
}

// --- Initial State ---

const DEFAULT_CITIES = [
  POPULAR_CITIES.find(c => c.id === 'seoul')!,
  POPULAR_CITIES.find(c => c.id === 'london')!,
  POPULAR_CITIES.find(c => c.id === 'new_york')!,
].filter(Boolean) as City[];

const initialState: TimeState = {
  referenceTime: startOfHour(new Date()),
  selectedCities: DEFAULT_CITIES,
  isMeetingMode: false,
  homeCityId: 'seoul', // Default to Seoul as per persona guidelines (implicit) or user pref
};

// --- Stores ---

function createTimeStore() {
  const { subscribe, set, update } = writable<TimeState>(initialState);

  return {
    subscribe,
    addCity: (city: City) => update(s => {
      if (s.selectedCities.find(c => c.id === city.id)) return s;
      return { ...s, selectedCities: [...s.selectedCities, city] };
    }),
    removeCity: (cityId: string) => update(s => ({
      ...s,
      selectedCities: s.selectedCities.filter(c => c.id !== cityId)
    })),
    setReferenceTime: (date: Date) => update(s => ({ ...s, referenceTime: date })),
    toggleMeetingMode: () => update(s => ({ ...s, isMeetingMode: !s.isMeetingMode })),
    setHomeCity: (cityId: string) => update(s => ({ ...s, homeCityId: cityId })),
    reset: () => set(initialState),
    loadState: (state: Partial<TimeState>) => update(s => ({ ...s, ...state })),
    reorderCities: (newOrder: City[]) => update(s => ({ ...s, selectedCities: newOrder }))
  };
}

export const timeStore = createTimeStore();

// --- Derived Stores ---

// Helper to get zoned time for a city based on reference time
// We assume referenceTime is the time in the *home city*.
// If no home city is set, we treat referenceTime as Local Device Time.
export const cityTimes = derived(timeStore, ($s) => {
  const homeCity = $s.selectedCities.find(c => c.id === $s.homeCityId) || $s.selectedCities[0];
  if (!homeCity) return [];

  // 1. Get the UTC timestamp of the reference time *as if* it were in the home city's timezone.
  // Actually, easiest way: referenceTime is just a JS Date object.
  // If we want the slider to control "Seoul Time", and the slider says "15:00",
  // we construct a date that is 15:00 in Seoul.

  // However, simpler model: referenceTime is the ACTUAL moment in time (UTC).
  // The slider adjusts this absolute moment.

  return $s.selectedCities.map(city => {
    // toZonedTime takes a date and a time zone, and returns a Date object
    // whose internal parts (getHour, etc.) match that time zone.
    const zoned = toZonedTime($s.referenceTime, city.timezone);
    return {
      city,
      time: zoned,
      // Calculate offset string relative to home city? Or UTC?
      // Let's just return the zoned date object for display.
    };
  });
});

// Calculate overlap for meeting mode
export const meetingSlots = derived(timeStore, ($s) => {
    if (!$s.isMeetingMode) return null;

    // Logic to find best slots... for now just return the current status
    // A slot is "good" if time is between 9am and 6pm for all cities?
    // That might be impossible.
    // We'll handle visual highlighting in the UI components.
    return {};
});
