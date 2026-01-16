import type { SchemaProject, Table, Column, Relation } from '$lib/types/schema-forge';

export function generateCode(schema: SchemaProject, format: string): string {
    switch (format) {
        case 'mysql': return generateMySQL(schema);
        case 'postgres': return generatePostgres(schema);
        case 'sqlite': return generateSQLite(schema);
        case 'prisma': return generatePrisma(schema);
        case 'typescript': return generateTypeScript(schema);
        case 'mermaid': return generateMermaid(schema);
        default: return '';
    }
}

function generateMySQL(schema: SchemaProject): string {
    return schema.tables.map(table => {
        const lines = [`CREATE TABLE \`${table.name}\` (`];
        const colDefs = table.columns.map(col => {
            let def = `  \`${col.name}\` ${mapTypeToSQL(col.type, 'mysql')}`;
            if (col.length && ['varchar'].includes(col.type)) def += `(${col.length})`;
            if (!col.isNullable) def += ' NOT NULL';
            if (col.isAutoIncrement) def += ' AUTO_INCREMENT';
            if (col.isUnique) def += ' UNIQUE';
            if (col.defaultValue) def += ` DEFAULT ${col.defaultValue}`;
            if (col.comment) def += ` COMMENT '${col.comment}'`;
            return def;
        });

        // PK
        const pks = table.columns.filter(c => c.isPk).map(c => `\`${c.name}\``);
        if (pks.length > 0) {
            colDefs.push(`  PRIMARY KEY (${pks.join(', ')})`);
        }

        // Relations (Foreign Keys)
        const relations = schema.relations.filter(r => r.fromTableId === table.id);
        relations.forEach(rel => {
            const targetTable = schema.tables.find(t => t.id === rel.toTableId);
            const sourceCol = table.columns.find(c => c.id === rel.fromColumnId);
            const targetCol = targetTable?.columns.find(c => c.id === rel.toColumnId);

            if (targetTable && sourceCol && targetCol) {
                colDefs.push(`  CONSTRAINT \`fk_${table.name}_${sourceCol.name}\` FOREIGN KEY (\`${sourceCol.name}\`) REFERENCES \`${targetTable.name}\` (\`${targetCol.name}\`)`);
            }
        });

        lines.push(colDefs.join(',\n'));
        lines.push(`)${table.comment ? ` COMMENT='${table.comment}'` : ''};`);
        return lines.join('\n');
    }).join('\n\n');
}

function generatePostgres(schema: SchemaProject): string {
     return schema.tables.map(table => {
        const lines = [`CREATE TABLE "${table.name}" (`];
        const colDefs = table.columns.map(col => {
            let type = mapTypeToSQL(col.type, 'postgres');
            if (col.isAutoIncrement && col.type === 'int') type = 'SERIAL';
            if (col.isAutoIncrement && col.type === 'bigint') type = 'BIGSERIAL';

            let def = `  "${col.name}" ${type}`;
            if (col.length && ['varchar'].includes(col.type)) def += `(${col.length})`;
            if (!col.isNullable) def += ' NOT NULL';
            if (col.isUnique) def += ' UNIQUE';
            if (col.defaultValue) def += ` DEFAULT ${col.defaultValue}`;
            return def;
        });

        const pks = table.columns.filter(c => c.isPk).map(c => `"${c.name}"`);
        if (pks.length > 0) {
            colDefs.push(`  PRIMARY KEY (${pks.join(', ')})`);
        }

        const relations = schema.relations.filter(r => r.fromTableId === table.id);
        relations.forEach(rel => {
            const targetTable = schema.tables.find(t => t.id === rel.toTableId);
            const sourceCol = table.columns.find(c => c.id === rel.fromColumnId);
            const targetCol = targetTable?.columns.find(c => c.id === rel.toColumnId);

            if (targetTable && sourceCol && targetCol) {
                colDefs.push(`  FOREIGN KEY ("${sourceCol.name}") REFERENCES "${targetTable.name}" ("${targetCol.name}")`);
            }
        });

        lines.push(colDefs.join(',\n'));
        lines.push(`);`);

        if (table.comment) {
            lines.push(`COMMENT ON TABLE "${table.name}" IS '${table.comment}';`);
        }

        return lines.join('\n');
    }).join('\n\n');
}

