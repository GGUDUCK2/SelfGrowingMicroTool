<script lang="ts">
  import { fade } from 'svelte/transition';
  import Prism from 'prismjs';
  import 'prismjs/components/prism-json';
  import 'prismjs/components/prism-sql';
  import { afterUpdate } from 'svelte';

  export let output: string;
  export let format: string;

  let copied = false;
  let codeElement: HTMLElement;

  afterUpdate(() => {
    if (codeElement) {
       // Simple highlight if small enough, else might lag with 10000 lines.
       // We'll trust Prism for now but maybe limit it if huge.
       if (output.length < 50000) {
           Prism.highlightElement(codeElement);
       }
    }
  });

  async function copy() {
    await navigator.clipboard.writeText(output);
    copied = true;
    setTimeout(() => copied = false, 2000);
  }

  function download() {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ids-${new Date().toISOString()}.${format === 'json' ? 'json' : format === 'sql' ? 'sql' : 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

{#if output}
  <div transition:fade class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-[500px]">
    <div class="px-4 py-3 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur">
      <div class="flex items-center space-x-2">
        <div class="flex space-x-1">
            <div class="w-3 h-3 rounded-full bg-red-400"></div>
            <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div class="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
        <span class="text-xs font-mono text-slate-500 ml-2">Output Preview</span>
      </div>
      <div class="flex items-center space-x-2">
        <button
          on:click={copy}
          class="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors relative"
          aria-label="Copy to clipboard"
        >
          {#if copied}
            <span class="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded shadow animate-bounce">Copied!</span>
          {/if}
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
        </button>
        <button
          on:click={download}
          class="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
          aria-label="Download"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
        </button>
      </div>
    </div>

    <div class="relative flex-1 overflow-auto bg-slate-50 dark:bg-[#1e1e1e]">
        <pre class="m-0 p-4 text-sm font-mono leading-relaxed min-h-full"><code bind:this={codeElement} class="language-{format === 'sql' ? 'sql' : format === 'json' ? 'json' : 'text'}">{output}</code></pre>
    </div>
  </div>
{/if}
