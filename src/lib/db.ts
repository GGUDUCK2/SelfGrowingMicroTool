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

export interface JsonHistory {
  id?: number;
  content: string;
  action: 'format' | 'minify' | 'validate' | 'convert';
  createdAt: Date;
}

export interface CronHistory {
  id?: number;
  expression: string;
  description: string;
  createdAt: Date;
}

export interface RegexHistory {
  id?: number;
  pattern: string;
  flags: string;
  createdAt: Date;
}

export interface ColorHistory {
  id?: number;
  baseColor: string; // Hex
  paletteType: string;
  createdAt: Date;
  starred?: number; // 0 or 1, using number for Dexie ease of indexing if needed
}

export interface DiffHistory {
  id?: number;
  original: string;
  modified: string;
  mode: string;
  createdAt: Date;
  starred?: number;
}

export interface IdForgeHistory {
  id?: number;
  type: string;
  count: number;
  sample: string; // First generated ID as sample
  createdAt: Date;
  starred?: number;
}

export interface CipherHistory {
  id?: number;
  type: 'hash' | 'hmac' | 'encode' | 'jwt' | 'password';
  content: string; // The result or summary
  details?: string; // Extra details like algorithm or key hint
  input?: string; // Original input to restore state
  settings?: string; // JSON string of settings (algo, mode, etc.)
  createdAt: Date;
  starred?: number;
}

class MySubClassedDexie extends Dexie {
  compoundInterestConfig!: Table<CompoundInterestConfig>;
  compoundInterestHistory!: Table<CompoundInterestHistory>;
  glassmorphismHistory!: Table<GlassmorphismHistory>;
  jsonHistory!: Table<JsonHistory>;
  cronHistory!: Table<CronHistory>;
  regexHistory!: Table<RegexHistory>;
  colorHistory!: Table<ColorHistory>;
  diffHistory!: Table<DiffHistory>;
  idForgeHistory!: Table<IdForgeHistory>;
  cipherHistory!: Table<CipherHistory>;

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
    this.version(4).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt',
      jsonHistory: '++id, createdAt'
    });
    this.version(5).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt',
      jsonHistory: '++id, createdAt',
      cronHistory: '++id, createdAt'
    });
    this.version(6).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt',
      jsonHistory: '++id, createdAt',
      cronHistory: '++id, createdAt',
      regexHistory: '++id, createdAt'
    });
    this.version(7).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt',
      jsonHistory: '++id, createdAt',
      cronHistory: '++id, createdAt',
      regexHistory: '++id, createdAt',
      colorHistory: '++id, createdAt'
    });
    this.version(8).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt',
      jsonHistory: '++id, createdAt',
      cronHistory: '++id, createdAt',
      regexHistory: '++id, createdAt',
      colorHistory: '++id, createdAt, starred'
    }).upgrade(tx => {
      return tx.table('colorHistory').toCollection().modify(item => {
        item.starred = 0;
      });
    });
    this.version(9).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt',
      jsonHistory: '++id, createdAt',
      cronHistory: '++id, createdAt',
      regexHistory: '++id, createdAt',
      colorHistory: '++id, createdAt, starred',
      diffHistory: '++id, createdAt, starred'
    });
    this.version(10).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt',
      jsonHistory: '++id, createdAt',
      cronHistory: '++id, createdAt',
      regexHistory: '++id, createdAt',
      colorHistory: '++id, createdAt, starred',
      diffHistory: '++id, createdAt, starred',
      idForgeHistory: '++id, createdAt, starred'
    });
    this.version(11).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt',
      jsonHistory: '++id, createdAt',
      cronHistory: '++id, createdAt',
      regexHistory: '++id, createdAt',
      colorHistory: '++id, createdAt, starred',
      diffHistory: '++id, createdAt, starred',
      idForgeHistory: '++id, createdAt, starred',
      cipherHistory: '++id, createdAt, starred'
    });
    this.version(12).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt',
      jsonHistory: '++id, createdAt',
      cronHistory: '++id, createdAt',
      regexHistory: '++id, createdAt',
      colorHistory: '++id, createdAt, starred',
      diffHistory: '++id, createdAt, starred',
      idForgeHistory: '++id, createdAt, starred',
      cipherHistory: '++id, createdAt, starred'
    }).upgrade(tx => {
      return tx.table('cipherHistory').toCollection().modify(item => {
        if (!item.input) item.input = '';
        if (!item.settings) item.settings = '{}';
      });
    });
  }
}

import { browser } from '$app/environment';

export const db = (browser ? new MySubClassedDexie() : {}) as MySubClassedDexie;
