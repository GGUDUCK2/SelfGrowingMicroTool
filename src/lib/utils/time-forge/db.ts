import Dexie, { type Table } from 'dexie';
import type { City } from './cities';

export interface TimeForgeTeam {
  id?: number;
  name: string;
  cityIds: string[];
  createdAt: Date;
}

export class TimeForgeDB extends Dexie {
  teams!: Table<TimeForgeTeam, number>;

  constructor() {
    super('TimeForgeDB');
    this.version(1).stores({
      teams: '++id, name, createdAt'
    });
  }
}

export const db = new TimeForgeDB();

export async function saveTeam(name: string, cities: City[]) {
  const cityIds = cities.map(c => c.id);
  return await db.teams.add({
    name,
    cityIds,
    createdAt: new Date()
  });
}

export async function getTeams() {
  return await db.teams.toArray();
}

export async function deleteTeam(id: number) {
  return await db.teams.delete(id);
}
