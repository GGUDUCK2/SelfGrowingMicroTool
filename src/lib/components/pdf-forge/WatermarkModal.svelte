<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  import { watermark } from '$lib/utils/pdf-forge/store';
  import { X } from 'lucide-svelte';
  import type { PdfForgeDictionary } from '$lib/types/pdf-forge';

  export let isOpen = false;
  export let dict: PdfForgeDictionary;

  const dispatch = createEventDispatcher();

  let text = $watermark;

  $: if (isOpen) text = $watermark;

  function save() {
    watermark.set(text);
    dispatch('close');
  }

  function clear() {
      text = '';
      watermark.set('');
      dispatch('close');
  }
</script>

{#if isOpen}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" transition:fade on:click={() => dispatch('close')}>
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 relative" transition:scale on:click|stopPropagation>
      <button style="min-height: 44px; min-width: 44px;" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" on:click={() => dispatch('close')}>
        <X class="w-5 h-5" />
      </button>

      <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-4">
        {dict.actions?.watermark || "Watermark"}
      </h3>

      <div class="space-y-4">
        <div>
            <label for="wm-text" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {dict.watermark?.prompt || "Enter watermark text:"}
            </label>
            <input
                id="wm-text"
                type="text"
                bind:value={text}
                placeholder="e.g. CONFIDENTIAL"
                class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                on:keydown={(e) => e.key === 'Enter' && save()}
            />
        </div>

        <div class="flex gap-2 justify-end pt-2">
            <button style="min-height: 44px; min-width: 44px;" class="px-4 py-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium" on:click={clear}>
                {dict.actions?.clear || "Clear"}
            </button>
            <button style="min-height: 44px; min-width: 44px;" class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-indigo-500/20" on:click={save}>
                {dict.actions?.save || "Save"}
            </button>
        </div>
      </div>
    </div>
  </div>
{/if}
