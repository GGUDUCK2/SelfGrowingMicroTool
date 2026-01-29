<script lang="ts">
  import { animationStore, previewStore, isPlaying } from '$lib/utils/motion-master/store';
  import { generateCSS } from '$lib/utils/motion-master/generator';

  let css = '';
  let styleTag = '';

  // Reactively generate CSS
  $: css = generateCSS($animationStore);
  // Obfuscate style tag to prevent vite-plugin-svelte from processing it as a style block
  $: styleTag = '<' + 'style>' + css + '</' + 'style>';

  // Toggle play/pause by toggling class
  let animationClass = '';
  $: animationClass = $isPlaying ? `animate-${$animationStore.name}` : '';

</script>

<div class="w-full h-full flex items-center justify-center relative overflow-hidden transition-colors duration-300 rounded-xl border border-slate-200 dark:border-slate-700" style="background-color: {$previewStore.bgColor}">

  <!-- Injected Styles -->
  {@html styleTag}

  <!-- Grid Background -->
  <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: radial-gradient(#64748b 1px, transparent 1px); background-size: 20px 20px;"></div>

  <!-- The Element -->
  {#if $previewStore.type === 'box'}
    <div
        class="{animationClass} w-32 h-32 rounded-lg shadow-xl"
        style="background-color: {$previewStore.color};"
    ></div>
  {:else if $previewStore.type === 'circle'}
    <div
        class="{animationClass} w-32 h-32 rounded-full shadow-xl"
        style="background-color: {$previewStore.color};"
    ></div>
  {:else if $previewStore.type === 'text'}
    <h1
        class="{animationClass} text-4xl font-bold"
        style="color: {$previewStore.color};"
    >
      {$previewStore.content || 'Motion'}
    </h1>
  {:else if $previewStore.type === 'image'}
     <div class="{animationClass} w-32 h-32 bg-contain bg-center bg-no-repeat" style="background-image: url('{$previewStore.content || '/favicon.png'}');"></div>
  {/if}

</div>
