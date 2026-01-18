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
  type: '1:1' | '1:n' | 'n:m';
}

export interface SchemaSnapshot {
  id: string;
  name: string;
  date: Date;
  data: {
    tables: Table[];
    relations: Relation[];
  };
}

export interface SchemaProject {
  id?: number;
  name: string;
  tables: Table[];
  relations: Relation[];
  snapshots?: SchemaSnapshot[];
  createdAt: Date;
  updatedAt: Date;
  starred?: number;
}

export type ExportFormat = 'mysql' | 'postgres' | 'sqlite' | 'prisma' | 'typescript' | 'mermaid';
