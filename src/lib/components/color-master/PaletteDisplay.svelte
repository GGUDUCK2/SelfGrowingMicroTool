<script lang="ts">
  import type { ColorData } from '$lib/types/color-master';
  import type { ColorMasterDictionary } from '$lib/types/color-master';

  export let colors: ColorData[] = [];
  export let title = 'Harmony';
  export let t: ColorMasterDictionary;

  let copiedIndex: number | null = null;

  function copyToClipboard(text: string, index: number) {
    navigator.clipboard.writeText(text);
    copiedIndex = index;
    setTimeout(() => copiedIndex = null, 1500);
  }
</script>

<div class="space-y-3">
  <h3 class="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</h3>
  <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
    {#each colors as color, i}
      <button
        class="group relative h-24 rounded-xl shadow-sm border border-black/5 dark:border-white/5 overflow-hidden transition-transform hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        style="background-color: {color.hex}"
        on:click={() => copyToClipboard(color.hex, i)}
        aria-label="Copy {color.hex}"
      >
        <div class="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[2px]">
          <span class="text-white font-mono font-bold text-sm drop-shadow-md">
            {copiedIndex === i ? t.copied.toUpperCase() : color.hex}
          </span>
          {#if copiedIndex !== i}
             <span class="text-white/80 text-xs mt-1">{color.name}</span>
          {/if}
        </div>
      </button>
    {/each}
  </div>
</div>
