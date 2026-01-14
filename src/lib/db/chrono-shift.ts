import Dexie, { type Table } from 'dexie';

export interface TimeZoneLocation {
    id: string; // uuid or nanoid
    zoneName: string; // e.g., "America/New_York"
    customLabel?: string; // e.g., "NY Office"
    city?: string; // Extracted from zoneName if not provided
}

export interface TeamGroup {
    id?: number;
    name: string;
    locations: TimeZoneLocation[];
    createdAt: number;
    updatedAt: number;
}

export class ChronoShiftDB extends Dexie {
    teams!: Table<TeamGroup, number>;

    constructor() {
        super('ChronoShiftDB');
        this.version(1).stores({
            teams: '++id, name, updatedAt'
        });
    }
}

export const db = new ChronoShiftDB();
