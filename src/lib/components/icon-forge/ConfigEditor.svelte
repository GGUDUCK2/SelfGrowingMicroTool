<script lang="ts">
  import { RotateCcw, Check, Palette, Sparkles, Settings2 } from '@lucide/svelte';
  import { IconProcessor, type IconConfig } from '$lib/utils/icon-forge/processor';
  import type { IconForgeDictionary } from '$lib/types/icon-forge';
  import { createEventDispatcher } from 'svelte';

  export let config: IconConfig;
  export let t: IconForgeDictionary;
  export let file: File | null = null;

  const dispatch = createEventDispatcher();

  let extractedColors: string[] = [];

  $: if (file) {
      extractColors();
  }

  async function extractColors() {
      if (!file) return;
      try {
          extractedColors = await IconProcessor.extractColors(file);
      } catch (e) {
          console.error(e);
      }
  }

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
  <!-- App Info -->
  <div class="space-y-3">
    <div class="space-y-1">
      <label class="text-sm font-medium text-slate-300" for="appName">{t.config.name}</label>
      <input
        type="text"
        id="appName"
        class="w-full h-10 px-3 bg-slate-700 text-slate-50 border border-slate-600 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
        bind:value={config.name}
        placeholder="My Awesome App"
        on:input={update}
      />
    </div>
    <div class="space-y-1">
      <label class="text-sm font-medium text-slate-300" for="shortName">{t.config.shortName}</label>
      <input
        type="text"
        id="shortName"
        class="w-full h-10 px-3 bg-slate-700 text-slate-50 border border-slate-600 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
        bind:value={config.shortName}
        placeholder="App"
        on:input={update}
      />
    </div>
  </div>

  <div class="h-px bg-slate-700/50"></div>

  <!-- Background Color -->
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium text-slate-300">{t.config.background}</span>
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

      {#if extractedColors.length > 0}
        <div class="space-y-2 pt-2">
            <div class="flex items-center text-xs font-medium text-slate-400">
                <Sparkles class="w-3 h-3 mr-1 text-amber-400" />
                {t.magicPalette || 'Magic Palette'}
            </div>
            <div class="flex items-center space-x-2">
                {#each extractedColors as color}
                    <button
                        type="button"
                        class="w-6 h-6 rounded-md ring-1 ring-slate-700/50 hover:scale-110 transition-transform relative"
                        style="background-color: {color}"
                        on:click={() => {
                            config.background = color;
                            config.transparent = false;
                            update();
                        }}
                        title={color}
                    >
                         {#if config.background === color}
                            <div class="absolute inset-0 flex items-center justify-center">
                                <Check class="w-3 h-3 {color > '#aaaaaa' ? 'text-black' : 'text-white'}" />
                            </div>
                         {/if}
                    </button>
                {/each}
            </div>
        </div>
      {/if}
    {/if}
  </div>

  <div class="h-px bg-slate-700/50"></div>

  <!-- Padding -->
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <label class="text-sm font-medium text-slate-300" for="configPadding">{t.config.padding}</label>
      <span class="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
        {config.padding}%
      </span>
    </div>
    <input
      id="configPadding"
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
      <label class="text-sm font-medium text-slate-300" for="configRadius">{t.config.radius}</label>
      <span class="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
        {config.radius}%
      </span>
    </div>
    <input
      id="configRadius"
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

  <div class="h-px bg-slate-700/50"></div>

  <!-- Manifest Settings -->
  <div class="space-y-3">
      <div class="flex items-center justify-between">
          <label class="text-sm font-medium text-slate-300 flex items-center">
              <Settings2 class="w-4 h-4 mr-1.5 text-indigo-400" />
              {t.manifestSettings?.title || 'Manifest Settings'}
          </label>
      </div>

      <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1">
               <label class="text-xs text-slate-400" for="startUrl">Start URL</label>
               <input
                id="startUrl"
                type="text"
                class="w-full h-9 px-3 bg-slate-700 text-slate-50 border border-slate-600 rounded-lg text-xs focus:border-indigo-500 focus:outline-none"
                bind:value={config.startUrl}
                placeholder="/"
                on:input={update}
               />
          </div>
          <div class="space-y-1">
               <label class="text-xs text-slate-400" for="displayMode">Display Mode</label>
               <select
                id="displayMode"
                class="w-full h-9 px-3 bg-slate-700 text-slate-50 border border-slate-600 rounded-lg text-xs focus:border-indigo-500 focus:outline-none"
                bind:value={config.display}
                on:change={update}
               >
                 <option value="standalone">Standalone</option>
                 <option value="fullscreen">Fullscreen</option>
                 <option value="minimal-ui">Minimal UI</option>
                 <option value="browser">Browser</option>
               </select>
          </div>
      </div>
  </div>
</div>
