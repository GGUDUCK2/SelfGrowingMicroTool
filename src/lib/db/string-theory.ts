import Dexie, { type Table } from 'dexie';

export interface StringHistory {
  id?: number;
  text: string;
  operation: string; // e.g. "Uppercase", "Base64 Encode"
  timestamp: number;
  isFavorite: boolean;
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
