import Dexie, { type Table } from 'dexie';

export interface RestroRequest {
  id?: number;
  method: string;
  url: string;
  headers: { key: string; value: string; enabled: boolean }[];
  params: { key: string; value: string; enabled: boolean }[];
  bodyType: 'none' | 'json' | 'text' | 'form-data';
  bodyContent: string;
  timestamp: number;
  duration?: number;
  status?: number;
  responseSize?: number;
  isFavorite?: boolean;
  name?: string; // For saved collections
  folder?: string; // For organizing into folders
}

export class RestroDB extends Dexie {
  history!: Table<RestroRequest>;
  collections!: Table<RestroRequest>;

  constructor() {
    super('RestroDB');
    this.version(1).stores({
      history: '++id, timestamp, method, url',
      collections: '++id, name, timestamp, folder'
    });
    this.version(2).stores({
      history: '++id, timestamp, method, url',
      collections: '++id, name, timestamp, folder'
    }).upgrade(tx => {
      return tx.table('collections').toCollection().modify(item => {
        if (!item.folder) item.folder = 'Default';
      });
    });
  }
}

export const db = new RestroDB();

// Helper to add request to history (limits to 100 items)
export async function addToHistory(req: RestroRequest) {
  await db.history.add({ ...req, id: undefined, timestamp: Date.now() });
  const count = await db.history.count();
  if (count > 100) {
    const oldest = await db.history.orderBy('timestamp').limit(count - 100).keys();
    await db.history.bulkDelete(oldest as number[]);
  }
}
