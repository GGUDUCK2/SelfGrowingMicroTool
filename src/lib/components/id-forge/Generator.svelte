<script lang="ts">
  import { createEventDispatcher, tick } from 'svelte';
  import { slide } from 'svelte/transition';
  import type { GenerationOptions, IdType } from '$lib/utils/id-forge/id-forge';

  const dispatch = createEventDispatcher();

  export let options: GenerationOptions;

  let selectedType: IdType;
  let quantity: number;
  let format: GenerationOptions['format'];
  let nanoidLength: number;
  let nanoidAlphabet: string;
  let namespace: string;
  let name: string;

  // Sync from props to local state
  $: {
      selectedType = options.type;
      quantity = options.quantity;
      format = options.format;
      nanoidLength = options.nanoidLength || 21;
      nanoidAlphabet = options.nanoidAlphabet || '';
      namespace = options.namespace || '';
      name = options.name || '';
  }

  function updateOptions() {
      options = {
          type: selectedType,
          quantity,
          format,
          nanoidLength,
          nanoidAlphabet,
          namespace,
          name
      };
  }

  const types: { value: IdType; label: string; desc: string }[] = [
    { value: 'uuid-v4', label: 'UUID v4', desc: 'Random (Standard)' },
    { value: 'uuid-v7', label: 'UUID v7', desc: 'Time-sortable (Modern Standard)' },
    { value: 'ulid', label: 'ULID', desc: 'Sortable, Compact' },
    { value: 'nanoid', label: 'NanoID', desc: 'Tiny, URL-friendly' },
    { value: 'cuid2', label: 'CUID2', desc: 'Secure, Collision-resistant' },
    { value: 'uuid-v1', label: 'UUID v1', desc: 'Mac Address + Time' },
    { value: 'uuid-v3', label: 'UUID v3', desc: 'MD5 Namespace' },
    { value: 'uuid-v5', label: 'UUID v5', desc: 'SHA-1 Namespace' },
    { value: 'uuid-nil', label: 'Nil UUID', desc: 'All Zeros' },
  ];

  function generate() {
    updateOptions();
    dispatch('generate', options);
  }

  // Smart Examples
  async function loadExample(type: IdType, qty: number, fmt: GenerationOptions['format'] = 'plain', extra: Partial<GenerationOptions> = {}) {
      selectedType = type;
      quantity = qty;
      format = fmt;
      nanoidLength = extra.nanoidLength || 21;
      nanoidAlphabet = extra.nanoidAlphabet || '';
      namespace = extra.namespace || '';
      name = extra.name || '';

      updateOptions();
      await tick();
      generate();
  }
</script>

