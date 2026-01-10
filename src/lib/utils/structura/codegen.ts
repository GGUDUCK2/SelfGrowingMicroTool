export interface CodeGenOptions {
  name: string;
}

export type CodeGenLanguage = 'typescript' | 'zod' | 'go' | 'python' | 'pydantic' | 'json_schema';

/**
 * Helper to capitalize first letter
 */
const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

/**
 * Helper to convert string to PascalCase
 */
const toPascalCase = (str: string) => str.replace(/(^\w|-\w|_\w)/g, (c) => c.replace(/[-_]/, '').toUpperCase());

/**
 * Generates TypeScript Interface definition from an object.
 */
function generateTypeScript(data: unknown, name: string): string {
  if (Array.isArray(data)) {
    const itemType = data.length > 0 ? generateTypeScript(data[0], 'Item').replace('export interface Item ', '') : 'any';
    // Remove trailing semicolon and newline from recursive call if present
    const cleanItemType = itemType.trim().replace(/;$/, '');

    // If it's a complex object (starts with {), we need to extract it or name it
    if (cleanItemType.startsWith('{')) {
       // Ideally we would extract interfaces, but for simplicity:
       return `export type ${name} = ${cleanItemType}[];`;
    }
    return `export type ${name} = ${cleanItemType}[];`;
  }

  if (typeof data === 'object' && data !== null) {
    let output = `export interface ${name} {\n`;
    for (const [key, value] of Object.entries(data)) {
      let type = 'any';
      if (typeof value === 'string') type = 'string';
      else if (typeof value === 'number') type = 'number';
      else if (typeof value === 'boolean') type = 'boolean';
      else if (Array.isArray(value)) {
          // Simple array type inference
          if (value.length > 0) {
              const first = value[0];
              if (typeof first === 'string') type = 'string[]';
              else if (typeof first === 'number') type = 'number[]';
              else if (typeof first === 'boolean') type = 'boolean[]';
              else type = 'any[]'; // Deep nesting handled simply for now
          } else {
              type = 'any[]';
          }
      }
      else if (typeof value === 'object') type = 'Record<string, any>'; // Simplified nested object

      output += `  ${key}: ${type};\n`;
    }
    output += `}`;
    return output;
  }

  return `export type ${name} = ${typeof data};`;
}

/**
 * Generates Zod Schema
 */
function generateZod(data: unknown, name: string): string {
    const imports = `import { z } from 'zod';\n\n`;

    const inferZod = (val: unknown): string => {
        if (val === null) return "z.null()";
        if (typeof val === 'string') return "z.string()";
        if (typeof val === 'number') return "z.number()";
        if (typeof val === 'boolean') return "z.boolean()";

        if (Array.isArray(val)) {
            const itemType = val.length > 0 ? inferZod(val[0]) : "z.any()";
            return `z.array(${itemType})`;
        }

        if (typeof val === 'object') {
            const lines: string[] = [];
            for (const [k, v] of Object.entries(val)) {
                lines.push(`  ${k}: ${inferZod(v)}`);
            }
            return `z.object({\n${lines.join(',\n')}\n})`;
        }

        return "z.any()";
    };

    return `${imports}export const ${name}Schema = ${inferZod(data)};\n\nexport type ${name} = z.infer<typeof ${name}Schema>;`;
}

/**
 * Generates Go Struct definition from an object.
 */
function generateGo(data: unknown, name: string): string {
  if (Array.isArray(data)) {
      if (data.length > 0) return generateGo(data[0], name);
      return `type ${name} []interface{}`;
  }

  if (typeof data === 'object' && data !== null) {
    let output = `type ${name} struct {\n`;
    for (const [key, value] of Object.entries(data)) {
      const fieldName = toPascalCase(key);
      let type = 'interface{}';
      if (typeof value === 'string') type = 'string';
      else if (typeof value === 'number') type = 'float64';
      else if (typeof value === 'boolean') type = 'bool';
      else if (Array.isArray(value)) type = '[]interface{}'; // Simplified

      output += `\t${fieldName} ${type} \`json:"${key}"\`\n`;
    }
    output += `}`;
    return output;
  }

  return `// Cannot generate struct for primitive type`;
}

/**
 * Generates Python Dataclass definition.
 */
function generatePython(data: unknown, name: string): string {
    if (Array.isArray(data)) {
        if (data.length > 0) return generatePython(data[0], name);
        return `# List of items`;
    }

    if (typeof data === 'object' && data !== null) {
        let output = `from dataclasses import dataclass\nfrom typing import Any, List, Optional\n\n@dataclass\nclass ${name}:\n`;
        for (const [key, value] of Object.entries(data)) {
            let type = 'Any';
            if (typeof value === 'string') type = 'str';
            else if (typeof value === 'number') type = 'float';
            else if (typeof value === 'boolean') type = 'bool';
            else if (Array.isArray(value)) type = 'List[Any]';

            output += `    ${key}: ${type}\n`;
        }
        return output;
    }
    return `# Primitive type`;
}

/**
 * Generates Pydantic v2 Model
 */
function generatePydantic(data: unknown, name: string): string {
     if (Array.isArray(data)) {
        if (data.length > 0) return generatePydantic(data[0], name);
        return `# List of items`;
    }

    if (typeof data === 'object' && data !== null) {
        let output = `from pydantic import BaseModel\nfrom typing import Any, List, Optional\n\nclass ${name}(BaseModel):\n`;
        for (const [key, value] of Object.entries(data)) {
            let type = 'Any';
            if (typeof value === 'string') type = 'str';
            else if (typeof value === 'number') type = 'float';
            else if (typeof value === 'boolean') type = 'bool';
            else if (Array.isArray(value)) type = 'List[Any]';

            output += `    ${key}: ${type}\n`;
        }
        return output;
    }
    return `# Primitive type`;
}

/**
 * Generates JSON Schema.
 */
function generateJsonSchema(data: unknown, name: string): string {
    const schema: any = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": name,
    };

    const inferType = (val: any): any => {
        if (val === null) return { type: "null" };
        if (Array.isArray(val)) {
            return {
                type: "array",
                items: val.length > 0 ? inferType(val[0]) : {}
            };
        }
        if (typeof val === 'object') {
            const props: any = {};
            for (const k in val) {
                props[k] = inferType(val[k]);
            }
            return {
                type: "object",
                properties: props
            };
        }
        if (typeof val === 'string') return { type: "string" };
        if (typeof val === 'number') return { type: "number" };
        if (typeof val === 'boolean') return { type: "boolean" };
        return {};
    };

    Object.assign(schema, inferType(data));
    return JSON.stringify(schema, null, 2);
}

export function generateCode(data: unknown, language: CodeGenLanguage, options: CodeGenOptions = { name: 'Root' }): string {
  try {
    switch (language) {
      case 'typescript':
        return generateTypeScript(data, options.name);
      case 'zod':
        return generateZod(data, options.name);
      case 'go':
        return generateGo(data, options.name);
      case 'python':
        return generatePython(data, options.name);
      case 'pydantic':
        return generatePydantic(data, options.name);
      case 'json_schema':
        return generateJsonSchema(data, options.name);
      default:
        return '// Unsupported language';
    }
  } catch (e) {
    return `// Error generating code: ${e instanceof Error ? e.message : String(e)}`;
  }
}
