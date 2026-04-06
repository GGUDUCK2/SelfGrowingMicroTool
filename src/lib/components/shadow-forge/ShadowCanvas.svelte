<script lang="ts">
  import { shadowStore, generateShadowCSS, getNeumorphismBackground } from '$lib/utils/shadow-forge/store';
  export let dict: any;

  $: config = $shadowStore;
  $: cssShadow = generateShadowCSS(config);

  $: bgStyles = config.mode === 'neumorphism'
      ? `background: ${getNeumorphismBackground(config.neumorphismConfig, config.canvas.bgColor)};`
      : `background-color: ${config.canvas.boxColor};`;

</script>

<div class="flex-1 flex flex-col h-full bg-slate-50 dark:bg-black/50 border-r border-slate-200 dark:border-slate-800 relative min-h-[400px]">

  <!-- Target Canvas -->
  <div
    class="flex-1 w-full h-full flex items-center justify-center overflow-auto relative p-8 transition-colors duration-300"
    style="background-color: {config.canvas.bgColor};"
  >
    <!-- Background Grid Pattern for better visibility -->
    <div class="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
         style="background-image: radial-gradient(circle at 1px 1px, currentcolor 1px, transparent 0); background-size: 20px 20px;">
    </div>

    <!-- The Box -->
    <div
      class="transition-all duration-300 ease-out flex items-center justify-center text-center p-6 relative"
      style="
        width: {config.canvas.width}px;
        height: {config.canvas.height}px;
        border-radius: {config.canvas.borderRadius}px;
        box-shadow: {cssShadow};
        {bgStyles}
      "
    >
      <span class="font-medium opacity-50 mix-blend-difference text-white">Shadow Forge</span>
    </div>
  </div>

  <!-- Canvas Controls (Bottom Bar) -->
  <div class="h-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shrink-0 flex flex-wrap gap-4 items-center">
    <!-- BG Color -->
    <div class="flex items-center gap-2">
      <label for="bg-color" class="text-xs font-medium text-slate-500 uppercase tracking-wider">{dict.canvas.bgColor}</label>
      <input
        id="bg-color"
        type="color"
        bind:value={$shadowStore.canvas.bgColor}
        class="w-8 h-8 rounded cursor-pointer border-0 p-0 min-w-[44px] min-h-[44px]"
      />
    </div>

    {#if config.mode !== 'neumorphism'}
      <!-- Box Color -->
      <div class="flex items-center gap-2">
        <label for="box-color" class="text-xs font-medium text-slate-500 uppercase tracking-wider">{dict.canvas.boxColor}</label>
        <input
          id="box-color"
          type="color"
          bind:value={$shadowStore.canvas.boxColor}
          class="w-8 h-8 rounded cursor-pointer border-0 p-0 min-w-[44px] min-h-[44px]"
        />
      </div>
    {/if}

    <!-- Border Radius -->
    <div class="flex items-center gap-2 flex-1 min-w-[150px]">
      <label for="border-radius" class="text-xs font-medium text-slate-500 uppercase tracking-wider shrink-0">{dict.canvas.borderRadius}</label>
      <input
        id="border-radius"
        type="range"
        min="0" max="150"
        bind:value={$shadowStore.canvas.borderRadius}
        class="flex-1 w-full accent-indigo-600 min-h-[44px]"
      />
    </div>
  </div>
</div>
