<script lang="ts">
  import { ArrowRightLeft, Copy, Check } from 'lucide-svelte';
  import { categories, type UnitDefinition } from '$lib/utils/unit-verse/definitions';
  import { unitEngine } from '$lib/utils/unit-verse/engine';
  import SmartContext from './features/SmartContext.svelte';
  import FormulaView from './features/FormulaView.svelte';
  import { addToHistory } from '$lib/db/unit-verse';
  import { onMount, tick } from 'svelte';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';

  export let selectedCategory: string;
  export let t: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  export let inputValue: number | null = 1;
  export let fromUnitId: string = '';
  export let toUnitId: string = '';
  let precision: number = 6;

  let resultValue: number = 0;
  let formattedResult: string = '';
  let formula: string = '';
  let copied = false;

  function handleKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      copyResult();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      inputValue = null;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      copyResult();
    }
    if (e.key === 'Escape') {
      inputValue = 1;
    }
  }

  $: currentCategory = categories.find(c => c.id === selectedCategory);
  $: units = currentCategory?.units || [];
  $: fromUnitSymbol = units.find(u => u.id === fromUnitId)?.symbol || '';
  $: toUnitSymbol = units.find(u => u.id === toUnitId)?.symbol || '';

  // Reset units when category changes
  $: if (selectedCategory) {
     initializeUnits();
  }

  function initializeUnits() {
    if (units.length > 0) {
        // Default to first two units or reasonable defaults
        // Try to preserve selection if unit exists in new category (rare)
        const currentFromExists = units.find(u => u.id === fromUnitId);
        const currentToExists = units.find(u => u.id === toUnitId);

        if (!currentFromExists) fromUnitId = units[0].id;
        if (!currentToExists) toUnitId = units[1]?.id || units[0].id;
    }
  }

  // Reactive conversion
  $: if (browser && inputValue !== null && fromUnitId && toUnitId && selectedCategory) {
    calculate();
  }

  async function calculate() {
    try {
      if (inputValue === null) {
          formattedResult = '';
          formula = '';
          return;
      }

      const res = unitEngine.convert(inputValue, fromUnitId, toUnitId, selectedCategory, precision);
      resultValue = res.value;
      formattedResult = res.formatted;
      formula = res.formula;

      // Debounce history save
      await saveToHistory(inputValue, fromUnitId, toUnitId, selectedCategory, resultValue);

       // URL State
      const params = new URLSearchParams($page.url.searchParams);
      params.set('cat', selectedCategory);
      params.set('val', inputValue.toString());
      params.set('from', fromUnitId);
      params.set('to', toUnitId);
      window.history.replaceState({}, '', `?${params.toString()}`);

    } catch (e) {
      console.error(e);
      formattedResult = t.error || 'Error';
    }
  }

  let timer: any;
  async function saveToHistory(val: number, from: string, to: string, cat: string, res: number) {
      clearTimeout(timer);
      timer = setTimeout(() => {
          addToHistory({
              fromValue: val,
              fromUnitId: from,
              toUnitId: to,
              categoryId: cat,
              resultValue: res
          });
      }, 1000);
  }

  function swap() {
    const temp = fromUnitId;
    fromUnitId = toUnitId;
    toUnitId = temp;
  }

  async function copyResult() {
    try {
      await navigator.clipboard.writeText(formattedResult);
      copied = true;
      setTimeout(() => copied = false, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

    // Load from URL
    onMount(() => {
        const params = $page.url.searchParams;
        if (params.get('cat')) selectedCategory = params.get('cat')!;
        if (params.get('from')) fromUnitId = params.get('from')!;
        if (params.get('to')) toUnitId = params.get('to')!;
        if (params.get('val')) inputValue = parseFloat(params.get('val')!);
        initializeUnits(); // Ensure valid units if URL params are partial
    });

</script>

<svelte:window on:keydown={handleKeydown} />

<div class="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700">
  <div class="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-6 items-center">

    <!-- Input Section -->
    <div class="space-y-4 w-full">
      <label for="input-value" class="block text-sm font-medium text-slate-400">{t.from}</label>

      <div class="flex space-x-2">
        <input
          id="input-value"
          type="number"
          inputmode="decimal"
          bind:value={inputValue}
          class="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-2xl font-mono text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[44px]"
          placeholder="0"
        />
      </div>

      <select
        bind:value={fromUnitId}
        class="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
        aria-label="{t.from} unit"
      >
        {#each units as unit}
          <option value={unit.id}>{unit.name.en} ({unit.symbol})</option>
        {/each}
      </select>
    </div>

    <!-- Swap Button -->
    <div class="flex justify-center z-10">
      <button
        on:click={swap}
        class="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label={t.swap}
      >
        <ArrowRightLeft size={20} class="transform md:rotate-0 rotate-90" />
      </button>
    </div>

    <!-- Output Section -->
    <div class="space-y-4 w-full">
      <label for="output-result" class="block text-sm font-medium text-slate-400">{t.to}</label>

      <div class="flex space-x-2 relative group">
        <div
          id="output-result"
          class="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-2xl font-mono text-indigo-300 break-all min-h-[60px] flex items-center"
          role="status"
          aria-live="polite"
        >
          {formattedResult || '---'}
        </div>

        <button
            on:click={copyResult}
            class="absolute right-2 top-2 p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title={t.copy}
            aria-label={t.copy}
        >
            {#if copied}
                <Check size={18} class="text-green-400" />
            {:else}
                <Copy size={18} />
            {/if}
        </button>
      </div>

      <select
        bind:value={toUnitId}
        class="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
        aria-label="{t.to} unit"
      >
        {#each units as unit}
          <option value={unit.id}>{unit.name.en} ({unit.symbol})</option>
        {/each}
      </select>
    </div>

  </div>

  <!-- Formula & Precision -->
  <div class="mt-8 pt-6 border-t border-slate-700">

      {#if formula && inputValue !== null}
        <FormulaView
            {formula}
            {inputValue}
            {fromUnitSymbol}
            {toUnitSymbol}
            {resultValue}
            {t}
        />

        <SmartContext
            value={inputValue}
            {fromUnitId}
            categoryId={selectedCategory}
            {t}
        />
      {/if}

      <div class="flex items-center justify-end mt-6" role="group" aria-labelledby="precision-label">
          <span id="precision-label" class="text-sm text-slate-400 whitespace-nowrap mr-3">{t.precision}:</span>
          <div class="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
             {#each [2, 4, 6, 10] as p}
                 <button
                    class="px-3 py-2 text-sm rounded-md transition-colors min-h-[44px] min-w-[44px] {precision === p ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}"
                    on:click={() => precision = p}
                    aria-label="{t.precision} {p}"
                    aria-pressed={precision === p}
                 >
                     {p}
                 </button>
             {/each}
          </div>
      </div>
  </div>
</div>
