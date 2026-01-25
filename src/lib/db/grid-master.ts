import { db, type GridMasterProject } from '$lib/db';

export const gridMasterWorkspace = {
  save: async (project: GridMasterProject) => {
    const id = await db.gridMasterProjects.put({
      ...project,
      updatedAt: new Date(),
      createdAt: project.createdAt || new Date(),
      starred: project.starred || 0
    });
    return id;
  },

  loadAll: async () => {
    return await db.gridMasterProjects.orderBy('updatedAt').reverse().toArray();
  },

  get: async (id: number) => {
    return await db.gridMasterProjects.get(id);
  },

  delete: async (id: number) => {
    return await db.gridMasterProjects.delete(id);
  },

  toggleStar: async (id: number) => {
      const project = await db.gridMasterProjects.get(id);
      if (project) {
          await db.gridMasterProjects.update(id, { starred: project.starred ? 0 : 1 });
      }
  }
};
