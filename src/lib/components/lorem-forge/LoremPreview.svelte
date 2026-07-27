<script lang="ts">
  import { Copy, Check, Download, History, RefreshCcw } from '@lucide/svelte';
  import { fade } from 'svelte/transition';

  export let text: string = "";
  export let dict: any;
  export let onSave: () => void;
  export let onGenerate: () => void;

  let copied = false;
  let saved = false;

  $: byteSize = new TextEncoder().encode(text).length;
  $: wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  $: charCount = text.length;

  function handleCopy() {
    if (!text) return;
    navigator.clipboard.writeText(text);
    copied = true;
    setTimeout(() => copied = false, 2000);
  }

  function handleDownload() {
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lorem-forge-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleSave() {
    if (!text) return;
    onSave();
    saved = true;
    setTimeout(() => saved = false, 2000);
  }
</script>

<div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-full">

  <!-- Header -->
  <div class="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
    <h3 class="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
      {(dict as any)?.preview?.title || 'Preview'}
    </h3>

    <div class="flex items-center gap-2">
      <!-- Stats -->
      <div class="hidden sm:flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 mr-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
        <span title="Bytes">{byteSize.toLocaleString()} B</span>
        <span class="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
        <span title="Words">{wordCount.toLocaleString()} W</span>
        <span class="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
        <span title="Characters">{charCount.toLocaleString()} C</span>
      </div>

      <!-- Actions -->
      <button
        on:click={onGenerate}
        class="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-all shadow-sm"
        title="Regenerate"
      >
        <RefreshCcw class="w-5 h-5" />
      </button>

      <button
        on:click={handleCopy}
        class="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-all shadow-sm relative"
        title="Copy"
      >
        {#if copied}
          <div in:fade={{duration: 150}} class="absolute inset-0 flex items-center justify-center text-emerald-500">
            <Check class="w-5 h-5" />
          </div>
        {:else}
          <div in:fade={{duration: 150}} class="absolute inset-0 flex items-center justify-center">
            <Copy class="w-5 h-5" />
          </div>
        {/if}
      </button>

      <button
        on:click={handleDownload}
        class="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-all shadow-sm"
        title="Download"
      >
        <Download class="w-5 h-5" />
      </button>

      <button
        on:click={handleSave}
        class="hidden sm:flex min-w-[44px] min-h-[44px] items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-all shadow-sm"
      >
        {#if saved}
          <Check class="w-4 h-4 text-emerald-500" />
          <span class="text-emerald-500">{(dict as any)?.preview?.saved || 'Saved!'}</span>
        {:else}
          <History class="w-4 h-4" />
          <span>{(dict as any)?.preview?.saveHistory || 'Save to History'}</span>
        {/if}
      </button>
    </div>
  </div>

  <!-- Content Area -->
  <div class="flex-1 relative bg-slate-50/30 dark:bg-slate-900/30 min-h-[300px]">
    {#if text}
      <textarea
        readonly
        class="absolute inset-0 w-full h-full p-6 bg-transparent resize-none outline-none font-mono text-sm leading-relaxed text-slate-800 dark:text-slate-300"
      >{text}</textarea>
    {:else}
      <div class="absolute inset-0 flex items-center justify-center text-slate-400 dark:text-slate-500 italic text-sm">
        Generated text will appear here...
      </div>
    {/if}
  </div>

</div>
