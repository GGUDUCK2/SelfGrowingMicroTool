<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import RequestPanel from '$lib/components/restro/RequestPanel.svelte';
  import RequestTabs from '$lib/components/restro/RequestTabs.svelte';
  import ResponsePanel from '$lib/components/restro/ResponsePanel.svelte';
  import HistorySidebar from '$lib/components/restro/HistorySidebar.svelte';
  import { executeRequest, type HttpResponse } from '$lib/utils/restro/client';
  import { generateCurl, generateFetch } from '$lib/utils/restro/code-gen';
  import { db, addToHistory, type RestroRequest } from '$lib/db/restro';
  import { Code, Share2, Menu, X } from 'lucide-svelte';
  import { getDictionary } from '$lib/dictionaries';
  import { page } from '$app/stores';

  // Ensure dict is always available
  $: lang = $page.params.lang || 'en';
  // Fallback to English if dict is missing or loading
  $: dict = (getDictionary(lang) || getDictionary('en')).restro;

  let method = 'GET';
  let url = '';
  let params: { key: string; value: string; enabled: boolean }[] = [];
  let headers: { key: string; value: string; enabled: boolean }[] = [];
  let bodyType: 'none' | 'json' | 'text' | 'form-data' = 'none';
  let bodyContent = '';

  let response: HttpResponse | null = null;
  let loading = false;
  let showSidebar = false;
  let showCodeModal = false;

  function parseUrlParams() {
    try {
        if (!url) return;
        const urlObj = new URL(url);
        const newParams: typeof params = [];
        urlObj.searchParams.forEach((value, key) => {
            newParams.push({ key, value, enabled: true });
        });

        if (newParams.length > 0) {
            params = newParams;
        }
    } catch (e) {
    }
  }

  async function handleSend() {
    if (!url) return;
    loading = true;

    // Construct final URL
    let finalUrl = url;
    try {
       // If URL doesn't start with http, assume https (unless localhost)
       if (!finalUrl.startsWith('http')) {
           finalUrl = 'https://' + finalUrl;
           // If user typed "localhost:5173", we should probably default to http
           if (url.includes('localhost') || url.includes('127.0.0.1')) {
               finalUrl = 'http://' + url;
           }
       }

       const urlObj = new URL(finalUrl);
       params.forEach(p => {
         if (p.enabled && p.key) {
           urlObj.searchParams.append(p.key, p.value);
         }
       });
       finalUrl = urlObj.toString();
    } catch (e) {
       // Invalid URL, let fetch fail
    }

    const reqData: RestroRequest = {
      method,
      url: finalUrl,
      headers: headers.map(h => ({ ...h })),
      params: params.map(p => ({ ...p })),
      bodyType,
      bodyContent,
      timestamp: Date.now()
    };

    response = await executeRequest(
      method,
      finalUrl,
      headers,
      bodyType,
      bodyContent
    );

    // Add to history
    await addToHistory({
       ...reqData,
       status: response.status,
       duration: response.time,
       responseSize: response.size
    });

    loading = false;
  }

  async function handleSave() {
    const name = prompt(dict.save + ':');
    if (name) {
       await db.collections.add({
         method,
         url,
         headers,
         params,
         bodyType,
         bodyContent,
         timestamp: Date.now(),
         name
       });
       alert(dict.save + '!');
    }
  }

  function loadRequest(req: RestroRequest) {
    method = req.method;

    if (req.params && req.params.length > 0) {
        url = req.url.split('?')[0];
        params = req.params;
    } else {
        url = req.url;
        params = [];
        parseUrlParams();
    }

    headers = req.headers || [];
    bodyType = req.bodyType;
    bodyContent = req.bodyContent;

    showSidebar = false;
  }

  // Snippets
  let snippetCurl = '';
  let snippetFetch = '';

  $: {
    const req: RestroRequest = {
        method, url, headers, params, bodyType, bodyContent, timestamp: 0
    };
    // We need constructed URL for snippets
    let finalUrl = url;
    try {
        if (finalUrl && !finalUrl.startsWith('http')) finalUrl = 'https://' + finalUrl;
        const u = new URL(finalUrl || 'http://localhost');
        params.forEach(p => { if (p.enabled && p.key) u.searchParams.append(p.key, p.value); });
        req.url = u.toString();
    } catch {}

    snippetCurl = generateCurl(req);
    snippetFetch = generateFetch(req);
  }

  function copySnippet(txt: string) {
    navigator.clipboard.writeText(txt);
  }
</script>

<svelte:head>
  <title>{dict?.title ?? 'Restro'}</title>
  <meta name="description" content={dict?.description ?? 'API Client'} />
</svelte:head>

