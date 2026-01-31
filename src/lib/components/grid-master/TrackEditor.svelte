<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Trash2 } from 'lucide-svelte';
  import type { GridMasterDictionary } from '$lib/utils/grid-master/types';

  export let value: string;
  export let index: number;
  export let label: string;
  export let dict: GridMasterDictionary;

  const dispatch = createEventDispatcher();

  let unit = 'fr';
  let val1 = '1';
  let val2 = '1fr'; // For minmax

  // Reactive Parser: Update internal state when external `value` changes
  $: parseValue(value);

  function parseValue(v: string) {
      // Avoid infinite loop if we just emitted this exact value
      // But actually, we need to sync if the store changes from elsewhere (e.g. undo/redo)

      const trimmed = v.trim();
      if (trimmed.startsWith('minmax')) {
          if (unit !== 'minmax') unit = 'minmax';
          const content = trimmed.match(/minmax\((.*)\)/)?.[1] || '100px, 1fr';
          const parts = content.split(',').map(s => s.trim());
          if (val1 !== parts[0]) val1 = parts[0];
          if (val2 !== parts[1]) val2 = parts[1];
      } else if (trimmed.startsWith('fit-content')) {
          if (unit !== 'fit-content') unit = 'fit-content';
          const content = trimmed.match(/fit-content\((.*)\)/)?.[1] || '200px';
          if (val1 !== content) val1 = content;
      } else if (trimmed === 'auto') {
          if (unit !== 'auto') unit = 'auto';
      } else if (trimmed.endsWith('fr')) {
          if (unit !== 'fr') unit = 'fr';
          const num = trimmed.replace('fr', '');
          if (val1 !== num) val1 = num;
      } else if (trimmed.endsWith('px')) {
          if (unit !== 'px') unit = 'px';
          const num = trimmed.replace('px', '');
          if (val1 !== num) val1 = num;
      } else if (trimmed.endsWith('%')) {
          if (unit !== '%') unit = '%';
          const num = trimmed.replace('%', '');
          if (val1 !== num) val1 = num;
      } else {
          // Fallback or just '100px' without unit?
          // If it's just a number, assume px for safety or keep as is?
          // Let's check if it's a number
          if (!isNaN(parseFloat(trimmed))) {
             // It's a number, but no unit.
             // CSS Grid usually requires unit unless 0.
             // We'll treat as px for editing purposes if valid number
             if (unit !== 'px') unit = 'px';
             if (val1 !== trimmed) val1 = trimmed;
          } else {
             // Unknown format
             if (unit !== 'auto') unit = 'auto'; // Default safe fallback
          }
      }
  }

  function emit() {
      let final = '';
      if (unit === 'auto') final = 'auto';
      else if (unit === 'minmax') final = `minmax(${val1}, ${val2})`;
      else if (unit === 'fit-content') final = `fit-content(${val1})`;
      else final = `${val1}${unit}`;

      if (final !== value) {
        dispatch('change', final);
      }
  }

  function updateUnit(u: string) {
      unit = u;
      // Set sensible defaults when switching
      if (u === 'fr' && !val1) val1 = '1';
      if (u === 'px' && !val1) val1 = '100';
      if (u === '%' && !val1) val1 = '20';
      if (u === 'minmax') {
          val1 = '100px';
          val2 = '1fr';
      }
      if (u === 'fit-content') {
          val1 = '200px';
      }
      emit();
  }
</script>

<div class="flex items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-800/50 rounded border border-slate-200 dark:border-slate-800">
    <span class="text-xs text-slate-400 font-mono w-4 text-center">{index + 1}</span>

    <div class="flex-1 flex gap-1 items-center min-w-0">
        <!-- Main Value Input (if applicable) -->
        {#if ['fr', 'px', '%'].includes(unit)}
            <input
              type="number"
              bind:value={val1}
              on:input={emit}
              class="w-full min-w-[40px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-1 text-xs sm:text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
              aria-label={`${label} ${index + 1} value`}
            />
        {:else if unit === 'minmax'}
             <div class="flex flex-col gap-1 w-full min-w-0">
                 <div class="flex items-center gap-1">
                     <span class="text-[9px] text-slate-400 uppercase w-6 shrink-0">{dict.min || 'Min'}</span>
                     <input type="text" bind:value={val1} on:change={emit} class="flex-1 min-w-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-1 py-0.5 text-xs" aria-label="Min value" />
                 </div>
                 <div class="flex items-center gap-1">
                     <span class="text-[9px] text-slate-400 uppercase w-6 shrink-0">{dict.max || 'Max'}</span>
                     <input type="text" bind:value={val2} on:change={emit} class="flex-1 min-w-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-1 py-0.5 text-xs" aria-label="Max value" />
                 </div>
             </div>
        {:else if unit === 'fit-content'}
             <input type="text" bind:value={val1} on:change={emit} class="flex-1 min-w-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-1 text-xs" aria-label="Fit content limit" />
        {/if}

        <!-- Unit Selector -->
        <select
          value={unit}
          on:change={(e) => updateUnit(e.currentTarget.value)}
          class="bg-slate-100 dark:bg-slate-800 border-none text-[10px] sm:text-xs font-medium text-slate-600 dark:text-slate-400 focus:ring-0 cursor-pointer rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors py-1 pl-1 pr-6 w-auto shrink-0"
          aria-label={dict.units || 'Unit'}
        >
            <option value="fr">fr</option>
            <option value="px">px</option>
            <option value="%">%</option>
            <option value="auto">auto</option>
            <option value="minmax">minmax</option>
            <option value="fit-content">fit</option>
        </select>
    </div>

    <button
      class="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors shrink-0"
      on:click={() => dispatch('remove')}
      aria-label={`Remove ${label} ${index + 1}`}
    >
       <Trash2 size={14} />
    </button>
</div>
