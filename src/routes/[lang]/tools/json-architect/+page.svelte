<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { getDictionary } from '$lib/dictionaries';
  import JsonEditor from '$lib/components/json-architect/JsonEditor.svelte';
  import JsonViewer from '$lib/components/json-architect/JsonViewer.svelte';
  import JsonTree from '$lib/components/json-architect/JsonTree.svelte';
  import Toolbar from '$lib/components/json-architect/Toolbar.svelte';
  import History from '$lib/components/json-architect/History.svelte';
  import { validateJson, formatJson, minifyJson, jsonToTypescript, jsonToGo } from '$lib/utils/json';
  import { db } from '$lib/db';

  import { browser } from '$app/environment';

  $: lang = $page.params.lang || 'en';
  $: t = (getDictionary(lang) || getDictionary('en')).tools?.jsonArchitect || getDictionary('en').tools.jsonArchitect;

  let input = '';
  let output = '';
  let mode: 'json' | 'typescript' | 'go' = 'json';
  let view: 'text' | 'tree' = 'text';
  let error: string | null = null;
  let parsedData: any = null;

  function updateState(newInput: string) {
      input = newInput;
      const validation = validateJson(input);
      if (validation.isValid) {
          error = null;
          parsedData = JSON.parse(input);
          // If in text mode and json output, auto-update output?
          // No, usually user wants to trigger action. But maybe live preview?
          // Let's keep output manual or synced for Tree View.
      } else {
          error = validation.error || 'Invalid JSON';
          parsedData = null;
      }

      // Debounced URL sync
      debounceUrlSync(newInput);
  }

  $: updateState(input);

  // Initial load from URL or default
  onMount(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const shared = urlParams.get('state');
      if (shared) {
          try {
              input = decodeURIComponent(shared);
          } catch {}
      } else {
          // Default example
          input = '{\n  "name": "MicroFactory",\n  "active": true,\n  "features": ["Svelte", "Tailwind", "Dexie"],\n  "stats": {\n    "users": 1000,\n    "rating": 4.9\n  }\n}';
      }
  });

  let debounceTimer: any;
  function debounceUrlSync(val: string) {
      if (!browser) return;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
          const url = new URL(window.location.href);
          if (val && val.length < 2000) { // Limit URL length
             url.searchParams.set('state', encodeURIComponent(val));
          } else {
             url.searchParams.delete('state');
          }
          window.history.replaceState({}, '', url);
      }, 500);
  }

  async function handleAction(e: CustomEvent<string>) {
      const action = e.detail;

      if (action === 'clear') {
          input = '';
          output = '';
          error = null;
          return;
      }

      if (action === 'restore') {
           // handled by History component event
           return;
      }

      if (!input.trim()) return;

      if (action === 'share') {
           const url = window.location.href;
           navigator.clipboard.writeText(url);
           // Show toast? relying on button text change handled in Toolbar if possible,
           // but Toolbar is dumb. Let's send a prop or assume simple alert for now/Toolbar handles visual feedback.
           // Actually Toolbar handles 'copied!' state for copy button, but maybe not share.
           alert(t.linkCopied); // Fallback for now.
           return;
      }

      if (action === 'copy') {
           navigator.clipboard.writeText(output || input);
           // Toolbar handles visual
           return;
      }

      // For processing actions, validate first
      const v = validateJson(input);
      if (!v.isValid) {
          error = v.error || 'Invalid JSON';
          return;
      }

      let result = '';
      let type: 'format' | 'minify' | 'validate' | 'convert' = 'format';

      if (action === 'format') {
          result = formatJson(input);
          input = result; // Update input as well for editor
          output = result;
          mode = 'json';
          view = 'text';
          type = 'format';
      } else if (action === 'minify') {
          result = minifyJson(input);
          output = result;
          mode = 'json';
          view = 'text';
          type = 'minify';
      } else if (action === 'validate') {
          // Already validated
          output = t.validJson; // Or just show success indicator
          mode = 'json'; // strictly it is just a message
          type = 'validate';
      } else if (action === 'toTs') {
          result = jsonToTypescript(input);
          output = result;
          mode = 'typescript';
          view = 'text';
          type = 'convert';
      } else if (action === 'toGo') {
          result = jsonToGo(input);
          output = result;
          mode = 'go';
          view = 'text';
          type = 'convert';
      }

      // Save to history
      try {
          await db.jsonHistory.add({
              content: input,
              action: type,
              createdAt: new Date()
          });
      } catch (err) {
          console.error('Failed to save history', err);
      }
  }

  function handleRestore(e: CustomEvent<string>) {
      input = e.detail;
  }

