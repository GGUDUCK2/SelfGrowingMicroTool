import Dexie, { type Table } from 'dexie';
import type { Project } from '$lib/utils/deploy-forge/types';

export class DeployForgeDB extends Dexie {
  projects!: Table<Project>;

  constructor() {
    super('DeployForgeDB');
    this.version(1).stores({
      projects: 'id, name, stackId, updatedAt'
    });
  }
}

export const db = new DeployForgeDB();

export const saveProject = async (project: Project) => {
    try {
        await db.projects.put(project);
    } catch (e) {
        console.error('Failed to save project', e);
    }
};

export const getProjects = async () => {
    return await db.projects.orderBy('updatedAt').reverse().toArray();
};

export const deleteProject = async (id: string) => {
    await db.projects.delete(id);
};
