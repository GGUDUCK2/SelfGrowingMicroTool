/**
 * Generates heuristic-based sample values for prompt variables.
 */
export function magicFill(variable: string): string {
    const v = variable.toLowerCase();

    if (v.includes('email')) return 'alice@example.com';
    if (v.includes('name') || v.includes('user') || v.includes('customer')) return 'Alice Smith';
    if (v.includes('product') || v.includes('item')) return 'Quantum Toaster 3000';
    if (v.includes('company') || v.includes('brand')) return 'Acme Corp';
    if (v.includes('date') || v.includes('time')) return new Date().toISOString().split('T')[0];
    if (v.includes('url') || v.includes('link') || v.includes('website')) return 'https://example.com';
    if (v.includes('phone')) return '+1-555-0123';
    if (v.includes('address')) return '123 Tech Blvd, Silicon Valley, CA';
    if (v.includes('city')) return 'San Francisco';
    if (v.includes('country')) return 'United States';
    if (v.includes('lang')) return 'English';
    if (v.includes('topic') || v.includes('subject')) return 'Artificial Intelligence';
    if (v.includes('context')) return 'The user is asking about the refund policy.';
    if (v.includes('code') || v.includes('snippet')) return 'console.log("Hello World");';
    if (v.includes('error')) return 'TypeError: undefined is not a function';
    if (v.includes('json')) return '{"key": "value"}';
    if (v.includes('csv')) return 'id,name\n1,Alice\n2,Bob';
    if (v.includes('age')) return '25';
    if (v.includes('price') || v.includes('cost')) return '$99.99';
    if (v.includes('feature')) return 'Dark Mode';
    if (v.includes('bug')) return 'App crashes on launch';
    if (v.includes('id')) return '550e8400-e29b-41d4-a716-446655440000';
    if (v.includes('review')) return 'I loved this product! It changed my life.';

    return 'Sample Value';
}

/**
 * Fills all empty variables with magic values.
 */
export function autoFillVariables(variables: string[], current: Record<string, string>): Record<string, string> {
    const next = { ...current };
    variables.forEach(v => {
        if (!next[v]) {
            next[v] = magicFill(v);
        }
    });
    return next;
}
