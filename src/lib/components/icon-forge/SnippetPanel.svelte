<script lang="ts">
  import { Copy, Check, Terminal } from 'lucide-svelte';
  import { IconProcessor, type IconConfig } from '$lib/utils/icon-forge/processor';
  import type { IconForgeDictionary } from '$lib/types/icon-forge';

  export let file: File | null;
  export let config: IconConfig;
  export let t: IconForgeDictionary;

  let base64 = '';
  let activeTab: 'html' | 'manifest' | 'base64' = 'html';
  let copied = false;

  $: if (file) {
      generateBase64(file, config);
  }

  async function generateBase64(f: File, c: IconConfig) {
      if (!f) return;
      try {
          const img = new Image();
          const url = URL.createObjectURL(f);
          img.src = url;
          await new Promise((resolve) => img.onload = resolve);

          const blob = await IconProcessor.createPng(img, 32, c);

          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
              base64 = reader.result as string;
          };
          URL.revokeObjectURL(url);
      } catch (e) {
          console.error(e);
      }
  }

  $: htmlSnippet = `<!-- PWA & Favicons -->
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/icon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/icon-16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="${config.background}">`;

  $: manifestSnippet = JSON.stringify({
      name: config.name || 'My PWA',
      short_name: config.shortName || 'PWA',
      icons: [
        { src: "/icon-192.png", type: "image/png", sizes: "192x192" },
        { src: "/icon-512.png", type: "image/png", sizes: "512x512" },
        { src: "/maskable-icon.png", type: "image/png", sizes: "512x512", purpose: "maskable" }
      ],
      theme_color: config.background,
      background_color: config.background,
      display: "standalone"
  }, null, 2);

  function copyToClipboard(text: string) {
      navigator.clipboard.writeText(text);
      copied = true;
      setTimeout(() => copied = false, 2000);
  }
</script>

<div class="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-lg">
  <div class="flex items-center justify-between mb-6">
    <h3 class="text-lg font-medium text-slate-200 flex items-center">
        <Terminal class="w-5 h-5 mr-2 text-indigo-400" />
        {t.snippets.title}
    </h3>
  </div>

  <!-- Tabs -->
  <div class="flex space-x-1 mb-4 bg-slate-900/50 p-1 rounded-lg">
      <button
        type="button"
        class="flex-1 py-1.5 text-xs font-medium rounded-md transition-colors {activeTab === 'html' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}"
        on:click={() => activeTab = 'html'}>
        {t.snippets.html}
      </button>
      <button
        type="button"
        class="flex-1 py-1.5 text-xs font-medium rounded-md transition-colors {activeTab === 'manifest' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}"
        on:click={() => activeTab = 'manifest'}>
        {t.snippets.manifest}
      </button>
      <button
        type="button"
        class="flex-1 py-1.5 text-xs font-medium rounded-md transition-colors {activeTab === 'base64' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}"
        on:click={() => activeTab = 'base64'}>
        {t.snippets.base64}
      </button>
  </div>

  <div class="relative group">
      <pre class="w-full h-48 bg-slate-900 rounded-lg p-4 text-xs font-mono text-slate-300 overflow-auto border border-slate-700/50 custom-scrollbar">
{#if activeTab === 'html'}
{htmlSnippet}
{:else if activeTab === 'manifest'}
{manifestSnippet}
{:else}
{base64 || 'Generating...'}
{/if}
      </pre>

      <button
        type="button"
        class="absolute top-2 right-2 p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
        on:click={() => copyToClipboard(activeTab === 'html' ? htmlSnippet : activeTab === 'manifest' ? manifestSnippet : base64)}
        aria-label={t.snippets.copy}
      >
        {#if copied}
            <Check class="w-4 h-4 text-green-400" />
        {:else}
            <Copy class="w-4 h-4" />
        {/if}
      </button>
  </div>
</div>

<style>
    .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: #0f172a;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #334155;
        border-radius: 4px;
    }
</style>
