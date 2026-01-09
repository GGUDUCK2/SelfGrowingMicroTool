<script lang="ts">
  import { fade } from 'svelte/transition';
  import Prism from 'prismjs';
  import 'prismjs/components/prism-json';
  import 'prismjs/components/prism-sql';
  import 'prismjs/components/prism-csv';
  import { afterUpdate } from 'svelte';
  import { getDictionary } from '$lib/dictionaries';
  import { page } from '$app/stores';
  import { formatOutput } from '$lib/utils/id-forge/id-forge';

  export let output: string;
  export let format: string;
  export let ids: string[] = [];

  $: dict = getDictionary($page.params.lang ?? 'en').tools.idForge;

  let copied = false;
  let codeElement: HTMLElement;

  afterUpdate(() => {
    if (codeElement) {
       if (output.length < 50000) {
           Prism.highlightElement(codeElement);
       }
    }
  });

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text);
    copied = true;
    setTimeout(() => copied = false, 2000);
  }

  function download(fmtOverride?: any) {
    const text = fmtOverride ? formatOutput(ids, fmtOverride) : output;
    const ext = fmtOverride ? (fmtOverride === 'json' ? 'json' : fmtOverride === 'sql' ? 'sql' : 'csv') : (format === 'json' ? 'json' : format === 'sql' ? 'sql' : 'txt');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ids-${new Date().toISOString()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function share() {
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'ID Forge Output',
                text: output.slice(0, 1000)
            });
        } catch (err) {
            copyText(output);
        }
    } else {
        copyText(output);
    }
  }
</script>

{#if output}
  <div transition:fade class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-[500px]">
    <div class="px-4 py-3 border-b border-slate-100 dark:border-slate-700/50 flex flex-col md:flex-row items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur gap-2">
      <div class="flex items-center space-x-2">
        <div class="flex space-x-1">
            <div class="w-3 h-3 rounded-full bg-red-400"></div>
            <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div class="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
        <span class="text-xs font-mono text-slate-500 ml-2">Output Preview ({ids.length})</span>
      </div>
      <div class="flex flex-wrap items-center gap-2 justify-center">
        <!-- Bulk Export Options -->
        {#if ids.length > 0}
        <div class="flex items-center bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-0.5">
            <button
                on:click={() => copyText(formatOutput(ids, 'json'))}
                class="px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                title="Copy as JSON"
            >JSON</button>
            <div class="w-px h-3 bg-slate-200 dark:bg-slate-700 mx-0.5"></div>
            <button
                on:click={() => copyText(formatOutput(ids, 'sql'))}
                class="px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                title="Copy as SQL"
            >SQL</button>
             <div class="w-px h-3 bg-slate-200 dark:bg-slate-700 mx-0.5"></div>
            <button
                on:click={() => copyText(formatOutput(ids, 'csv'))}
                class="px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                title="Copy as CSV"
            >CSV</button>
        </div>
        {/if}

        <div class="h-4 w-px bg-slate-300 dark:bg-slate-600 mx-1 hidden md:block"></div>

        <button
          on:click={() => copyText(output)}
          class="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors relative group"
          aria-label={dict.buttons.copy}
          title={dict.buttons.copy}
        >
          {#if copied}
            <span class="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded shadow animate-bounce z-10 whitespace-nowrap">Copied!</span>
          {/if}
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
        </button>
        <button
          on:click={() => download()}
          class="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
          aria-label={dict.buttons.download}
          title={dict.buttons.download}
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
        </button>
        <button
            on:click={share}
            class="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
            aria-label={dict.buttons.share}
            title={dict.buttons.share}
        >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
        </button>
      </div>
    </div>

    <div class="relative flex-1 overflow-auto bg-slate-50 dark:bg-[#1e1e1e]">
        <pre class="m-0 p-4 text-sm font-mono leading-relaxed min-h-full"><code bind:this={codeElement} class="language-{format === 'sql' ? 'sql' : format === 'json' ? 'json' : 'text'}">{output}</code></pre>
    </div>
  </div>
{/if}