{#if dict}
<div class="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-50 dark:bg-slate-900">
  <!-- Sidebar (Responsive) -->
  <div class="fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-slate-800 shadow-xl transform transition-transform duration-300 md:relative md:translate-x-0 md:shadow-none border-r border-slate-200 dark:border-slate-700 {showSidebar ? 'translate-x-0' : '-translate-x-full'} pt-16 md:pt-0">
      <div class="absolute top-4 right-4 md:hidden">
        <button on:click={() => showSidebar = false} class="p-2 text-slate-500">
            <X class="w-6 h-6" />
        </button>
      </div>
      <HistorySidebar onLoadRequest={loadRequest} {dict} />
  </div>

  <!-- Backdrop for mobile sidebar -->
  {#if showSidebar}
    <button
        type="button"
        class="fixed inset-0 bg-black/50 z-40 md:hidden cursor-default w-full h-full border-none"
        on:click={() => showSidebar = false}
        aria-label="Close Sidebar"
        on:keydown={(e) => e.key === 'Escape' && (showSidebar = false)}
    ></button>
  {/if}

  <!-- Main Content -->
  <div class="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
    <!-- Toolbar -->
    <div class="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-2 flex items-center gap-2 justify-between">
       <button
         class="md:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
         on:click={() => showSidebar = true}
       >
         <Menu class="w-5 h-5" />
       </button>

       <h1 class="text-lg font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent hidden sm:block px-2">
         Restro <span class="text-xs font-medium text-slate-500 dark:text-slate-400 font-mono">v1.0</span>
       </h1>

       <div class="flex items-center gap-2">
         <button
           on:click={() => showCodeModal = true}
           class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
         >
           <Code class="w-4 h-4" /> <span class="hidden sm:inline">Code</span>
         </button>
       </div>
    </div>

    <!-- Workspace -->
    <div class="flex-1 flex flex-col md:flex-row overflow-hidden">
      <!-- Request Pane -->
      <div class="flex-1 flex flex-col p-4 overflow-hidden min-w-[300px] border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700">
         <RequestPanel
            bind:method
            bind:url
            bind:loading
            onSend={handleSend}
            onSave={handleSave}
            {dict}
         />
         <div class="flex-1 overflow-hidden mt-2">
            <RequestTabs bind:params bind:headers bind:bodyType bind:bodyContent {dict} />
         </div>
      </div>

      <!-- Response Pane -->
      <div class="flex-1 flex flex-col p-4 overflow-hidden min-w-[300px] bg-slate-50/50 dark:bg-slate-900/50">
         <div class="flex-1 overflow-hidden h-full">
            <ResponsePanel {response} {dict} />
         </div>
      </div>
    </div>
  </div>
</div>

<!-- Code Snippet Modal -->
{#if showCodeModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
      <div class="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <h3 class="font-bold text-lg text-slate-800 dark:text-white">{dict.generateCode}</h3>
        <button on:click={() => showCodeModal = false} class="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="text-sm font-semibold text-slate-700 dark:text-slate-300">cURL</label>
            <button on:click={() => copySnippet(snippetCurl)} class="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Copy</button>
          </div>
          <pre class="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg text-xs font-mono overflow-x-auto text-slate-800 dark:text-slate-200">{snippetCurl}</pre>
        </div>

        <div>
           <div class="flex items-center justify-between mb-2">
            <label class="text-sm font-semibold text-slate-700 dark:text-slate-300">JavaScript (Fetch)</label>
            <button on:click={() => copySnippet(snippetFetch)} class="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Copy</button>
          </div>
          <pre class="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg text-xs font-mono overflow-x-auto text-slate-800 dark:text-slate-200">{snippetFetch}</pre>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Documentation Section -->
<div class="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
  <div class="max-w-4xl mx-auto px-4 py-12">
    <article class="prose dark:prose-invert max-w-none">
      <h2 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 mb-6">
        {dict.guide.title}
      </h2>

      <p class="text-lg text-slate-600 dark:text-slate-400 mb-8">
        {@html dict.guide.intro}
      </p>

      <div class="grid md:grid-cols-2 gap-8 mb-12">
        <div class="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl">
          <h3 class="text-xl font-bold mb-3 text-slate-800 dark:text-slate-100">{dict.guide.featuresTitle}</h3>
          <ul class="space-y-2 text-slate-600 dark:text-slate-400">
            <li>{@html dict.guide.f1}</li>
            <li>{@html dict.guide.f2}</li>
            <li>{@html dict.guide.f3}</li>
          </ul>
        </div>

        <div class="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl">
           <h3 class="text-xl font-bold mb-3 text-slate-800 dark:text-slate-100">{dict.guide.tipsTitle}</h3>
           <ul class="space-y-2 text-slate-600 dark:text-slate-400">
             <li>{@html dict.guide.tip1}</li>
             <li>{@html dict.guide.tip2}</li>
             <li>{@html dict.guide.tip3}</li>
           </ul>
        </div>
      </div>

    </article>
  </div>
</div>
{/if}
