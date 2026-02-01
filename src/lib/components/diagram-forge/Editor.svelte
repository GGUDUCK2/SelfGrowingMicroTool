<script lang="ts">
  export let value: string;
  export let placeholder: string = '';

  let textarea: HTMLTextAreaElement;

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      value = value.substring(0, start) + '  ' + value.substring(end);
      setTimeout(() => {
        if (textarea) {
            textarea.selectionStart = textarea.selectionEnd = start + 2;
        }
      }, 0);
    }
  }
</script>

<div class="relative w-full h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
  <textarea
    bind:this={textarea}
    class="w-full h-full p-4 bg-transparent text-slate-800 dark:text-slate-200 resize-none outline-none font-mono text-sm leading-relaxed border-none focus:ring-0"
    spellcheck="false"
    {placeholder}
    bind:value
    on:keydown={handleKeydown}
  ></textarea>
</div>
