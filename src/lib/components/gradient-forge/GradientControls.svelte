<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let t: any;
  export let type: 'linear' | 'radial' | 'conic' = 'linear';
  export let angle: number = 90;
  export let position: string = 'center';

  const dispatch = createEventDispatcher();

  function update() {
    dispatch('update', { type, angle, position });
  }

  const positions = [
    { value: 'center', label: 'Center' },
    { value: 'top', label: 'Top' },
    { value: 'bottom', label: 'Bottom' },
    { value: 'left', label: 'Left' },
    { value: 'right', label: 'Right' },
    { value: 'top left', label: 'Top Left' },
    { value: 'top right', label: 'Top Right' },
    { value: 'bottom left', label: 'Bottom Left' },
    { value: 'bottom right', label: 'Bottom Right' }
  ];
</script>

<div class="space-y-6">
  <!-- Type Selector -->
  <div>
    <div class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.type}</div>
    <div class="grid grid-cols-3 gap-2">
      {#each ['linear', 'radial', 'conic'] as tType}
        <button
          class="py-2 px-3 text-sm font-medium rounded-lg border transition-all min-h-[44px] {type === tType ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500 dark:text-indigo-300 shadow-sm' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}"
          on:click={() => { type = tType as any; update(); }}
        >
          {t[tType]}
        </button>
      {/each}
    </div>
  </div>

  {#if type === 'linear' || type === 'conic'}
    <!-- Angle Dial -->
    <div>
      <label for="angle-slider" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.angle}: {angle}°</label>
      <input
        id="angle-slider"
        type="range"
        min="0"
        max="360"
        bind:value={angle}
        on:input={update}
        class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 min-h-[44px]"
      />
    </div>
  {/if}

  {#if type === 'radial' || type === 'conic'}
    <!-- Position Selector -->
    <div>
      <label for="position-select" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.position}</label>
      <select
        id="position-select"
        bind:value={position}
        on:change={update}
        class="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none min-h-[44px]"
      >
        {#each positions as pos}
          <option value={pos.value}>{pos.label}</option>
        {/each}
      </select>
    </div>
  {/if}
</div>
