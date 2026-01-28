import alasql from 'alasql';

export interface QueryResult {
    data: any[];
    columns: string[];
    time: number;
    error?: string;
}

export interface TableInfo {
    name: string;
    columns: string[];
    rowCount: number;
}

export class SqlEngine {
    constructor() {
        if (typeof window !== 'undefined') {
            (window as any).alasql = alasql; // For debugging
        }
    }

    async init() {
        // Create a default table or just ensure DB is ready.
        // alasql usually works on 'alasql' global database by default.
        // We create a specific DB to avoid collisions if any global usage exists
        try {
            await (alasql as any).promise('CREATE DATABASE IF NOT EXISTS sqlforge');
            await (alasql as any).promise('USE sqlforge');
        } catch (e) {
            console.error('Init error:', e);
        }
    }

    async createTableFromData(name: string, data: any[]) {
        const tableName = name.replace(/[^a-zA-Z0-9_]/g, '_'); // Sanitize
        try {
            await (alasql as any).promise(`DROP TABLE IF EXISTS ${tableName}`);
            await (alasql as any).promise(`CREATE TABLE ${tableName}`);
            await (alasql as any).promise(`SELECT * INTO ${tableName} FROM ?`, [data]);
            return tableName;
        } catch (e) {
            console.error('Create table error:', e);
            throw e;
        }
    }

    async execute(sql: string): Promise<QueryResult> {
        const start = performance.now();
        try {
            const res = await (alasql as any).promise(sql);
            const time = performance.now() - start;

            // Handle multiple statements (returns array of results)
            let data = res;
            if (Array.isArray(res) && res.length > 0 && Array.isArray(res[0])) {
                 // Multistatement, take the last one that looks like data
                 // Or we could return all? For simplicity, return the last result set.
                 data = res[res.length - 1];
            }

            // Normalization
            if (!Array.isArray(data)) {
                 if (typeof data === 'number') {
                     // e.g. COUNT or affected rows
                     data = [{ result: data }];
                 } else if (typeof data === 'boolean') {
                     data = [{ result: data }];
                 } else if (typeof data === 'object') {
                     data = [data]; // wrap object
                 } else {
                     data = []; // void?
                 }
            }

            const columns = data.length > 0 ? Object.keys(data[0]) : [];

            return {
                data,
                columns,
                time
            };

        } catch (e: any) {
            return {
                data: [],
                columns: [],
                time: performance.now() - start,
                error: e.message || String(e)
            };
        }
    }

    async getTables(): Promise<TableInfo[]> {
        try {
             const tables: any[] = await (alasql as any).promise('SHOW TABLES');
             const infos: TableInfo[] = [];

             for (const t of tables) {
                 const name = t.tableid || t.Table;
                 try {
                     const cols: any[] = await (alasql as any).promise(`SHOW COLUMNS FROM ${name}`);
                     const columns = cols.map((c: any) => c.columnid);

                     const countRes = await (alasql as any).promise(`SELECT COUNT(*) as c FROM ${name}`);
                     const rowCount = countRes[0]?.c || 0;

                     infos.push({ name, columns, rowCount });
                 } catch (e) {
                     console.warn(`Failed to get info for table ${name}`, e);
                 }
             }
             return infos;
        } catch (e) {
            console.error('Get tables error:', e);
            return [];
        }
    }

    async dropTable(name: string) {
        await (alasql as any).promise(`DROP TABLE IF EXISTS ${name}`);
    }
}
