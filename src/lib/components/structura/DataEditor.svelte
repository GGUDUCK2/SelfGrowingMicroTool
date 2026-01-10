<script lang="ts">
  import { onMount } from 'svelte';
  import Prism from 'prismjs';
  import 'prismjs/components/prism-json';
  import 'prismjs/components/prism-yaml';
  import 'prismjs/components/prism-xml-doc';
  import 'prismjs/components/prism-csv';
  import 'prismjs/themes/prism-tomorrow.css';

  export let value: string;
  export let language: string = 'json';
  export let readonly: boolean = false;
  export let placeholder: string = '';

  let textarea: HTMLTextAreaElement;
  let pre: HTMLPreElement;

  $: if (textarea && value !== undefined) {
    // Sync textarea height
  }

  $: highlightedCode = Prism.highlight(
    value || '',
    Prism.languages[language] || Prism.languages.plain,
    language
  );

  function handleInput(e: Event) {
    value = (e.target as HTMLTextAreaElement).value;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      value = value.substring(0, start) + '  ' + value.substring(end);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  }
</script>

<div class="relative w-full h-full min-h-[400px] border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-[#2d2d2d] font-mono text-sm">
  <textarea
    bind:this={textarea}
    class="absolute inset-0 w-full h-full p-4 bg-transparent text-transparent caret-white resize-none outline-none z-10 font-mono leading-relaxed"
    spellcheck="false"
    {readonly}
    {placeholder}
    value={value}
    on:input={handleInput}
    on:keydown={handleKeydown}
  ></textarea>
  <pre
    bind:this={pre}
    class="absolute inset-0 w-full h-full p-4 m-0 pointer-events-none overflow-hidden font-mono leading-relaxed"
    aria-hidden="true"><code class="language-{language}">{@html highlightedCode}</code></pre>
</div>

<style>
  /* Match font settings exactly between textarea and pre */
  textarea, pre, code {
    font-family: 'Fira Code', 'Consolas', monospace;
    font-size: 14px;
    line-height: 1.5;
  }
</style>
