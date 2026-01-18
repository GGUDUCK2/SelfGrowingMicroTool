<script lang="ts">
  import { X, Copy, Check } from 'lucide-svelte';
  import { generateCurl, generatePython, generateNode, generateLangChain } from '$lib/utils/prompt-forge/generators';
  import type { PromptExport } from '$lib/utils/prompt-forge/parser';
  import { fade, scale } from 'svelte/transition';

  export let data: PromptExport;
  export let onClose: () => void;

  let activeTab: 'curl' | 'python' | 'node' | 'langchain' = 'curl';
  let copied = false;

  $: code = getCode(activeTab, data);

  function getCode(tab: string, d: PromptExport) {
      switch(tab) {
          case 'curl': return generateCurl(d);
          case 'python': return generatePython(d);
          case 'node': return generateNode(d);
          case 'langchain': return generateLangChain(d);
          default: return '';
      }
  }

  function copyCode() {
      navigator.clipboard.writeText(code);
      copied = true;
      setTimeout(() => copied = false, 2000);
  }
</script>

<div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" transition:fade>
    <div class="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" transition:scale={{ start: 0.95 }}>
        <div class="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 class="font-bold text-lg text-slate-800 dark:text-white">Export Code</h3>
            <button on:click={onClose} class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                <X class="w-5 h-5 text-slate-500" />
            </button>
        </div>

        <div class="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
            {#each ['curl', 'python', 'node', 'langchain'] as tab}
                <button
                    class="px-4 py-3 text-sm font-medium border-b-2 transition-colors capitalize whitespace-nowrap {activeTab === tab ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}"
                    on:click={() => activeTab = tab as any}
                >
                    {tab === 'node' ? 'Node.js' : tab}
                </button>
            {/each}
        </div>

        <div class="relative flex-1 bg-slate-900 overflow-auto group min-h-[300px]">
            <button
                class="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                on:click={copyCode}
                title="Copy Code"
            >
                {#if copied}
                    <Check class="w-4 h-4 text-green-400" />
                {:else}
                    <Copy class="w-4 h-4" />
                {/if}
            </button>
            <pre class="p-6 text-sm font-mono text-slate-300 leading-relaxed tab-4 whitespace-pre-wrap break-all">{code}</pre>
        </div>
    </div>
</div>

<style>
    .tab-4 { tab-size: 4; }
</style>
