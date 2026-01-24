import Dexie, { type Table } from 'dexie';
import type { LogSession } from '$lib/utils/log-prism/types';

export class LogPrismDB extends Dexie {
  sessions!: Table<LogSession, number>;

  constructor() {
    super('LogPrismDB');
    this.version(1).stores({
      sessions: '++id, name, createdAt'
    });
    this.version(2).stores({
      sessions: '++id, name, createdAt, starred'
    });
  }
}

export const logPrismDB = new LogPrismDB();

export async function pruneHistory() {
  const count = await logPrismDB.sessions.where('starred').equals(0).count();
  if (count > 20) {
    const oldest = await logPrismDB.sessions
      .where('starred')
      .equals(0)
      .sortBy('createdAt');

    const limit = count - 20;
    const toDelete = oldest.slice(0, limit).map(s => s.id!);
    await logPrismDB.sessions.bulkDelete(toDelete);
  }
}
