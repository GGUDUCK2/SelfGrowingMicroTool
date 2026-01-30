export type FieldType =
  | 'id'
  | 'name'
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'phone'
  | 'date'
  | 'number'
  | 'boolean'
  | 'select'
  | 'city'
  | 'country'
  | 'lorem';

export interface SchemaField {
  id: string;
  name: string;
  type: FieldType;
  options?: {
    min?: number;
    max?: number;
    format?: string;
    choices?: string; // Comma separated
    refFieldId?: string; // For correlation (e.g. email based on name field)
  };
}

export interface GeneratorOptions {
  locale: 'en' | 'ko';
  rows: number;
  format: 'json' | 'csv' | 'sql' | 'xml';
  tableName?: string; // For SQL
}
