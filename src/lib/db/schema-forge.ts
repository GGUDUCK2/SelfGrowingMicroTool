import { db } from '../db';
import type { SchemaProject } from '../types/schema-forge';

export class SchemaForgeWorkspaceAdapter {
    async save(project: Omit<SchemaProject, 'id' | 'createdAt' | 'starred'>, id?: number) {
        if (id) {
            await db.schemaForgeProjects.update(id, {
                ...project,
                updatedAt: new Date()
            });
            return id;
        } else {
            return await db.schemaForgeProjects.add({
                ...project,
                createdAt: new Date(),
                updatedAt: new Date(),
                starred: 0
            });
        }
    }

    loadAll() {
        return db.schemaForgeProjects.orderBy('createdAt').reverse().toArray();
    }

    get(id: number) {
        return db.schemaForgeProjects.get(id);
    }

    async delete(id: number) {
        await db.schemaForgeProjects.delete(id);
    }

    async toggleStar(id: number) {
        const item = await db.schemaForgeProjects.get(id);
        if (item) {
            await db.schemaForgeProjects.update(id, { starred: item.starred ? 0 : 1 });
        }
    }
}

export const schemaForgeWorkspace = new SchemaForgeWorkspaceAdapter();