<div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-6">

  <!-- Smart Examples -->
  <div class="flex flex-col space-y-2">
      <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">Quick Presets</span>
      <div class="flex flex-wrap gap-2">
        <button class="min-h-[44px] min-w-[44px] px-3 py-1.5 text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800" on:click={() => loadExample('uuid-v7', 5, 'json')}>
            UUID v7 (JSON Batch)
        </button>
        <button class="min-h-[44px] min-w-[44px] px-3 py-1.5 text-xs font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800" on:click={() => loadExample('ulid', 1, 'plain')}>
            ULID (Sortable)
        </button>
        <button class="min-h-[44px] min-w-[44px] px-3 py-1.5 text-xs font-medium bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors border border-transparent hover:border-rose-200 dark:hover:border-rose-800" on:click={() => loadExample('nanoid', 1, 'plain', { nanoidLength: 10 })}>
            Short NanoID (10)
        </button>
        <button class="min-h-[44px] min-w-[44px] px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors border border-transparent hover:border-slate-300 dark:hover:border-slate-500" on:click={() => loadExample('uuid-v4', 100, 'sql')}>
            SQL Bulk Insert (100)
        </button>
      </div>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Type Selection -->
    <div class="space-y-3">
      <label for="type-select" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
        Identifier Type
      </label>
      <div class="relative">
        <select
          id="type-select"
          bind:value={selectedType}
          on:change={updateOptions}
          class="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none"
        >
          {#each types as t}
            <option value={t.value}>{t.label} - {t.desc}</option>
          {/each}
        </select>
        <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>
    </div>

    <!-- Quantity -->
    <div class="space-y-3">
      <label for="quantity-input" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
        Quantity
      </label>
      <div class="flex items-center space-x-4">
        <input
          id="quantity-input"
          type="range"
          min="1"
          max="1000"
          bind:value={quantity}
          on:change={updateOptions}
          class="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-indigo-600"
        />
        <input
          type="number"
          min="1"
          max="10000"
          bind:value={quantity}
          on:change={updateOptions}
          class="w-20 px-3 py-2 text-center rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>
    </div>
  </div>

  <!-- Advanced Options -->
  {#if selectedType === 'nanoid'}
    <div transition:slide class="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl space-y-4 border border-slate-100 dark:border-slate-700/50">
      <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">NanoID Options</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2">
            <label for="nano-length" class="text-xs font-medium text-slate-500 uppercase">Length</label>
            <input id="nano-length" type="number" bind:value={nanoidLength} on:change={updateOptions} class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm" />
        </div>
        <div class="space-y-2">
            <label for="nano-alphabet" class="text-xs font-medium text-slate-500 uppercase">Custom Alphabet (Optional)</label>
            <input id="nano-alphabet" type="text" bind:value={nanoidAlphabet} on:change={updateOptions} placeholder="e.g. 0123456789ABCDEF" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-mono" />
        </div>
      </div>
    </div>
  {/if}

  {#if selectedType === 'uuid-v3' || selectedType === 'uuid-v5'}
    <div transition:slide class="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl space-y-4 border border-slate-100 dark:border-slate-700/50">
      <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">Namespace Options</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2">
            <label for="ns-name" class="text-xs font-medium text-slate-500 uppercase">Name</label>
            <input id="ns-name" type="text" bind:value={name} on:change={updateOptions} placeholder="example.com" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm" />
        </div>
        <div class="space-y-2">
            <label for="ns-uuid" class="text-xs font-medium text-slate-500 uppercase">Namespace UUID (Optional)</label>
            <input id="ns-uuid" type="text" bind:value={namespace} on:change={updateOptions} placeholder="Leave empty for DNS default" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-mono" />
        </div>
      </div>
    </div>
  {/if}

  <!-- Format Options -->
  <div class="flex flex-wrap gap-4 pt-2">
    <label class="flex items-center space-x-2 cursor-pointer">
        <input type="radio" bind:group={format} value="plain" on:change={updateOptions} class="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300" />
        <span class="text-sm text-slate-700 dark:text-slate-300">Plain</span>
    </label>
    {#if selectedType.startsWith('uuid')}
    <label class="flex items-center space-x-2 cursor-pointer">
        <input type="radio" bind:group={format} value="hyphens" on:change={updateOptions} class="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300" />
        <span class="text-sm text-slate-700 dark:text-slate-300">Hyphens</span>
    </label>
    <label class="flex items-center space-x-2 cursor-pointer">
        <input type="radio" bind:group={format} value="guid" on:change={updateOptions} class="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300" />
        <span class="text-sm text-slate-700 dark:text-slate-300">GUID {`{...}`}</span>
    </label>
    {/if}
    <label class="flex items-center space-x-2 cursor-pointer">
        <input type="radio" bind:group={format} value="json" on:change={updateOptions} class="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300" />
        <span class="text-sm text-slate-700 dark:text-slate-300">JSON</span>
    </label>
    <label class="flex items-center space-x-2 cursor-pointer">
        <input type="radio" bind:group={format} value="sql" on:change={updateOptions} class="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300" />
        <span class="text-sm text-slate-700 dark:text-slate-300">SQL</span>
    </label>
     <label class="flex items-center space-x-2 cursor-pointer">
        <input type="radio" bind:group={format} value="csv" on:change={updateOptions} class="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300" />
        <span class="text-sm text-slate-700 dark:text-slate-300">CSV</span>
    </label>
  </div>

  <!-- Generate Button -->
  <button class="min-h-[44px] min-w-[44px] w-full min-h-12 px-8 py-4 text-lg bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all transform active:scale-[0.98] flex items-center justify-center space-x-2" on:click={generate}
  >
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
    <span>Generate {quantity} IDs</span>
  </button>
</div>
