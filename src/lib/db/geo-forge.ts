import Dexie, { type Table } from 'dexie';

export interface GeoForgeProject {
  id?: number;
  name: string;
  data: string; // The raw string content
  format: 'wkt' | 'geojson' | 'csv';
  updatedAt: number;
}

export class GeoForgeDB extends Dexie {
  projects!: Table<GeoForgeProject>;

  constructor() {
    super('GeoForgeDB');
    this.version(1).stores({
      projects: '++id, name, updatedAt'
    });
  }
}

export const db = new GeoForgeDB();

export async function saveProject(name: string, data: string, format: 'wkt' | 'geojson' | 'csv') {
    // Check if exists
    const existing = await db.projects.where('name').equals(name).first();
    if (existing) {
        await db.projects.update(existing.id!, { data, format, updatedAt: Date.now() });
    } else {
        await db.projects.add({ name, data, format, updatedAt: Date.now() });
    }
}

export async function getRecentProjects(limit = 10) {
    return await db.projects.orderBy('updatedAt').reverse().limit(limit).toArray();
}
