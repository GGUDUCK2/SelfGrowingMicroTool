<script lang="ts">
  import Prism from 'prismjs';
  import 'prismjs/components/prism-sql';
  import 'prismjs/themes/prism-tomorrow.css';
  import { createEventDispatcher } from 'svelte';

  export let value: string = '';
  export let placeholder: string = 'SELECT * FROM ...';

  const dispatch = createEventDispatcher();
  let textarea: HTMLTextAreaElement;

  $: highlightedCode = Prism.highlight(
    value || '',
    Prism.languages.sql || Prism.languages.plain,
    'sql'
  );

  function handleInput(e: Event) {
    value = (e.target as HTMLTextAreaElement).value;
  }

  function handleKeydown(e: KeyboardEvent) {
    // Tab handling
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      value = value.substring(0, start) + '  ' + value.substring(end);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
    // Ctrl+Enter to run
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        dispatch('run');
    }
  }
</script>

<div class="relative w-full h-full min-h-[200px] border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-[#2d2d2d] font-mono text-sm group focus-within:ring-2 ring-indigo-500/50 transition-all">
  <textarea
    bind:this={textarea}
    class="absolute inset-0 w-full h-full p-4 bg-transparent text-transparent caret-white resize-none outline-none z-10 font-mono leading-relaxed selection:bg-indigo-500/30"
    spellcheck="false"
    {placeholder}
    value={value}
    on:input={handleInput}
    on:keydown={handleKeydown}
  ></textarea>
  <pre
    class="absolute inset-0 w-full h-full p-4 m-0 pointer-events-none overflow-hidden font-mono leading-relaxed"
    aria-hidden="true"><code class="language-sql">{@html highlightedCode}</code></pre>
</div>

<style>
  /* Match font settings exactly between textarea and pre */
  textarea, pre, code {
    font-family: 'Fira Code', 'Consolas', monospace;
    font-size: 14px;
    line-height: 1.5;
  }
</style>
