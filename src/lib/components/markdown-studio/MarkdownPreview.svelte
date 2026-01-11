<script lang="ts">
  import { onMount } from 'svelte';
  import { marked } from 'marked';
  import DOMPurify from 'dompurify';
  import Prism from 'prismjs';
  import 'prismjs/themes/prism-tomorrow.css';
  import 'prismjs/components/prism-typescript';
  import 'prismjs/components/prism-javascript';
  import 'prismjs/components/prism-css';
  import 'prismjs/components/prism-json';
  import 'prismjs/components/prism-bash';
  import 'prismjs/components/prism-python';
  import 'prismjs/components/prism-go';
  import 'prismjs/components/prism-markdown';

  export let content: string = "";

  let html: string = "";

  // Configure marked options
  marked.setOptions({
    gfm: true,
    breaks: true
  });

  $: {
    if (content) {
      parseMarkdown(content);
    } else {
      html = "";
    }
  }

  async function parseMarkdown(markdown: string) {
    try {
      const rawHtml = await marked.parse(markdown);
      const sanitized = DOMPurify.sanitize(rawHtml as string);
      html = sanitized;

      // Apply syntax highlighting after render
      setTimeout(() => {
        Prism.highlightAll();
      }, 0);
    } catch (e) {
      console.error('Markdown parsing error:', e);
      html = '<p class="text-red-500">Error parsing markdown</p>';
    }
  }
</script>

<div class="prose prose-slate dark:prose-invert max-w-none p-6 md:p-8 bg-white dark:bg-slate-900 shadow-sm min-h-full">
  {@html html}
</div>

<style>
  /* Customizing prose for better dark mode and density */
  :global(.prose) {
    font-size: 1rem;
    line-height: 1.75;
  }
  :global(.prose h1), :global(.prose h2), :global(.prose h3) {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    font-weight: 700;
  }
  :global(.prose a) {
    color: #6366f1; /* Indigo-500 */
    text-decoration: none;
  }
  :global(.prose a:hover) {
    text-decoration: underline;
  }
  :global(.prose pre) {
    background-color: #1e293b; /* Slate-800 */
    border-radius: 0.5rem;
    margin-top: 1em;
    margin-bottom: 1em;
  }
  :global(.prose code) {
    color: #ef4444; /* Red-500 for inline code */
    background-color: rgba(226, 232, 240, 0.5); /* Slate-200 with opacity */
    padding: 0.2em 0.4em;
    border-radius: 0.25rem;
    font-size: 0.875em;
    font-weight: 500;
  }
  :global(.dark .prose code) {
    color: #fca5a5; /* Red-300 */
    background-color: rgba(30, 41, 59, 0.5); /* Slate-800 with opacity */
  }
  :global(.prose pre code) {
    color: inherit;
    background-color: transparent;
    padding: 0;
  }
  :global(.prose img) {
    border-radius: 0.5rem;
  }
  :global(.prose blockquote) {
    border-left-color: #6366f1;
    background-color: #f8fafc; /* Slate-50 */
    padding: 0.5rem 1rem;
    border-radius: 0 0.5rem 0.5rem 0;
  }
  :global(.dark .prose blockquote) {
    background-color: #1e293b;
    color: #cbd5e1;
  }
  :global(.prose table) {
    width: 100%;
    border-collapse: collapse;
  }
  :global(.prose th), :global(.prose td) {
    padding: 0.5rem;
    border: 1px solid #cbd5e1;
  }
  :global(.dark .prose th), :global(.dark .prose td) {
    border-color: #475569;
  }
  :global(.prose th) {
    background-color: #f1f5f9;
  }
  :global(.dark .prose th) {
    background-color: #334155;
  }
</style>
