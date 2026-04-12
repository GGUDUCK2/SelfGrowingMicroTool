<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let content: string;
  export let t: Record<string, any>;

  const dispatch = createEventDispatcher();

  // A robust parser that keeps comments and blank lines intact, but allows modification of keys.
  // We represent the file as an array of line objects.
  function parseLines(str: string) {
      return str.split('\n').map(line => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) {
              return { type: 'comment_or_blank', raw: line, key: null, value: null };
          }

          const match = line.match(/^([^=]+)=(.*)$/);
          if (match) {
              const key = match[1].trim();
              const value = match[2].trim();
              return { type: 'kv', raw: line, key, value };
          }
          // Fallback
          return { type: 'unknown', raw: line, key: null, value: null };
      });
  }

  function format(action: string) {
      let lines = parseLines(content);

      if (action === 'sortAlphabetically') {
          // Extract KVs
          const kvs = lines.filter(l => l.type === 'kv').sort((a, b) => a.key!.localeCompare(b.key!));
          // Extract comments that were not inline. For simplicity, if sorting, we drop standalone comments or put them at the top.
          // Let's do a pure sort of KV, and drop comments to keep it clean, OR just put KVs.
          // Actually, standard is to sort keys and ignore comments, or group them. Let's just output KVs for sort.
          content = kvs.map(l => `${l.key}=${l.value}`).join('\n');
      }
      else if (action === 'removeDuplicates') {
          const seen = new Set();
          const result = [];
          // Keep comments, but if KV is duplicate (by key), remove. We keep the LAST occurrence usually in .env (overrides).
          // To keep last, we reverse, seen, then reverse back.
          const reversedLines = [...lines].reverse();
          for (const line of reversedLines) {
              if (line.type === 'kv') {
                  if (!seen.has(line.key)) {
                      seen.add(line.key);
                      result.push(line);
                  }
              } else {
                  result.push(line); // keep comments
              }
          }
          content = result.reverse().map(l => l.raw).join('\n');
      }
      else if (action === 'alignEquals') {
          // Find max key length
          const kvs = lines.filter(l => l.type === 'kv');
          if (kvs.length > 0) {
              const maxKeyLen = Math.max(...kvs.map(l => l.key!.length));
              content = lines.map(line => {
                  if (line.type === 'kv') {
                      const padding = ' '.repeat(maxKeyLen - line.key!.length);
                      return `${line.key}${padding}=${line.value}`;
                  }
                  return line.raw;
              }).join('\n');
          }
      }
      else if (action === 'generateExample') {
          content = lines.map(line => {
              if (line.type === 'kv') {
                  return `${line.key}=`;
              }
              return line.raw;
          }).join('\n');
      }


      else if (action === 'obfuscate') {
          content = lines.map(line => {
              if (line.type === 'kv') {
                  // Keep the key, replace value with asterisks, keeping length if possible
                  // Or just standard 8 asterisks for safety.
                  const masked = '********';
                  return `${line.key}=${masked}`;
              }
              return line.raw;
          }).join('\n');
      }
      else if (action === 'groupByPrefix') {
          // Group by the first part of the key before an underscore. E.g. DATABASE_URL -> DATABASE
          const kvs = lines.filter(l => l.type === 'kv');
          const groups: Record<string, typeof kvs> = {};
          for (const kv of kvs) {
              const prefix = kv.key!.split('_')[0].toUpperCase();
              if (!groups[prefix]) groups[prefix] = [];
              groups[prefix].push(kv);
          }

          let newContent = '';
          const sortedPrefixes = Object.keys(groups).sort();
          for (const prefix of sortedPrefixes) {
              newContent += `\n# --- ${prefix} ---\n`;
              for (const kv of groups[prefix]) {
                  newContent += `${kv.key}=${kv.value}\n`;
              }
          }
          content = newContent.trim();
      }

      dispatch('change', content);
  }
</script>

<div class="space-y-6">
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <button class="min-h-[44px] min-w-[44px] px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2" on:click={() => format('sortAlphabetically')}>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5h10"></path><path d="M11 9h7"></path><path d="M11 13h4"></path><path d="M3 17l3 3 3-3"></path><path d="M6 18V4"></path></svg>
          {t.sortAlphabetically}
      </button>

      <button class="min-h-[44px] min-w-[44px] px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2" on:click={() => format('removeDuplicates')}>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="9" y1="15" x2="15" y2="15"></line></svg>
          {t.removeDuplicates}
      </button>

      <button class="min-h-[44px] min-w-[44px] px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2" on:click={() => format('alignEquals')}>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line></svg>
          {t.alignEquals}
      </button>

      <button class="min-h-[44px] min-w-[44px] px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2" on:click={() => format('generateExample')}>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
          {t.generateExample}
      </button>

      <button class="min-h-[44px] min-w-[44px] px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2" on:click={() => format('obfuscate')}>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle><line x1="2" y1="2" x2="22" y2="22"></line></svg>
          {t.obfuscate}
      </button>

      <button class="min-h-[44px] min-w-[44px] px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2" on:click={() => format('groupByPrefix')}>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          {t.groupByPrefix}
      </button>
  </div>
</div>