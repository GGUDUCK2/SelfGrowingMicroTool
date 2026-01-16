export type DataType = 'int' | 'bigint' | 'varchar' | 'text' | 'boolean' | 'date' | 'datetime' | 'timestamp' | 'decimal' | 'float' | 'json' | 'uuid';

export const DATA_TYPES: DataType[] = ['int', 'bigint', 'varchar', 'text', 'boolean', 'date', 'datetime', 'timestamp', 'decimal', 'float', 'json', 'uuid'];

export interface Column {
  id: string;
  name: string;
  type: DataType;
  length?: number; // for varchar
  isPk: boolean;
  isNullable: boolean;
  isUnique: boolean;
  isAutoIncrement: boolean;
  defaultValue?: string;
  comment?: string;
}

export interface Table {
  id: string;
  name: string;
  columns: Column[];
  comment?: string;
  position?: { x: number; y: number };
}

export interface Relation {
  id: string;
  fromTableId: string;
  fromColumnId: string;
  toTableId: string;
  toColumnId: string;
  type: '1:1' | '1:n' | 'n:m'; // n:m usually requires join table, maybe stick to 1:1 and 1:n for simple generator
}

export interface SchemaProject {
  id?: number; // Dexie uses number for auto-inc
  name: string;
  tables: Table[];
  relations: Relation[];
  createdAt: Date;
  updatedAt: Date;
  starred?: number; // 0 or 1
}

export type ExportFormat = 'mysql' | 'postgres' | 'sqlite' | 'prisma' | 'typescript' | 'mermaid';
