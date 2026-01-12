import Dexie, { type Table } from 'dexie';

export interface ConversionRecord {
  id?: number;
  fromValue: number;
  fromUnitId: string;
  toUnitId: string;
  categoryId: string;
  resultValue: number;
  timestamp: number;
  isFavorite: boolean;
}

export class UnitVerseDB extends Dexie {
  history!: Table<ConversionRecord>;

  constructor() {
    super('UnitVerseDB');
    this.version(1).stores({
      history: '++id, timestamp, categoryId, isFavorite'
    });
  }
}

export const db = new UnitVerseDB();

export const addToHistory = async (record: Omit<ConversionRecord, 'id' | 'timestamp' | 'isFavorite'>) => {
  try {
    // Check for duplicate recent entry to avoid spamming history
    const recent = await db.history.orderBy('timestamp').reverse().limit(1).first();
    if (
      recent &&
      recent.fromValue === record.fromValue &&
      recent.fromUnitId === record.fromUnitId &&
      recent.toUnitId === record.toUnitId
    ) {
      // Update timestamp instead of adding new
      return await db.history.update(recent.id!, { timestamp: Date.now() });
    }

    await db.history.add({
      ...record,
      timestamp: Date.now(),
      isFavorite: false
    });

    // Prune history (keep last 50 non-favorites)
    const nonFavorites = await db.history.where('isFavorite').equals(0).toArray();
    if (nonFavorites.length > 50) {
      // Sort by timestamp ascending (oldest first)
      nonFavorites.sort((a, b) => a.timestamp - b.timestamp);

      const itemsToDelete = nonFavorites.slice(0, nonFavorites.length - 50);
      const keysToDelete = itemsToDelete.map(item => item.id!);

      await db.history.bulkDelete(keysToDelete);
    }
  } catch (error) {
    console.error('Failed to add to history:', error);
  }
};

export const toggleFavorite = async (id: number) => {
    const item = await db.history.get(id);
    if (item) {
        await db.history.update(id, { isFavorite: !item.isFavorite });
    }
}

export const clearHistory = async () => {
    // Only delete non-favorites
    const keys = await db.history.where('isFavorite').equals(0).primaryKeys();
    await db.history.bulkDelete(keys);
}
