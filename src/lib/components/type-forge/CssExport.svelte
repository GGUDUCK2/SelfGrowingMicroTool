<script lang="ts">
  import type { LoadedFont, VariableAxis } from '$lib/utils/type-forge/types';
  import { Copy, Check } from '@lucide/svelte';

  export let font: LoadedFont;
  export let axes: VariableAxis[];
  export let dict: any;

  let copied = false;

  $: cssCode = `@font-face {
  font-family: '${font.meta.family}';
  src: url('${font.fileName}');
}

.custom-font {
  font-family: '${font.meta.family}', sans-serif;
  font-variation-settings: ${axes.length > 0 ? axes.map(a => `"${a.tag}" ${a.current}`).join(', ') : '"wght" 400'};
}`;

  function copyCode() {
      navigator.clipboard.writeText(cssCode);
      copied = true;
      setTimeout(() => copied = false, 2000);
  }
</script>

<div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
  <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
      <h3 class="font-bold text-slate-800 dark:text-white text-sm">{dict.css.title}</h3>
      <button
          on:click={copyCode}
          class="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded hover:bg-white dark:hover:bg-slate-700 transition-colors {copied ? 'text-green-600' : 'text-indigo-600'}"
      >
          {#if copied}
              <Check size={14} /> {dict.css.copied}
          {:else}
              <Copy size={14} /> {dict.css.copy}
          {/if}
      </button>
  </div>
  <div class="p-4 bg-slate-900 overflow-x-auto relative group">
      <pre class="text-xs font-mono text-slate-300 whitespace-pre-wrap">{cssCode}</pre>
  </div>
</div>
