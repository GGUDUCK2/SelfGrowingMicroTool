<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { TEMPLATES } from '$lib/utils/git-forge/templates';
  import type { GitignoreTemplate } from '$lib/utils/git-forge/types';
  import { Download, Copy, Search, X, Check, Save } from 'lucide-svelte';

  export let dictionary: any;

  const dispatch = createEventDispatcher();

  let searchTerm = '';
  let selectedIds: string[] = [];

  $: filteredTemplates = TEMPLATES.filter(t =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.tags.some(tag => tag.includes(searchTerm.toLowerCase()))
  );

  $: selectedTemplates = selectedIds.map(id => TEMPLATES.find(t => t.id === id)).filter(Boolean) as GitignoreTemplate[];

  $: content = selectedTemplates.map(t => t.content).join('\n');

  function toggle(id: string) {
      if (selectedIds.includes(id)) {
          selectedIds = selectedIds.filter(i => i !== id);
      } else {
          selectedIds = [...selectedIds, id];
      }
  }

  function copy() {
      navigator.clipboard.writeText(content);
      dispatch('copy');
  }

  function download() {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '.gitignore';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      dispatch('download');
  }

  function save() {
      if (!content) return;
      dispatch('save', {
          type: 'ignore',
          content,
          details: selectedTemplates.map(t => t.name).join(', ')
      });
  }
</script>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
    <!-- Selection Area -->
    <div class="flex flex-col h-full space-y-4">
        <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
                type="text"
                bind:value={searchTerm}
                placeholder={dictionary.ignore.search}
                class="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
            />
        </div>

        <!-- Selected Tags -->
        {#if selectedIds.length > 0}
            <div class="flex flex-wrap gap-2">
                {#each selectedTemplates as tmpl (tmpl.id)}
                    <button
                        on:click={() => toggle(tmpl.id)}
                        class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/30 transition-colors"
                    >
                        {tmpl.name}
                        <X size={12} />
                    </button>
                {/each}
            </div>
        {/if}

        <div class="flex-1 overflow-y-auto pr-2 space-y-2">
            {#each filteredTemplates as tmpl (tmpl.id)}
                <button
                    on:click={() => toggle(tmpl.id)}
                    class="w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between group {selectedIds.includes(tmpl.id) ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300 dark:hover:border-slate-600'}"
                >
                    <div>
                        <div class="font-medium text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{tmpl.name}</div>
                        <div class="flex gap-1 mt-1">
                            {#each tmpl.tags as tag}
                                <span class="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{tag}</span>
                            {/each}
                        </div>
                    </div>
                    {#if selectedIds.includes(tmpl.id)}
                        <div class="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                            <Check size={12} />
                        </div>
                    {/if}
                </button>
            {/each}
        </div>
    </div>

    <!-- Preview Area -->
    <div class="flex flex-col h-full bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-800">
        <div class="bg-slate-800 p-3 flex items-center justify-between border-b border-slate-700">
            <span class="text-xs font-mono text-slate-400">.gitignore</span>
            <div class="flex gap-2">
                <button on:click={save} class="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white" title="Save">
                    <Save size={16} />
                </button>
                <button on:click={copy} class="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white" title={dictionary.ignore.copy}>
                    <Copy size={16} />
                </button>
                <button on:click={download} class="p-1.5 bg-indigo-600 hover:bg-indigo-500 rounded text-white transition-colors" title={dictionary.ignore.download}>
                    <Download size={16} />
                </button>
            </div>
        </div>
        <div class="flex-1 p-4 overflow-y-auto">
            {#if content}
                <pre class="font-mono text-xs text-slate-300 whitespace-pre-wrap">{content}</pre>
            {:else}
                <div class="h-full flex items-center justify-center text-slate-600 text-sm">
                    {dictionary.ignore.selected}
                </div>
            {/if}
        </div>
    </div>
</div>
