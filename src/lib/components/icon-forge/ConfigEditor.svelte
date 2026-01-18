<script lang="ts">
  import { RotateCcw, Check, Palette } from 'lucide-svelte';
  import type { IconConfig } from '$lib/utils/icon-forge/processor';
  import { createEventDispatcher } from 'svelte';

  export let config: IconConfig;
  export let t: any;

  const dispatch = createEventDispatcher();

  const presets = [
    '#6366f1', // Indigo
    '#3b82f6', // Blue
    '#10b981', // Emerald
    '#ef4444', // Red
    '#f59e0b', // Amber
    '#1e293b', // Slate 800
    '#ffffff', // White
    '#000000', // Black
  ];

  function update() {
    dispatch('change', config);
  }
</script>

<div class="space-y-6">
  <!-- Background Color -->
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <label class="text-sm font-medium text-slate-300">{t.config.background}</label>
      <div class="flex items-center space-x-2">
        <input
          type="checkbox"
          id="transparent"
          class="rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500/50"
          bind:checked={config.transparent}
          on:change={update}
        />
        <label for="transparent" class="text-xs text-slate-400 cursor-pointer select-none">
          {t.config.transparent}
        </label>
      </div>
    </div>

    {#if !config.transparent}
      <div class="grid grid-cols-8 gap-2">
        {#each presets as color}
          <button
            type="button"
            class="w-8 h-8 rounded-lg ring-1 ring-slate-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:scale-110 transition-transform flex items-center justify-center"
            style="background-color: {color}"
            on:click={() => {
              config.background = color;
              update();
            }}
          >
            {#if config.background.toLowerCase() === color}
              <Check class="w-4 h-4 {color === '#ffffff' ? 'text-black' : 'text-white'}" />
            {/if}
          </button>
        {/each}
      </div>

      <div class="relative flex items-center">
        <div class="absolute left-3 text-slate-400">
           <Palette class="w-4 h-4" />
        </div>
        <input
          type="text"
          class="w-full h-10 pl-10 pr-12 bg-slate-700 text-slate-50 border border-slate-600 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
          bind:value={config.background}
          on:input={update}
        />
        <input
          type="color"
          class="absolute right-2 top-1.5 w-8 h-7 bg-transparent border-0 cursor-pointer p-0"
          bind:value={config.background}
          on:input={update}
        />
      </div>
    {/if}
  </div>

  <div class="h-px bg-slate-700/50"></div>

  <!-- Padding -->
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <label class="text-sm font-medium text-slate-300">{t.config.padding}</label>
      <span class="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
        {config.padding}%
      </span>
    </div>
    <input
      type="range"
      min="0"
      max="80"
      step="1"
      class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
      bind:value={config.padding}
      on:input={update}
    />
  </div>

  <!-- Radius -->
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <label class="text-sm font-medium text-slate-300">{t.config.radius}</label>
      <span class="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
        {config.radius}%
      </span>
    </div>
    <input
      type="range"
      min="0"
      max="50"
      step="1"
      class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
      bind:value={config.radius}
      on:input={update}
      disabled={config.transparent}
    />
    <p class="text-xs text-slate-500">
        {config.transparent ? 'Enable background to set radius.' : '0% for square, 50% for circle.'}
    </p>
  </div>
</div>
