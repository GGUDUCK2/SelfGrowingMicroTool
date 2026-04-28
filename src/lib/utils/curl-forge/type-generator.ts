export function generateTypeScriptInterfaces(jsonString: string, rootName: string = 'Root'): string {
  try {
    const parsed = JSON.parse(jsonString);
    const interfaces: Record<string, string> = {};
    const seen = new Set<string>();

    function getType(value: unknown, name: string): string {
      if (value === null) return 'any | null';
      if (Array.isArray(value)) {
        if (value.length === 0) return 'any[]';
        return `${getType(value[0], name + 'Item')}[]`;
      }
      if (typeof value === 'object') {
        const interfaceName = name.charAt(0).toUpperCase() + name.slice(1);
        if (!seen.has(interfaceName)) {
            seen.add(interfaceName);
            generateInterface(value as Record<string, unknown>, interfaceName);
        }
        return interfaceName;
      }
      return typeof value;
    }

    function generateInterface(obj: Record<string, unknown>, name: string) {
      let props = '';
      for (const [key, value] of Object.entries(obj)) {
        const typeStr = getType(value, key);
        props += `  ${key}: ${typeStr};\n`;
      }
      interfaces[name] = `export interface ${name} {\n${props}}`;
    }

    const rootType = getType(parsed, rootName);
    if (typeof parsed !== 'object' || parsed === null) {
      return `export type ${rootName} = ${rootType};`;
    }

    return Object.values(interfaces).join('\n\n');
  } catch {
    return '// Invalid JSON for TypeScript generation\n';
  }
}
