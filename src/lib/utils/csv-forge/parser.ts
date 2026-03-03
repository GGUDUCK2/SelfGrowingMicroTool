import Papa from 'papaparse';

export interface ParseResult {
  data: any[][];
  errors: any[];
  meta: Papa.ParseMeta;
}

export function parseCsv(csvString: string, config?: Papa.ParseConfig): ParseResult {
  const result = Papa.parse(csvString, {
    skipEmptyLines: true,
    ...config,
  });
  return {
    data: result.data as any[][],
    errors: result.errors,
    meta: result.meta
  };
}

export function unparseCsv(data: any[][]): string {
  return Papa.unparse(data);
}

export function convertToJson(data: any[][]): string {
  if (data.length === 0) return '[]';
  const headers = data[0];
  const rows = data.slice(1);
  const json = rows.map(row => {
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
  return JSON.stringify(json, null, 2);
}

export function convertToHtmlTable(data: any[][]): string {
  if (data.length === 0) return '<table></table>';
  const headers = data[0];
  const rows = data.slice(1);

  let html = '<table>\n  <thead>\n    <tr>\n';
  headers.forEach(header => {
    html += `      <th>${escapeHtml(String(header))}</th>\n`;
  });
  html += '    </tr>\n  </thead>\n  <tbody>\n';

  rows.forEach(row => {
    html += '    <tr>\n';
    row.forEach(cell => {
      html += `      <td>${escapeHtml(String(cell))}</td>\n`;
    });
    html += '    </tr>\n';
  });

  html += '  </tbody>\n</table>';
  return html;
}

export function convertToSqlInsert(data: any[][], tableName: string): string {
  if (data.length === 0) return '';
  const headers = data[0];
  const rows = data.slice(1);

  const columns = headers.map(h => `"${h}"`).join(', ');
  let sql = `INSERT INTO ${tableName} (${columns}) VALUES\n`;

  const values = rows.map(row => {
    const cellValues = row.map(cell => {
      if (cell === null || cell === undefined || cell === '') return 'NULL';
      if (!isNaN(Number(cell))) return cell;
      return `'${String(cell).replace(/'/g, "''")}'`;
    });
    return `  (${cellValues.join(', ')})`;
  });

  sql += values.join(',\n') + ';';
  return sql;
}

function escapeHtml(unsafe: string) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}