function generateSQLite(schema: SchemaProject): string {
    return schema.tables.map(table => {
        const lines = [`CREATE TABLE "${table.name}" (`];
        const colDefs = table.columns.map(col => {
            let def = `  "${col.name}" ${mapTypeToSQL(col.type, 'sqlite')}`;
            if (!col.isNullable) def += ' NOT NULL';
            if (col.isUnique) def += ' UNIQUE';
            if (col.defaultValue) def += ` DEFAULT ${col.defaultValue}`;
            return def;
        });

        const pks = table.columns.filter(c => c.isPk);
        if (pks.length === 1 && pks[0].isAutoIncrement) {
            // SQLite specific: INTEGER PRIMARY KEY AUTOINCREMENT
            // We need to modify the definition line of this column
            const pkCol = pks[0];
            const idx = table.columns.findIndex(c => c.id === pkCol.id);
            if (idx !== -1) {
                colDefs[idx] = `  "${pkCol.name}" INTEGER PRIMARY KEY AUTOINCREMENT`;
            }
        } else if (pks.length > 0) {
             colDefs.push(`  PRIMARY KEY (${pks.map(c => `"${c.name}"`).join(', ')})`);
        }

        const relations = schema.relations.filter(r => r.fromTableId === table.id);
        relations.forEach(rel => {
            const targetTable = schema.tables.find(t => t.id === rel.toTableId);
            const sourceCol = table.columns.find(c => c.id === rel.fromColumnId);
            const targetCol = targetTable?.columns.find(c => c.id === rel.toColumnId);

            if (targetTable && sourceCol && targetCol) {
                colDefs.push(`  FOREIGN KEY ("${sourceCol.name}") REFERENCES "${targetTable.name}" ("${targetCol.name}")`);
            }
        });

        lines.push(colDefs.join(',\n'));
        lines.push(`);`);
        return lines.join('\n');
    }).join('\n\n');
}

function generatePrisma(schema: SchemaProject): string {
    const models = schema.tables.map(table => {
        const lines = [`model ${capitalize(table.name)} {`];

        table.columns.forEach(col => {
            let line = `  ${col.name} ${mapTypeToPrisma(col.type)}`;
            const modifiers: string[] = [];

            if (col.isPk) {
                modifiers.push('@id');
                if (col.isAutoIncrement) modifiers.push('@default(autoincrement())');
            }
            if (col.isUnique) modifiers.push('@unique');
            if (!col.isPk && col.defaultValue) modifiers.push(`@default(${col.defaultValue})`);
            if (col.isNullable && !col.isPk) line += '?'; // Optional

            if (modifiers.length) line += ` ${modifiers.join(' ')}`;
            if (col.comment) line += ` /// ${col.comment}`;

            lines.push(line);
        });

        // Relations (Prisma side)
        const outRels = schema.relations.filter(r => r.fromTableId === table.id);
        outRels.forEach(rel => {
             const targetTable = schema.tables.find(t => t.id === rel.toTableId);
             const sourceCol = table.columns.find(c => c.id === rel.fromColumnId);
             const targetCol = targetTable?.columns.find(c => c.id === rel.toColumnId);

             if (targetTable && sourceCol && targetCol) {
                 lines.push(`  ${targetTable.name} ${capitalize(targetTable.name)} @relation(fields: [${sourceCol.name}], references: [${targetCol.name}])`);
             }
        });

        // Incoming relations (for back-references in Prisma)
        const inRels = schema.relations.filter(r => r.toTableId === table.id);
        inRels.forEach(rel => {
             const sourceTable = schema.tables.find(t => t.id === rel.fromTableId);
             if (sourceTable) {
                 lines.push(`  ${sourceTable.name}s ${capitalize(sourceTable.name)}[]`);
             }
        });

        lines.push('}');
        return lines.join('\n');
    });

    return models.join('\n\n');
}

