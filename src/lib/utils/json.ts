
export function validateJson(json: string): { isValid: boolean; error?: string; line?: number; column?: number } {
  try {
    JSON.parse(json);
    return { isValid: true };
  } catch (e: any) {
    const msg = e.message;
    // Attempt to extract line and column from error message
    // Common format: "Unexpected token } in JSON at position 123"
    // Or if using a better parser, but standard JSON.parse is limited.
    // We can try to approximate line/col from position if available.
    return { isValid: false, error: msg };
  }
}

export function formatJson(json: string, space: number = 2): string {
  try {
    const obj = JSON.parse(json);
    return JSON.stringify(obj, null, space);
  } catch {
    return json;
  }
}

export function minifyJson(json: string): string {
  try {
    const obj = JSON.parse(json);
    return JSON.stringify(obj);
  } catch {
    return json;
  }
}

function getType(value: any): string {
  if (value === null) return 'any'; // or null
  if (Array.isArray(value)) {
    if (value.length === 0) return 'any[]';
    const types = new Set(value.map(getType));
    if (types.size === 1) return `${Array.from(types)[0]}[]`;
    return `(${Array.from(types).join(' | ')})[]`;
  }
  if (typeof value === 'object') return 'object';
  return typeof value;
}

export function jsonToTypescript(json: string, rootName: string = 'Root'): string {
  try {
    const obj = JSON.parse(json);
    const interfaces: string[] = [];
    const names = new Set<string>();

    function generateInterface(name: string, data: any): string {
      if (names.has(name)) return name; // Handle recursion slightly? Or just reuse name.
      // names.add(name); // Don't add yet, allows re-definition if structure differs? No, simple approach.

      // Simple strategy: Collect all interfaces first.
      return name;
    }

    // A better approach for a simple tool:
    // Recursively build strings.

    function walk(name: string, data: any): string {
      if (data === null) return 'any';
      if (Array.isArray(data)) {
        if (data.length === 0) return 'any[]';
        // Check if all items are objects
        if (data.every(item => typeof item === 'object' && item !== null && !Array.isArray(item))) {
           // Merge keys? Or just take first? Let's take first for simplicity or merge.
           // Merging is better.
           const merged = data.reduce((acc, curr) => ({...acc, ...curr}), {});
           return `${walk(name, merged)}[]`;
        }
        const types = new Set(data.map(item => walk(name + 'Item', item)));
        const typeStr = Array.from(types).join(' | ');
        return `(${typeStr})[]`;
      }
      if (typeof data === 'object') {
        const interfaceName = capitalize(name);
        // check if already exists
        // simplified: Just generate inline or append to list
        const lines = Object.entries(data).map(([key, value]) => {
          const type = walk(key, value);
          // If type is an object type (starts with I...), it's a reference.
          // But here walk returns the type string.
          return `  ${key}: ${type};`;
        });

        const interfaceBody = `interface ${interfaceName} {\n${lines.join('\n')}\n}`;
        // Verify uniqueness
        const existing = interfaces.find(i => i.startsWith(`interface ${interfaceName}`));
        if (!existing) {
             interfaces.push(interfaceBody);
        } else {
            // If body is different, we might need a unique name.
            // Skipping for MVP stability.
        }
        return interfaceName;
      }
      return typeof data;
    }

    // Helper to traverse and collect interfaces
    function parseObject(name: string, obj: any): string {
        if (Array.isArray(obj)) {
            // If root is array
             if (obj.length === 0) return 'any[]';
             // simplified: assume object array
             if (typeof obj[0] === 'object') {
                 const type = parseObject(name + 'Item', obj[0]);
                 return `${type}[]`;
             }
             return `${typeof obj[0]}[]`;
        }

        if (typeof obj === 'object' && obj !== null) {
            const keys = Object.keys(obj);
            let result = `interface ${name} {\n`;
            for (const key of keys) {
                const value = obj[key];
                let type: string = typeof value;
                if (value === null) type = 'any';
                else if (Array.isArray(value)) {
                    if (value.length > 0) {
                        if (typeof value[0] === 'object') {
                             const subName = capitalize(key);
                             type = `${subName}[]`;
                             parseObject(subName, value[0]);
                        } else {
                            type = `${typeof value[0]}[]`;
                        }
                    } else {
                        type = 'any[]';
                    }
                } else if (typeof value === 'object') {
                    const subName = capitalize(key);
                    type = subName;
                    parseObject(subName, value);
                }
                result += `  ${key}: ${type};\n`;
            }
            result += `}\n`;
            interfaces.push(result);
            return name;
        }
        return 'any';
    }

    parseObject(rootName, obj);
    return interfaces.reverse().join('\n\n');
  } catch (e) {
    return `// Error generating TypeScript: ${e}`;
  }
}

export function jsonToGo(json: string, rootName: string = 'Root'): string {
    try {
        const obj = JSON.parse(json);
        const structs: string[] = [];

        function parse(name: string, obj: any): string {
            if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
                let struct = `type ${name} struct {\n`;
                for (const [key, value] of Object.entries(obj)) {
                    const pascalKey = capitalize(key); // Go exports fields
                    let type = 'interface{}';

                    if (value === null) type = 'interface{}';
                    else if (typeof value === 'string') type = 'string';
                    else if (typeof value === 'number') type = 'float64';
                    else if (typeof value === 'boolean') type = 'bool';
                    else if (Array.isArray(value)) {
                        if (value.length > 0) {
                            if (typeof value[0] === 'object') {
                                const subName = capitalize(key);
                                parse(subName, value[0]);
                                type = `[]${subName}`;
                            } else {
                                const subType = typeof value[0] === 'number' ? 'float64' : typeof value[0];
                                type = `[]${subType}`;
                            }
                        } else {
                            type = '[]interface{}';
                        }
                    } else if (typeof value === 'object') {
                        const subName = capitalize(key);
                        parse(subName, value);
                        type = subName;
                    }

                    struct += `\t${pascalKey} ${type} \`json:"${key}"\`\n`;
                }
                struct += `}`;
                structs.push(struct);
                return name;
            }
            return '';
        }

        if (Array.isArray(obj)) {
             if (obj.length > 0 && typeof obj[0] === 'object') {
                 parse(rootName, obj[0]);
             }
        } else {
            parse(rootName, obj);
        }

        return structs.reverse().join('\n\n');

    } catch (e) {
        return `// Error generating Go: ${e}`;
    }
}

function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
