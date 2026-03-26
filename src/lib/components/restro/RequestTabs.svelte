<script lang="ts">
  import { Plus, Trash2 } from 'lucide-svelte';
  import type { RestroDictionary } from '$lib/types/restro';

  export let params: { key: string; value: string; enabled: boolean }[];
  export let headers: { key: string; value: string; enabled: boolean }[];
  export let bodyType: 'none' | 'json' | 'text';
  export let bodyContent: string;
  export let dict: RestroDictionary;

  let activeTab = 'params'; // params, headers, body

  function addParam() {
    params = [...params, { key: '', value: '', enabled: true }];
  }

  function removeParam(index: number) {
    params = params.filter((_, i) => i !== index);
  }

  function addHeader() {
    headers = [...headers, { key: '', value: '', enabled: true }];
  }

  function removeHeader(index: number) {
    headers = headers.filter((_, i) => i !== index);
  }
</script>

<div class="flex flex-col h-full bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
  <div class="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
    <button
      class="px-4 py-2 text-sm font-medium border-b-2 transition-colors min-h-[44px] shrink-0 {activeTab === 'params' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
      on:click={() => activeTab = 'params'}
    >
      {dict.params}
      {#if params.length > 0}
        <span class="ml-1 text-xs bg-slate-200 dark:bg-slate-600 px-1.5 rounded-full text-slate-600 dark:text-slate-300">{params.length}</span>
      {/if}
    </button>
    <button
      class="px-4 py-2 text-sm font-medium border-b-2 transition-colors min-h-[44px] shrink-0 {activeTab === 'headers' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
      on:click={() => activeTab = 'headers'}
    >
      {dict.headers}
      {#if headers.length > 0}
        <span class="ml-1 text-xs bg-slate-200 dark:bg-slate-600 px-1.5 rounded-full text-slate-600 dark:text-slate-300">{headers.length}</span>
      {/if}
    </button>
    <button
      class="px-4 py-2 text-sm font-medium border-b-2 transition-colors min-h-[44px] shrink-0 {activeTab === 'body' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
      on:click={() => activeTab = 'body'}
    >
      {dict.body}
      {#if bodyType !== 'none'}
        <span class="ml-1 text-xs bg-indigo-100 dark:bg-indigo-900/50 px-1.5 rounded-full text-indigo-600 dark:text-indigo-300">•</span>
      {/if}
    </button>
  </div>

  <div class="flex-1 overflow-y-auto p-4">
    {#if activeTab === 'params'}
      <div class="space-y-2">
        <div class="text-xs text-slate-500 font-medium mb-2 uppercase tracking-wider">{dict.params}</div>
        {#each params as param, i}
          <div class="flex gap-2 items-center group">
            <label class="flex items-center justify-center min-w-[44px] min-h-[44px] cursor-pointer">
              <input type="checkbox" bind:checked={param.enabled} class="rounded text-indigo-600 focus:ring-indigo-500 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 w-4 h-4" />
            </label>
            <input
              type="text"
              bind:value={param.key}
              placeholder="Key"
              class="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-sm font-mono text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none min-h-[44px]"
            />
            <input
              type="text"
              bind:value={param.value}
              placeholder="Value"
              class="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-sm font-mono text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none min-h-[44px]"
            />
            <button
              on:click={() => removeParam(i)}
              class="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Remove parameter"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        {/each}
        <button
          on:click={addParam}
          class="flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline mt-2 min-h-[44px] px-2"
        >
          <Plus class="w-3 h-3" /> Add Parameter
        </button>
      </div>

    {:else if activeTab === 'headers'}
      <div class="space-y-2">
        <div class="text-xs text-slate-500 font-medium mb-2 uppercase tracking-wider">{dict.headers}</div>
        {#each headers as header, i}
          <div class="flex gap-2 items-center group">
            <label class="flex items-center justify-center min-w-[44px] min-h-[44px] cursor-pointer">
              <input type="checkbox" bind:checked={header.enabled} class="rounded text-indigo-600 focus:ring-indigo-500 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 w-4 h-4" />
            </label>
            <input
              type="text"
              bind:value={header.key}
              placeholder="Key"
              class="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-sm font-mono text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none min-h-[44px]"
            />
            <input
              type="text"
              bind:value={header.value}
              placeholder="Value"
              class="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-sm font-mono text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none min-h-[44px]"
            />
            <button
              on:click={() => removeHeader(i)}
              class="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Remove header"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        {/each}
        <button
          on:click={addHeader}
          class="flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline mt-2 min-h-[44px] px-2"
        >
          <Plus class="w-3 h-3" /> Add Header
        </button>
      </div>

    {:else if activeTab === 'body'}
      <div class="flex flex-col h-full">
        <div class="flex gap-4 mb-3 text-sm flex-wrap">
          <label class="flex items-center gap-2 cursor-pointer min-h-[44px] px-2">
            <input type="radio" bind:group={bodyType} value="none" class="text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
            <span class="text-slate-700 dark:text-slate-300">None</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer min-h-[44px] px-2">
            <input type="radio" bind:group={bodyType} value="json" class="text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
            <span class="text-slate-700 dark:text-slate-300">JSON</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer min-h-[44px] px-2">
            <input type="radio" bind:group={bodyType} value="text" class="text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
            <span class="text-slate-700 dark:text-slate-300">Text</span>
          </label>
        </div>

        {#if bodyType !== 'none'}
          <textarea
            bind:value={bodyContent}
            class="flex-1 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-3 text-sm font-mono text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            placeholder={bodyType === 'json' ? '{\n  "key": "value"\n}' : 'Enter text body...'}
          ></textarea>
        {:else}
           <div class="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-600 text-sm italic">
             No body content
           </div>
        {/if}
      </div>
    {/if}
  </div>
</div>
