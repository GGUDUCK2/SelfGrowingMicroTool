import type { Table, Column, DataType } from '$lib/types/schema-forge';
import { nanoid } from 'nanoid';

export function parseSQL(sql: string): Table[] {
    const tables: Table[] = [];
    const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["`]?([a-zA-Z0-9_]+)["`]?\s*\(([\s\S]*?)\);/gim;

    let match;
    while ((match = createTableRegex.exec(sql)) !== null) {
        const tableName = match[1];
        const body = match[2];

        const table: Table = {
            id: nanoid(),
            name: tableName,
            columns: []
        };

        const lines = body.split(',').map(l => l.trim()).filter(l => l.length > 0);

        // Very basic line parser
        // Handles: `col_name` TYPE [constraints]
        // Doesn't handle complex nested parentheses in constraints properly yet, but good for simple schemas

        lines.forEach(line => {
            // Check for PRIMARY KEY (col1, col2)
            if (line.toUpperCase().startsWith('PRIMARY KEY')) {
                // Parse composite keys if needed (skipped for now for simplicity, assuming inline PK usually)
                return;
            }
            if (line.toUpperCase().startsWith('FOREIGN KEY')) {
                return;
            }
            if (line.toUpperCase().startsWith('CONSTRAINT')) {
                return;
            }
            if (line.toUpperCase().startsWith('KEY') || line.toUpperCase().startsWith('INDEX') || line.toUpperCase().startsWith('UNIQUE KEY')) {
                return;
            }

            // Assume column definition
            // "col_name" VARCHAR(255) NOT NULL...
            // `col_name` int...
            const parts = line.split(/\s+/);
            if (parts.length < 2) return;

            const name = parts[0].replace(/["`]/g, '');
            let typeStr = parts[1].toUpperCase();

            // Extract length if present: VARCHAR(255)
            let length: number | undefined;
            if (typeStr.includes('(')) {
                const matchLen = /\((.*?)\)/.exec(typeStr);
                if (matchLen) {
                    length = parseInt(matchLen[1], 10);
                }
                typeStr = typeStr.split('(')[0];
            }

            let type: DataType = 'varchar';
            // Map SQL types to our DataType
            if (['INT', 'INTEGER', 'TINYINT', 'SMALLINT'].includes(typeStr)) type = 'int';
            else if (['BIGINT'].includes(typeStr)) type = 'bigint';
            else if (['VARCHAR', 'CHAR', 'STRING'].includes(typeStr)) type = 'varchar';
            else if (['TEXT', 'LONGTEXT', 'MEDIUMTEXT'].includes(typeStr)) type = 'text';
            else if (['BOOLEAN', 'BOOL', 'BIT'].includes(typeStr)) type = 'boolean';
            else if (['DATE'].includes(typeStr)) type = 'date';
            else if (['DATETIME'].includes(typeStr)) type = 'datetime';
            else if (['TIMESTAMP'].includes(typeStr)) type = 'timestamp';
            else if (['DECIMAL', 'NUMERIC', 'MONEY'].includes(typeStr)) type = 'decimal';
            else if (['FLOAT', 'DOUBLE', 'REAL'].includes(typeStr)) type = 'float';
            else if (['JSON', 'JSONB'].includes(typeStr)) type = 'json';
            else if (['UUID'].includes(typeStr)) type = 'uuid';

            const col: Column = {
                id: nanoid(),
                name,
                type,
                length,
                isPk: line.toUpperCase().includes('PRIMARY KEY'),
                isNullable: !line.toUpperCase().includes('NOT NULL'),
                isUnique: line.toUpperCase().includes('UNIQUE'),
                isAutoIncrement: line.toUpperCase().includes('AUTO_INCREMENT') || line.toUpperCase().includes('SERIAL'),
            };

            if (col.isPk) col.isNullable = false;

            table.columns.push(col);
        });

        tables.push(table);
    }

    return tables;
}
