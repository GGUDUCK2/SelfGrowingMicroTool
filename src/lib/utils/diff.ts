import * as Diff from 'diff';

export type DiffMode = 'lines' | 'words' | 'chars' | 'json';

export interface DiffResult {
  diffs: Diff.Change[];
  stats: {
    additions: number;
    deletions: number;
    unchanged: number;
  };
}

const MAX_INPUT_LENGTH = 100000; // Cap to prevent browser crash

export function calculateDiff(
  original: string,
  modified: string,
  mode: DiffMode = 'lines',
  options: { ignoreCase?: boolean; ignoreWhitespace?: boolean } = {}
): DiffResult {
  // Safety cap
  if (original.length > MAX_INPUT_LENGTH) original = original.slice(0, MAX_INPUT_LENGTH);
  if (modified.length > MAX_INPUT_LENGTH) modified = modified.slice(0, MAX_INPUT_LENGTH);

  let diffs: Diff.Change[] = [];

  const diffOptions = {
    ignoreCase: options.ignoreCase,
    ignoreWhitespace: options.ignoreWhitespace,
    newlineIsToken: false
  };

  try {
    switch (mode) {
      case 'json':
        // Try to parse and pretty print JSON before diffing
        try {
          const obj1 = JSON.parse(original);
          const obj2 = JSON.parse(modified);
          const sorted1 = JSON.stringify(sortKeys(obj1), null, 2);
          const sorted2 = JSON.stringify(sortKeys(obj2), null, 2);
          // diffJson expects objects, not strings, or just strings?
          // Actually diffJson in jsdiff takes strings or objects.
          // But the type definition might be strict about options.
          // Let's coerce options to any to satisfy TS or remove unsupported options for JSON diff.
          diffs = Diff.diffJson(sorted1, sorted2, diffOptions as any) || [];
        } catch (e) {
            // Fallback to line diff if invalid JSON
            diffs = Diff.diffLines(original, modified, diffOptions);
        }
        break;
      case 'words':
        diffs = Diff.diffWordsWithSpace(original, modified, diffOptions);
        break;
      case 'chars':
        diffs = Diff.diffChars(original, modified, diffOptions);
        break;
      case 'lines':
      default:
        // diffLines doesn't support ignoreWhitespace natively in the same way,
        // but we can try diffTrimmedLines or pass options if supported.
        // Actually diffLines does accept options in newer versions.
        if (options.ignoreWhitespace) {
            diffs = Diff.diffTrimmedLines(original, modified, diffOptions);
        } else {
            diffs = Diff.diffLines(original, modified, diffOptions);
        }
        break;
    }
  } catch (error) {
    console.error("Diff calculation failed", error);
    return {
      diffs: [],
      stats: { additions: 0, deletions: 0, unchanged: 0 }
    };
  }

  // Calculate stats
  let additions = 0;
  let deletions = 0;
  let unchanged = 0;

  diffs.forEach(part => {
    const count = part.count || 0;
    if (part.added) {
      additions += count;
    } else if (part.removed) {
      deletions += count;
    } else {
      unchanged += count;
    }
  });

  return {
    diffs,
    stats: { additions, deletions, unchanged }
  };
}

// Helper to sort object keys recursively for consistent JSON comparison
function sortKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sortKeys);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj)
      .sort()
      .reduce((acc: any, key) => {
        acc[key] = sortKeys(obj[key]);
        return acc;
      }, {});
  }
  return obj;
}
