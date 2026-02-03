import { writable } from 'svelte/store';
import { createEmptyResume, type Resume } from './types';

function createResumeStore() {
  const { subscribe, set, update } = writable<Resume>(createEmptyResume());

  return {
    subscribe,
    set,
    update,
    reset: () => set(createEmptyResume()),
    load: (data: Resume) => set(data)
  };
}

export const resumeStore = createResumeStore();
