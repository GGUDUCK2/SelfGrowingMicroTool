<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';

  export let value = '';
  export let placeholder = '';
  export let label = '';
  export let readonly = false;

  const dispatch = createEventDispatcher();

  let textarea: HTMLTextAreaElement;
  let lineNumbers: HTMLDivElement;
  let isScrolling = false;

  function updateLineNumbers() {
    if (!textarea || !lineNumbers) return;
    const lines = value.split('\n').length;
    // Optimize: only update if line count changed to avoid DOM thrashing,
    // though here simplified.
    lineNumbers.innerHTML = Array(lines).fill(0).map((_, i) => `<div>${i + 1}</div>`).join('');
  }

  function handleScroll() {
    if (lineNumbers && textarea) {
      lineNumbers.scrollTop = textarea.scrollTop;
    }
    if (!isScrolling) {
        dispatch('scroll', { scrollTop: textarea.scrollTop });
    }
  }

  $: if (value !== undefined) updateLineNumbers();

  export function scrollTo(top: number) {
      if (textarea && Math.abs(textarea.scrollTop - top) > 1) {
          isScrolling = true;
          textarea.scrollTop = top;
          // Small timeout to prevent feedback loop
          setTimeout(() => isScrolling = false, 50);
      }
  }

  export function getScrollTop() {
      return textarea ? textarea.scrollTop : 0;
  }

  onMount(() => {
    updateLineNumbers();
  });
</script>

<div class="flex flex-col h-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
  {#if label}
    <div class="bg-gray-50 dark:bg-gray-900 px-4 py-2 border-b border-gray-200 dark:border-gray-700 font-medium text-sm text-gray-700 dark:text-gray-300">
      {label}
    </div>
  {/if}
  <div class="relative flex-1 flex overflow-hidden">
    <!-- Line Numbers -->
    <div
      bind:this={lineNumbers}
      class="bg-gray-100 dark:bg-gray-900 text-gray-400 dark:text-gray-500 text-right pr-2 pl-2 pt-2 select-none font-mono text-sm leading-6 overflow-hidden w-12 border-r border-gray-200 dark:border-gray-700"
    ></div>

    <!-- Text Area -->
    <textarea
      bind:this={textarea}
      bind:value
      {placeholder}
      {readonly}
      on:scroll={handleScroll}
      on:input={updateLineNumbers}
      class="flex-1 p-2 font-mono text-sm leading-6 bg-transparent resize-none outline-none dark:text-gray-200 w-full"
      spellcheck="false"
      aria-label={label}
    ></textarea>
  </div>
</div>

<style>
    /* Hide scrollbar for line numbers */
    div::-webkit-scrollbar {
        display: none;
    }
</style>
