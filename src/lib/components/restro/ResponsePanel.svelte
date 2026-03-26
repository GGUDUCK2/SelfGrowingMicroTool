<script lang="ts">
  import { onMount } from 'svelte';
  import Prism from 'prismjs';
  import 'prismjs/components/prism-json';
  import { Check, Copy } from 'lucide-svelte';
  import type { RestroDictionary } from '$lib/types/restro';

  export let response: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;
    time: number;
    size: number;
    ok: boolean;
  } | null = null;
  export let dict: RestroDictionary;

  let activeTab = 'body';
  let copied = false;

  // Re-highlight when response changes
  $: if (response && activeTab === 'body') {
    setTimeout(() => {
        try {
            if (typeof window !== 'undefined') {
                Prism.highlightAll();
            }
        } catch (e) {
            console.error('Prism error:', e);
        }
    }, 0);
  }

  function getStatusColor(status: number) {
    if (status >= 200 && status < 300) return 'text-green-500 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900';
    if (status >= 300 && status < 400) return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-900';
    if (status >= 400 && status < 500) return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-900';
    return 'text-red-500 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900';
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  function copyBody() {
    if (!response) return;
    navigator.clipboard.writeText(response.body);
    copied = true;
    setTimeout(() => copied = false, 2000);
  }
</script>

<div class="flex flex-col h-full bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
  {#if !response}
    <div class="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 p-8">
      <div class="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
        <svg class="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <p class="text-sm font-medium">Send a request to see the response here</p>
    </div>
  {:else}
    <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-4 py-2 bg-slate-50/50 dark:bg-slate-900/50">
      <div class="flex items-center gap-4">
        <div class="px-2 py-0.5 rounded text-xs font-bold border {getStatusColor(response.status)}">
          {response.status} {response.statusText}
        </div>
        <div class="text-xs text-slate-500 dark:text-slate-400">
          <span class="font-semibold text-slate-700 dark:text-slate-300">{response.time}</span> ms
        </div>
        <div class="text-xs text-slate-500 dark:text-slate-400">
          <span class="font-semibold text-slate-700 dark:text-slate-300">{formatSize(response.size)}</span>
        </div>
      </div>
    </div>

  <div class="flex border-b border-slate-200 dark:border-slate-700 shrink-0 overflow-x-auto">
      <button
      class="px-4 py-2 text-sm font-medium border-b-2 transition-colors min-h-[44px] shrink-0 {activeTab === 'body' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
        on:click={() => activeTab = 'body'}
      >
        {dict.body}
      </button>
      <button
      class="px-4 py-2 text-sm font-medium border-b-2 transition-colors min-h-[44px] shrink-0 {activeTab === 'headers' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
        on:click={() => activeTab = 'headers'}
      >
        {dict.headers}
      </button>
    </div>

    <div class="flex-1 overflow-hidden relative">
      {#if activeTab === 'body'}
        <div class="absolute top-2 right-2 z-10">
           <button
             on:click={copyBody}
             class="p-1.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors border border-slate-200 dark:border-slate-600"
             aria-label="Copy Response"
           >
             {#if copied}
               <Check class="w-4 h-4 text-green-500" />
             {:else}
               <Copy class="w-4 h-4" />
             {/if}
           </button>
        </div>
        <div class="h-full overflow-auto p-4 custom-scrollbar">
           <pre class="text-sm font-mono"><code class="language-json">{response.body}</code></pre>
        </div>
      {:else}
        <div class="h-full overflow-auto p-4 space-y-2">
           {#each Object.entries(response.headers) as [key, value]}
             <div class="flex flex-col sm:flex-row sm:gap-4 border-b border-slate-100 dark:border-slate-700/50 pb-2 last:border-0">
               <span class="text-xs font-semibold text-slate-600 dark:text-slate-400 min-w-[150px] break-words">{key}</span>
               <span class="text-xs font-mono text-slate-800 dark:text-slate-200 break-all">{value}</span>
             </div>
           {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    @apply bg-slate-300 dark:bg-slate-600 rounded;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    @apply bg-slate-400 dark:bg-slate-500;
  }
</style>
