export function getMatches(regexStr: string, flags: string, text: string) {
  if (!regexStr) return { matches: [], error: null };

  try {
    const regex = new RegExp(regexStr, flags);
    const matches = [];

    // Safety cap to prevent infinite loops or huge memory usage
    const MAX_MATCHES = 2000;
    let match;
    let loopCount = 0;

    // Handle global flag vs non-global
    if (regex.global) {
      // Prevent infinite loop with zero-length matches (e.g. /.*/g on empty string or gaps)
      // Exec maintains state in regex.lastIndex

      while ((match = regex.exec(text)) !== null) {
        matches.push({
          index: match.index,
          content: match[0],
          groups: match.slice(1) // Capture groups
        });

        loopCount++;
        if (loopCount > MAX_MATCHES) break;

        // If match is empty string, manually advance index to avoid infinite loop
        if (match[0].length === 0) {
          regex.lastIndex++;
        }
      }
    } else {
      // Non-global: just one match
      match = regex.exec(text);
      if (match) {
        matches.push({
          index: match.index,
          content: match[0],
          groups: match.slice(1)
        });
      }
    }

    return { matches, error: null };
  } catch (e: any) {
    return { matches: [], error: e.message };
  }
}
