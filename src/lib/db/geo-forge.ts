import Dexie, { type Table } from 'dexie';

export interface GeoForgeProject {
  id?: number;
  name: string;
  data: string; // The raw string content
  format: 'wkt' | 'geojson' | 'csv';
  updatedAt: number;
  preview?: string; // Data URL of the snapshot
}

export class GeoForgeDB extends Dexie {
  projects!: Table<GeoForgeProject>;

  constructor() {
    super('GeoForgeDB');
    this.version(1).stores({
      projects: '++id, name, updatedAt'
    });
    // Add version 2 for future schema changes if needed,
    // but adding 'preview' field doesn't require schema change in Dexie if not indexed.
  }
}

export const db = new GeoForgeDB();

export async function saveProject(name: string, data: string, format: 'wkt' | 'geojson' | 'csv', preview?: string) {
    // Check if exists
    const existing = await db.projects.where('name').equals(name).first();
    if (existing) {
        await db.projects.update(existing.id!, { data, format, updatedAt: Date.now(), preview });
    } else {
        await db.projects.add({ name, data, format, updatedAt: Date.now(), preview });
    }
}

export async function getRecentProjects(limit = 10) {
    return await db.projects.orderBy('updatedAt').reverse().limit(limit).toArray();
}
