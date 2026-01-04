<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  import Prism from 'prismjs';
  import 'prismjs/components/prism-json';
  import 'prismjs/components/prism-typescript';
  import 'prismjs/components/prism-go';
  import 'prismjs/themes/prism-tomorrow.css'; // Dark theme usually looks pro

  export let content: string = '';
  export let language: string = 'json';

  let codeElement: HTMLElement;

  function highlight() {
    if (codeElement) {
      Prism.highlightElement(codeElement);
    }
  }

  onMount(() => {
    highlight();
  });

  afterUpdate(() => {
    highlight();
  });
</script>

<div class="relative w-full h-full min-h-[400px] border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-[#2d2d2d] shadow-sm">
  <pre class="!m-0 !p-4 !bg-transparent h-full overflow-auto text-sm"><code bind:this={codeElement} class="language-{language}">{content}</code></pre>
</div>
