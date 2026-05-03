<script lang="ts">
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import Head from '$lib/components/Head.svelte';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { getDictionary } from '$lib/dictionaries';
  import JsonEditor from '$lib/components/json-architect/JsonEditor.svelte';
  import JsonViewer from '$lib/components/json-architect/JsonViewer.svelte';
  import JsonTree from '$lib/components/json-architect/JsonTree.svelte';
  import Toolbar from '$lib/components/json-architect/Toolbar.svelte';
  import History from '$lib/components/json-architect/History.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import Button from '$lib/components/Button.svelte';
  import { validateJson, formatJson, minifyJson, jsonToTypescript, jsonToGo } from '$lib/utils/json';
  import { db } from '$lib/db';

  import { browser } from '$app/environment';

  $: lang = $page.params.lang || 'en';
  $: t = (getDictionary(lang) || getDictionary('en')).tools?.jsonArchitect || getDictionary('en').tools.jsonArchitect;

  let input = '';
  $: isTooLarge = input.length > 50000;
  $: if (isTooLarge && view === 'tree') view = 'text';
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

  $: schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
        "@id": "https://selfgrowingmicrotool.com/" + lang + "/tools/json-architect",
        "isAccessibleForFree": true,
    "name": t.title,
    "description": t.description,
    "applicationCategory": "DeveloperApplication",
    "applicationSubCategory": "JSON Utility",
    "operatingSystem": "Web, iOS, Android, Linux, Windows, macOS",
    "browserRequirements": "Requires JavaScript. HTML5.",
    "featureList": "Format JSON, Minify JSON, Validate JSON, Convert JSON to TypeScript, Convert JSON to Go, Visual Tree View",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "datePublished": "2023-10-15",
    "screenshot": "https://selfgrowingmicrotool.com/og/json-architect.png",
    "author": {
        "@type": "Organization",
        "name": "MicroFactory"
    }
  };

  $: breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [{
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://selfgrowingmicrotool.com/"
    }, {
      "@type": "ListItem",
      "position": 2,
      "name": "Tools",
      "item": "https://selfgrowingmicrotool.com/tools"
    }, {
      "@type": "ListItem",
      "position": 3,
      "name": t.title,
      "item": `https://selfgrowingmicrotool.com/${lang}/tools/json-architect`
    }]
  };

  $: faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": t?.q1,
        "acceptedAnswer": { "@type": "Answer", "text": t?.a1 }
      },
      {
        "@type": "Question",
        "name": t?.q2,
        "acceptedAnswer": { "@type": "Answer", "text": t?.a2 }
      },
      {
        "@type": "Question",
        "name": t?.q3,
        "acceptedAnswer": { "@type": "Answer", "text": t?.a3 }
      }
    ]
  };

</script>
<Head
  title={t.title}
  description={t.description}
/>


<svelte:head>
  {@html '<script type="application/ld+json">' + JSON.stringify(schema) + '</script>'}
  {@html '<script type="application/ld+json">' + JSON.stringify(breadcrumbSchema) + '</script>'}
  {@html '<script type="application/ld+json">' + JSON.stringify(faqSchema) + '</script>'}
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-slate-900 dark:text-slate-100 sm:text-4xl">{t.title}</h1>
    <p class="mt-2 text-lg text-slate-600 dark:text-slate-400">{t.description}</p>
  </div>

  <div class="sticky top-0 z-30 bg-slate-900/95 backdrop-blur py-2 shadow-sm">
      <Toolbar {t} on:action={handleAction} />
  </div>

  <div class="flex flex-col lg:flex-row gap-6 min-h-[500px] lg:min-h-[calc(100vh-14rem)]">
      <!-- Input Column -->
      <section class="flex-1 flex flex-col gap-2" aria-label={t.input}>
          <div class="flex justify-between items-center">
             <label for="json-input" class="text-sm font-semibold text-slate-300">{t.input}</label>
             {#if error}
                <span class="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">{error}</span>
             {:else if parsedData}
                <span class="text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">{t.validJson}</span>
             {/if}
          </div>
          <JsonEditor id="json-input" bind:value={input} placeholder={t.input} />
      </section>

      <!-- Divider -->
      <div class="hidden lg:block w-px bg-slate-600 self-stretch"></div>

      <!-- Output Column -->
      <section class="flex-1 flex flex-col gap-2" aria-label={t.output}>
          <div class="flex justify-between items-center">
             <label for="json-output" class="text-sm font-semibold text-slate-300">
                {t.output}
                {#if mode !== 'json'}
                  <span class="ml-2 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-xs text-slate-500">{mode.toUpperCase()}</span>
                {/if}
             </label>
             <div class="flex gap-2">
                 <Button
                   on:click={() => view = 'text'}
                   class={view === 'text' ? 'min-h-[44px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' : 'min-h-[44px]'}
                 >
                    {t.textView}
                 </Button>
                 {#if mode === 'json' && parsedData}
                 <Button
                   on:click={() => view = 'tree'}
                   disabled={isTooLarge}
                   title={isTooLarge ? 'JSON too large for tree view' : ''}
                   class={view === 'tree' ? 'min-h-[44px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' : 'min-h-[44px]'}
                 >
                    {t.treeView}
                 </Button>
                 {/if}
             </div>
          </div>

          {#if view === 'tree' && parsedData}
             <div class="relative w-full h-full min-h-[300px] sm:min-h-[400px] border border-slate-200 dark:border-slate-700 rounded-lg overflow-auto bg-white dark:bg-slate-800 shadow-sm p-4">
                 <JsonTree data={parsedData} />
             </div>
          {:else}
             <JsonViewer content={output || input} language={mode} />
          {/if}
      </section>
  </div>

  <History {t} on:restore={handleRestore} />

  <!-- FAQ Section -->
  <div class="mt-16">
      <FAQSection title={t.faqTitle} items={[
        { q: t?.q1, a: t?.a1 },
        { q: t?.q2, a: t?.a2 },
        { q: t?.q3, a: t?.a3 }
      ]} />
  </div>

  <section class="mt-12 mb-8">
     <h3 class="text-lg font-bold mb-4 text-slate-900 dark:text-slate-100">Related Tools</h3>
     <div class="flex gap-4 items-center">
         <a href="/{lang}/tools/diff-viewer" class="inline-flex items-center justify-center min-h-[44px] min-w-[44px] text-indigo-600 dark:text-indigo-400 hover:underline">Diff Viewer</a>
         <span class="text-slate-300">|</span>
         <a href="/{lang}/tools/schema-forge" class="inline-flex items-center justify-center min-h-[44px] min-w-[44px] text-indigo-600 dark:text-indigo-400 hover:underline">Schema Forge</a>
     </div>
  </section>


  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-20">
    <RelatedTools {lang} currentSlug="json-architect" currentCategory="dev" />
  </div>
</div>
