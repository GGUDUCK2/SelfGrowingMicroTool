<script lang="ts">
  import { gridStore } from '$lib/utils/grid-master/store';
  import { generateCSS, generateTailwind } from '$lib/utils/grid-master/codegen';
  import { Copy, Check, Code, FileCode } from 'lucide-svelte';
  import { fade } from 'svelte/transition';

  export let dict: any;

  let activeTab: 'tailwind' | 'css' = 'tailwind';
  let copied = false;

  $: code = activeTab === 'tailwind'
      ? generateTailwind($gridStore)
      : generateCSS($gridStore);

  function copyCode() {
      navigator.clipboard.writeText(code);
      copied = true;
      setTimeout(() => copied = false, 2000);
  }
</script>

<div class="bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-slate-800 flex flex-col h-full">
  <div class="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
      <div class="flex gap-2">
          <button
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 {activeTab === 'tailwind' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}"
            on:click={() => activeTab = 'tailwind'}
          >
             <Code size={14} />
             {dict.tailwind}
          </button>
          <button
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 {activeTab === 'css' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}"
            on:click={() => activeTab = 'css'}
          >
             <FileCode size={14} />
             {dict.css}
          </button>
      </div>

      <button
        class="text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors {copied ? 'bg-green-500/20 text-green-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}"
        on:click={copyCode}
      >
         {#if copied}
             <Check size={14} />
             {dict.copied}
         {:else}
             <Copy size={14} />
             {dict.copy}
         {/if}
      </button>
  </div>

  <div class="flex-1 overflow-auto p-4 relative group custom-scrollbar">
      <pre class="font-mono text-sm text-blue-300 whitespace-pre-wrap break-all">{code}</pre>
  </div>
</div>

<style>
  /* Custom scrollbar for code panel */
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #334155;
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #475569;
  }
</style>
