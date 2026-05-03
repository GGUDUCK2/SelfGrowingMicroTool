import { db } from '../db';
import type { CspForgeHistory } from '../db';

export class CspForgeWorkspaceAdapter {
  async save(item: Omit<CspForgeHistory, 'id' | 'createdAt' | 'starred'>) {
    await db.cspForgeHistory.add({
      ...item,
      createdAt: new Date(),
      starred: 0
    });

    // Prune unstarred history (keep max 100)
    const count = await db.cspForgeHistory.where('starred').equals(0).count();
    if (count > 100) {
       const oldest = await db.cspForgeHistory.orderBy('createdAt').limit(count - 100).keys();
       await db.cspForgeHistory.bulkDelete(oldest as number[]);
    }
  }

  loadHistory(limit: number) {
     return db.cspForgeHistory.orderBy('createdAt').reverse().limit(limit).toArray();
  }

  async delete(id: number) {
    await db.cspForgeHistory.delete(id);
  }

  async toggleStar(id: number) {
    const item = await db.cspForgeHistory.get(id);
    if (item) {
        await db.cspForgeHistory.update(id, { starred: item.starred ? 0 : 1 });
    }
  }

  async clear() {
      const nonStarred = await db.cspForgeHistory.where('starred').equals(0).primaryKeys();
      await db.cspForgeHistory.bulkDelete(nonStarred);
  }
}

export const cspForgeWorkspace = new CspForgeWorkspaceAdapter();
