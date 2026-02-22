import Dexie, { type Table as DexieTable } from 'dexie';
import type { Table as SchemaTable, Relation as SchemaRelation } from './types/schema-forge';
import type { IconConfig } from './utils/icon-forge/processor';
import type { GridArea, GridItem } from '$lib/utils/grid-master/types';
import type { SchemaField } from '$lib/utils/mock-forge/types';
import type { LogicForgeHistory } from './types/logic-forge';

export interface MockForgeSchema {
  id?: number;
  name: string;
  fields: SchemaField[];
  createdAt: Date;
  starred?: number;
}

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

export interface StructuraHistory {
  id?: number;
  inputFormat: string;
  outputFormat: string;
  inputPreview: string; // Short preview of input
  createdAt: Date;
  starred?: number;
}

export interface MarkFlowHistory {
  id?: number;
  content: string;
  createdAt: Date;
  starred?: number;
}

export interface SeoHistory {
  id?: number;
  title: string;
  description: string;
  url: string;
  ogImage?: string;
  jsonLdType?: string;
  projectName?: string;
  starred?: number; // Added starred field
  createdAt: Date;
}

export interface SchemaForgeProject {
  id?: number;
  name: string;
  tables: SchemaTable[];
  relations: SchemaRelation[];
  createdAt: Date;
  updatedAt: Date;
  starred?: number;
}

export interface IconForgeProject {
  id?: number;
  name: string;
  config: IconConfig;
  blob?: Blob;
  createdAt: Date;
  starred?: number;
}

export interface PromptForgeHistory {
  id?: number;
  title: string;
  template: string;
  variables: Record<string, string>;
  scenarios?: Record<string, Record<string, string>>;
  folder?: string;
  tags?: string[];
  createdAt: Date;
  starred?: number;
}

export interface InputLabHistory {
  id?: number;
  type: 'keyboard' | 'gamepad' | 'pointer' | 'screen';
  data: string;
  createdAt: Date;
  starred?: number;
}

export interface DecisionForgeMatrix {
  id?: number;
  name: string;
  criteria: { id: string; name: string; weight: number }[];
  options: { id: string; name: string; scores: Record<string, number> }[];
  createdAt: Date;
  starred?: number;
}

export interface GridMasterProject {
  id?: number;
  name: string;
  rows: string[];
  cols: string[];
  gap: string;
  rowGap: string;
  colGap: string;
  areas: GridArea[];
  items: GridItem[];
  createdAt: Date;
  updatedAt: Date;
  starred?: number;
}

export interface SnippetForgeHistory {
  id?: number;
  code: string;
  language: string;
  theme: string;
  background: string;
  padding: number;
  windowControls: boolean;
  title?: string;
  starred?: number;
  createdAt: Date;
}

export interface JwtForgeHistory {
  id?: number;
  token: string;
  header: any;
  payload: any;
  isValid: boolean;
  algorithm: string;
  createdAt: Date;
  starred?: number;
}

export interface SqlForgeHistory {
  id?: number;
  query: string;
  timestamp: Date;
  starred?: number;
  status: 'success' | 'error';
  executionTime?: number;
}

export interface MotionMasterHistory {
  id?: number;
  name: string;
  state: any;
  createdAt: Date;
  starred?: number;
}

export interface InvoiceHistory {
  id?: number;
  data: any;
  invoiceNumber: string;
  clientName: string;
  total: number;
  currency: string;
  createdAt: Date;
  starred?: number;
}

export interface InvoiceClient {
  id?: number;
  name: string;
  email: string;
  address: string;
  createdAt: Date;
}

export interface DiagramForgeHistory {
  id?: number;
  title: string;
  code: string;
  type: string;
  createdAt: Date;
  starred?: number;
}

export interface TableForgeHistory {
  id?: number;
  name?: string;
  data: any[];
  format: string;
  createdAt: Date;
  starred?: number;
}

export interface ResumeForgeHistory {
  id?: number;
  name: string;
  data: any;
  createdAt: Date;
  updatedAt: Date;
  starred?: number;
}

export interface TypeForgeHistory {
  id?: number;
  fontName: string;
  fileName: string;
  config: string; // JSON string of axes
  createdAt: Date;
  starred?: number;
}

export interface AudioForgeHistory {
  id?: number;
  name: string;
  blob: Blob;
  duration: number;
  format: string;
  createdAt: Date;
  starred?: number;
}

export interface ScreenForgeHistory {
  id?: number;
  name: string;
  blob: Blob;
  duration: number;
  size: number;
  createdAt: Date;
  starred?: number;
}

export interface PdfForgeHistory {
  id?: number;
  name: string;
  files: { id: string; name: string; blob: Blob }[];
  pages: any[]; // Using any to avoid circular dependency, will cast to PDFPage[]
  createdAt: Date;
  starred?: number;
}

export interface BannerForgeHistory {
  id?: number;
  name: string;
  config: string; // JSON string
  preview?: string; // Base64 thumbnail
  createdAt: Date;
  starred?: number;
}

export interface RhythmForgePreset {
  id?: number;
  name: string;
  bpm: number;
  signature: [number, number]; // [numerator, denominator]
  polyrhythm?: [number, number]; // [primary, secondary]
  soundPack: string;
  createdAt: Date;
  starred?: number;
}

export interface RhythmForgeHistory {
  id?: number;
  bpm: number;
  signature: [number, number];
  polyrhythm?: [number, number];
  soundPack: string;
  createdAt: Date;
  starred?: number;
}

export interface RhythmForgeSession {
  id?: number;
  bpm: number;
  duration: number; // in seconds
  accuracy: number; // percentage 0-100
  avgOffset: number; // in ms
  createdAt: Date;
}

export interface RhythmForgePlaylist {
  id?: number;
  name: string;
  tracks: any[]; // RhythmSettings[]
  createdAt: Date;
  starred?: number;
}

export interface KeyForgeHistory {
  id?: number;
  wpm: number;
  accuracy: number;
  consistency: number;
  mode: string; // 'time', 'words', 'quote', 'zen'
  language: string; // 'english', 'javascript', etc.
  duration: number; // seconds
  timestamp: Date;
  starred?: number;
}

export interface ZenForgeMix {
  id?: number;
  name: string;
  tracks: { id: string; volume: number; muted: boolean }[];
  createdAt: Date;
  starred?: number;
}

export interface MathForgeHistory {
  id?: number;
  type: string;
  expression: string;
  result: string;
  createdAt: Date;
  starred?: number;
}

export interface FileForgeHistory {
  id?: number;
  name: string;
  size: number;
  type: string;
  hash: string;
  createdAt: Date;
  starred?: number;
}

