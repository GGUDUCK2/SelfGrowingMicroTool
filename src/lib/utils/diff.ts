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

  let diffs: Diff.Change[] | undefined;

  const diffOptions: any = {
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
          const result = Diff.diffJson(sorted1, sorted2, diffOptions);
          diffs = result || [];
        } catch (e) {
            // Fallback to line diff if invalid JSON
            const result = Diff.diffLines(original, modified, diffOptions);
            diffs = result || [];
        }
        break;
      case 'words':
        {
            const result = Diff.diffWordsWithSpace(original, modified, diffOptions);
            diffs = result || [];
        }
        break;
      case 'chars':
        {
            const result = Diff.diffChars(original, modified, diffOptions);
            diffs = result || [];
        }
        break;
      case 'lines':
      default:
        if (options.ignoreWhitespace) {
            const result = Diff.diffTrimmedLines(original, modified, diffOptions);
            diffs = result || [];
        } else {
            const result = Diff.diffLines(original, modified, diffOptions);
            diffs = result || [];
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

  if (diffs && Array.isArray(diffs)) {
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
  } else {
      diffs = [];
  }

  return {
    diffs: diffs,
    stats: { additions, deletions, unchanged }
  };
}

// Helper to sort object keys recursively for consistent JSON comparison
function sortKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(sortKeys);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj as object)
      .sort()
      .reduce((acc: Record<string, unknown>, key) => {
        acc[key] = sortKeys((obj as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }
  return obj;
}

export function parseMergeConflict(input: string): { original: string; modified: string; success: boolean } {
  const conflictRegex = /<<<<<<< (.*?)\n([\s\S]*?)=======\n([\s\S]*?)>>>>>>> (.*?)/g;
  let original = "";
  let modified = "";
  let lastIndex = 0;
  let match;
  let found = false;

  while ((match = conflictRegex.exec(input)) !== null) {
    found = true;
    // Append content before the match
    const before = input.slice(lastIndex, match.index);
    original += before;
    modified += before;

    // Append ours (original) and theirs (modified)
    original += match[2];
    modified += match[3];

    lastIndex = conflictRegex.lastIndex;
  }

  // Append remaining content
  const remaining = input.slice(lastIndex);
  original += remaining;
  modified += remaining;

  return { original, modified, success: found };
}
