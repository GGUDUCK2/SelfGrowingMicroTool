/**
 * Extracts unique variable names from a template string.
 * Supports {{variable}} syntax.
 */
export function extractVariables(template: string): string[] {
  const regex = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
  const matches = new Set<string>();
  const ordered: string[] = [];

  let match;
  while ((match = regex.exec(template)) !== null) {
    const varName = match[1];
    if (!matches.has(varName)) {
      matches.add(varName);
      ordered.push(varName);
    }
  }
  return ordered;
}

/**
 * Replaces variables in the template with provided values.
 * If a value is missing, the original tag {{var}} is preserved.
 */
export function compilePrompt(template: string, variables: Record<string, string>): string {
    if (!template) return '';
    return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, varName) => {
        // We use checks for undefined/null, but allow empty string
        return variables[varName] !== undefined && variables[varName] !== null ? variables[varName] : match;
    });
}

export interface OpenAIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface PromptExport {
    messages: OpenAIMessage[];
    model: string;
    temperature: number;
}

/**
 * Generates a JSON export object compatible with OpenAI chat completion format (partial).
 */
export function generateExport(system: string, user: string, variables: Record<string, string>): PromptExport {
    const compiledSystem = compilePrompt(system, variables);
    const compiledUser = compilePrompt(user, variables);

    return {
        messages: [
            { role: "system", content: compiledSystem },
            { role: "user", content: compiledUser }
        ],
        model: "gpt-4",
        temperature: 0.7
    };
}
