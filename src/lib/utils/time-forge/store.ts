import { writable, derived } from 'svelte/store';
import { type City, POPULAR_CITIES } from './cities';
import { startOfHour } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { findBestMeetingSlots, type MeetingSlot } from './meeting-scheduler';

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

export const cityTimes = derived(timeStore, ($s) => {
  const homeCity = $s.selectedCities.find(c => c.id === $s.homeCityId) || $s.selectedCities[0];
  if (!homeCity) return [];

  return $s.selectedCities.map(city => {
    const zoned = toZonedTime($s.referenceTime, city.timezone);
    return {
      city,
      time: zoned,
    };
  });
});

// Calculate overlap for meeting mode
export const meetingSlots = derived(timeStore, ($s) => {
    if (!$s.isMeetingMode) return [];

    // Calculate best slots for the next 3 days starting from reference time
    return findBestMeetingSlots($s.selectedCities, $s.referenceTime, 3);
});
