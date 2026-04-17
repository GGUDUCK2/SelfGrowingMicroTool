import Dexie, { type Table } from 'dexie';

export interface CurlHistoryItem {
  id?: number;
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
  createdAt: string;
}

export class CurlForgeDB extends Dexie {
  history!: Table<CurlHistoryItem, number>;

  constructor() {
    super('CurlForgeDB');
    this.version(1).stores({
      history: '++id, method, url, createdAt'
    });
  }
}

export const db = new CurlForgeDB();
