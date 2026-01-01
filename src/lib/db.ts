import Dexie, { type Table } from 'dexie';

export interface CompoundInterestConfig {
  id?: number;
  principal: number;
  rate: number;
  years: number;
  contribution: number;
  inflationRate: number;
  compoundFrequency: number; // 12 for monthly, 1 for annually, etc.
  taxRate: number;
  updatedAt: Date;
}

export interface CompoundInterestHistory {
  id?: number;
  principal: number;
  rate: number;
  years: number;
  contribution: number;
  inflationRate: number;
  compoundFrequency: number;
  taxRate: number;
  createdAt: Date;
}

export interface GlassmorphismHistory {
  id?: number;
  blur: number;
  transparency: number;
  color: string;
  outline: number;
  radius: number;
  createdAt: Date;
}

class MySubClassedDexie extends Dexie {
  compoundInterestConfig!: Table<CompoundInterestConfig>;
  compoundInterestHistory!: Table<CompoundInterestHistory>;
  glassmorphismHistory!: Table<GlassmorphismHistory>;

  constructor() {
    super('webFactoryDB');
    this.version(1).stores({
      compoundInterestConfig: '++id, updatedAt'
    });
    this.version(2).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt'
    });
    this.version(3).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt'
    });
  }
}

export const db = new MySubClassedDexie();
