<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { slide } from 'svelte/transition';
  import type { GenerationOptions, IdType } from '$lib/utils/id-forge/id-forge';

  const dispatch = createEventDispatcher();

  export let options: GenerationOptions;

  // Local state for form binding
  let selectedType: IdType = options.type;
  let quantity = options.quantity;
  let format: GenerationOptions['format'] = options.format;
  let nanoidLength = options.nanoidLength || 21;
  let nanoidAlphabet = options.nanoidAlphabet || '';
  let namespace = options.namespace || '';
  let name = options.name || '';

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
    dispatch('generate', {
      type: selectedType,
      quantity,
      format,
      nanoidLength,
      nanoidAlphabet,
      namespace,
      name
    });
  }
</script>

<div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-6">
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
          class="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-indigo-600"
        />
        <input
          type="number"
          min="1"
          max="10000"
          bind:value={quantity}
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
            <input id="nano-length" type="number" bind:value={nanoidLength} class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm" />
        </div>
        <div class="space-y-2">
            <label for="nano-alphabet" class="text-xs font-medium text-slate-500 uppercase">Custom Alphabet (Optional)</label>
            <input id="nano-alphabet" type="text" bind:value={nanoidAlphabet} placeholder="e.g. 0123456789ABCDEF" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-mono" />
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
            <input id="ns-name" type="text" bind:value={name} placeholder="example.com" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm" />
        </div>
        <div class="space-y-2">
            <label for="ns-uuid" class="text-xs font-medium text-slate-500 uppercase">Namespace UUID (Optional)</label>
            <input id="ns-uuid" type="text" bind:value={namespace} placeholder="Leave empty for DNS default" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-mono" />
        </div>
      </div>
    </div>
  {/if}

  <!-- Format Options -->
  <div class="flex flex-wrap gap-4 pt-2">
    <label class="flex items-center space-x-2 cursor-pointer">
        <input type="radio" bind:group={format} value="plain" class="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300" />
        <span class="text-sm text-slate-700 dark:text-slate-300">Plain</span>
    </label>
    {#if selectedType.startsWith('uuid')}
    <label class="flex items-center space-x-2 cursor-pointer">
        <input type="radio" bind:group={format} value="hyphens" class="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300" />
        <span class="text-sm text-slate-700 dark:text-slate-300">Hyphens</span>
    </label>
    <label class="flex items-center space-x-2 cursor-pointer">
        <input type="radio" bind:group={format} value="guid" class="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300" />
        <span class="text-sm text-slate-700 dark:text-slate-300">GUID {`{...}`}</span>
    </label>
    {/if}
    <label class="flex items-center space-x-2 cursor-pointer">
        <input type="radio" bind:group={format} value="json" class="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300" />
        <span class="text-sm text-slate-700 dark:text-slate-300">JSON Array</span>
    </label>
    <label class="flex items-center space-x-2 cursor-pointer">
        <input type="radio" bind:group={format} value="sql" class="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300" />
        <span class="text-sm text-slate-700 dark:text-slate-300">SQL Insert</span>
    </label>
  </div>

  <!-- Generate Button -->
  <button
    on:click={generate}
    class="w-full py-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all transform active:scale-[0.98] flex items-center justify-center space-x-2"
  >
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
    <span>Generate {quantity} IDs</span>
  </button>
</div>
