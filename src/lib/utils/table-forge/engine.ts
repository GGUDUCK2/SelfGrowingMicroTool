import Papa from 'papaparse';

export type TableCell = string | number | boolean | null;
export type TableRow = TableCell[];
export type TableData = TableRow[];

export type InputFormat = 'csv' | 'json' | 'markdown' | 'auto';
export type OutputFormat = 'markdown' | 'csv' | 'json' | 'html' | 'sql' | 'latex' | 'ascii';

export interface ParseOptions {
    format?: InputFormat;
    delimiter?: string; // For CSV
}

export function detectFormat(content: string): InputFormat {
    const trimmed = content.trim();
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) return 'json';
    // Markdown usually has pipes. Check for at least one pipe and newline.
    if (trimmed.includes('|') && trimmed.split('\n').length > 1) {
        // Basic check if it looks like a table structure
        const lines = trimmed.split('\n');
        if (lines[0].includes('|') || (lines.length > 1 && lines[1].includes('-'))) return 'markdown';
    }
    return 'csv'; // Default fallback
}

export function parseInput(content: string, options: ParseOptions = {}): TableData {
    const format = options.format === 'auto' || !options.format
        ? detectFormat(content)
        : options.format;

    switch (format) {
        case 'json':
            return parseJson(content);
        case 'markdown':
            return parseMarkdown(content);
        case 'csv':
        default:
            return parseCsv(content, options.delimiter);
    }
}

function parseCsv(content: string, delimiter?: string): TableData {
    // Basic fix for pasted excel data that might use tabs but PapaParse might assume comma
    const result = Papa.parse(content, {
        delimiter: delimiter, // Auto-detect if undefined
        skipEmptyLines: true,
        dynamicTyping: true
    });
    return result.data as TableData;
}

function parseJson(content: string): TableData {
    try {
        const parsed = JSON.parse(content);
        if (!Array.isArray(parsed)) {
            // Handle single object? Wrap in array
            if (typeof parsed === 'object' && parsed !== null) {
                return objectToTable([parsed]);
            }
            return [];
        }
        if (parsed.length === 0) return [];

        // Check if array of arrays
        if (Array.isArray(parsed[0])) {
            return parsed;
        }

        // Array of objects
        return objectToTable(parsed);
    } catch (e) {
        console.error('JSON Parse Error', e);
        return [];
    }
}

function objectToTable(objects: any[]): TableData {
    if (objects.length === 0) return [];
    // Collect all keys
    const keys = new Set<string>();
    objects.forEach(obj => {
        if (typeof obj === 'object' && obj !== null) {
            Object.keys(obj).forEach(k => keys.add(k));
        }
    });

    const headers = Array.from(keys);
    const data: TableData = [headers];

    objects.forEach(obj => {
        const row = headers.map(h => {
            const val = obj[h];
            if (typeof val === 'object' && val !== null) return JSON.stringify(val);
            return val;
        });
        data.push(row);
    });

    return data;
}

function parseMarkdown(content: string): TableData {
    const lines = content.trim().split('\n');
    const data: TableData = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        // Skip separator lines like |---|---| or |:---|---:|
        if (line.match(/^\|?(\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?$/)) continue;

        // Remove leading/trailing pipes if present
        const cleanLine = line.replace(/^\|/, '').replace(/\|$/, '');
        const cells = cleanLine.split('|').map(c => c.trim());
        data.push(cells);
    }
    return data;
}

export interface FormatConfig {
    compact?: boolean; // For Markdown/JSON
    pretty?: boolean;  // For HTML/JSON
    delimiter?: string;
    tableName?: string; // For SQL
}

export function formatOutput(data: TableData, format: OutputFormat, config: FormatConfig = {}): string {
    if (!data || data.length === 0) return '';

    switch (format) {
        case 'csv':
            return Papa.unparse(data, { delimiter: config.delimiter });
        case 'json':
            // Logic: if headers exist (row 0), create objects. Else array of arrays.
            return config.compact ? JSON.stringify(tableToJson(data)) : JSON.stringify(tableToJson(data), null, 2);
        case 'markdown':
            return formatMarkdown(data, config.compact);
        case 'html':
            return formatHtml(data, config.pretty);
        case 'sql':
            return formatSql(data, config.tableName || 'table_name');
        case 'latex':
            return formatLatex(data);
        case 'ascii':
            return formatAscii(data);
        default:
            return '';
    }
}

// Helper: Convert array of arrays back to array of objects if headers exist
function tableToJson(data: TableData): any[] {
    if (data.length < 2) return data; // Just return array of arrays if only header or empty
    const headers = data[0].map(String);
    const rows = data.slice(1);

    return rows.map(row => {
        const obj: any = {};
        headers.forEach((h, i) => {
            // Only add property if header exists (handle ragged rows)
            if (i < h.length) {
                 obj[h] = row[i] ?? null;
            }
        });
        return obj;
    });
}

