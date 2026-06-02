<script lang="ts">
  import { X, Command, Save, Eye, Undo2, Redo2 } from '@lucide/svelte';
  import { fade, scale } from 'svelte/transition';
  import type { GridMasterDictionary } from '$lib/utils/grid-master/types';

  export let close: () => void;
  export let dict: GridMasterDictionary;

  const shortcuts = [
      { key: 'Ctrl + Z', desc: dict.undo || 'Undo', icon: Undo2 },
      { key: 'Ctrl + Y', desc: dict.redo || 'Redo', icon: Redo2 },
      { key: 'Ctrl + S', desc: dict.save || 'Save', icon: Save },
      { key: 'Ctrl + P', desc: dict.preview || 'Preview', icon: Eye },
      { key: 'Shift + ?', desc: dict.shortcuts || 'Shortcuts', icon: Command },
  ];
</script>

<div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" transition:fade on:click|self={close} role="presentation">
  <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 p-6 relative" transition:scale>
      <button class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" on:click={close} aria-label="Close">
          <X size={20} />
      </button>

      <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
          <Command class="text-indigo-500" />
          {dict.shortcuts || 'Keyboard Shortcuts'}
      </h2>

      <div class="space-y-3">
          {#each shortcuts as s (s.key)}
              <div class="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div class="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                      <svelte:component this={s.icon} size={16} />
                      <span>{s.desc}</span>
                  </div>
                  <kbd class="px-2 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-xs font-mono font-bold text-slate-500 dark:text-slate-400 min-w-[3rem] text-center shadow-sm">
                      {s.key}
                  </kbd>
              </div>
          {/each}
      </div>
  </div>
</div>
