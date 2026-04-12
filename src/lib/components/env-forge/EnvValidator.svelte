<script lang="ts">
  export let content: string;
  export let t: Record<string, any>;

  interface EnvError {
      line: number;
      type: string;
      message: string;
      raw: string;
  }

  $: errors = validate(content);

  function validate(str: string): EnvError[] {
      const errs: EnvError[] = [];
      const lines = str.split('\n');
      const seenKeys = new Map<string, number>(); // key -> line number

      lines.forEach((line, i) => {
          const lineNumber = i + 1;
          const trimmed = line.trim();

          if (!trimmed || trimmed.startsWith('#')) return; // skip comments and blanks

          const match = line.match(/^([^=]+)=(.*)$/);
          if (!match) {
              errs.push({ line: lineNumber, type: 'invalid_format', message: "Line does not match KEY=VALUE format", raw: line });
              return;
          }

          const key = match[1];
          const value = match[2].trim();

          // 1. Invalid Key
          // Keys typically should only contain alphanumeric and underscores, and not start with a number.
          if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key.trim())) {
              errs.push({ line: lineNumber, type: 'invalid_key', message: t.validation.invalidKey, raw: line });
          }

          // 2. Spaces in value not quoted
          // If value has spaces, it should start and end with " or '
          if (value.includes(' ') && !(/^".*"$/.test(value) || /^'.*'$/.test(value))) {
              errs.push({ line: lineNumber, type: 'spaces_in_value', message: t.validation.spacesInValue, raw: line });
          }

          // 3. Duplicate Key
          const trimmedKey = key.trim();
          if (seenKeys.has(trimmedKey)) {
              errs.push({ line: lineNumber, type: 'duplicate_key', message: `${t.validation.duplicateKey} (First seen at line ${seenKeys.get(trimmedKey)})`, raw: line });
          } else {
              seenKeys.set(trimmedKey, lineNumber);
          }
      });

      return errs;
  }
</script>

<div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
  <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
      {t.validation.title}
  </h3>

  {#if errors.length === 0}
      <div class="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-800 flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <p>{t.validation.noErrors}</p>
      </div>
  {:else}
      <div class="space-y-3">
          {#each errors as error}
              <div class="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-800">
                  <div class="flex items-start gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                      <div>
                          <p class="font-bold">Line {error.line}: {error.message}</p>
                          <code class="block mt-2 text-sm bg-white dark:bg-red-950/50 px-2 py-1 rounded">{error.raw}</code>
                      </div>
                  </div>
              </div>
          {/each}
      </div>
  {/if}
</div>