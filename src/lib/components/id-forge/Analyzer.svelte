<script lang="ts">
  import { analyzeId, type IdAnalysis } from '$lib/utils/id-forge/id-forge';
  import Anatomy from './Anatomy.svelte';
  import { parse } from 'uuid';
  import { getDictionary } from '$lib/dictionaries';
  import { page } from '$app/stores';

  $: dict = getDictionary($page.params.lang ?? 'en').tools.idForge.analyzer;

  let input = '';
  let result: IdAnalysis | null = null;
  let conversions: { label: string; value: string }[] = [];

  function analyze() {
    if (!input) {
        result = null;
        conversions = [];
        return;
    }
    result = analyzeId(input);

    // Generate conversions if valid UUID
    if (result.isValid && result.type === 'UUID') {
        try {
            const bytes = parse(input);

            // 1. Base64 (Standard)
            const base64 = btoa(String.fromCharCode(...bytes));

            // 2. Base64 (URL Safe) - Replace + with - and / with _ and remove padding =
            const base64Url = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

            // 3. Hex (No Dashes)
            const hex = input.replace(/-/g, '');

            conversions = [
                { label: 'Hex (No Dashes)', value: hex },
                { label: 'Base64 (Standard)', value: base64 },
                { label: 'Base64 (URL Safe)', value: base64Url },
                { label: 'URN', value: `urn:uuid:${input}` }
            ];
        } catch (e) {
            conversions = [];
        }
    } else {
        conversions = [];
    }
  }

  function copy(text: string) {
      navigator.clipboard.writeText(text);
  }
</script>

<div class="space-y-6">
  <div class="relative">
    <input
      type="text"
      bind:value={input}
      on:input={analyze}
      placeholder={dict.pastePlaceholder}
      class="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-lg font-mono text-center shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
    />
    <div class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
    </div>
  </div>

  {#if result}
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="p-6 grid md:grid-cols-2 gap-6">
            <div>
                <h3 class="text-sm font-semibold text-slate-500 uppercase mb-1">{dict.type}</h3>
                <div class="flex items-center space-x-2">
                    {#if result.isValid}
                        <span class="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-bold">{result.type}</span>
                        {#if result.version}
                            <span class="px-3 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-full text-sm font-bold">v{result.version}</span>
                        {/if}
                    {:else}
                        <span class="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-sm font-bold">{dict.invalid}</span>
                    {/if}
                </div>
            </div>

            {#if result.timestamp}
                <div>
                    <h3 class="text-sm font-semibold text-slate-500 uppercase mb-1">{dict.timestamp}</h3>
                    <p class="text-lg font-medium text-slate-900 dark:text-slate-100">{result.timestamp.toLocaleString()}</p>
                    <p class="text-xs text-slate-500">{result.timestamp.toISOString()}</p>
                </div>
            {/if}

            <div class="md:col-span-2">
                <h3 class="text-sm font-semibold text-slate-500 uppercase mb-1">{dict.details}</h3>
                <p class="text-slate-700 dark:text-slate-300">{result.details}</p>
            </div>

            <!-- Anatomy Visualization -->
            {#if result.isValid && result.type}
                <div class="md:col-span-2 border-t border-slate-100 dark:border-slate-700 pt-6">
                    <h3 class="text-sm font-semibold text-slate-500 uppercase mb-3">{dict.anatomy}</h3>
                    <Anatomy id={input.trim()} type={result.type} />
                </div>
            {/if}

            <!-- Conversions -->
            {#if conversions.length > 0}
                <div class="md:col-span-2 border-t border-slate-100 dark:border-slate-700 pt-6">
                    <h3 class="text-sm font-semibold text-slate-500 uppercase mb-3">{dict.conversions}</h3>
                    <div class="grid sm:grid-cols-2 gap-4">
                        {#each conversions as conv}
                            <div class="flex flex-col bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                <span class="text-xs text-slate-500 uppercase mb-1">{conv.label}</span>
                                <div class="flex items-center justify-between">
                                    <code class="text-sm font-mono text-slate-800 dark:text-slate-200 break-all">{conv.value}</code>
                                    <button class="min-h-[44px] min-w-[44px] text-slate-400 hover:text-indigo-600 ml-2" on:click={() => copy(conv.value)} title="Copy">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                    </button>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}
        </div>
    </div>
  {/if}
</div>
