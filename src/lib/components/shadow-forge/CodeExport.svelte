<script lang="ts">
  import { shadowStore, generateShadowCSS, getNeumorphismBackground } from '$lib/utils/shadow-forge/store';
  import { Copy, Save, Check } from '@lucide/svelte';
  import { createEventDispatcher } from 'svelte';

  export let dict: any;

  const dispatch = createEventDispatcher();

  let copiedCss = false;
  let copiedTailwind = false;

  $: config = $shadowStore;
  $: cssShadow = generateShadowCSS(config);

  function copyCss() {
      const isNeumorphism = config.mode === 'neumorphism';
      const bgStyle = isNeumorphism ? getNeumorphismBackground(config.neumorphismConfig, config.canvas.bgColor) : config.canvas.boxColor;

      const code = `.shadow-box {
  width: ${config.canvas.width}px;
  height: ${config.canvas.height}px;
  border-radius: ${config.canvas.borderRadius}px;
  background: ${bgStyle};
  box-shadow: ${cssShadow};
}`;
      navigator.clipboard.writeText(code);
      copiedCss = true;
      setTimeout(() => copiedCss = false, 2000);
  }

  function copyTailwind() {
      const code = `// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      boxShadow: {
        'custom': '${cssShadow.replace(/\n\s*/g, ' ')}'
      }
    }
  }
}`;
      navigator.clipboard.writeText(code);
      copiedTailwind = true;
      setTimeout(() => copiedTailwind = false, 2000);
  }

  function handleSave() {
      dispatch('save');
  }
</script>

<div class="h-64 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 relative z-10">
    <div class="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <div class="flex space-x-2">
            <button class="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm flex items-center gap-2 min-h-[44px] min-w-[44px] transition-colors" on:click={copyCss}>
                {#if copiedCss}
                    <Check size={16} /> {dict.export.copied}
                {:else}
                    <Copy size={16} /> {dict.export.copyCss}
                {/if}
            </button>
            <button class="px-4 py-2 text-sm font-medium bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg shadow-sm flex items-center gap-2 min-h-[44px] min-w-[44px] transition-colors" on:click={copyTailwind}>
                {#if copiedTailwind}
                    <Check size={16} /> {dict.export.copied}
                {:else}
                    <Copy size={16} /> {dict.export.copyTailwind}
                {/if}
            </button>
        </div>
        <button class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-2 min-h-[44px] min-w-[44px]" on:click={handleSave}>
            <Save size={16} /> {dict.export.save}
        </button>
    </div>

    <div class="flex-1 overflow-auto bg-slate-900 text-slate-300 p-4 font-mono text-sm leading-relaxed custom-scrollbar relative">
        <pre><code><span class="text-indigo-400">.shadow-box</span> {'{'}
  <span class="text-blue-300">width</span>: <span class="text-emerald-400">{config.canvas.width}px</span>;
  <span class="text-blue-300">height</span>: <span class="text-emerald-400">{config.canvas.height}px</span>;
  <span class="text-blue-300">border-radius</span>: <span class="text-emerald-400">{config.canvas.borderRadius}px</span>;
  <span class="text-blue-300">background</span>: <span class="text-amber-300">{config.mode === 'neumorphism' ? getNeumorphismBackground(config.neumorphismConfig, config.canvas.bgColor) : config.canvas.boxColor}</span>;
  <span class="text-blue-300">box-shadow</span>: <span class="text-pink-300">{cssShadow}</span>;
}</code></pre>
    </div>
</div>

<style lang="postcss">
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    @apply bg-slate-700 rounded-full;
  }
  .custom-scrollbar:hover::-webkit-scrollbar-thumb {
    @apply bg-slate-600;
  }
</style>
