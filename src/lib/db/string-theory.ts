import Dexie, { type Table } from 'dexie';

export interface StringHistory {
  id?: number;
  text: string;
  operation: string; // e.g. "Uppercase", "Base64 Encode"
  timestamp: number;
  isFavorite: boolean; // Renamed to match the schema but mapped to 'starred' logic
}

export interface StringTemplate {
  id?: number;
  title: string;
  content: string;
  createdAt: number;
}

export class StringTheoryDB extends Dexie {
  history!: Table<StringHistory>;
  templates!: Table<StringTemplate>;

  constructor() {
    super('StringTheoryDB');
    this.version(1).stores({
      history: '++id, timestamp, isFavorite'
    });
    this.version(2).stores({
      history: '++id, timestamp, isFavorite',
      templates: '++id, title, createdAt'
    });
  }
}

export const db = new StringTheoryDB();

export const StringHistoryManager = {
    async add(text: string, operation: string) {
        await db.history.add({
            text,
            operation,
            timestamp: Date.now(),
            isFavorite: false
        });

        // Prune: Keep max 100 non-favorite items
        const count = await db.history.where('isFavorite').equals(0).count(); // Dexie uses 0 for false in boolean indices
        if (count > 100) {
            const oldest = await db.history
                .where('isFavorite')
                .equals(0)
                .sortBy('timestamp');

            const deleteCount = count - 100;
            if (deleteCount > 0) {
                 const toDelete = oldest.slice(0, deleteCount).map(i => i.id!);
                 await db.history.bulkDelete(toDelete);
            }
        }
    },

    async toggleFavorite(id: number) {
        const item = await db.history.get(id);
        if (item) {
            await db.history.update(id, { isFavorite: !item.isFavorite });
        }
    },

    async delete(id: number) {
        await db.history.delete(id);
    },

    async clearAll() {
        // Only clear non-favorites
        const keys = await db.history.where('isFavorite').equals(0).primaryKeys();
        await db.history.bulkDelete(keys);
    }
};