function generateTypeScript(schema: SchemaProject): string {
    return schema.tables.map(table => {
        const lines = [`export interface ${capitalize(table.name)} {`];
        table.columns.forEach(col => {
            lines.push(`  ${col.name}${col.isNullable ? '?' : ''}: ${mapTypeToTS(col.type)};`);
        });
        lines.push('}');
        return lines.join('\n');
    }).join('\n\n');
}

function generateMermaid(schema: SchemaProject): string {
    const lines = ['erDiagram'];

    schema.tables.forEach(table => {
        lines.push(`  ${table.name} {`);
        table.columns.forEach(col => {
             // Type, Name, PK/FK/Comment
             let type = mapTypeToSQL(col.type, 'mysql'); // Generic
             let comment = '';
             if (col.isPk) comment = 'PK';
             else if (schema.relations.find(r => r.fromColumnId === col.id)) comment = 'FK';

             lines.push(`    ${type} ${col.name} ${comment ? `"${comment}"` : ''}`);
        });
        lines.push(`  }`);
    });

    schema.relations.forEach(rel => {
         const sourceTable = schema.tables.find(t => t.id === rel.fromTableId);
         const targetTable = schema.tables.find(t => t.id === rel.toTableId);
         if (sourceTable && targetTable) {
             // ||--o{ = 1 to N
             // ||--|| = 1 to 1
             const connector = rel.type === '1:1' ? '||--||' : '||--o{';
             lines.push(`  ${sourceTable.name} ${connector} ${targetTable.name} : "relates to"`);
         }
    });

    return lines.join('\n');
}


// Helpers
function mapTypeToSQL(type: string, flavor: 'mysql' | 'postgres' | 'sqlite'): string {
    switch (type) {
        case 'int': return 'INT';
        case 'bigint': return flavor === 'sqlite' ? 'INTEGER' : 'BIGINT';
        case 'varchar': return flavor === 'sqlite' ? 'TEXT' : 'VARCHAR';
        case 'text': return 'TEXT';
        case 'boolean': return flavor === 'mysql' ? 'TINYINT(1)' : 'BOOLEAN';
        case 'date': return 'DATE';
        case 'datetime': return flavor === 'postgres' ? 'TIMESTAMP' : 'DATETIME';
        case 'timestamp': return 'TIMESTAMP';
        case 'decimal': return 'DECIMAL';
        case 'float': return flavor === 'postgres' ? 'DOUBLE PRECISION' : 'FLOAT';
        case 'json': return flavor === 'postgres' ? 'JSONB' : 'JSON';
        case 'uuid': return flavor === 'postgres' ? 'UUID' : 'CHAR(36)';
        default: return 'VARCHAR(255)';
    }
}

function mapTypeToPrisma(type: string): string {
    switch (type) {
        case 'int': return 'Int';
        case 'bigint': return 'BigInt';
        case 'varchar': return 'String';
        case 'text': return 'String';
        case 'boolean': return 'Boolean';
        case 'date': return 'DateTime';
        case 'datetime': return 'DateTime';
        case 'timestamp': return 'DateTime';
        case 'decimal': return 'Decimal';
        case 'float': return 'Float';
        case 'json': return 'Json';
        case 'uuid': return 'String';
        default: return 'String';
    }
}

function mapTypeToTS(type: string): string {
     switch (type) {
        case 'int': return 'number';
        case 'bigint': return 'number'; // or bigint
        case 'varchar': return 'string';
        case 'text': return 'string';
        case 'boolean': return 'boolean';
        case 'date': return 'Date';
        case 'datetime': return 'Date';
        case 'timestamp': return 'Date';
        case 'decimal': return 'number';
        case 'float': return 'number';
        case 'json': return 'any';
        case 'uuid': return 'string';
        default: return 'string';
    }
}

function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
