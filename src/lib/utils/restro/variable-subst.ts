import type { HttpResponse } from './client';

export interface RestroVariable {
  key: string;
  value: string;
}

export async function substituteVariables(
    target: string,
    lastResponse: HttpResponse | null,
    globalVariables: RestroVariable[] = []
): Promise<string> {
    if (!target) return target;

    // First replace global variables {{key}}
    let result = target;

    // Sort variables by key length (descending) to avoid partial matches
    const sortedVars = [...globalVariables].sort((a, b) => b.key.length - a.key.length);

    for (const v of sortedVars) {
        // Use a safe regex for exact replacement if possible, or simple replaceAll
        // Note: Global vars usually don't have spaces, but let's be safe.
        // We look for {{key}}
        result = result.split(`{{${v.key}}}`).join(v.value);
    }

    // Then replace dynamic response variables {{last_response...}}
    if (lastResponse) {
        result = result.replace(/{{last_response\.(.*?)}}/g, (_, path) => {
            try {
                // Check if looking for headers
                if (path.startsWith('headers.')) {
                    const headerKey = path.split('.')[1];
                    // Case insensitive header lookup
                    const val = Object.entries(lastResponse.headers)
                        .find(([k]) => k.toLowerCase() === headerKey.toLowerCase())?.[1];
                    return val || '';
                }

                // Assume body is JSON
                const body = JSON.parse(lastResponse.body);
                // Simple path parser: data.users[0].id
                // Split by dot, but handle brackets
                const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');

                let current = body;
                for (const key of keys) {
                    if (current === undefined || current === null) return '';
                    current = current[key];
                }
                return String(current);
            } catch (e) {
                return '';
            }
        });
    }

    return result;
}

// ... existing code ...
export { executeRequest, type HttpResponse } from './client';
