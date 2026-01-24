import Dexie, { type Table } from 'dexie';
import type { LogSession } from '$lib/utils/log-prism/types';

export class LogPrismDB extends Dexie {
  sessions!: Table<LogSession, number>;

  constructor() {
    super('LogPrismDB');
    this.version(1).stores({
      sessions: '++id, name, createdAt'
    });
  }
}

export const logPrismDB = new LogPrismDB();
