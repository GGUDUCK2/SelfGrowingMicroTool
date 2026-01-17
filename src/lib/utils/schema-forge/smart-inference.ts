import type { Column } from '$lib/types/schema-forge';

export function inferColumnDetails(name: string): Partial<Column> | null {
    const lower = name.toLowerCase();

    // ID patterns
    if (lower === 'id') {
        return { type: 'int', isPk: true, isAutoIncrement: true, isNullable: false };
    }
    if (lower.endsWith('_id')) {
        return { type: 'int', isNullable: true, isPk: false };
    }
    if (lower === 'uuid') {
        return { type: 'uuid', isPk: true, isNullable: false };
    }

    // Date/Time patterns
    if (['created_at', 'updated_at', 'deleted_at', 'timestamp'].includes(lower)) {
        return { type: 'timestamp', isNullable: false, defaultValue: 'CURRENT_TIMESTAMP' };
    }
    if (lower.includes('date') || lower === 'dob') {
        return { type: 'date', isNullable: true };
    }

    // Boolean patterns
    if (lower.startsWith('is_') || lower.startsWith('has_') || ['active', 'enabled', 'visible'].includes(lower)) {
        return { type: 'boolean', isNullable: false, defaultValue: 'false' };
    }

    // Text patterns
    if (['email', 'username', 'slug', 'title', 'name', 'first_name', 'last_name', 'city', 'country'].includes(lower)) {
        const details: Partial<Column> = { type: 'varchar', length: 255 };
        if (['email', 'username', 'slug'].includes(lower)) details.isUnique = true;
        return details;
    }
    if (['description', 'bio', 'content', 'body', 'address', 'comment'].includes(lower)) {
        return { type: 'text', isNullable: true };
    }
    if (['password', 'password_hash'].includes(lower)) {
        return { type: 'varchar', length: 255, isNullable: false };
    }
    if (['image', 'avatar', 'url', 'website', 'link'].includes(lower)) {
        return { type: 'varchar', length: 2048, isNullable: true };
    }

    // Number patterns
    if (['price', 'cost', 'amount', 'total', 'tax', 'discount'].includes(lower)) {
        return { type: 'decimal', isNullable: false, defaultValue: '0' };
    }
    if (['quantity', 'count', 'age', 'year', 'month', 'day', 'order', 'priority', 'status', 'rating', 'score'].includes(lower)) {
        return { type: 'int', isNullable: false, defaultValue: '0' };
    }
    if (['views', 'likes', 'shares'].includes(lower)) {
        return { type: 'bigint', isNullable: false, defaultValue: '0' };
    }

    // JSON patterns
    if (['settings', 'config', 'options', 'metadata', 'data', 'properties', 'tags'].includes(lower)) {
        return { type: 'json', isNullable: true };
    }

    return null;
}
