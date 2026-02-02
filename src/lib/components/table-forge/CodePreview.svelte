<script lang="ts">
  import { onMount } from 'svelte';

  export let code = '';
  export let language = 'markdown';

  let Prism: any;
  let highlighted = '';

  onMount(async () => {
      // Dynamic import to avoid SSR issues
      const prismModule = await import('prismjs');
      Prism = prismModule.default;

      // Import languages
      await import('prismjs/components/prism-markdown');
      await import('prismjs/components/prism-json');
      await import('prismjs/components/prism-sql');
      await import('prismjs/components/prism-latex');
      await import('prismjs/components/prism-markup'); // HTML
      // Theme
      await import('prismjs/themes/prism-tomorrow.css');

      update();
  });

  $: {
      code;
      language;
      if (Prism) update();
  }

  function update() {
      try {
          const langMap: Record<string, string> = {
              'markdown': 'markdown',
              'json': 'json',
              'sql': 'sql',
              'latex': 'latex',
              'html': 'markup',
              'csv': 'text', // Prism doesn't standardly have CSV, text is fine
              'ascii': 'text'
          };
          const prismLang = langMap[language] || 'text';

          if (Prism.languages[prismLang]) {
              highlighted = Prism.highlight(code, Prism.languages[prismLang], prismLang);
          } else {
              highlighted = escapeHtml(code);
          }
      } catch (e) {
          console.warn('Highlight error', e);
          highlighted = escapeHtml(code);
      }
  }

  function escapeHtml(text: string) {
      if (!text) return '';
      return text.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
  }
</script>

<div class="h-full w-full overflow-auto bg-[#2d2d2d] text-white p-4 font-mono text-sm leading-relaxed whitespace-pre rounded-lg shadow-inner">
    {@html highlighted}
</div>
