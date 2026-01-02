<script lang="ts">
  import { onMount } from 'svelte';

  export let value: string = '';
  export let placeholder: string = '';
  export let readonly: boolean = false;

  let textarea: HTMLTextAreaElement;

  function handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    value = target.value;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      value = value.substring(0, start) + '  ' + value.substring(end);
      // Wait for update then set cursor
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  }
</script>

<div class="relative w-full h-full min-h-[400px] border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col bg-white dark:bg-gray-800 shadow-sm">
  <div class="flex-1 relative">
      <textarea
        bind:this={textarea}
        {value}
        on:input={handleInput}
        on:keydown={handleKeydown}
        {placeholder}
        {readonly}
        class="w-full h-full p-4 font-mono text-sm bg-transparent border-none resize-none focus:ring-0 focus:outline-none dark:text-gray-100"
        spellcheck="false"
      ></textarea>
  </div>
</div>
