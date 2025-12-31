import Dexie, { type Table } from 'dexie';

export interface HistoryItem {
  id?: number;
  toolId: string;
  data: any;
  createdAt: Date;
}

export class WebFactoryDB extends Dexie {
  history!: Table<HistoryItem>;

  constructor() {
    super('WebFactoryDB');
    this.version(1).stores({
      history: '++id, toolId, createdAt'
    });
  }
}

export const db = new WebFactoryDB();
