export function repairWKT(wkt: string): string {
  if (!wkt) return '';

  let repaired = wkt.trim();

  // 1. Normalize case
  // Identify the type keyword
  const match = repaired.match(/^([a-zA-Z]+)/);
  if (match) {
      const type = match[1].toUpperCase();
      repaired = type + repaired.slice(match[1].length);
  }

  // 3. Fix comma spacing (1,2 -> 1, 2)
  repaired = repaired.replace(/,(\S)/g, ', $1');

  // 4. Fix double spaces
  repaired = repaired.replace(/\s+/g, ' ');

  // 2. Fix missing outer parentheses
  const typeMatch = repaired.match(/^([A-Z]+)\s*(.*)$/);
  if (typeMatch) {
      const type = typeMatch[1];
      const content = typeMatch[2].trim();

      if (!content.startsWith('(')) {
          // No parens at all
          if (type === 'POINT' || type === 'LINESTRING' || type === 'MULTIPOINT') {
              repaired = `${type} (${content})`;
          } else if (type === 'POLYGON' || type === 'MULTILINESTRING') {
              // Usually needs double parens for polygon (one ring)
              repaired = `${type} ((${content}))`;
          } else if (type === 'MULTIPOLYGON') {
              repaired = `${type} (((${content})))`;
          }
      }
  }

  // 5. Balance parentheses (simple heuristic)
  const openCount = (repaired.match(/\(/g) || []).length;
  const closeCount = (repaired.match(/\)/g) || []).length;
  if (openCount > closeCount) {
      repaired += ')'.repeat(openCount - closeCount);
  }

  // 6. Fix "POLYGON (0 0, 1 0, 1 1, 0 0)" -> needs double parens "POLYGON ((0 0, ...))"
  // If type is POLYGON and only one level of parens detected?
  if (repaired.startsWith('POLYGON')) {
      const parenMatch = repaired.match(/^POLYGON\s*(\(+)/);
      if (parenMatch && parenMatch[1].length === 1) {
          const contentStart = repaired.indexOf('(');
          const contentEnd = repaired.lastIndexOf(')');
          if (contentStart !== -1 && contentEnd !== -1) {
              const content = repaired.substring(contentStart + 1, contentEnd);
              // If content doesn't have nested parens, it's likely a single ring
              if (!content.includes('(')) {
                   repaired = repaired.substring(0, contentStart) + '((' + content + '))' + repaired.substring(contentEnd + 1);
              }
          }
      }
  }

  return repaired;
}