</script>

<svelte:head>
  <title>{t.title} - MicroFactory</title>
  <meta name="description" content={t.description} />
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "JSON Architect",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    }
  </script>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 sm:text-4xl">{t.title}</h1>
    <p class="mt-2 text-lg text-gray-600 dark:text-gray-400">{t.description}</p>
  </div>

  <Toolbar {t} on:action={handleAction} />

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[600px]">
      <!-- Input Column -->
      <div class="flex flex-col gap-2">
          <div class="flex justify-between items-center">
             <label for="json-input" class="text-sm font-medium text-gray-700 dark:text-gray-300">{t.input}</label>
             {#if error}
                <span class="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">{error}</span>
             {:else if parsedData}
                <span class="text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">{t.validJson}</span>
             {/if}
          </div>
          <JsonEditor bind:value={input} placeholder={t.input} />
      </div>

      <!-- Output Column -->
      <div class="flex flex-col gap-2">
          <div class="flex justify-between items-center">
             <label for="json-output" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.output}
                {#if mode !== 'json'}
                  <span class="ml-2 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-xs text-gray-500">{mode.toUpperCase()}</span>
                {/if}
             </label>
             <div class="flex gap-2">
                 <button
                   on:click={() => view = 'text'}
                   class="text-xs px-2 py-1 rounded {view === 'text' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'text-gray-500'}"
                 >
                    {t.textView}
                 </button>
                 {#if mode === 'json' && parsedData}
                 <button
                   on:click={() => view = 'tree'}
                   class="text-xs px-2 py-1 rounded {view === 'tree' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'text-gray-500'}"
                 >
                    {t.treeView}
                 </button>
                 {/if}
             </div>
          </div>

          {#if view === 'tree' && parsedData}
             <div class="relative w-full h-full min-h-[400px] border border-gray-200 dark:border-gray-700 rounded-lg overflow-auto bg-white dark:bg-gray-800 shadow-sm p-4">
                 <JsonTree data={parsedData} />
             </div>
          {:else}
             <JsonViewer content={output || input} language={mode} />
          {/if}
      </div>
  </div>

  <History {t} on:restore={handleRestore} />

  <!-- FAQ Section -->
  <section class="mt-16 border-t border-gray-200 dark:border-gray-700 pt-12">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">{t.faqTitle}</h2>
    <div class="grid gap-8 md:grid-cols-2">
      <div>
        <h3 class="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">{t.q1}</h3>
        <p class="text-gray-600 dark:text-gray-400">{t.a1}</p>
      </div>
      <div>
        <h3 class="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">{t.q2}</h3>
        <p class="text-gray-600 dark:text-gray-400">{t.a2}</p>
      </div>
      <div>
        <h3 class="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">{t.q3}</h3>
        <p class="text-gray-600 dark:text-gray-400">{t.a3}</p>
      </div>
    </div>
  </section>

  <section class="mt-12 mb-8">
     <!-- Related Tools (Simple Placeholder or Dynamic) -->
     <h3 class="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Related Tools</h3>
     <div class="flex gap-4">
         <a href="/{lang}/tools/glassmorphism-generator" class="text-indigo-600 dark:text-indigo-400 hover:underline">Glassmorphism Generator</a>
         <span class="text-gray-300">|</span>
         <a href="/{lang}/tools/pomodoro-timer" class="text-indigo-600 dark:text-indigo-400 hover:underline">Pomodoro Timer</a>
     </div>
  </section>
</div>
