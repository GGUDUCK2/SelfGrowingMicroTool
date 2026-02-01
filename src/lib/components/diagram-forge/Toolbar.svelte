<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import {
    Download,
    Share2,
    ZoomIn,
    ZoomOut,
    Save,
    LayoutTemplate,
    Palette
  } from 'lucide-svelte';
  import { templates } from '$lib/utils/diagram-forge/templates';

  export let theme: string = 'default';
  export let dict: any;

  const dispatch = createEventDispatcher();

  const themes = ['default', 'forest', 'dark', 'neutral'];
</script>

<div class="h-14 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center px-4 justify-between gap-4 z-20 relative">
    <!-- Left: Templates & Theme -->
    <div class="flex items-center gap-2">
        <div class="relative group">
            <button class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                <LayoutTemplate size={16} />
                <span class="hidden sm:inline">{dict.templates}</span>
            </button>
            <!-- Dropdown -->
            <div class="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 hidden group-hover:block z-50">
                {#each templates as t}
                    <button
                        class="w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors text-slate-700 dark:text-slate-300"
                        on:click={() => dispatch('loadTemplate', t)}
                    >
                        {t.label}
                    </button>
                {/each}
            </div>
        </div>

        <div class="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

        <div class="flex items-center gap-2">
            <Palette size={16} class="text-slate-400" />
            <select
                bind:value={theme}
                on:change={() => dispatch('themeChange', theme)}
                class="bg-transparent text-sm font-medium text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
                {#each themes as t}
                    <option value={t}>{dict.theme?.[t] || t}</option>
                {/each}
            </select>
        </div>
    </div>

    <!-- Right: Actions -->
    <div class="flex items-center gap-1">
        <button
            on:click={() => dispatch('zoomOut')}
            class="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title={dict.actions.zoomOut}
        >
            <ZoomOut size={18} />
        </button>
        <button
            on:click={() => dispatch('zoomIn')}
            class="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title={dict.actions.zoomIn}
        >
            <ZoomIn size={18} />
        </button>

        <div class="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

        <button
            on:click={() => dispatch('save')}
            class="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title={dict.actions.save}
        >
            <Save size={18} />
        </button>

        <button
            on:click={() => dispatch('copyLink')}
            class="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title={dict.actions.copyLink}
        >
            <Share2 size={18} />
        </button>

        <div class="relative group">
             <button class="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors ml-2">
                <Download size={16} />
                <span class="hidden sm:inline">Export</span>
            </button>
            <div class="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 hidden group-hover:block z-50">
                <button
                    class="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300"
                    on:click={() => dispatch('export', 'svg')}
                >
                    {dict.actions.exportSvg}
                </button>
                <button
                    class="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300"
                    on:click={() => dispatch('export', 'png')}
                >
                    {dict.actions.exportPng}
                </button>
            </div>
        </div>
    </div>
</div>
