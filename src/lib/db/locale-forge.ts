import Dexie, { type Table } from 'dexie';
import type { LocaleProject } from '$lib/utils/locale-forge/store';

export class LocaleForgeDB extends Dexie {
  projects!: Table<LocaleProject, number>;

  constructor() {
    super('LocaleForgeDB');
    this.version(1).stores({
      projects: '++id, name, createdAt'
    });
  }
}

export const db = new LocaleForgeDB();

export const localeForgeWorkspace = {
    save: async (project: LocaleProject, id?: number) => {
        project.updatedAt = new Date();
        if (id) {
            return await db.projects.put({ ...project, id });
        } else {
            // New project
            project.createdAt = new Date();
            const newId = await db.projects.add(project);
            return newId;
        }
    },
    loadAll: async () => {
        return await db.projects.orderBy('createdAt').reverse().toArray();
    },
    get: async (id: number) => {
        return await db.projects.get(id);
    },
    delete: async (id: number) => {
        return await db.projects.delete(id);
    }
};
