<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { categories, type CategoryDefinition } from '$lib/utils/unit-verse/definitions';
  import { Ruler, Scale, Box, Mountain, Thermometer, Clock, Monitor, Gauge, Activity, Zap, Radio, ZapOff } from 'lucide-svelte';

  export let selectedCategory: string;
  export let t: any;

  const dispatch = createEventDispatcher();

  function selectCategory(id: string) {
    dispatch('select', id);
  }

  const icons: Record<string, any> = {
    length: Ruler,
    mass: Scale,
    volume: Box,
    area: Mountain,
    temperature: Thermometer,
    time: Clock,
    digital: Monitor,
    speed: Gauge,
    pressure: Activity, // Approximate
    energy: Zap,
    frequency: Radio,
    power: ZapOff // Approximate
  };
</script>

<div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-6" role="tablist">
  {#each categories as category}
    <button style="min-height: 44px; min-width: 44px;"
      role="tab"
      aria-selected={selectedCategory === category.id}
      class="flex flex-col items-center justify-center p-4 min-h-[88px] rounded-xl transition-all duration-200 border
        {selectedCategory === category.id
          ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg scale-105 z-10'
          : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:border-slate-600 hover:text-slate-200'}"
      on:click={() => selectCategory(category.id)}
      aria-label={t.categories[category.id] || category.name.en}
    >
      <svelte:component
        this={icons[category.id] || Box}
        size={24}
        class="mb-2 {selectedCategory === category.id ? 'text-white' : 'text-slate-400'}"
      />
      <span class="text-sm font-medium text-center leading-tight">
        {t.categories[category.id] || category.name.en}
      </span>
    </button>
  {/each}
</div>
