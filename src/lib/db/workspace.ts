import Dexie, { type Table } from 'dexie';
import { db, type CipherHistory, type StructuraHistory, type GitForgeHistory } from '../db'; // Import from src/lib/db.ts

export interface ToolHistoryItem<T = unknown, R = unknown> {
  id?: number;
  toolId: string;
  input?: T;
  result?: R;
  action?: string;
  details?: string;
  timestamp: number;
  starred: boolean;
  name?: string; // Optional name for starred items
}

export class ToolWorkspace extends Dexie {
  history!: Table<ToolHistoryItem>;

  constructor() {
    super('MicroFactoryWorkspace');
    this.version(1).stores({
      history: '++id, toolId, timestamp, starred, [toolId+starred]'
    });
  }
}

export const workspace = new ToolWorkspace();
export const workspaceDB = workspace;

export async function addToHistory(toolId: string, action: string, details: unknown) {
    const serializedDetails = typeof details === 'string' ? details : JSON.stringify(details);

    await workspace.history.add({
        toolId,
        action,
        details: serializedDetails,
        timestamp: Date.now(),
        starred: false
    });

    // Cleanup old (simple version)
    const count = await workspace.history.where('toolId').equals(toolId).count();
    if (count > 100) {
        const collection = workspace.history.where('toolId').equals(toolId).sortBy('timestamp');
        const items = await collection;
        const limit = count - 100;
        if (limit > 0) {
             const toDelete = items.slice(0, limit).map(i => i.id!);
             await workspace.history.bulkDelete(toDelete);
        }
    }
}

export async function saveToHistory<T, R>(
    toolId: string,
    input: T,
    result: R
) {
    // Add new item
    await workspace.history.add({
        toolId,
        input,
        result,
        timestamp: Date.now(),
        starred: false
    });

    // Prune old non-starred items (keep max 100 per tool)
    // We only count non-starred items for pruning
    const count = await workspace.history
        .where({ toolId, starred: 0 }) // 0 is false in IndexedDB index
        .count();

    if (count > 100) {
        // Delete oldest non-starred
        const oldest = await workspace.history
            .where({ toolId, starred: 0 })
            .sortBy('timestamp');

        const toDelete = oldest.slice(0, count - 100);
        await workspace.history.bulkDelete(toDelete.map(i => i.id!));
    }
}

export async function toggleStar(id: number) {
    const item = await workspace.history.get(id);
    if (item) {
        await workspace.history.update(id, { starred: !item.starred });
    }
}

export async function deleteHistoryItem(id: number) {
    await workspace.history.delete(id);
}

export async function clearHistory(toolId: string) {
    // Only clear non-starred
    await workspace.history
        .where({ toolId, starred: 0 })
        .delete();
}

export function getHistoryObservable(toolId: string) {
    return workspace.history
        .where('toolId')
        .equals(toolId)
        .reverse()
        .sortBy('timestamp');
}

export async function loadHistory(toolId: string, limit = 100) {
    return workspace.history
        .where('toolId')
        .equals(toolId)
        .reverse()
        .limit(limit)
        .sortBy('timestamp');
}

export async function loadLastSession(toolId: string) {
    const items = await workspace.history
        .where('toolId')
        .equals(toolId)
        .reverse()
        .limit(1)
        .sortBy('timestamp');
    return items.length > 0 ? items[0] : null;
}

export async function smartSaveToHistory<T, R>(
    toolId: string,
    input: T,
    result: R
) {
    // 1. Get the most recent item
    const lastItems = await workspace.history
        .where('toolId')
        .equals(toolId)
        .reverse()
        .sortBy('timestamp');

    if (lastItems.length > 0) {
        const last = lastItems[0];
        // 2. Deep compare (using JSON stringify for simplicity)
        const lastInput = JSON.stringify(last.input);
        const currentInput = JSON.stringify(input);

        if (lastInput === currentInput) {
            // No significant change, skip save
            return;
        }
    }

    // 3. Save if different or no history
    await saveToHistory(toolId, input, result);
}