class MySubClassedDexie extends Dexie {
  compoundInterestConfig!: DexieTable<CompoundInterestConfig>;
  compoundInterestHistory!: DexieTable<CompoundInterestHistory>;
  glassmorphismHistory!: DexieTable<GlassmorphismHistory>;
  jsonHistory!: DexieTable<JsonHistory>;
  cronHistory!: DexieTable<CronHistory>;
  regexHistory!: DexieTable<RegexHistory>;
  colorHistory!: DexieTable<ColorHistory>;
  diffHistory!: DexieTable<DiffHistory>;
  idForgeHistory!: DexieTable<IdForgeHistory>;
  cipherHistory!: DexieTable<CipherHistory>;
  structuraHistory!: DexieTable<StructuraHistory>;
  markFlowHistory!: DexieTable<MarkFlowHistory>;
  seoHistory!: DexieTable<SeoHistory>;
  schemaForgeProjects!: DexieTable<SchemaForgeProject>;
  iconForgeProjects!: DexieTable<IconForgeProject>;
  promptForgeHistory!: DexieTable<PromptForgeHistory>;
  inputLabHistory!: DexieTable<InputLabHistory>;
  decisionForgeMatrices!: DexieTable<DecisionForgeMatrix>;
  gridMasterProjects!: DexieTable<GridMasterProject>;
  snippetForgeHistory!: DexieTable<SnippetForgeHistory>;
  jwtForgeHistory!: DexieTable<JwtForgeHistory>;
  sqlForgeHistory!: DexieTable<SqlForgeHistory>;
  motionMasterHistory!: DexieTable<MotionMasterHistory>;
  mockForgeSchemas!: DexieTable<MockForgeSchema>;
  invoiceForgeHistory!: DexieTable<InvoiceHistory>;
  invoiceForgeClients!: DexieTable<InvoiceClient>;
  diagramForgeHistory!: DexieTable<DiagramForgeHistory>;
  tableForgeHistory!: DexieTable<TableForgeHistory>;
  resumeForgeHistory!: DexieTable<ResumeForgeHistory>;
  typeForgeHistory!: DexieTable<TypeForgeHistory>;
  audioForgeHistory!: DexieTable<AudioForgeHistory>;
  screenForgeHistory!: DexieTable<ScreenForgeHistory>;
  pdfForgeHistory!: DexieTable<PdfForgeHistory>;
  bannerForgeHistory!: DexieTable<BannerForgeHistory>;
  rhythmForgePresets!: DexieTable<RhythmForgePreset>;
  rhythmForgeHistory!: DexieTable<RhythmForgeHistory>;
  rhythmForgeSessions!: DexieTable<RhythmForgeSession>;
  rhythmForgePlaylists!: DexieTable<RhythmForgePlaylist>;
  logicForgeHistory!: DexieTable<LogicForgeHistory>;
  keyForgeHistory!: DexieTable<KeyForgeHistory>;
  zenForgeMixes!: DexieTable<ZenForgeMix>;
  mathForgeHistory!: DexieTable<MathForgeHistory>;
  fileForgeHistory!: DexieTable<FileForgeHistory>;

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
    this.version(13).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt',
      jsonHistory: '++id, createdAt',
      cronHistory: '++id, createdAt',
      regexHistory: '++id, createdAt',
      colorHistory: '++id, createdAt, starred',
      diffHistory: '++id, createdAt, starred',
      idForgeHistory: '++id, createdAt, starred',
      cipherHistory: '++id, createdAt, starred',
      structuraHistory: '++id, createdAt, starred'
    });
    this.version(14).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt',
      jsonHistory: '++id, createdAt',
      cronHistory: '++id, createdAt',
      regexHistory: '++id, createdAt',
      colorHistory: '++id, createdAt, starred',
      diffHistory: '++id, createdAt, starred',
      idForgeHistory: '++id, createdAt, starred',
      cipherHistory: '++id, createdAt, starred',
      structuraHistory: '++id, createdAt, starred',
      markFlowHistory: '++id, createdAt, starred'
    });
    this.version(15).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt',
      jsonHistory: '++id, createdAt',
      cronHistory: '++id, createdAt',
      regexHistory: '++id, createdAt',
      colorHistory: '++id, createdAt, starred',
      diffHistory: '++id, createdAt, starred',
      idForgeHistory: '++id, createdAt, starred',
      cipherHistory: '++id, createdAt, starred',
      structuraHistory: '++id, createdAt, starred',
      markFlowHistory: '++id, createdAt, starred',
      seoHistory: '++id, createdAt'
    });
    this.version(16).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt',
      jsonHistory: '++id, createdAt',
      cronHistory: '++id, createdAt',
      regexHistory: '++id, createdAt',
      colorHistory: '++id, createdAt, starred',
      diffHistory: '++id, createdAt, starred',
      idForgeHistory: '++id, createdAt, starred',
      cipherHistory: '++id, createdAt, starred',
      structuraHistory: '++id, createdAt, starred',
      markFlowHistory: '++id, createdAt, starred',
      seoHistory: '++id, createdAt, projectName'
    }).upgrade(tx => {
      return tx.table('seoHistory').toCollection().modify(item => {
        if (!item.projectName) item.projectName = '';
      });
    });
    this.version(17).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt',
      jsonHistory: '++id, createdAt',
      cronHistory: '++id, createdAt',
      regexHistory: '++id, createdAt',
      colorHistory: '++id, createdAt, starred',
      diffHistory: '++id, createdAt, starred',
      idForgeHistory: '++id, createdAt, starred',
      cipherHistory: '++id, createdAt, starred',
      structuraHistory: '++id, createdAt, starred',
      markFlowHistory: '++id, createdAt, starred',
      seoHistory: '++id, createdAt, projectName',
      schemaForgeProjects: '++id, createdAt, starred'
    });
    this.version(18).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt',
      jsonHistory: '++id, createdAt',
      cronHistory: '++id, createdAt',
      regexHistory: '++id, createdAt',
      colorHistory: '++id, createdAt, starred',
      diffHistory: '++id, createdAt, starred',
      idForgeHistory: '++id, createdAt, starred',
      cipherHistory: '++id, createdAt, starred',
      structuraHistory: '++id, createdAt, starred',
      markFlowHistory: '++id, createdAt, starred',
      seoHistory: '++id, createdAt, projectName, starred',
      schemaForgeProjects: '++id, createdAt, starred'
    }).upgrade(tx => {
       return tx.table('seoHistory').toCollection().modify(item => {
           if (item.starred === undefined) item.starred = 0;
       });
    });
    this.version(19).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt',
      jsonHistory: '++id, createdAt',
      cronHistory: '++id, createdAt',
      regexHistory: '++id, createdAt',
      colorHistory: '++id, createdAt, starred',
      diffHistory: '++id, createdAt, starred',
      idForgeHistory: '++id, createdAt, starred',
      cipherHistory: '++id, createdAt, starred',
      structuraHistory: '++id, createdAt, starred',
      markFlowHistory: '++id, createdAt, starred',
      seoHistory: '++id, createdAt, projectName, starred',
      schemaForgeProjects: '++id, createdAt, starred',
      iconForgeProjects: '++id, createdAt, starred'
    });
    this.version(20).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt',
      jsonHistory: '++id, createdAt',
      cronHistory: '++id, createdAt',
      regexHistory: '++id, createdAt',
      colorHistory: '++id, createdAt, starred',
      diffHistory: '++id, createdAt, starred',
      idForgeHistory: '++id, createdAt, starred',
      cipherHistory: '++id, createdAt, starred',
      structuraHistory: '++id, createdAt, starred',
      markFlowHistory: '++id, createdAt, starred',
      seoHistory: '++id, createdAt, projectName, starred',
      schemaForgeProjects: '++id, createdAt, starred',
      iconForgeProjects: '++id, createdAt, starred',
      promptForgeHistory: '++id, createdAt, starred'
    });
    this.version(21).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt',
      jsonHistory: '++id, createdAt',
      cronHistory: '++id, createdAt',
      regexHistory: '++id, createdAt',
      colorHistory: '++id, createdAt, starred',
      diffHistory: '++id, createdAt, starred',
      idForgeHistory: '++id, createdAt, starred',
      cipherHistory: '++id, createdAt, starred',
      structuraHistory: '++id, createdAt, starred',
      markFlowHistory: '++id, createdAt, starred',
      seoHistory: '++id, createdAt, projectName, starred',
      schemaForgeProjects: '++id, createdAt, starred',
      iconForgeProjects: '++id, createdAt, starred',
      promptForgeHistory: '++id, createdAt, starred'
    });
    this.version(22).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt',
      jsonHistory: '++id, createdAt',
      cronHistory: '++id, createdAt',
      regexHistory: '++id, createdAt',
      colorHistory: '++id, createdAt, starred',
      diffHistory: '++id, createdAt, starred',
      idForgeHistory: '++id, createdAt, starred',
      cipherHistory: '++id, createdAt, starred',
      structuraHistory: '++id, createdAt, starred',
      markFlowHistory: '++id, createdAt, starred',
      seoHistory: '++id, createdAt, projectName, starred',
      schemaForgeProjects: '++id, createdAt, starred',
      iconForgeProjects: '++id, createdAt, starred',
      promptForgeHistory: '++id, createdAt, starred',
      inputLabHistory: '++id, createdAt, starred'
    });
    this.version(23).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt',
      jsonHistory: '++id, createdAt',
      cronHistory: '++id, createdAt',
      regexHistory: '++id, createdAt',
      colorHistory: '++id, createdAt, starred',
      diffHistory: '++id, createdAt, starred',
      idForgeHistory: '++id, createdAt, starred',
      cipherHistory: '++id, createdAt, starred',
      structuraHistory: '++id, createdAt, starred',
      markFlowHistory: '++id, createdAt, starred',
      seoHistory: '++id, createdAt, projectName, starred',
      schemaForgeProjects: '++id, createdAt, starred',
      iconForgeProjects: '++id, createdAt, starred',
      promptForgeHistory: '++id, createdAt, starred',
      inputLabHistory: '++id, createdAt, starred',
      decisionForgeMatrices: '++id, createdAt, starred'
    });
    this.version(24).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt',
      jsonHistory: '++id, createdAt',
      cronHistory: '++id, createdAt',
      regexHistory: '++id, createdAt',
      colorHistory: '++id, createdAt, starred',
      diffHistory: '++id, createdAt, starred',
      idForgeHistory: '++id, createdAt, starred',
      cipherHistory: '++id, createdAt, starred',
      structuraHistory: '++id, createdAt, starred',
      markFlowHistory: '++id, createdAt, starred',
      seoHistory: '++id, createdAt, projectName, starred',
      schemaForgeProjects: '++id, createdAt, starred',
      iconForgeProjects: '++id, createdAt, starred',
      promptForgeHistory: '++id, createdAt, starred',
      inputLabHistory: '++id, createdAt, starred',
      decisionForgeMatrices: '++id, createdAt, starred',
      gridMasterProjects: '++id, createdAt, starred'
    });
    this.version(25).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt',
      jsonHistory: '++id, createdAt',
      cronHistory: '++id, createdAt',
      regexHistory: '++id, createdAt',
      colorHistory: '++id, createdAt, starred',
      diffHistory: '++id, createdAt, starred',
      idForgeHistory: '++id, createdAt, starred',
      cipherHistory: '++id, createdAt, starred',
      structuraHistory: '++id, createdAt, starred',
      markFlowHistory: '++id, createdAt, starred',
      seoHistory: '++id, createdAt, projectName, starred',
      schemaForgeProjects: '++id, createdAt, starred',
      iconForgeProjects: '++id, createdAt, starred',
      promptForgeHistory: '++id, createdAt, starred',
      inputLabHistory: '++id, createdAt, starred',
      decisionForgeMatrices: '++id, createdAt, starred',
      gridMasterProjects: '++id, createdAt, starred',
      snippetForgeHistory: '++id, createdAt, starred'
    });
    this.version(26).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt',
      jsonHistory: '++id, createdAt',
      cronHistory: '++id, createdAt',
      regexHistory: '++id, createdAt',
      colorHistory: '++id, createdAt, starred',
      diffHistory: '++id, createdAt, starred',
      idForgeHistory: '++id, createdAt, starred',
      cipherHistory: '++id, createdAt, starred',
      structuraHistory: '++id, createdAt, starred',
      markFlowHistory: '++id, createdAt, starred',
      seoHistory: '++id, createdAt, projectName, starred',
      schemaForgeProjects: '++id, createdAt, starred',
      iconForgeProjects: '++id, createdAt, starred',
      promptForgeHistory: '++id, createdAt, starred',
      inputLabHistory: '++id, createdAt, starred',
      decisionForgeMatrices: '++id, createdAt, starred',
      gridMasterProjects: '++id, createdAt, starred',
      snippetForgeHistory: '++id, createdAt, starred',
      jwtForgeHistory: '++id, createdAt, starred'
    });
    this.version(27).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt',
      jsonHistory: '++id, createdAt',
      cronHistory: '++id, createdAt',
      regexHistory: '++id, createdAt',
      colorHistory: '++id, createdAt, starred',
      diffHistory: '++id, createdAt, starred',
      idForgeHistory: '++id, createdAt, starred',
      cipherHistory: '++id, createdAt, starred',
      structuraHistory: '++id, createdAt, starred',
      markFlowHistory: '++id, createdAt, starred',
      seoHistory: '++id, createdAt, projectName, starred',
      schemaForgeProjects: '++id, createdAt, starred',
      iconForgeProjects: '++id, createdAt, starred',
      promptForgeHistory: '++id, createdAt, starred',
      inputLabHistory: '++id, createdAt, starred',
      decisionForgeMatrices: '++id, createdAt, starred',
      gridMasterProjects: '++id, createdAt, starred',
      snippetForgeHistory: '++id, createdAt, starred',
      jwtForgeHistory: '++id, createdAt, starred',
      sqlForgeHistory: '++id, timestamp, starred'
    });
    this.version(28).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt',
      jsonHistory: '++id, createdAt',
      cronHistory: '++id, createdAt',
      regexHistory: '++id, createdAt',
      colorHistory: '++id, createdAt, starred',
      diffHistory: '++id, createdAt, starred',
      idForgeHistory: '++id, createdAt, starred',
      cipherHistory: '++id, createdAt, starred',
      structuraHistory: '++id, createdAt, starred',
      markFlowHistory: '++id, createdAt, starred',
      seoHistory: '++id, createdAt, projectName, starred',
      schemaForgeProjects: '++id, createdAt, starred',
      iconForgeProjects: '++id, createdAt, starred',
      promptForgeHistory: '++id, createdAt, starred',
      inputLabHistory: '++id, createdAt, starred',
      decisionForgeMatrices: '++id, createdAt, starred',
      gridMasterProjects: '++id, createdAt, starred',
      snippetForgeHistory: '++id, createdAt, starred',
      jwtForgeHistory: '++id, createdAt, starred',
      sqlForgeHistory: '++id, timestamp, starred',
      motionMasterHistory: '++id, createdAt, starred'
    });
    this.version(29).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt',
      jsonHistory: '++id, createdAt',
      cronHistory: '++id, createdAt',
      regexHistory: '++id, createdAt',
      colorHistory: '++id, createdAt, starred',
      diffHistory: '++id, createdAt, starred',
      idForgeHistory: '++id, createdAt, starred',
      cipherHistory: '++id, createdAt, starred',
      structuraHistory: '++id, createdAt, starred',
      markFlowHistory: '++id, createdAt, starred',
      seoHistory: '++id, createdAt, projectName, starred',
      schemaForgeProjects: '++id, createdAt, starred',
      iconForgeProjects: '++id, createdAt, starred',
      promptForgeHistory: '++id, createdAt, starred',
      inputLabHistory: '++id, createdAt, starred',
      decisionForgeMatrices: '++id, createdAt, starred',
      gridMasterProjects: '++id, createdAt, starred',
      snippetForgeHistory: '++id, createdAt, starred',
      jwtForgeHistory: '++id, createdAt, starred',
      sqlForgeHistory: '++id, timestamp, starred',
      motionMasterHistory: '++id, createdAt, starred',
      mockForgeSchemas: '++id, createdAt, starred'
    });
    this.version(30).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt',
      jsonHistory: '++id, createdAt',
      cronHistory: '++id, createdAt',
      regexHistory: '++id, createdAt',
      colorHistory: '++id, createdAt, starred',
      diffHistory: '++id, createdAt, starred',
      idForgeHistory: '++id, createdAt, starred',
      cipherHistory: '++id, createdAt, starred',
      structuraHistory: '++id, createdAt, starred',
      markFlowHistory: '++id, createdAt, starred',
      seoHistory: '++id, createdAt, projectName, starred',
      schemaForgeProjects: '++id, createdAt, starred',
      iconForgeProjects: '++id, createdAt, starred',
      promptForgeHistory: '++id, createdAt, starred',
      inputLabHistory: '++id, createdAt, starred',
      decisionForgeMatrices: '++id, createdAt, starred',
      gridMasterProjects: '++id, createdAt, starred',
      snippetForgeHistory: '++id, createdAt, starred',
      jwtForgeHistory: '++id, createdAt, starred',
      sqlForgeHistory: '++id, timestamp, starred',
      motionMasterHistory: '++id, createdAt, starred',
      mockForgeSchemas: '++id, createdAt, starred',
      invoiceForgeHistory: '++id, createdAt, invoiceNumber, clientName, starred',
      invoiceForgeClients: '++id, name, createdAt'
    });
    this.version(31).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt',
      jsonHistory: '++id, createdAt',
      cronHistory: '++id, createdAt',
      regexHistory: '++id, createdAt',
      colorHistory: '++id, createdAt, starred',
      diffHistory: '++id, createdAt, starred',
      idForgeHistory: '++id, createdAt, starred',
      cipherHistory: '++id, createdAt, starred',
      structuraHistory: '++id, createdAt, starred',
      markFlowHistory: '++id, createdAt, starred',
      seoHistory: '++id, createdAt, projectName, starred',
      schemaForgeProjects: '++id, createdAt, starred',
      iconForgeProjects: '++id, createdAt, starred',
      promptForgeHistory: '++id, createdAt, starred',
      inputLabHistory: '++id, createdAt, starred',
      decisionForgeMatrices: '++id, createdAt, starred',
      gridMasterProjects: '++id, createdAt, starred',
      snippetForgeHistory: '++id, createdAt, starred',
      jwtForgeHistory: '++id, createdAt, starred',
      sqlForgeHistory: '++id, timestamp, starred',
      motionMasterHistory: '++id, createdAt, starred',
      mockForgeSchemas: '++id, createdAt, starred',
      invoiceForgeHistory: '++id, createdAt, invoiceNumber, clientName, starred',
      invoiceForgeClients: '++id, name, createdAt',
      diagramForgeHistory: '++id, createdAt, starred'
    });
    this.version(32).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt',
      jsonHistory: '++id, createdAt',
      cronHistory: '++id, createdAt',
      regexHistory: '++id, createdAt',
      colorHistory: '++id, createdAt, starred',
      diffHistory: '++id, createdAt, starred',
      idForgeHistory: '++id, createdAt, starred',
      cipherHistory: '++id, createdAt, starred',
      structuraHistory: '++id, createdAt, starred',
      markFlowHistory: '++id, createdAt, starred',
      seoHistory: '++id, createdAt, projectName, starred',
      schemaForgeProjects: '++id, createdAt, starred',
      iconForgeProjects: '++id, createdAt, starred',
      promptForgeHistory: '++id, createdAt, starred',
      inputLabHistory: '++id, createdAt, starred',
      decisionForgeMatrices: '++id, createdAt, starred',
      gridMasterProjects: '++id, createdAt, starred',
      snippetForgeHistory: '++id, createdAt, starred',
      jwtForgeHistory: '++id, createdAt, starred',
      sqlForgeHistory: '++id, timestamp, starred',
      motionMasterHistory: '++id, createdAt, starred',
      mockForgeSchemas: '++id, createdAt, starred',
      invoiceForgeHistory: '++id, createdAt, invoiceNumber, clientName, starred',
      invoiceForgeClients: '++id, name, createdAt',
      diagramForgeHistory: '++id, createdAt, starred',
      tableForgeHistory: '++id, createdAt, starred'
    });
    this.version(33).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt',
      jsonHistory: '++id, createdAt',
      cronHistory: '++id, createdAt',
      regexHistory: '++id, createdAt',
      colorHistory: '++id, createdAt, starred',
      diffHistory: '++id, createdAt, starred',
      idForgeHistory: '++id, createdAt, starred',
      cipherHistory: '++id, createdAt, starred',
      structuraHistory: '++id, createdAt, starred',
      markFlowHistory: '++id, createdAt, starred',
      seoHistory: '++id, createdAt, projectName, starred',
      schemaForgeProjects: '++id, createdAt, starred',
      iconForgeProjects: '++id, createdAt, starred',
      promptForgeHistory: '++id, createdAt, starred',
      inputLabHistory: '++id, createdAt, starred',
      decisionForgeMatrices: '++id, createdAt, starred',
      gridMasterProjects: '++id, createdAt, starred',
      snippetForgeHistory: '++id, createdAt, starred',
      jwtForgeHistory: '++id, createdAt, starred',
      sqlForgeHistory: '++id, timestamp, starred',
      motionMasterHistory: '++id, createdAt, starred',
      mockForgeSchemas: '++id, createdAt, starred',
      invoiceForgeHistory: '++id, createdAt, invoiceNumber, clientName, starred',
      invoiceForgeClients: '++id, name, createdAt',
      diagramForgeHistory: '++id, createdAt, starred',
      tableForgeHistory: '++id, createdAt, starred',
      resumeForgeHistory: '++id, updatedAt, starred'
    });
    this.version(34).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt',
      jsonHistory: '++id, createdAt',
      cronHistory: '++id, createdAt',
      regexHistory: '++id, createdAt',
      colorHistory: '++id, createdAt, starred',
      diffHistory: '++id, createdAt, starred',
      idForgeHistory: '++id, createdAt, starred',
      cipherHistory: '++id, createdAt, starred',
      structuraHistory: '++id, createdAt, starred',
      markFlowHistory: '++id, createdAt, starred',
      seoHistory: '++id, createdAt, projectName, starred',
      schemaForgeProjects: '++id, createdAt, starred',
      iconForgeProjects: '++id, createdAt, starred',
      promptForgeHistory: '++id, createdAt, starred',
      inputLabHistory: '++id, createdAt, starred',
      decisionForgeMatrices: '++id, createdAt, starred',
      gridMasterProjects: '++id, createdAt, starred',
      snippetForgeHistory: '++id, createdAt, starred',
      jwtForgeHistory: '++id, createdAt, starred',
      sqlForgeHistory: '++id, timestamp, starred',
      motionMasterHistory: '++id, createdAt, starred',
      mockForgeSchemas: '++id, createdAt, starred',
      invoiceForgeHistory: '++id, createdAt, invoiceNumber, clientName, starred',
      invoiceForgeClients: '++id, name, createdAt',
      diagramForgeHistory: '++id, createdAt, starred',
      tableForgeHistory: '++id, createdAt, starred',
      resumeForgeHistory: '++id, updatedAt, starred',
      typeForgeHistory: '++id, createdAt, starred'
    });
    this.version(35).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt',
      jsonHistory: '++id, createdAt',
      cronHistory: '++id, createdAt',
      regexHistory: '++id, createdAt',
      colorHistory: '++id, createdAt, starred',
      diffHistory: '++id, createdAt, starred',
      idForgeHistory: '++id, createdAt, starred',
      cipherHistory: '++id, createdAt, starred',
      structuraHistory: '++id, createdAt, starred',
      markFlowHistory: '++id, createdAt, starred',
      seoHistory: '++id, createdAt, projectName, starred',
      schemaForgeProjects: '++id, createdAt, starred',
      iconForgeProjects: '++id, createdAt, starred',
      promptForgeHistory: '++id, createdAt, starred',
      inputLabHistory: '++id, createdAt, starred',
      decisionForgeMatrices: '++id, createdAt, starred',
      gridMasterProjects: '++id, createdAt, starred',
      snippetForgeHistory: '++id, createdAt, starred',
      jwtForgeHistory: '++id, createdAt, starred',
      sqlForgeHistory: '++id, timestamp, starred',
      motionMasterHistory: '++id, createdAt, starred',
      mockForgeSchemas: '++id, createdAt, starred',
      invoiceForgeHistory: '++id, createdAt, invoiceNumber, clientName, starred',
      invoiceForgeClients: '++id, name, createdAt',
      diagramForgeHistory: '++id, createdAt, starred',
      tableForgeHistory: '++id, createdAt, starred',
      resumeForgeHistory: '++id, updatedAt, starred',
      typeForgeHistory: '++id, createdAt, starred',
      audioForgeHistory: '++id, createdAt, starred'
    });
    this.version(36).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt',
      jsonHistory: '++id, createdAt',
      cronHistory: '++id, createdAt',
      regexHistory: '++id, createdAt',
      colorHistory: '++id, createdAt, starred',
      diffHistory: '++id, createdAt, starred',
      idForgeHistory: '++id, createdAt, starred',
      cipherHistory: '++id, createdAt, starred',
      structuraHistory: '++id, createdAt, starred',
      markFlowHistory: '++id, createdAt, starred',
      seoHistory: '++id, createdAt, projectName, starred',
      schemaForgeProjects: '++id, createdAt, starred',
      iconForgeProjects: '++id, createdAt, starred',
      promptForgeHistory: '++id, createdAt, starred',
      inputLabHistory: '++id, createdAt, starred',
      decisionForgeMatrices: '++id, createdAt, starred',
      gridMasterProjects: '++id, createdAt, starred',
      snippetForgeHistory: '++id, createdAt, starred',
      jwtForgeHistory: '++id, createdAt, starred',
      sqlForgeHistory: '++id, timestamp, starred',
      motionMasterHistory: '++id, createdAt, starred',
      mockForgeSchemas: '++id, createdAt, starred',
      invoiceForgeHistory: '++id, createdAt, invoiceNumber, clientName, starred',
      invoiceForgeClients: '++id, name, createdAt',
      diagramForgeHistory: '++id, createdAt, starred',
      tableForgeHistory: '++id, createdAt, starred',
      resumeForgeHistory: '++id, updatedAt, starred',
      typeForgeHistory: '++id, createdAt, starred',
      audioForgeHistory: '++id, createdAt, starred',
      screenForgeHistory: '++id, createdAt, starred'
    });
    this.version(37).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt',
      jsonHistory: '++id, createdAt',
      cronHistory: '++id, createdAt',
      regexHistory: '++id, createdAt',
      colorHistory: '++id, createdAt, starred',
      diffHistory: '++id, createdAt, starred',
      idForgeHistory: '++id, createdAt, starred',
      cipherHistory: '++id, createdAt, starred',
      structuraHistory: '++id, createdAt, starred',
      markFlowHistory: '++id, createdAt, starred',
      seoHistory: '++id, createdAt, projectName, starred',
      schemaForgeProjects: '++id, createdAt, starred',
      iconForgeProjects: '++id, createdAt, starred',
      promptForgeHistory: '++id, createdAt, starred',
      inputLabHistory: '++id, createdAt, starred',
      decisionForgeMatrices: '++id, createdAt, starred',
      gridMasterProjects: '++id, createdAt, starred',
      snippetForgeHistory: '++id, createdAt, starred',
      jwtForgeHistory: '++id, createdAt, starred',
      sqlForgeHistory: '++id, timestamp, starred',
      motionMasterHistory: '++id, createdAt, starred',
      mockForgeSchemas: '++id, createdAt, starred',
      invoiceForgeHistory: '++id, createdAt, invoiceNumber, clientName, starred',
      invoiceForgeClients: '++id, name, createdAt',
      diagramForgeHistory: '++id, createdAt, starred',
      tableForgeHistory: '++id, createdAt, starred',
      resumeForgeHistory: '++id, updatedAt, starred',
      typeForgeHistory: '++id, createdAt, starred',
      audioForgeHistory: '++id, createdAt, starred',
      screenForgeHistory: '++id, createdAt, starred',
      pdfForgeHistory: '++id, createdAt, starred'
    });
    this.version(38).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt',
      jsonHistory: '++id, createdAt',
      cronHistory: '++id, createdAt',
      regexHistory: '++id, createdAt',
      colorHistory: '++id, createdAt, starred',
      diffHistory: '++id, createdAt, starred',
      idForgeHistory: '++id, createdAt, starred',
      cipherHistory: '++id, createdAt, starred',
      structuraHistory: '++id, createdAt, starred',
      markFlowHistory: '++id, createdAt, starred',
      seoHistory: '++id, createdAt, projectName, starred',
      schemaForgeProjects: '++id, createdAt, starred',
      iconForgeProjects: '++id, createdAt, starred',
      promptForgeHistory: '++id, createdAt, starred',
      inputLabHistory: '++id, createdAt, starred',
      decisionForgeMatrices: '++id, createdAt, starred',
      gridMasterProjects: '++id, createdAt, starred',
      snippetForgeHistory: '++id, createdAt, starred',
      jwtForgeHistory: '++id, createdAt, starred',
      sqlForgeHistory: '++id, timestamp, starred',
      motionMasterHistory: '++id, createdAt, starred',
      mockForgeSchemas: '++id, createdAt, starred',
      invoiceForgeHistory: '++id, createdAt, invoiceNumber, clientName, starred',
      invoiceForgeClients: '++id, name, createdAt',
      diagramForgeHistory: '++id, createdAt, starred',
      tableForgeHistory: '++id, createdAt, starred',
      resumeForgeHistory: '++id, updatedAt, starred',
      typeForgeHistory: '++id, createdAt, starred',
      audioForgeHistory: '++id, createdAt, starred',
      screenForgeHistory: '++id, createdAt, starred',
      pdfForgeHistory: '++id, createdAt, starred',
      bannerForgeHistory: '++id, createdAt, starred'
    });
    this.version(39).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt',
      jsonHistory: '++id, createdAt',
      cronHistory: '++id, createdAt',
      regexHistory: '++id, createdAt',
      colorHistory: '++id, createdAt, starred',
      diffHistory: '++id, createdAt, starred',
      idForgeHistory: '++id, createdAt, starred',
      cipherHistory: '++id, createdAt, starred',
      structuraHistory: '++id, createdAt, starred',
      markFlowHistory: '++id, createdAt, starred',
      seoHistory: '++id, createdAt, projectName, starred',
      schemaForgeProjects: '++id, createdAt, starred',
      iconForgeProjects: '++id, createdAt, starred',
      promptForgeHistory: '++id, createdAt, starred',
      inputLabHistory: '++id, createdAt, starred',
      decisionForgeMatrices: '++id, createdAt, starred',
      gridMasterProjects: '++id, createdAt, starred',
      snippetForgeHistory: '++id, createdAt, starred',
      jwtForgeHistory: '++id, createdAt, starred',
      sqlForgeHistory: '++id, timestamp, starred',
      motionMasterHistory: '++id, createdAt, starred',
      mockForgeSchemas: '++id, createdAt, starred',
      invoiceForgeHistory: '++id, createdAt, invoiceNumber, clientName, starred',
      invoiceForgeClients: '++id, name, createdAt',
      diagramForgeHistory: '++id, createdAt, starred',
      tableForgeHistory: '++id, createdAt, starred',
      resumeForgeHistory: '++id, updatedAt, starred',
      typeForgeHistory: '++id, createdAt, starred',
      audioForgeHistory: '++id, createdAt, starred',
      screenForgeHistory: '++id, createdAt, starred',
      pdfForgeHistory: '++id, createdAt, starred',
      bannerForgeHistory: '++id, createdAt, starred',
      rhythmForgePresets: '++id, createdAt, starred'
    });
    this.version(40).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt',
      jsonHistory: '++id, createdAt',
      cronHistory: '++id, createdAt',
      regexHistory: '++id, createdAt',
      colorHistory: '++id, createdAt, starred',
      diffHistory: '++id, createdAt, starred',
      idForgeHistory: '++id, createdAt, starred',
      cipherHistory: '++id, createdAt, starred',
      structuraHistory: '++id, createdAt, starred',
      markFlowHistory: '++id, createdAt, starred',
      seoHistory: '++id, createdAt, projectName, starred',
      schemaForgeProjects: '++id, createdAt, starred',
      iconForgeProjects: '++id, createdAt, starred',
      promptForgeHistory: '++id, createdAt, starred',
      inputLabHistory: '++id, createdAt, starred',
      decisionForgeMatrices: '++id, createdAt, starred',
      gridMasterProjects: '++id, createdAt, starred',
      snippetForgeHistory: '++id, createdAt, starred',
      jwtForgeHistory: '++id, createdAt, starred',
      sqlForgeHistory: '++id, timestamp, starred',
      motionMasterHistory: '++id, createdAt, starred',
      mockForgeSchemas: '++id, createdAt, starred',
      invoiceForgeHistory: '++id, createdAt, invoiceNumber, clientName, starred',
      invoiceForgeClients: '++id, name, createdAt',
      diagramForgeHistory: '++id, createdAt, starred',
      tableForgeHistory: '++id, createdAt, starred',
      resumeForgeHistory: '++id, updatedAt, starred',
      typeForgeHistory: '++id, createdAt, starred',
      audioForgeHistory: '++id, createdAt, starred',
      screenForgeHistory: '++id, createdAt, starred',
      pdfForgeHistory: '++id, createdAt, starred',
      bannerForgeHistory: '++id, createdAt, starred',
      rhythmForgePresets: '++id, createdAt, starred',
      rhythmForgeHistory: '++id, createdAt, starred'
    });
    this.version(41).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt',
      jsonHistory: '++id, createdAt',
      cronHistory: '++id, createdAt',
      regexHistory: '++id, createdAt',
      colorHistory: '++id, createdAt, starred',
      diffHistory: '++id, createdAt, starred',
      idForgeHistory: '++id, createdAt, starred',
      cipherHistory: '++id, createdAt, starred',
      structuraHistory: '++id, createdAt, starred',
      markFlowHistory: '++id, createdAt, starred',
      seoHistory: '++id, createdAt, projectName, starred',
      schemaForgeProjects: '++id, createdAt, starred',
      iconForgeProjects: '++id, createdAt, starred',
      promptForgeHistory: '++id, createdAt, starred',
      inputLabHistory: '++id, createdAt, starred',
      decisionForgeMatrices: '++id, createdAt, starred',
      gridMasterProjects: '++id, createdAt, starred',
      snippetForgeHistory: '++id, createdAt, starred',
      jwtForgeHistory: '++id, createdAt, starred',
      sqlForgeHistory: '++id, timestamp, starred',
      motionMasterHistory: '++id, createdAt, starred',
      mockForgeSchemas: '++id, createdAt, starred',
      invoiceForgeHistory: '++id, createdAt, invoiceNumber, clientName, starred',
      invoiceForgeClients: '++id, name, createdAt',
      diagramForgeHistory: '++id, createdAt, starred',
      tableForgeHistory: '++id, createdAt, starred',
      resumeForgeHistory: '++id, updatedAt, starred',
      typeForgeHistory: '++id, createdAt, starred',
      audioForgeHistory: '++id, createdAt, starred',
      screenForgeHistory: '++id, createdAt, starred',
      pdfForgeHistory: '++id, createdAt, starred',
      bannerForgeHistory: '++id, createdAt, starred',
      rhythmForgePresets: '++id, createdAt, starred',
      rhythmForgeHistory: '++id, createdAt, starred',
      rhythmForgeSessions: '++id, createdAt'
    });
    this.version(42).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt',
      jsonHistory: '++id, createdAt',
      cronHistory: '++id, createdAt',
      regexHistory: '++id, createdAt',
      colorHistory: '++id, createdAt, starred',
      diffHistory: '++id, createdAt, starred',
      idForgeHistory: '++id, createdAt, starred',
      cipherHistory: '++id, createdAt, starred',
      structuraHistory: '++id, createdAt, starred',
      markFlowHistory: '++id, createdAt, starred',
      seoHistory: '++id, createdAt, projectName, starred',
      schemaForgeProjects: '++id, createdAt, starred',
      iconForgeProjects: '++id, createdAt, starred',
      promptForgeHistory: '++id, createdAt, starred',
      inputLabHistory: '++id, createdAt, starred',
      decisionForgeMatrices: '++id, createdAt, starred',
      gridMasterProjects: '++id, createdAt, starred',
      snippetForgeHistory: '++id, createdAt, starred',
      jwtForgeHistory: '++id, createdAt, starred',
      sqlForgeHistory: '++id, timestamp, starred',
      motionMasterHistory: '++id, createdAt, starred',
      mockForgeSchemas: '++id, createdAt, starred',
      invoiceForgeHistory: '++id, createdAt, invoiceNumber, clientName, starred',
      invoiceForgeClients: '++id, name, createdAt',
      diagramForgeHistory: '++id, createdAt, starred',
      tableForgeHistory: '++id, createdAt, starred',
      resumeForgeHistory: '++id, updatedAt, starred',
      typeForgeHistory: '++id, createdAt, starred',
      audioForgeHistory: '++id, createdAt, starred',
      screenForgeHistory: '++id, createdAt, starred',
      pdfForgeHistory: '++id, createdAt, starred',
      bannerForgeHistory: '++id, createdAt, starred',
      rhythmForgePresets: '++id, createdAt, starred',
      rhythmForgeHistory: '++id, createdAt, starred',
      rhythmForgeSessions: '++id, createdAt',
      rhythmForgePlaylists: '++id, createdAt, starred'
    });
    this.version(43).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt',
      jsonHistory: '++id, createdAt',
      cronHistory: '++id, createdAt',
      regexHistory: '++id, createdAt',
      colorHistory: '++id, createdAt, starred',
      diffHistory: '++id, createdAt, starred',
      idForgeHistory: '++id, createdAt, starred',
      cipherHistory: '++id, createdAt, starred',
      structuraHistory: '++id, createdAt, starred',
      markFlowHistory: '++id, createdAt, starred',
      seoHistory: '++id, createdAt, projectName, starred',
      schemaForgeProjects: '++id, createdAt, starred',
      iconForgeProjects: '++id, createdAt, starred',
      promptForgeHistory: '++id, createdAt, starred',
      inputLabHistory: '++id, createdAt, starred',
      decisionForgeMatrices: '++id, createdAt, starred',
      gridMasterProjects: '++id, createdAt, starred',
      snippetForgeHistory: '++id, createdAt, starred',
      jwtForgeHistory: '++id, createdAt, starred',
      sqlForgeHistory: '++id, timestamp, starred',
      motionMasterHistory: '++id, createdAt, starred',
      mockForgeSchemas: '++id, createdAt, starred',
      invoiceForgeHistory: '++id, createdAt, invoiceNumber, clientName, starred',
      invoiceForgeClients: '++id, name, createdAt',
      diagramForgeHistory: '++id, createdAt, starred',
      tableForgeHistory: '++id, createdAt, starred',
      resumeForgeHistory: '++id, updatedAt, starred',
      typeForgeHistory: '++id, createdAt, starred',
      audioForgeHistory: '++id, createdAt, starred',
      screenForgeHistory: '++id, createdAt, starred',
      pdfForgeHistory: '++id, createdAt, starred',
      bannerForgeHistory: '++id, createdAt, starred',
      rhythmForgePresets: '++id, createdAt, starred',
      rhythmForgeHistory: '++id, createdAt, starred',
      rhythmForgeSessions: '++id, createdAt',
      rhythmForgePlaylists: '++id, createdAt, starred',
      logicForgeHistory: '++id, createdAt, starred'
    });
    this.version(44).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt',
      jsonHistory: '++id, createdAt',
      cronHistory: '++id, createdAt',
      regexHistory: '++id, createdAt',
      colorHistory: '++id, createdAt, starred',
      diffHistory: '++id, createdAt, starred',
      idForgeHistory: '++id, createdAt, starred',
      cipherHistory: '++id, createdAt, starred',
      structuraHistory: '++id, createdAt, starred',
      markFlowHistory: '++id, createdAt, starred',
      seoHistory: '++id, createdAt, projectName, starred',
      schemaForgeProjects: '++id, createdAt, starred',
      iconForgeProjects: '++id, createdAt, starred',
      promptForgeHistory: '++id, createdAt, starred',
      inputLabHistory: '++id, createdAt, starred',
      decisionForgeMatrices: '++id, createdAt, starred',
      gridMasterProjects: '++id, createdAt, starred',
      snippetForgeHistory: '++id, createdAt, starred',
      jwtForgeHistory: '++id, createdAt, starred',
      sqlForgeHistory: '++id, timestamp, starred',
      motionMasterHistory: '++id, createdAt, starred',
      mockForgeSchemas: '++id, createdAt, starred',
      invoiceForgeHistory: '++id, createdAt, invoiceNumber, clientName, starred',
      invoiceForgeClients: '++id, name, createdAt',
      diagramForgeHistory: '++id, createdAt, starred',
      tableForgeHistory: '++id, createdAt, starred',
      resumeForgeHistory: '++id, updatedAt, starred',
      typeForgeHistory: '++id, createdAt, starred',
      audioForgeHistory: '++id, createdAt, starred',
      screenForgeHistory: '++id, createdAt, starred',
      pdfForgeHistory: '++id, createdAt, starred',
      bannerForgeHistory: '++id, createdAt, starred',
      rhythmForgePresets: '++id, createdAt, starred',
      rhythmForgeHistory: '++id, createdAt, starred',
      rhythmForgeSessions: '++id, createdAt',
      rhythmForgePlaylists: '++id, createdAt, starred',
      logicForgeHistory: '++id, createdAt, starred',
      keyForgeHistory: '++id, wpm, mode, language, timestamp, starred'
    });
    this.version(45).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt',
      jsonHistory: '++id, createdAt',
      cronHistory: '++id, createdAt',
      regexHistory: '++id, createdAt',
      colorHistory: '++id, createdAt, starred',
      diffHistory: '++id, createdAt, starred',
      idForgeHistory: '++id, createdAt, starred',
      cipherHistory: '++id, createdAt, starred',
      structuraHistory: '++id, createdAt, starred',
      markFlowHistory: '++id, createdAt, starred',
      seoHistory: '++id, createdAt, projectName, starred',
      schemaForgeProjects: '++id, createdAt, starred',
      iconForgeProjects: '++id, createdAt, starred',
      promptForgeHistory: '++id, createdAt, starred',
      inputLabHistory: '++id, createdAt, starred',
      decisionForgeMatrices: '++id, createdAt, starred',
      gridMasterProjects: '++id, createdAt, starred',
      snippetForgeHistory: '++id, createdAt, starred',
      jwtForgeHistory: '++id, createdAt, starred',
      sqlForgeHistory: '++id, timestamp, starred',
      motionMasterHistory: '++id, createdAt, starred',
      mockForgeSchemas: '++id, createdAt, starred',
      invoiceForgeHistory: '++id, createdAt, invoiceNumber, clientName, starred',
      invoiceForgeClients: '++id, name, createdAt',
      diagramForgeHistory: '++id, createdAt, starred',
      tableForgeHistory: '++id, createdAt, starred',
      resumeForgeHistory: '++id, updatedAt, starred',
      typeForgeHistory: '++id, createdAt, starred',
      audioForgeHistory: '++id, createdAt, starred',
      screenForgeHistory: '++id, createdAt, starred',
      pdfForgeHistory: '++id, createdAt, starred',
      bannerForgeHistory: '++id, createdAt, starred',
      rhythmForgePresets: '++id, createdAt, starred',
      rhythmForgeHistory: '++id, createdAt, starred',
      rhythmForgeSessions: '++id, createdAt',
      rhythmForgePlaylists: '++id, createdAt, starred',
      logicForgeHistory: '++id, createdAt, starred',
      keyForgeHistory: '++id, wpm, mode, language, timestamp, starred',
      zenForgeMixes: '++id, createdAt, starred'
    });
    this.version(46).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt',
      jsonHistory: '++id, createdAt',
      cronHistory: '++id, createdAt',
      regexHistory: '++id, createdAt',
      colorHistory: '++id, createdAt, starred',
      diffHistory: '++id, createdAt, starred',
      idForgeHistory: '++id, createdAt, starred',
      cipherHistory: '++id, createdAt, starred',
      structuraHistory: '++id, createdAt, starred',
      markFlowHistory: '++id, createdAt, starred',
      seoHistory: '++id, createdAt, projectName, starred',
      schemaForgeProjects: '++id, createdAt, starred',
      iconForgeProjects: '++id, createdAt, starred',
      promptForgeHistory: '++id, createdAt, starred',
      inputLabHistory: '++id, createdAt, starred',
      decisionForgeMatrices: '++id, createdAt, starred',
      gridMasterProjects: '++id, createdAt, starred',
      snippetForgeHistory: '++id, createdAt, starred',
      jwtForgeHistory: '++id, createdAt, starred',
      sqlForgeHistory: '++id, timestamp, starred',
      motionMasterHistory: '++id, createdAt, starred',
      mockForgeSchemas: '++id, createdAt, starred',
      invoiceForgeHistory: '++id, createdAt, invoiceNumber, clientName, starred',
      invoiceForgeClients: '++id, name, createdAt',
      diagramForgeHistory: '++id, createdAt, starred',
      tableForgeHistory: '++id, createdAt, starred',
      resumeForgeHistory: '++id, updatedAt, starred',
      typeForgeHistory: '++id, createdAt, starred',
      audioForgeHistory: '++id, createdAt, starred',
      screenForgeHistory: '++id, createdAt, starred',
      pdfForgeHistory: '++id, createdAt, starred',
      bannerForgeHistory: '++id, createdAt, starred',
      rhythmForgePresets: '++id, createdAt, starred',
      rhythmForgeHistory: '++id, createdAt, starred',
      rhythmForgeSessions: '++id, createdAt',
      rhythmForgePlaylists: '++id, createdAt, starred',
      logicForgeHistory: '++id, createdAt, starred',
      keyForgeHistory: '++id, wpm, mode, language, timestamp, starred',
      zenForgeMixes: '++id, createdAt, starred',
      mathForgeHistory: '++id, createdAt, starred'
    });
    this.version(47).stores({
      compoundInterestConfig: '++id, updatedAt',
      compoundInterestHistory: '++id, createdAt',
      glassmorphismHistory: '++id, createdAt',
      jsonHistory: '++id, createdAt',
      cronHistory: '++id, createdAt',
      regexHistory: '++id, createdAt',
      colorHistory: '++id, createdAt, starred',
      diffHistory: '++id, createdAt, starred',
      idForgeHistory: '++id, createdAt, starred',
      cipherHistory: '++id, createdAt, starred',
      structuraHistory: '++id, createdAt, starred',
      markFlowHistory: '++id, createdAt, starred',
      seoHistory: '++id, createdAt, projectName, starred',
      schemaForgeProjects: '++id, createdAt, starred',
      iconForgeProjects: '++id, createdAt, starred',
      promptForgeHistory: '++id, createdAt, starred',
      inputLabHistory: '++id, createdAt, starred',
      decisionForgeMatrices: '++id, createdAt, starred',
      gridMasterProjects: '++id, createdAt, starred',
      snippetForgeHistory: '++id, createdAt, starred',
      jwtForgeHistory: '++id, createdAt, starred',
      sqlForgeHistory: '++id, timestamp, starred',
      motionMasterHistory: '++id, createdAt, starred',
      mockForgeSchemas: '++id, createdAt, starred',
      invoiceForgeHistory: '++id, createdAt, invoiceNumber, clientName, starred',
      invoiceForgeClients: '++id, name, createdAt',
      diagramForgeHistory: '++id, createdAt, starred',
      tableForgeHistory: '++id, createdAt, starred',
      resumeForgeHistory: '++id, updatedAt, starred',
      typeForgeHistory: '++id, createdAt, starred',
      audioForgeHistory: '++id, createdAt, starred',
      screenForgeHistory: '++id, createdAt, starred',
      pdfForgeHistory: '++id, createdAt, starred',
      bannerForgeHistory: '++id, createdAt, starred',
      rhythmForgePresets: '++id, createdAt, starred',
      rhythmForgeHistory: '++id, createdAt, starred',
      rhythmForgeSessions: '++id, createdAt',
      rhythmForgePlaylists: '++id, createdAt, starred',
      logicForgeHistory: '++id, createdAt, starred',
      keyForgeHistory: '++id, wpm, mode, language, timestamp, starred',
      zenForgeMixes: '++id, createdAt, starred',
      mathForgeHistory: '++id, createdAt, starred',
      fileForgeHistory: '++id, createdAt, starred, hash'
    });
  }
}

import { browser } from '$app/environment';

export const db = (browser ? new MySubClassedDexie() : {}) as MySubClassedDexie;
