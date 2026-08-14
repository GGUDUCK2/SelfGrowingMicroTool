<script lang="ts">
  import { onMount } from 'svelte';
  import Prism from 'prismjs';
  // Import basic languages
  import 'prismjs/components/prism-javascript';
  import 'prismjs/components/prism-typescript';
  import 'prismjs/components/prism-css';
  import 'prismjs/components/prism-python';
  import 'prismjs/components/prism-java';
  import 'prismjs/components/prism-c';
  import 'prismjs/components/prism-cpp';
  import 'prismjs/components/prism-csharp';
  import 'prismjs/components/prism-go';
  import 'prismjs/components/prism-rust';
  import 'prismjs/components/prism-sql';
  import 'prismjs/components/prism-json';
  import 'prismjs/components/prism-yaml';
  import 'prismjs/components/prism-markdown';
  import 'prismjs/components/prism-bash';
  import 'prismjs/components/prism-markup'; // HTML

  export let code = '';
  export let language = 'javascript';
  export let fontSize = 14;
  export let fontFamily = 'monospace';

  let highlightedCode = '';
  let textarea: HTMLTextAreaElement;
  let pre: HTMLElement;

  $: {
    if (code !== undefined) {
        try {
            // Mapping for common aliases
            let lang = language;
            if (lang === 'html') lang = 'markup';

            const grammar = Prism.languages[lang] || Prism.languages.plaintext;
            // Add a zero-width space to empty lines to ensure they render height
            const normalizedCode = code.endsWith('\n') ? code + ' ' : code;
            highlightedCode = Prism.highlight(normalizedCode, grammar, lang);
        } catch (e) {
            console.warn('Prism highlight error', e);
            highlightedCode = Prism.util.encode(code);
        }
    }
  }

  function handleInput() {
      resize();
  }

  function resize() {
      if (textarea && pre) {
          // Reset height to shrink if needed
          textarea.style.height = '0px';

          const height = textarea.scrollHeight;
          textarea.style.height = height + 'px';
          // Pre should match
          // pre.style.height = height + 'px';
      }
  }

  onMount(() => {
      resize();
      // Need to handle theme loading globally or scoped?
      // For now assume global styles or imported in parent.
  });

  $: if (code || fontSize || fontFamily) {
      if (typeof window !== 'undefined') setTimeout(resize, 0);
  }
</script>

<div class="relative w-full min-h-[100px]" style="font-family: {fontFamily}; font-size: {fontSize}px;">
  <!-- Highlighted Code (Background) -->
  <pre
    bind:this={pre}
    class="block w-full h-full m-0 p-4 overflow-hidden whitespace-pre-wrap break-words pointer-events-none"
    style="min-height: 100%; color: inherit; background: transparent;"
  ><code class="language-{language}">{@html highlightedCode}</code></pre>

  <!-- Editable Area (Foreground) -->
  <textarea
    bind:this={textarea}
    bind:value={code}
    on:input={handleInput}
    class="absolute inset-0 w-full h-full p-4 resize-none bg-transparent text-transparent caret-white border-0 outline-none focus:ring-0 whitespace-pre-wrap break-words overflow-hidden"
    spellcheck="false"
    autocapitalize="off"
    autocomplete="off"

    style="color: transparent; background: transparent;"
  ></textarea>
</div>

<style>
  textarea, pre, code {
    font-family: inherit;
    font-size: inherit;
    line-height: 1.5;
    tab-size: 2;
  }

  /* Ensure prism classes don't override our layout */
  :global(pre[class*="language-"]) {
      padding: 1rem !important;
      margin: 0 !important;
      background: transparent !important;
      text-shadow: none !important;
      box-shadow: none !important;
  }

  :global(code[class*="language-"], pre[class*="language-"]) {
      text-shadow: none !important;
  }
</style>
