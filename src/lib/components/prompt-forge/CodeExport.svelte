<script lang="ts">
  import { X, Copy, Check } from 'lucide-svelte';
  import { generateCurl, generatePython, generateNode, generateLangChain, generateTestSuiteJson, generateTestSuitePython } from '$lib/utils/prompt-forge/generators';
  import type { PromptExport, TestSuiteExport } from '$lib/utils/prompt-forge/parser';
  import { scale } from 'svelte/transition';

  export let data: PromptExport;
  export let testSuite: TestSuiteExport;
  export let onClose: () => void;

  type Tab = 'curl' | 'python' | 'node' | 'langchain' | 'suite-json' | 'suite-python';
  const tabs: Tab[] = ['curl', 'python', 'node', 'langchain', 'suite-json', 'suite-python'];

  let activeTab: Tab = 'curl';
  let copied = false;

  $: code = getCode(activeTab, data, testSuite);

  function getCode(tab: Tab, d: PromptExport, ts: TestSuiteExport) {
      switch(tab) {
          case 'curl': return generateCurl(d);
          case 'python': return generatePython(d);
          case 'node': return generateNode(d);
          case 'langchain': return generateLangChain(d);
          case 'suite-json': return generateTestSuiteJson(ts);
          case 'suite-python': return generateTestSuitePython(ts);
          default: return '';
      }
  }

  function getLabel(tab: Tab) {
      if (tab === 'node') return 'Node.js';
      if (tab === 'suite-json') return 'Test Suite (JSON)';
      if (tab === 'suite-python') return 'Test Suite (Py)';
      return tab;
  }

  function copyCode() {
      navigator.clipboard.writeText(code);
      copied = true;
      setTimeout(() => copied = false, 2000);
  }
</script>

<div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true">
    <div class="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" transition:scale={{ start: 0.95 }}>
        <div class="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 class="font-bold text-lg text-slate-800 dark:text-white">Export Code</h3>
            <button on:click={onClose} class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors" aria-label="Close">
                <X class="w-5 h-5 text-slate-500" />
            </button>
        </div>

        <div class="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
            {#each tabs as tab (tab)}
                <button
                    class="px-4 py-3 text-sm font-medium border-b-2 transition-colors capitalize whitespace-nowrap {activeTab === tab ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}"
                    on:click={() => activeTab = tab}
                >
                    {getLabel(tab)}
                </button>
            {/each}
        </div>

        <div class="relative flex-1 bg-slate-900 overflow-auto group min-h-[300px]">
            <button
                class="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                on:click={copyCode}
                title="Copy Code"
                aria-label="Copy Code"
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
