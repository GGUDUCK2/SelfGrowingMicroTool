/**
 * Generates heuristic-based sample values for prompt variables.
 */

const DATASETS = {
    emails: ['alice@example.com', 'bob@test.co', 'charlie@domain.net', 'support@acme.inc'],
    names: ['Alice Smith', 'Bob Jones', 'Charlie Day', 'Diana Prince', 'Evan Wright'],
    products: ['Quantum Toaster 3000', 'Super Widget X', 'Eco-Friendly Bottle', 'Smart Glasses', 'Neural Chip v2'],
    companies: ['Acme Corp', 'Globex Inc', 'Soylent Corp', 'Initech', 'Massive Dynamic'],
    cities: ['San Francisco', 'New York', 'Tokyo', 'London', 'Berlin', 'Seoul'],
    countries: ['United States', 'South Korea', 'Germany', 'Japan', 'United Kingdom'],
    topics: ['Artificial Intelligence', 'Climate Change', 'Quantum Computing', 'Space Exploration', 'Healthy Eating'],
    contexts: [
        'The user is asking about the refund policy.',
        'The user is frustrated with a bug.',
        'The user wants to upgrade their plan.',
        'The system is currently down for maintenance.'
    ],
    codes: [
        'console.log("Hello World");',
        'def fib(n): return n if n < 2 else fib(n-1) + fib(n-2)',
        'SELECT * FROM users WHERE active = true;',
        'const [state, setState] = useState(null);'
    ],
    errors: [
        'TypeError: undefined is not a function',
        '500 Internal Server Error',
        'Connection Timed Out',
        'ValueError: invalid literal for int()'
    ]
};

function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function magicFill(variable: string): string {
    const v = variable.toLowerCase();

    if (v.includes('email')) return pick(DATASETS.emails);
    if (v.includes('name') || v.includes('user') || v.includes('customer')) return pick(DATASETS.names);
    if (v.includes('product') || v.includes('item')) return pick(DATASETS.products);
    if (v.includes('company') || v.includes('brand')) return pick(DATASETS.companies);
    if (v.includes('date') || v.includes('time')) return new Date().toISOString().split('T')[0];
    if (v.includes('url') || v.includes('link') || v.includes('website')) return 'https://example.com';
    if (v.includes('phone')) return '+1-555-' + Math.floor(1000 + Math.random() * 9000);
    if (v.includes('address')) return Math.floor(1 + Math.random() * 999) + ' Tech Blvd';
    if (v.includes('city')) return pick(DATASETS.cities);
    if (v.includes('country')) return pick(DATASETS.countries);
    if (v.includes('lang')) return 'English';
    if (v.includes('topic') || v.includes('subject')) return pick(DATASETS.topics);
    if (v.includes('context')) return pick(DATASETS.contexts);
    if (v.includes('code') || v.includes('snippet')) return pick(DATASETS.codes);
    if (v.includes('error')) return pick(DATASETS.errors);
    if (v.includes('json')) return JSON.stringify({ key: "value", id: Math.floor(Math.random() * 100) });
    if (v.includes('csv')) return 'id,name\n1,Alice\n2,Bob';
    if (v.includes('age')) return String(Math.floor(18 + Math.random() * 60));
    if (v.includes('price') || v.includes('cost')) return '$' + (Math.random() * 100).toFixed(2);
    if (v.includes('feature')) return 'Dark Mode';
    if (v.includes('bug')) return 'App crashes on launch';
    if (v.includes('id')) return '550e8400-e29b-41d4-a716-' + Math.floor(100000000000 + Math.random() * 900000000000);
    if (v.includes('review')) return 'I loved this product! It changed my life.';
    if (v.includes('tone')) return pick(['Professional', 'Casual', 'Funny', 'Sarcastic', 'Empathetic']);

    return 'Sample Value';
}

/**
 * Fills all empty variables with magic values.
 * @param force If true, overwrites existing values.
 */
export function autoFillVariables(variables: string[], current: Record<string, string>, force = false): Record<string, string> {
    const next = { ...current };
    variables.forEach(v => {
        if (force || !next[v]) {
            next[v] = magicFill(v);
        }
    });
    return next;
}
