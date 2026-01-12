import type { TransformMode } from './types';

export class TextTransformer {
  static transform(text: string, mode: TransformMode): string {
    switch (mode) {
      case 'uppercase': return text.toUpperCase();
      case 'lowercase': return text.toLowerCase();
      case 'capitalize': return this.toCapitalize(text);
      case 'camelCase': return this.toCamelCase(text);
      case 'pascalCase': return this.toPascalCase(text);
      case 'snakeCase': return this.toSnakeCase(text);
      case 'kebabCase': return this.toKebabCase(text);
      case 'constantCase': return this.toConstantCase(text);
      case 'dotCase': return this.toDotCase(text);
      case 'pathCase': return this.toPathCase(text);
      case 'sentenceCase': return this.toSentenceCase(text);
      case 'titleCase': return this.toTitleCase(text);
      case 'alternatingCase': return this.toAlternatingCase(text);
      case 'inverseCase': return this.toInverseCase(text);
      case 'slugify': return this.toSlug(text);
      case 'reverse': return text.split('').reverse().join('');
      case 'reverseWords': return text.split(/\s+/).map(w => w.split('').reverse().join('')).join(' ');
      case 'shuffleLines': return this.shuffleLines(text);
      case 'sortLinesAlpha': return text.split('\n').sort().join('\n');
      case 'sortLinesLength': return text.split('\n').sort((a, b) => a.length - b.length).join('\n');
      case 'uniqueLines': return [...new Set(text.split('\n'))].join('\n');
      default: return text;
    }
  }

  private static toCapitalize(text: string): string {
    return text.replace(/\b\w/g, c => c.toUpperCase());
  }

  private static toCamelCase(text: string): string {
    return text
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
        index === 0 ? word.toLowerCase() : word.toUpperCase()
      )
      .replace(/[\s\-_]+/g, '');
  }

  private static toPascalCase(text: string): string {
    return text
      .replace(new RegExp(/[-_]+/, 'g'), ' ')
      .replace(new RegExp(/[^\w\s]/, 'g'), '')
      .replace(
        new RegExp(/\s+(.)(\w*)/, 'g'),
        ($1, $2, $3) => `${$2.toUpperCase() + $3.toLowerCase()}`
      )
      .replace(new RegExp(/\w/), s => s.toUpperCase());
  }

  // Robust case conversion helpers
  // We'll use a standardized tokenizer for complex cases
  private static tokenize(text: string): string[] {
    return text.split(/[\s\-_]+|(?=[A-Z])/).filter(t => t.length > 0);
  }

  private static toSnakeCase(text: string): string {
    return this.tokenize(text).map(w => w.toLowerCase()).join('_');
  }

  private static toKebabCase(text: string): string {
    return this.tokenize(text).map(w => w.toLowerCase()).join('-');
  }

  private static toConstantCase(text: string): string {
    return this.tokenize(text).map(w => w.toUpperCase()).join('_');
  }

  private static toDotCase(text: string): string {
    return this.tokenize(text).map(w => w.toLowerCase()).join('.');
  }

  private static toPathCase(text: string): string {
    return this.tokenize(text).map(w => w.toLowerCase()).join('/');
  }

  private static toSentenceCase(text: string): string {
    const lower = text.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }

  private static toTitleCase(text: string): string {
    return text.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  private static toAlternatingCase(text: string): string {
    return text.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('');
  }

  private static toInverseCase(text: string): string {
    return text.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('');
  }

  private static toSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private static shuffleLines(text: string): string {
    const lines = text.split('\n');
    for (let i = lines.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [lines[i], lines[j]] = [lines[j], lines[i]];
    }
    return lines.join('\n');
  }
}
