export interface SmartSuggestion {
  id: string;
  label: string;
  action: string; // matches action types in Toolbar
  mode: string;   // matches mode types
  confidence: number;
}

export class SmartMagic {
  static detect(text: string): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = [];
    const trimmed = text.trim();

    if (!trimmed) return [];

    // JSON Detection
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        JSON.parse(trimmed);
        // If it parses, it's JSON. Suggest formatting if it looks minified or messy.
        if (!trimmed.includes('\n') || trimmed.split('\n').length < 3) {
             suggestions.push({
                id: 'format-json',
                label: 'formatJson',
                action: 'clean', // We might need a 'format' action or piggyback
                mode: 'formatJson', // We need to add this mode
                confidence: 0.95
             });
        }
      } catch (e) {
         // Invalid JSON, maybe suggest fixing?
      }
    }

    // Base64 Detection (naive)
    if (trimmed.length > 8 && /^[A-Za-z0-9+/]+={0,2}$/.test(trimmed)) {
       try {
           atob(trimmed);
           suggestions.push({
               id: 'decode-base64',
               label: 'decodeBase64',
               action: 'encode',
               mode: 'base64Decode',
               confidence: 0.8
           });
       } catch (e) {}
    }

    // URL Encoded
    if (trimmed.includes('%20') || trimmed.includes('%2F')) {
        suggestions.push({
            id: 'decode-url',
            label: 'decodeUrl',
            action: 'encode',
            mode: 'urlDecode',
            confidence: 0.9
        });
    }

    // JWT Detection
    if (trimmed.split('.').length === 3 && trimmed.startsWith('ey')) {
         suggestions.push({
            id: 'decode-jwt',
            label: 'decodeBase64',
            action: 'encode', // We might not have a JWT decoder in String Theory yet, maybe just Base64 decode parts?
            mode: 'base64Decode', // Fallback
            confidence: 0.95
        });
    }

    // Messy Whitespace
    if (/\n\s*\n\s*\n/.test(text) || /[ \t]{2,}/.test(text)) {
        suggestions.push({
            id: 'clean-whitespace',
            label: 'cleanWhitespace',
            action: 'clean',
            mode: 'normalizeSpace',
            confidence: 0.7
        });
    }

    return suggestions;
  }
}