function formatMarkdown(data: TableData, compact = false): string {
    if (data.length === 0) return '';

    // Calculate column widths
    const colWidths = data[0].map((_, i) => {
        return Math.max(...data.map(row => String(row[i] ?? '').length));
    });

    const formatRow = (row: TableRow, pad = true) => {
        // Handle rows that might be shorter than header
        const paddedRow = [...row];
        while(paddedRow.length < colWidths.length) paddedRow.push(null);

        return '| ' + paddedRow.map((cell, i) => {
            const str = String(cell ?? '');
            return pad && !compact ? str.padEnd(colWidths[i]) : str;
        }).join(' | ') + ' |';
    };

    const header = formatRow(data[0]);
    const separator = '| ' + colWidths.map(w => '-'.repeat(Math.max(3, compact ? 3 : w))).join(' | ') + ' |';
    const rows = data.slice(1).map(r => formatRow(r));

    return [header, separator, ...rows].join('\n');
}

function formatHtml(data: TableData, pretty = true): string {
    const indent = pretty ? '  ' : '';
    const newline = pretty ? '\n' : '';

    let html = `<table>${newline}`;

    // Header
    if (data.length > 0) {
        html += `${indent}<thead>${newline}`;
        html += `${indent}${indent}<tr>${newline}`;
        data[0].forEach(cell => {
            html += `${indent}${indent}${indent}<th>${escapeHtml(String(cell ?? ''))}</th>${newline}`;
        });
        html += `${indent}${indent}</tr>${newline}`;
        html += `${indent}</thead>${newline}`;
    }

    // Body
    if (data.length > 1) {
        html += `${indent}<tbody>${newline}`;
        data.slice(1).forEach(row => {
            html += `${indent}${indent}<tr>${newline}`;
            // Ensure row matches header length
            const headerLen = data[0].length;
            for (let i = 0; i < headerLen; i++) {
                const cell = row[i];
                html += `${indent}${indent}${indent}<td>${escapeHtml(String(cell ?? ''))}</td>${newline}`;
            }
            html += `${indent}${indent}</tr>${newline}`;
        });
        html += `${indent}</tbody>${newline}`;
    }
    html += `</table>`;

    return html;
}

function formatSql(data: TableData, tableName: string): string {
    if (data.length < 2) return '-- No data';
    const headers = data[0].map(h => String(h).replace(/[^a-zA-Z0-9_]/g, '_'));
    const rows = data.slice(1);

    const sql = `INSERT INTO ${tableName} (${headers.join(', ')}) VALUES\n`;
    const values = rows.map(row => {
        const cells = headers.map((_, i) => {
            const cell = row[i];
            if (cell === null || cell === undefined) return 'NULL';
            if (typeof cell === 'number') return cell;
            return `'${String(cell).replace(/'/g, "''")}'`;
        });
        return `(${cells.join(', ')})`;
    });

    return sql + values.join(',\n') + ';';
}

function formatLatex(data: TableData): string {
    if (data.length === 0) return '';
    const cols = data[0].length;
    const align = 'l'.repeat(cols);

    let tex = `\\begin{tabular}{${align}}\n`;
    tex += `\\toprule\n`;

    // Header
    tex += data[0].map(escapeLatex).join(' & ') + ' \\\\\n';
    tex += `\\midrule\n`;

    // Rows
    data.slice(1).forEach(row => {
        // Pad row
        const fullRow = [...row];
        while(fullRow.length < cols) fullRow.push(null);

        tex += fullRow.map(escapeLatex).join(' & ') + ' \\\\\n';
    });

    tex += `\\bottomrule\n`;
    tex += `\\end{tabular}`;
    return tex;
}

function formatAscii(data: TableData): string {
    if (data.length === 0) return '';
    // Similar to markdown but with + corners
    const colWidths = data[0].map((_, i) => {
        return Math.max(...data.map(row => String(row[i] ?? '').length));
    });

    const border = '+-' + colWidths.map(w => '-'.repeat(w)).join('-+-') + '-+';

    const formatRow = (row: TableRow) => {
        const paddedRow = [...row];
        while(paddedRow.length < colWidths.length) paddedRow.push(null);

        return '| ' + paddedRow.map((cell, i) => {
            return String(cell ?? '').padEnd(colWidths[i]);
        }).join(' | ') + ' |';
    };

    const rows = data.map(r => formatRow(r));
    // Header sep is double line or just normal border
    // Grid style usually has borders between every row or just header

    // Top border
    let result = border + '\n';
    // Header
    result += formatRow(data[0]) + '\n';
    // Header sep
    result += border + '\n';
    // Body
    data.slice(1).forEach(row => {
        result += formatRow(row) + '\n';
        result += border + '\n';
    });

    return result;
}

function escapeHtml(text: string): string {
    return text.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeLatex(cell: TableCell): string {
    const str = String(cell ?? '');
    return str.replace(/([&%$#_{}])/g, '\\$1')
              .replace(/~/g, '\\textasciitilde{}')
              .replace(/\^/g, '\\textasciicircum{}');
}
