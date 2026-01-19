<script lang="ts">
  import { X, BookTemplate, Code, PenTool, TrendingUp, Search, Smile } from 'lucide-svelte';
  import { TEMPLATES, type PromptTemplate } from '$lib/utils/prompt-forge/templates';
  import { fade, scale } from 'svelte/transition';

  export let onSelect: (t: PromptTemplate) => void;
  export let onClose: () => void;

  let selectedCategory = 'all';

  const categories = [
      { id: 'all', label: 'All', icon: Search },
      { id: 'coding', label: 'Coding', icon: Code },
      { id: 'writing', label: 'Writing', icon: PenTool },
      { id: 'marketing', label: 'Marketing', icon: TrendingUp },
      { id: 'analysis', label: 'Analysis', icon: Search },
      { id: 'fun', label: 'Fun', icon: Smile }
  ];

  $: filtered = selectedCategory === 'all'
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category === selectedCategory);
</script>

<div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true" transition:fade>
    <div class="bg-white dark:bg-slate-800 w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col h-[80vh]" transition:scale={{ start: 0.95 }}>

        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 class="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                <BookTemplate class="w-5 h-5 text-indigo-500" />
                Template Library
            </h3>
            <button on:click={onClose} class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors" aria-label="Close">
                <X class="w-5 h-5 text-slate-500" />
            </button>
        </div>

        <!-- Body -->
        <div class="flex flex-1 overflow-hidden">
            <!-- Sidebar -->
            <div class="w-48 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 p-2 space-y-1">
                {#each categories as cat}
                    <button
                        class="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors {selectedCategory === cat.id ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}"
                        on:click={() => selectedCategory = cat.id}
                    >
                        <svelte:component this={cat.icon} class="w-4 h-4" />
                        {cat.label}
                    </button>
                {/each}
            </div>

            <!-- List -->
            <div class="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-800/50">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {#each filtered as template (template.id)}
                        <button
                            class="text-left group flex flex-col p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all h-full"
                            on:click={() => onSelect(template)}
                        >
                            <div class="flex justify-between items-start mb-2">
                                <h4 class="font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {template.title}
                                </h4>
                                <span class="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                                    {template.category}
                                </span>
                            </div>
                            <p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                                {template.description}
                            </p>
                            <div class="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/50 w-full">
                                <code class="text-xs text-slate-400 font-mono block truncate opacity-75">
                                    {template.user.slice(0, 40)}...
                                </code>
                            </div>
                        </button>
                    {/each}

                    {#if filtered.length === 0}
                        <div class="col-span-full text-center py-10 text-slate-400">
                            No templates found in this category.
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>
</div>
