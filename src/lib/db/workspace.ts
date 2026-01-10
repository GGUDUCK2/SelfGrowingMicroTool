import { db, type CipherHistory } from '$lib/db';
import type { Table } from 'dexie';

/**
 * Generic Tool Workspace Manager
 * Handles history management (save, load, delete) with a unified interface.
 */
export class ToolWorkspace<T extends { id?: number; createdAt: Date; starred?: number; input?: string }> {
  constructor(private table: Table<T>) {}

  /**
   * Saves an item to history, maintaining a limit of 100 non-starred items.
   */
  async save(item: Omit<T, 'id' | 'createdAt'>): Promise<number> {
    const newItem = {
      ...item,
      createdAt: new Date(),
      starred: 0
    } as T;

    const id = await this.table.add(newItem);

    // Prune old history
    await this.prune();

    return id as number;
  }

  /**
   * Prunes history to keep only the latest 100 non-starred items.
   */
  async prune(limit = 100): Promise<void> {
    const count = await this.table.where('starred').equals(0).count();
    if (count > limit) {
      const deleteCount = count - limit;
      // Get the oldest non-starred items
      const keys = await this.table
        .where('starred')
        .equals(0)
        .sortBy('createdAt');

      const keysToDelete = keys.slice(0, deleteCount).map(k => k.id!);
      await this.table.bulkDelete(keysToDelete);
    }
  }

  /**
   * Loads history sorted by creation date descending.
   */
  async loadHistory(limit = 50): Promise<T[]> {
    return await this.table
      .orderBy('createdAt')
      .reverse()
      .limit(limit)
      .toArray();
  }

  /**
   * Toggles the starred status of an item.
   */
  async toggleStar(id: number): Promise<void> {
    const item = await this.table.get(id);
    if (item) {
      await this.table.update(id, { starred: item.starred ? 0 : 1 } as any);
    }
  }

  async delete(id: number): Promise<void> {
    await this.table.delete(id);
  }

  async clear(): Promise<void> {
    await this.table.clear();
  }
}

// Singleton instances for specific tools can be exported here if needed
export const cipherWorkspace = new ToolWorkspace<CipherHistory>(db.cipherHistory);
