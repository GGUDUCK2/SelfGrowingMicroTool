import Dexie, { type Table } from 'dexie';
import type { PixelHistoryItem } from './types';

export class PixelForgeDB extends Dexie {
  history!: Table<PixelHistoryItem>;

  constructor() {
    super('PixelForgeDB');
    this.version(1).stores({
      history: 'id, fileName, timestamp, format'
    });
  }
}

export const db = new PixelForgeDB();

export const addToHistory = async (item: PixelHistoryItem) => {
    try {
        await db.history.add(item);
        // Keep only last 50 items
        const count = await db.history.count();
        if (count > 50) {
            const keys = await db.history.orderBy('timestamp').keys();
            await db.history.bulkDelete(keys.slice(0, count - 50));
        }
    } catch (error) {
        console.error('Failed to save to history', error);
    }
};

export const getHistory = async () => {
    return await db.history.orderBy('timestamp').reverse().toArray();
};

export const clearHistory = async () => {
    return await db.history.clear();
};
