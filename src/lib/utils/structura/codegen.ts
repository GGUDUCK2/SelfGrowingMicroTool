export interface CodeGenOptions {
  name: string;
}

export type CodeGenLanguage = 'typescript' | 'go' | 'python_dataclass' | 'json_schema' | 'zod' | 'rust';

/**
 * Generates TypeScript Interface definition from an object.
 */
function generateTypeScript(data: unknown, name: string): string {
  if (Array.isArray(data)) {
    const itemType = data.length > 0 ? generateTypeScript(data[0], 'Item').replace('export interface Item ', '') : 'any';
    return `export type ${name} = ${itemType}[];`;
  }

  if (typeof data === 'object' && data !== null) {
    let output = `export interface ${name} {\n`;
    for (const [key, value] of Object.entries(data)) {
      let type = 'any';
      if (typeof value === 'string') type = 'string';
      else if (typeof value === 'number') type = 'number';
      else if (typeof value === 'boolean') type = 'boolean';
      else if (Array.isArray(value)) type = 'any[]'; // Simplified array handling
      else if (typeof value === 'object') type = 'object'; // Simplified nested object

      output += `  ${key}: ${type};\n`;
    }
    output += `}`;
    return output;
  }

  return `export type ${name} = ${typeof data};`;
}

/**
 * Generates Go Struct definition from an object.
 */
function generateGo(data: unknown, name: string): string {
  const toPascalCase = (str: string) => str.replace(/(^\w|-\w)/g, (c) => c.replace('-', '').toUpperCase());

  if (Array.isArray(data)) {
      // For top-level array, we can't really define a struct, so we define the item struct.
      if (data.length > 0) {
          return generateGo(data[0], name);
      }
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
            else if (typeof value === 'number') type = 'float'; // or int
            else if (typeof value === 'boolean') type = 'bool';

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
    // Basic inference
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

/**
 * Generates Zod Schema.
 */
function generateZod(data: unknown, name: string): string {
  const inferZod = (val: any): string => {
    if (val === null) return "z.null()";
    if (Array.isArray(val)) {
      const itemType = val.length > 0 ? inferZod(val[0]) : "z.any()";
      return `z.array(${itemType})`;
    }
    if (typeof val === 'object') {
      const props: string[] = [];
      for (const [k, v] of Object.entries(val)) {
        props.push(`  ${k}: ${inferZod(v)}`);
      }
      return `z.object({\n${props.join(',\n')}\n})`;
    }
    if (typeof val === 'string') return "z.string()";
    if (typeof val === 'number') return "z.number()";
    if (typeof val === 'boolean') return "z.boolean()";
    return "z.any()";
  };

  return `import { z } from 'zod';\n\nexport const ${name}Schema = ${inferZod(data)};\n\nexport type ${name} = z.infer<typeof ${name}Schema>;`;
}

/**
 * Generates Rust Struct.
 */
function generateRust(data: unknown, name: string): string {
  const toPascalCase = (str: string) => str.replace(/(^\w|-\w)/g, (c) => c.replace('-', '').toUpperCase());
  const toSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

  if (Array.isArray(data)) {
    if (data.length > 0) return generateRust(data[0], name);
    return `// Array of unknown items`;
  }

  if (typeof data === 'object' && data !== null) {
    let output = `use serde::{Deserialize, Serialize};\n\n#[derive(Debug, Serialize, Deserialize)]\npub struct ${name} {\n`;
    for (const [key, value] of Object.entries(data)) {
      const fieldName = key.includes('-') ? toSnakeCase(key) : key; // Simple handling
      const rename = key !== fieldName ? `    #[serde(rename = "${key}")]\n` : '';

      let type = 'serde_json::Value';
      if (typeof value === 'string') type = 'String';
      else if (typeof value === 'number') type = 'f64'; // Default to float
      else if (typeof value === 'boolean') type = 'bool';

      output += `${rename}    pub ${fieldName}: ${type},\n`;
    }
    output += `}`;
    return output;
  }
  return `// Primitive type`;
}

export function generateCode(data: unknown, language: CodeGenLanguage, options: CodeGenOptions = { name: 'Root' }): string {
  try {
    switch (language) {
      case 'typescript':
        return generateTypeScript(data, options.name);
      case 'go':
        return generateGo(data, options.name);
      case 'python_dataclass':
        return generatePython(data, options.name);
      case 'json_schema':
        return generateJsonSchema(data, options.name);
      case 'zod':
        return generateZod(data, options.name);
      case 'rust':
        return generateRust(data, options.name);
      default:
        return '// Unsupported language';
    }
  } catch (e) {
    return `// Error generating code: ${e instanceof Error ? e.message : String(e)}`;
  }
}
