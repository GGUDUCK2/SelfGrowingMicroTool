<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Copy, Download, Trash2, Wand2, Camera, Wrench, Circle, ArrowRightLeft } from 'lucide-svelte';

  export let dict: Record<string, string> = {};
  const dispatch = createEventDispatcher();
</script>

<div class="flex flex-wrap items-center gap-2">
  <button
    class="flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-sm font-medium"
    on:click={() => dispatch('copy')}
    title={dict?.copy || 'Copy'}
    aria-label={dict?.copy || 'Copy'}
  >
    <Copy class="w-4 h-4" />
    <span class="hidden sm:inline">{dict?.copy || 'Copy'}</span>
  </button>

  <button
    class="flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-sm font-medium"
    on:click={() => dispatch('download')}
    title={dict?.download || 'Download'}
    aria-label={dict?.download || 'Download'}
  >
    <Download class="w-4 h-4" />
    <span class="hidden sm:inline">{dict?.download || 'Download'}</span>
  </button>

  <div class="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>

  <button
    class="flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-sm font-medium"
    on:click={() => dispatch('simplify')}
    title={dict?.simplify || 'Simplify'}
    aria-label={dict?.simplify || 'Simplify'}
  >
    <Wand2 class="w-4 h-4" />
    <span class="hidden sm:inline">{dict?.simplify || 'Simplify'}</span>
  </button>

  <button
    class="flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-sm font-medium"
    on:click={() => dispatch('buffer')}
    title={dict?.buffer || 'Buffer'}
    aria-label={dict?.buffer || 'Buffer'}
  >
    <Circle class="w-4 h-4" />
    <span class="hidden sm:inline">{dict?.buffer || 'Buffer'}</span>
  </button>

  <button
    class="flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-sm font-medium"
    on:click={() => dispatch('reverse')}
    title={dict?.reverse || 'Reverse'}
    aria-label={dict?.reverse || 'Reverse'}
  >
    <ArrowRightLeft class="w-4 h-4" />
    <span class="hidden sm:inline">{dict?.reverse || 'Reverse'}</span>
  </button>

  <button
    class="flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-sm font-medium"
    on:click={() => dispatch('repair')}
    title={dict?.repair || 'Repair WKT'}
    aria-label={dict?.repair || 'Repair WKT'}
  >
    <Wrench class="w-4 h-4" />
    <span class="hidden sm:inline">{dict?.repair || 'Repair'}</span>
  </button>

  <button
    class="flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-sm font-medium"
    on:click={() => dispatch('snapshot')}
    title={dict?.snapshot || 'Snapshot'}
    aria-label={dict?.snapshot || 'Snapshot'}
  >
    <Camera class="w-4 h-4" />
    <span class="hidden sm:inline">{dict?.snapshot || 'Snap'}</span>
  </button>

  <div class="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>

  <button
    class="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium"
    on:click={() => dispatch('clear')}
    title={dict?.clear || 'Clear'}
    aria-label={dict?.clear || 'Clear'}
  >
    <Trash2 class="w-4 h-4" />
    <span class="hidden sm:inline">{dict?.clear || 'Clear'}</span>
  </button>
</div>
