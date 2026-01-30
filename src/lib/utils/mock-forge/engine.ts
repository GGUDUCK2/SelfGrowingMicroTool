import * as en from './data/en';
import * as ko from './data/ko';
import type { SchemaField, GeneratorOptions, FieldType } from './types';

const DATA = { en, ko };

export class MockEngine {
  private locale: 'en' | 'ko' = 'en';

  constructor(locale: 'en' | 'ko' = 'en') {
    this.locale = locale;
  }

  private pick<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Generate a single value for a field, possibly using context from other fields
  private generateValue(field: SchemaField, context: Record<string, any>): any {
    const d = DATA[this.locale];

    switch (field.type) {
      case 'id':
        const isSeq = field.options?.format === 'sequence';
        if (isSeq) {
          // This requires external counter handling, for now just random int
          // In real implementation, row index should be passed
          return (context._index || 0) + 1;
        }
        return crypto.randomUUID();

      case 'name':
        return `${this.pick(d.firstNames)} ${this.pick(d.lastNames)}`;

      case 'firstName':
        return this.pick(d.firstNames);

      case 'lastName':
        return this.pick(d.lastNames);

      case 'email':
        // Try to find correlated fields
        let first = 'user';
        let last = 'name';

        // Very basic heuristic correlation
        // Check for common name fields
        const nameField = context.name || context.fullName || context.full_name || context.userName || context.username;
        const firstNameField = context.firstName || context.first_name || context.givenName;
        const lastNameField = context.lastName || context.last_name || context.familyName;

        if (firstNameField) first = String(firstNameField).toLowerCase();
        else if (nameField) first = String(nameField).split(' ')[0].toLowerCase();

        if (lastNameField) last = String(lastNameField).toLowerCase();
        else if (nameField) last = String(nameField).split(' ')[1]?.toLowerCase() || 'doe';

        // Sanitize
        first = first.replace(/[^a-z0-9]/g, '');
        last = last.replace(/[^a-z0-9]/g, '');

        const domain = this.pick(d.domains);
        return `${first}.${last}${this.randInt(1, 99)}@${domain}`;

      case 'phone':
        if (this.locale === 'ko') {
          return `010-${this.randInt(1000, 9999)}-${this.randInt(1000, 9999)}`;
        }
        return `(${this.randInt(200, 999)}) ${this.randInt(200, 999)}-${this.randInt(1000, 9999)}`;

      case 'date':
        const start = field.options?.min ? new Date(field.options.min).getTime() : new Date(2020, 0, 1).getTime();
        const end = field.options?.max ? new Date(field.options.max).getTime() : new Date().getTime();
        return new Date(this.randInt(start, end)).toISOString().split('T')[0];

      case 'number':
        const min = field.options?.min ?? 0;
        const max = field.options?.max ?? 100;
        const val = Math.random() * (max - min) + min;
        return field.options?.format === 'float' ? Number(val.toFixed(2)) : Math.floor(val);

      case 'boolean':
        return Math.random() > 0.5;

      case 'select':
        if (!field.options?.choices) return '';
        const choices = field.options.choices.split(',').map(s => s.trim());
        return this.pick(choices);

      case 'city':
        return this.pick(d.cities);

      case 'country':
        return this.pick(d.countries);

      case 'lorem':
        const len = this.randInt(5, 15);
        const words = Array.from({length: len}, () => this.pick(d.lorem));
        return words.join(' ');

      default:
        return '';
    }
  }

  public generate(schema: SchemaField[], count: number): any[] {
    const data = [];
    for (let i = 0; i < count; i++) {
      const row: Record<string, any> = { _index: i };
      // Two passes? First pass for non-dependent, second for dependent?
      // For now, simple one pass, assuming order matters or "smart" guess
      // To support email depending on name, name must be processed first or we access it from row if exists

      // Let's rely on the order in schema for now.
      for (const field of schema) {
        row[field.name] = this.generateValue(field, row);
      }
      delete row._index;
      data.push(row);
    }
    return data;
  }

  public toCSV(data: any[]): string {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => headers.map(fieldName => {
        const val = row[fieldName];
        if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return String(val);
      }).join(','))
    ];
    return csvRows.join('\n');
  }

  public toSQL(data: any[], tableName: string = 'mock_data'): string {
    if (data.length === 0) return '';
    const keys = Object.keys(data[0]);
    const statements = data.map(row => {
      const values = keys.map(k => {
        const v = row[k];
        if (typeof v === 'boolean') return v ? 1 : 0;
        if (typeof v === 'number') return v;
        return `'${String(v).replace(/'/g, "''")}'`;
      }).join(', ');
      return `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${values});`;
    });
    return statements.join('\n');
  }

  public toXML(data: any[], root: string = 'dataset', item: string = 'row'): string {
    if (data.length === 0) return `<${root}></${root}>`;
    let xml = `<${root}>\n`;
    data.forEach(row => {
      xml += `  <${item}>\n`;
      Object.entries(row).forEach(([k, v]) => {
        // Simple sanitization
        const val = String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        // Sanitize tag name
        const tag = k.replace(/[^a-zA-Z0-9_-]/g, '_');
        xml += `    <${tag}>${val}</${tag}>\n`;
      });
      xml += `  </${item}>\n`;
    });
    xml += `</${root}>`;
    return xml;
  }
}
