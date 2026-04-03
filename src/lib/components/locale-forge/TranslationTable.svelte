<script lang="ts">
  import { projectStore } from '$lib/utils/locale-forge/store';
  import { Trash2 } from 'lucide-svelte';

  let filter = '';

  $: filteredData = $projectStore.data.filter(item => {
      if (!filter) return true;
      if (item.key.includes(filter)) return true;
      return Object.values(item.values).some(v => v && v.toString().toLowerCase().includes(filter.toLowerCase()));
  });

  function updateValue(key: string, lang: string, value: string) {
      projectStore.update(store => {
          const newData = store.data.map(item => {
              if (item.key === key) {
                  return {
                      ...item,
                      values: { ...item.values, [lang]: value }
                  };
              }
              return item;
          });
          return { ...store, data: newData };
      });
  }

  function deleteKey(key: string) {
      if(confirm('Delete key ' + key + '?')) {
          projectStore.update(store => ({
              ...store,
              data: store.data.filter(d => d.key !== key)
          }));
      }
  }
</script>

<div class="flex flex-col h-full">
    <div class="mb-4">
        <input
            type="text"
            bind:value={filter}
            placeholder="Search keys or values..."
            class="w-full px-4 py-2 min-h-[44px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
        />
    </div>

    <div class="flex-1 overflow-auto border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900">
        <table class="w-full text-sm text-left border-collapse">
            <thead class="bg-slate-50 dark:bg-slate-800 sticky top-0 z-10 text-xs uppercase text-slate-500 font-bold">
                <tr>
                    <th class="p-3 border-b border-slate-200 dark:border-slate-700 w-1/4">Key</th>
                    {#each $projectStore.languages as lang}
                        <th class="p-3 border-b border-slate-200 dark:border-slate-700 min-w-[200px]">{lang}</th>
                    {/each}
                    <th class="p-3 border-b border-slate-200 dark:border-slate-700 w-10"></th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                {#each filteredData as item (item.key)}
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td class="p-3 font-mono text-xs text-slate-600 dark:text-slate-400 break-all align-top">
                            {item.key}
                        </td>
                        {#each $projectStore.languages as lang}
                            <td class="p-2 align-top">
                                <textarea
                                    class="w-full bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-indigo-500 focus:ring-0 rounded px-2 py-1 text-slate-800 dark:text-slate-200 resize-none overflow-hidden min-h-[44px]"
                                    value={item.values[lang] || ''}
                                    on:input={(e) => updateValue(item.key, lang, e.currentTarget.value)}
                                    rows="1"
                                    placeholder="Missing..."
                                ></textarea>
                            </td>
                        {/each}
                        <td class="p-2 align-top text-center">
                            <button
                                class="text-slate-400 hover:text-red-500 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
                                on:click={() => deleteKey(item.key)}
                                title="Delete Key"
                            >
                                <Trash2 size={16} />
                            </button>
                        </td>
                    </tr>
                {/each}
                {#if filteredData.length === 0}
                    <tr>
                        <td colspan={$projectStore.languages.length + 2} class="p-8 text-center text-slate-400">
                            No keys found. Import files or add keys.
                        </td>
                    </tr>
                {/if}
            </tbody>
        </table>
    </div>
</div>
