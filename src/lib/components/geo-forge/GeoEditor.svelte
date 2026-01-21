<script lang="ts">
  import { onMount } from 'svelte';

  export let value = '';
  export let placeholder = '';
  export let readonly = false;
  export let format = 'wkt'; // For syntax highlighting hints (future)

  let textarea: HTMLTextAreaElement;

  // Auto-resize or just fixed height? Fixed height with scroll is better for large data.
</script>

<div class="relative w-full h-full font-mono text-sm">
  <textarea
    bind:this={textarea}
    bind:value
    {placeholder}
    {readonly}
    class="w-full h-full p-4 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 resize-none border-0 focus:ring-0 focus:outline-none"
    spellcheck="false"
  ></textarea>

  <div class="absolute bottom-2 right-2 px-2 py-1 bg-white/80 dark:bg-black/50 backdrop-blur rounded text-xs text-slate-500 font-bold pointer-events-none uppercase">
    {format}
  </div>
</div>
