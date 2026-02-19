import { writable } from 'svelte/store';

export interface TranslationItem {
    key: string;
    values: Record<string, string>; // langCode -> value
}

export interface LocaleProject {
    id?: number;
    name: string;
    languages: string[]; // e.g. ['en', 'ko']
    data: TranslationItem[];
    createdAt: Date;
    updatedAt: Date;
}

export const projectStore = writable<LocaleProject>({
    name: 'Untitled Project',
    languages: ['en'],
    data: [],
    createdAt: new Date(),
    updatedAt: new Date()
});
