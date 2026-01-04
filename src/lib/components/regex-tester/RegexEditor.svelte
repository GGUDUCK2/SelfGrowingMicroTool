<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let pattern = '';
  export let flags = 'g';
  export let dictionary: any;

  const dispatch = createEventDispatcher();

  const availableFlags = [
    { char: 'g', label: 'Global', desc: 'Find all matches rather than stopping after the first match' },
    { char: 'i', label: 'Insensitive', desc: 'Case insensitive match' },
    { char: 'm', label: 'Multi-line', desc: '^ and $ match start/end of line' },
    { char: 's', label: 'Single-line', desc: 'Dot matches newline' },
    { char: 'u', label: 'Unicode', desc: 'Treat pattern as a sequence of unicode code points' },
    { char: 'y', label: 'Sticky', desc: 'Matches only from the index indicated by the lastIndex property' }
  ];

  function toggleFlag(char: string) {
    if (flags.includes(char)) {
      flags = flags.replace(char, '');
    } else {
      flags += char;
    }
    // Sort flags alphabetically for consistency
    flags = flags.split('').sort().join('');
    dispatch('change', { pattern, flags });
  }

  function handleInput(e: Event) {
    pattern = (e.target as HTMLInputElement).value;
    dispatch('change', { pattern, flags });
  }
</script>

<div class="space-y-4">
  <div class="bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-xl p-4 border border-indigo-100 dark:border-indigo-900 shadow-sm">
    <label for="regex-pattern" class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
      {dictionary.pattern}
    </label>
    <div class="flex flex-col md:flex-row gap-4">
      <div class="relative flex-grow font-mono text-lg">
        <span class="absolute left-3 top-3 text-slate-400 select-none">/</span>
        <input
          id="regex-pattern"
          type="text"
          value={pattern}
          on:input={handleInput}
          class="w-full pl-6 pr-6 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          placeholder="[a-z]+"
        />
        <span class="absolute right-3 top-3 text-slate-400 select-none">/{flags}</span>
      </div>
    </div>

    <div class="mt-4">
      <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{dictionary.flags}</div>
      <div class="flex flex-wrap gap-2">
        {#each availableFlags as flag}
          <button
            class="px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 border {flags.includes(flag.char)
              ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'}"
            on:click={() => toggleFlag(flag.char)}
            title={flag.desc}
          >
            <span class="font-bold mr-1">{flag.char}</span>
            {flag.label}
          </button>
        {/each}
      </div>
    </div>
  </div>
</div>