// Restore CipherWorkspace functionality using the EXISTING db (webFactoryDB)
export class CipherWorkspaceAdapter {
  async save(item: Omit<CipherHistory, 'id' | 'createdAt' | 'starred'>) {
    // Use the existing main DB
    await db.cipherHistory.add({
      ...item,
      createdAt: new Date(),
      starred: 0
    });

    // Prune
    const count = await db.cipherHistory.where('starred').equals(0).count();
    if (count > 100) {
       const oldest = await db.cipherHistory.orderBy('createdAt').limit(count - 100).keys();
       await db.cipherHistory.bulkDelete(oldest as number[]);
    }
  }

  loadHistory(limit: number) {
     return db.cipherHistory.orderBy('createdAt').reverse().limit(limit).toArray();
  }

  async delete(id: number) {
    await db.cipherHistory.delete(id);
  }

  async toggleStar(id: number) {
    const item = await db.cipherHistory.get(id);
    if (item) {
        await db.cipherHistory.update(id, { starred: item.starred ? 0 : 1 });
    }
  }

  async clear() {
      // Delete only non-starred
      const nonStarred = await db.cipherHistory.where('starred').equals(0).primaryKeys();
      await db.cipherHistory.bulkDelete(nonStarred);
  }
}

export const cipherWorkspace = new CipherWorkspaceAdapter();

// Restore StructuraWorkspace functionality
export class StructuraWorkspaceAdapter {
  async save(item: Omit<StructuraHistory, 'id' | 'createdAt' | 'starred'>) {
    await db.structuraHistory.add({
      ...item,
      createdAt: new Date(),
      starred: 0
    });

    // Prune
    const count = await db.structuraHistory.where('starred').equals(0).count();
    if (count > 100) {
       const oldest = await db.structuraHistory.orderBy('createdAt').limit(count - 100).keys();
       await db.structuraHistory.bulkDelete(oldest as number[]);
    }
  }

  loadHistory(limit: number) {
     return db.structuraHistory.orderBy('createdAt').reverse().limit(limit).toArray();
  }

  async delete(id: number) {
    await db.structuraHistory.delete(id);
  }

  async toggleStar(id: number) {
    const item = await db.structuraHistory.get(id);
    if (item) {
        await db.structuraHistory.update(id, { starred: item.starred ? 0 : 1 });
    }
  }

  async clear() {
      const nonStarred = await db.structuraHistory.where('starred').equals(0).primaryKeys();
      await db.structuraHistory.bulkDelete(nonStarred);
  }
}

export const structuraWorkspace = new StructuraWorkspaceAdapter();

// Restore GitForgeWorkspace functionality
export class GitForgeWorkspaceAdapter {
  async save(item: Omit<GitForgeHistory, 'id' | 'createdAt' | 'starred'>) {
    await db.gitForgeHistory.add({
      ...item,
      createdAt: new Date(),
      starred: 0
    });

    // Prune
    const count = await db.gitForgeHistory.where('starred').equals(0).count();
    if (count > 100) {
       const oldest = await db.gitForgeHistory.orderBy('createdAt').limit(count - 100).keys();
       await db.gitForgeHistory.bulkDelete(oldest as number[]);
    }
  }

  loadHistory(limit: number) {
     return db.gitForgeHistory.orderBy('createdAt').reverse().limit(limit).toArray();
  }

  async delete(id: number) {
    await db.gitForgeHistory.delete(id);
  }

  async toggleStar(id: number) {
    const item = await db.gitForgeHistory.get(id);
    if (item) {
        await db.gitForgeHistory.update(id, { starred: item.starred ? 0 : 1 });
    }
  }

  async clear() {
      const nonStarred = await db.gitForgeHistory.where('starred').equals(0).primaryKeys();
      await db.gitForgeHistory.bulkDelete(nonStarred);
  }
}

export const gitForgeWorkspace = new GitForgeWorkspaceAdapter();
