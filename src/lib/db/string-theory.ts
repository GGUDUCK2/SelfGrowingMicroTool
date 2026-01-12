import Dexie, { type Table } from 'dexie';

export interface StringHistory {
  id?: number;
  text: string;
  operation: string; // e.g. "Uppercase", "Base64 Encode"
  timestamp: number;
  isFavorite: boolean;
}

export class StringTheoryDB extends Dexie {
  history!: Table<StringHistory>;

  constructor() {
    super('StringTheoryDB');
    this.version(1).stores({
      history: '++id, timestamp, isFavorite' // Indexed for performance
    });
  }
}

export const db = new StringTheoryDB();
