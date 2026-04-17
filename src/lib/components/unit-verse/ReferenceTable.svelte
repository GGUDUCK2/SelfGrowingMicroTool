<script lang="ts">
  import { categories, type UnitDefinition } from '$lib/utils/unit-verse/definitions';
  import { unitEngine } from '$lib/utils/unit-verse/engine';
  import { Copy, Check } from 'lucide-svelte';
  import { slide } from 'svelte/transition';

  export let selectedCategory: string;
  export let inputValue: number | null;
  export let fromUnitId: string;
  export let t: any;

  let copiedId: string | null = null;

  $: currentCategory = categories.find(c => c.id === selectedCategory);

  // Select a subset of popular units for the reference table to avoid overcrowding
  $: popularUnits = getPopularUnits(selectedCategory, currentCategory?.units || []);

  // Safely calculate reference data only when we have all necessary inputs
  $: referenceData = (inputValue !== null && currentCategory && fromUnitId)
    ? popularUnits.map(unit => {
        try {
            const res = unitEngine.convert(inputValue!, fromUnitId, unit.id, selectedCategory, 4);
            return {
            unit,
            value: res.formatted,
            raw: res.value
            };
        } catch (e) {
            return null;
        }
      }).filter(item => item !== null) as { unit: UnitDefinition, value: string, raw: number }[]
    : [];

  function getPopularUnits(catId: string, units: UnitDefinition[]): UnitDefinition[] {
    // Return max 6-8 relevant units per category
    const popularIds: Record<string, string[]> = {
        length: ['meter', 'foot', 'inch', 'centimeter', 'kilometer', 'mile', 'yard', 'nautical_mile'],
        mass: ['kilogram', 'pound', 'gram', 'ounce', 'stone', 'tonne'],
        temperature: ['celsius', 'fahrenheit', 'kelvin'],
        volume: ['liter', 'gallon_us', 'milliliter', 'fluid_ounce_us', 'cup_us', 'cubic_meter'],
        time: ['second', 'minute', 'hour', 'day', 'week', 'year_gregorian'],
        digital: ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte', 'bit'],
        area: ['square_meter', 'square_foot', 'acre', 'hectare', 'square_kilometer', 'square_mile'],
        speed: ['kilometer_per_hour', 'mile_per_hour', 'meters_per_second', 'knot', 'mach'],
        energy: ['joule', 'calorie', 'watt_hour', 'electronvolt'],
        pressure: ['pascal', 'bar', 'psi', 'standard_atmosphere'],
        power: ['watt', 'horsepower', 'kilowatt'],
        frequency: ['hertz', 'kilohertz', 'megahertz', 'gigahertz']
    };

    const targetIds = popularIds[catId];
    if (!targetIds) return units.slice(0, 6);

    return units.filter(u => targetIds.includes(u.id)).slice(0, 8);
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    copiedId = id;
    setTimeout(() => copiedId = null, 2000);
  }
</script>

{#if inputValue !== null && referenceData.length > 0}
  <div class="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg" transition:slide>
    <h3 class="text-lg font-semibold text-white mb-4 flex items-center">
      <span class="bg-indigo-500/20 text-indigo-300 p-1.5 rounded-lg mr-2 text-sm">Reference</span>
      {t.referenceTable || "Quick Reference"}
    </h3>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {#each referenceData as item}
        <button style="min-height: 44px; min-width: 44px;"
          class="flex items-center justify-between bg-slate-900/50 hover:bg-slate-700 border border-slate-700/50 rounded-lg p-3 transition-all group text-left min-h-[44px] min-w-[44px]"
          on:click={() => copyToClipboard(item.value, item.unit.id)}
          aria-label="Copy {item.value} {item.unit.name.en}"
        >
          <div class="overflow-hidden">
             <div class="text-xs text-slate-500 mb-0.5">{item.unit.name.en}</div>
             <div class="text-slate-200 font-mono font-medium truncate" title={item.value}>
               {item.value} <span class="text-slate-500 text-xs">{item.unit.symbol}</span>
             </div>
          </div>

          <div class="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
            {#if copiedId === item.unit.id}
               <Check size={14} class="text-green-400" />
            {:else}
               <Copy size={14} />
            {/if}
          </div>
        </button>
      {/each}
    </div>
  </div>
{/if}
