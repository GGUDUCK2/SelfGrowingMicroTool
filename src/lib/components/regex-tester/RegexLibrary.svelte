<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let dictionary: any;

  const dispatch = createEventDispatcher();

  const library = [
    { id: 'email', label: dictionary.presets.email, pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', flags: 'g' },
    { id: 'url', label: dictionary.presets.url, pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)', flags: 'gm' },
    { id: 'date', label: dictionary.presets.date, pattern: '\\d{4}-\\d{2}-\\d{2}', flags: 'g' },
    { id: 'ipv4', label: dictionary.presets.ipv4, pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', flags: 'g' },
    { id: 'hex', label: dictionary.presets.hex, pattern: '#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})', flags: 'gi' },
    { id: 'slug', label: dictionary.presets.slug, pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$', flags: '' }
  ];

  function selectPattern(item: any) {
    dispatch('select', { pattern: item.pattern, flags: item.flags });
  }
</script>

<div class="bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-xl p-4 border border-indigo-100 dark:border-indigo-900 shadow-sm h-full">
  <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 px-2">{dictionary.library}</h3>
  <div class="space-y-2">
    {#each library as item}
      <button
        class="w-full text-left px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm transition-all group"
        on:click={() => selectPattern(item)}
      >
        <div class="flex flex-col">
          <span class="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {item.label}
          </span>
          <code class="text-xs text-slate-500 mt-1 truncate font-mono opacity-70">/{item.pattern}/</code>
        </div>
      </button>
    {/each}
  </div>
</div>
