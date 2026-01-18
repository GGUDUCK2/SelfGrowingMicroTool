import type { Table, Column } from '$lib/types/schema-forge';

export function generateMockData(table: Table, count: number = 10): any[] {
    return Array.from({ length: count }).map((_, i) => {
        const row: Record<string, any> = {};
        for (const col of table.columns) {
            row[col.name] = generateValue(col, i);
        }
        return row;
    });
}

function generateValue(col: Column, index: number): any {
    const name = col.name.toLowerCase();
    const type = col.type;

    if (col.isAutoIncrement) return index + 1;
    if (col.defaultValue) return col.defaultValue;

    // Type-based fallback
    switch (type) {
        case 'boolean':
            return Math.random() > 0.5;
        case 'int':
        case 'bigint':
        case 'decimal':
        case 'float':
            if (name.includes('age')) return 18 + Math.floor(Math.random() * 60);
            if (name.includes('year')) return 2020 + Math.floor(Math.random() * 5);
            if (name.includes('price') || name.includes('cost')) return parseFloat((Math.random() * 100).toFixed(2));
            if (name.includes('count') || name.includes('qty')) return Math.floor(Math.random() * 100);
            return Math.floor(Math.random() * 1000);
        case 'date':
        case 'datetime':
        case 'timestamp':
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 365));
            if (type === 'date') return date.toISOString().split('T')[0];
            return date.toISOString();
        case 'uuid':
            return crypto.randomUUID();
        case 'json':
            return { key: "value", id: index };
    }

    // Varchar/Text - Heuristic based on name
    if (name.includes('email')) return `user${index + 1}@example.com`;
    if (name.includes('first') || name.includes('name')) return ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace', 'Hank'][index % 8];
    if (name.includes('last') || name.includes('surname')) return ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia'][index % 6];
    if (name.includes('phone') || name.includes('mobile')) return `+1-555-01${index.toString().padStart(2, '0')}`;
    if (name.includes('url') || name.includes('link')) return `https://example.com/item/${index + 1}`;
    if (name.includes('image') || name.includes('avatar')) return `https://i.pravatar.cc/150?u=${index}`;
    if (name.includes('address')) return `${100 + index} Main St, Cityville`;
    if (name.includes('city')) return ['New York', 'London', 'Tokyo', 'Paris', 'Berlin'][index % 5];
    if (name.includes('country')) return ['USA', 'UK', 'Japan', 'France', 'Germany'][index % 5];
    if (name.includes('title')) return `Sample Title ${index + 1}`;
    if (name.includes('desc') || name.includes('bio')) return `This is a sample description for item ${index + 1}.`;
    if (name.includes('password')) return '********';
    if (name.includes('status')) return ['active', 'inactive', 'pending'][index % 3];
    if (name.includes('role')) return ['admin', 'user', 'guest'][index % 3];
    if (name.includes('slug')) return `item-${index + 1}`;

    return `Sample ${col.name} ${index + 1}`;
}
