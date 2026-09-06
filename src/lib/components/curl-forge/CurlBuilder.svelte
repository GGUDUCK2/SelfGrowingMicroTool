<script lang="ts">
  import { parseCurl, generateCurl, generateFetch, generatePython, generateAxios, generatePlaywright, generateCypress } from '$lib/utils/curl-forge/parser';
  import { generateTypeScriptInterfaces } from '$lib/utils/curl-forge/type-generator';
  import { Copy, Trash2, Plus, ArrowDownToLine, Check } from '@lucide/svelte';
  import Button from '$lib/components/Button.svelte';

  export let dict: any = {};
  export let data = {
    method: 'GET',
    url: 'https://api.example.com/data',
    headers: { 'Content-Type': 'application/json' } as Record<string, string>,
    body: ''
  };

  import type { RequestData } from '$lib/utils/curl-forge/parser';
  export let onSave: (d: RequestData) => void;

  let headerKeys = Object.keys(data.headers);
  let headerValues = Object.values(data.headers);

  let paramKeys: string[] = [];
  let paramValues: string[] = [];

  $: {
    // Only resync if the parent data's header stringified doesn't match our local state
    const currentLocalHeaders: Record<string, string> = {};
    for (let i = 0; i < headerKeys.length; i++) {
      if (headerKeys[i]) currentLocalHeaders[headerKeys[i]] = headerValues[i];
    }
    if (JSON.stringify(data.headers) !== JSON.stringify(currentLocalHeaders)) {
      headerKeys = Object.keys(data.headers);
      headerValues = Object.values(data.headers);
    }
  }

  $: {
     try {
        if (data.url && data.url.includes('?')) {
             const urlObj = new URL(data.url.startsWith('http') ? data.url : `http://${data.url}`);
             const pKeys: string[] = [];
             const pVals: string[] = [];
             urlObj.searchParams.forEach((val, key) => {
                 pKeys.push(key);
                 pVals.push(val);
             });
             if (JSON.stringify(paramKeys) !== JSON.stringify(pKeys) || JSON.stringify(paramValues) !== JSON.stringify(pVals)) {
                 paramKeys = pKeys;
                 paramValues = pVals;
             }
        } else {
             if (paramKeys.length > 0 && data.url) {
                paramKeys = [];
                paramValues = [];
             }
        }
     } catch {
         // ignore
     }
  }



  let magicPasteToast = false;
  let magicPasteTimeout: ReturnType<typeof setTimeout>;

  function handleGlobalPaste(e: ClipboardEvent) {
    // Ignore if typing in an input/textarea
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

    const pastedText = e.clipboardData?.getData('text');
    if (pastedText && pastedText.trim().toLowerCase().startsWith('curl ')) {
        const parsed = parseCurl(pastedText);
        if (parsed && parsed.url) {
            data = parsed;
            headerKeys = Object.keys(data.headers);
            headerValues = Object.values(data.headers);
            onSave(data);
            magicPasteToast = true;
            clearTimeout(magicPasteTimeout);
            magicPasteTimeout = setTimeout(() => magicPasteToast = false, 3000);
        }
    }
  }

  let importRaw = '';
  let showImport = false;
  let copiedStates: Record<string, boolean> = {};

  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

  function updateHeaders() {
    const newHeaders: Record<string, string> = {};
    for (let i = 0; i < headerKeys.length; i++) {
      if (headerKeys[i]) {
        newHeaders[headerKeys[i]] = headerValues[i];
      }
    }
    data.headers = newHeaders;
    onSave(data);
  }

  function addHeader() {
    headerKeys = [...headerKeys, ''];
    headerValues = [...headerValues, ''];
  }

  function removeHeader(index: number) {
    headerKeys.splice(index, 1);
    headerValues.splice(index, 1);
    headerKeys = [...headerKeys];
    headerValues = [...headerValues];
    updateHeaders();
  }

  function updateParams() {
      try {
          const baseUrl = data.url.split('?')[0];
          if (!baseUrl) return;

          // eslint-disable-next-line svelte/prefer-svelte-reactivity
          const params = new URLSearchParams();
          for (let i = 0; i < paramKeys.length; i++) {
              if (paramKeys[i]) {
                  params.append(paramKeys[i], paramValues[i] || '');
              }
          }
          const queryString = params.toString();
          data.url = queryString ? `${baseUrl}?${queryString}` : baseUrl;
          onSave(data);
      } catch (e) {
          console.error(e);
      }
  }

  function addParam() {
      paramKeys = [...paramKeys, ''];
      paramValues = [...paramValues, ''];
  }

  function removeParam(index: number) {
      paramKeys.splice(index, 1);
      paramValues.splice(index, 1);
      paramKeys = [...paramKeys];
      paramValues = [...paramValues];
      updateParams();
  }

  // Response Filter
  let responseSearchTerm = '';
  $: filteredResponseData = filterResponse(responseData, responseSearchTerm);

  function filterResponse(res: string, term: string) {
      if (!term || !res) return res;
      try {
         const obj = JSON.parse(res);
         const termLower = term.toLowerCase();
         // Simple object filter logic for top level (expandable as needed)
         if (typeof obj === 'object' && obj !== null) {
            const filteredObj: any = Array.isArray(obj) ? [] : {};
            let matchFound = false;

            const traverse = (o: any, path: string = ''): any => {
                 if (typeof o === 'string' && o.toLowerCase().includes(termLower)) return true;
                 if (typeof o === 'number' && o.toString().includes(termLower)) return true;
                 if (typeof o === 'boolean' && o.toString().includes(termLower)) return true;
                 if (path.toLowerCase().includes(termLower)) return true;

                 if (typeof o === 'object' && o !== null) {
                     for (const k in o) {
                         if (traverse(o[k], k)) return true;
                     }
                 }
                 return false;
            };

            for (const key in obj) {
                if (key.toLowerCase().includes(termLower) || traverse(obj[key])) {
                    filteredObj[key] = obj[key];
                    matchFound = true;
                }
            }
            if (matchFound) return JSON.stringify(filteredObj, null, 2);
         }

         // Fallback to text search if not JSON or no deep matches
         if (res.toLowerCase().includes(termLower)) {
             return res;
         }
         return `No matches found for "${term}"`;
      } catch(e) {
         // Not JSON, just do text search
         if (res.toLowerCase().includes(term.toLowerCase())) {
             return res;
         }
         return `No matches found for "${term}"`;
      }
  }

  let showAuth = false;
  let authType = 'bearer';
  let authUsername = '';
  let authPassword = '';
  let authToken = '';

  function applyAuth() {
      if (authType === 'bearer' && authToken) {
          const authVal = `Bearer ${authToken}`;
          const existingIdx = headerKeys.findIndex(k => k.toLowerCase() === 'authorization');
          if (existingIdx !== -1) {
              headerValues[existingIdx] = authVal;
          } else {
              headerKeys = [...headerKeys, 'Authorization'];
              headerValues = [...headerValues, authVal];
          }
      } else if (authType === 'basic' && authUsername && authPassword) {
          const authVal = `Basic ${btoa(authUsername + ':' + authPassword)}`;
          const existingIdx = headerKeys.findIndex(k => k.toLowerCase() === 'authorization');
          if (existingIdx !== -1) {
              headerValues[existingIdx] = authVal;
          } else {
              headerKeys = [...headerKeys, 'Authorization'];
              headerValues = [...headerValues, authVal];
          }
      }
      updateHeaders();
      showAuth = false;
  }


  function handleImport() {
    const parsed = parseCurl(importRaw);
    if (parsed.url) {
      data = parsed;
      headerKeys = Object.keys(data.headers);
      headerValues = Object.values(data.headers);
      onSave(data);
    }
    showImport = false;
    importRaw = '';
  }

  function handleClear() {
    data = { method: 'GET', url: '', headers: {}, body: '' };
    headerKeys = [];
    headerValues = [];
    onSave(data);
  }

  async function copyToClipboard(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      copiedStates[id] = true;
      setTimeout(() => { copiedStates[id] = false; }, 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  }

  $: curlCode = generateCurl(data);
  $: fetchCode = generateFetch(data);
  $: pyCode = generatePython(data);
  $: axiosCode = generateAxios(data);
  $: playwrightCode = generatePlaywright(data);
  $: cypressCode = generateCypress(data);
  $: tsCode = generateTypeScriptInterfaces(responseData);

  let activeTab = 'curl';

  let responseData = '';
  let responseStatus = '';
  let responseTime = '';
  let isSending = false;

  function applyDynamicVariables(str: string): string {
    if (!str) return str;
    return str
      .replace(/\{\{\$uuid\}\}/g, () => crypto.randomUUID())
      .replace(/\{\{\$timestamp\}\}/g, () => Date.now().toString())
      .replace(/\{\{\$randomInt\}\}/g, () => Math.floor(Math.random() * 10000).toString());
  }

  export function copyActiveCode() {
      const codeToCopy = activeTab === 'curl' ? curlCode :
                         activeTab === 'fetch' ? fetchCode :
                         activeTab === 'python' ? pyCode :
                         activeTab === 'axios' ? axiosCode :
                         activeTab === 'playwright' ? playwrightCode :
                         activeTab === 'typescript' ? tsCode : cypressCode;
      copyToClipboard(codeToCopy, activeTab);
  }

  export async function handleSend() {
      if (!data.url) return;
      isSending = true;
      responseData = '';
      responseStatus = '';
      responseTime = '';

      let processedUrl = applyDynamicVariables(data.url.startsWith('http') ? data.url : `http://${data.url}`);
      let processedBody = applyDynamicVariables(data.body);
      let processedHeaders: Record<string, string> = {};
      for (const [key, value] of Object.entries(data.headers)) {
          processedHeaders[applyDynamicVariables(key)] = applyDynamicVariables(value);
      }

      const startTime = Date.now();
      try {
          const res = await fetch(processedUrl, {
              method: data.method,
              headers: processedHeaders,
              body: (data.method === 'GET' || data.method === 'HEAD') ? undefined : (processedBody || undefined)
          });
          responseTime = `${Date.now() - startTime}ms`;
          responseStatus = `${res.status} ${res.statusText}`;
          const text = await res.text();
          try {
              responseData = JSON.stringify(JSON.parse(text), null, 2);
          } catch {
              responseData = text;
          }
      } catch (err: unknown) {
          responseTime = `${Date.now() - startTime}ms`;
          responseStatus = 'Error';
          responseData = err instanceof Error ? err.message : 'Failed to fetch. CORS or network error.';
      } finally {
          isSending = false;
      }
  }

  // JSON Formatter logic
  let invalidJson = false;

  function formatBodyJson() {
    if (!data.body) return;
    try {
        const parsed = JSON.parse(data.body);
        data.body = JSON.stringify(parsed, null, 2);
        invalidJson = false;
        onSave(data);
    } catch {
        invalidJson = true;
        setTimeout(() => invalidJson = false, 3000);
    }
  }

  // Smart Examples
  const smartExamples = [
    {
      label: 'JSON POST',
      data: {
        method: 'POST',
        url: 'https://dummyjson.com/products/add',
        headers: { 'Content-Type': 'application/json' },
        body: '{\n  "title": "Perfume Oil",\n  "description": "Mega Discount",\n  "price": 13\n}'
      }
    },
    {
      label: 'Bearer Auth GET',
      data: {
        method: 'GET',
        url: 'https://httpbin.org/bearer',
        headers: { 'Authorization': 'Bearer YOUR_TOKEN_HERE' },
        body: ''
      }
    },
    {
      label: 'GitHub API: Get User',
      data: {
        method: 'GET',
        url: 'https://api.github.com/users/octocat',
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'curl-forge'
        },
        body: ''
      }
    }
  ];

  function loadExample(exampleData: RequestData) {
    data = { ...exampleData };
    headerKeys = Object.keys(data.headers);
    headerValues = Object.values(data.headers);
    onSave(data);
    setTimeout(() => {
       handleSend();
    }, 50);
  }

</script>

<svelte:window on:paste={handleGlobalPaste} />

<div class="grid lg:grid-cols-2 gap-6">
  <!-- Left Side: Builder -->
  <div class="space-y-6">
    {#if magicPasteToast}
      <div class="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-up">
        <div class="bg-indigo-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center text-sm font-medium">
          <span class="mr-2">🪄</span>
          {(dict as any)?.builder?.title || 'Magic Paste: cURL command parsed!'}
        </div>
      </div>
    {/if}

    <div class="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h2 class="text-xl font-bold text-slate-900 dark:text-white">{(dict as any)?.builder?.title || 'Request Builder'}</h2>
        <div class="flex flex-wrap items-center gap-2">
          <div class="relative group">
            <Button variant="secondary" class="min-w-[44px] min-h-[44px] px-3">
              {(dict as any)?.export?.examples || 'Examples'}
            </Button>
            <div class="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <div class="py-1">
                {#each smartExamples as ex, i (i)}
                  <button
                    on:click={() => loadExample(ex.data)}
                    class="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 min-h-[44px]"
                  >
                    {ex.label}
                  </button>
                {/each}
              </div>
            </div>
          </div>
          <Button variant="secondary" on:click={() => showImport = !showImport} class="min-h-[44px] min-w-[44px] px-3">
            <ArrowDownToLine class="w-4 h-4 mr-2" />
            <span class="hidden sm:inline">{(dict as any)?.builder?.import || 'Import'}</span>
          </Button>


          <Button variant="primary" on:click={handleSend} disabled={isSending || !data.url} class="min-h-[44px] min-w-[44px] px-3 whitespace-nowrap">
            <span class="hidden sm:inline">
            {#if isSending}
               ...
            {:else}
               Run Request
            {/if}
            </span>
            <span class="sm:hidden">
            {#if isSending}
               ...
            {:else}
               Run
            {/if}
            </span>
          </Button>
          <Button variant="danger" on:click={handleClear} class="min-h-[44px] min-w-[44px] flex items-center justify-center">
            <Trash2 class="w-4 h-4" />
            <span class="sr-only">{(dict as any)?.builder?.clear || 'Clear All'}</span>
          </Button>
        </div>
      </div>

      {#if showImport}
        <div class="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <label for="import-curl" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Paste cURL Command</label>
          <textarea
            id="import-curl"
            bind:value={importRaw}
            class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-sm font-mono focus:ring-2 focus:ring-blue-500 mb-3"
            rows="4"
            placeholder="curl -X POST https://api..."></textarea>
          <div class="flex justify-end space-x-2">
            <Button variant="secondary" on:click={() => showImport = false} class="min-h-[44px]">Cancel</Button>
            <Button variant="primary" on:click={handleImport} class="min-w-[44px] min-h-[44px]">Import</Button>
          </div>
        </div>
      {/if}

      <div class="space-y-4">
        <!-- Method and URL -->
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="w-full sm:w-1/3">
            <label for="method-select" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{(dict as any)?.builder?.method || 'Method'}</label>
            <select
              id="method-select"
              bind:value={data.method}
              on:change={() => onSave(data)}
              class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white min-h-[44px] focus:ring-2 focus:ring-blue-500"
            >
              {#each methods as m (m)}
                <option value={m}>{m}</option>
              {/each}
            </select>
          </div>
          <div class="w-full sm:w-2/3">
            <label for="url-input" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{(dict as any)?.builder?.url || 'URL'}</label>
            <div class="flex gap-2">
                <input
                  id="url-input"
                  type="text"
                  bind:value={data.url}
                  on:input={() => onSave(data)}
                  placeholder="https://api.example.com"
                  class="flex-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white min-h-[44px] focus:ring-2 focus:ring-blue-500"
                />
                <Button variant="primary" on:click={handleSend} disabled={isSending || !data.url} class="min-w-[44px] min-h-[44px] px-4 whitespace-nowrap">
                    {#if isSending}
                       ...
                    {:else}
                       Send
                    {/if}
                </Button>
            </div>
          </div>
        </div>

        <!-- Query Parameters -->
        <div class="pt-4 border-t border-slate-200 dark:border-slate-800">
          <div class="flex justify-between items-center mb-2">
            <span class="block text-sm font-medium text-slate-700 dark:text-slate-300">Query Parameters</span>
            <button on:click={addParam} class="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center text-sm min-h-[44px] min-w-[44px] px-2 rounded-lg transition-colors">
              <Plus class="w-4 h-4 mr-1" />
              Add
            </button>
          </div>

          <div class="space-y-2">
            <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
            {#each paramKeys as _p, i (i)}
              <div class="flex items-center gap-2">
                <input
                  type="text"
                  bind:value={paramKeys[i]}
                  on:input={updateParams}
                  placeholder="Key"
                  class="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm min-h-[44px]"
                  aria-label="Parameter Key"
                />
                <input
                  type="text"
                  bind:value={paramValues[i]}
                  on:input={updateParams}
                  placeholder="Value"
                  class="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm min-h-[44px]"
                  aria-label="Parameter Value"
                />
                <button
                  on:click={() => removeParam(i)}
                  class="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Remove Parameter"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            {/each}
          </div>
        </div>

        <!-- Headers -->
        <div class="pt-4 border-t border-slate-200 dark:border-slate-800">
          <div class="flex justify-between items-center mb-2">
            <span class="block text-sm font-medium text-slate-700 dark:text-slate-300">{(dict as any)?.builder?.headers || 'Headers'}</span>
            <div class="flex space-x-2">
                <button on:click={() => showAuth = !showAuth} class="text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center text-sm min-h-[44px] px-2 rounded-lg transition-colors font-medium">
                  Auth Quick-Add
                </button>
                <button on:click={addHeader} class="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center text-sm min-h-[44px] min-w-[44px] px-2 rounded-lg transition-colors">
                  <Plus class="w-4 h-4 mr-1" />
                  {(dict as any)?.builder?.addHeader || 'Add'}
                </button>
            </div>
          </div>

          {#if showAuth}
            <div class="mb-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-lg">
                <div class="flex space-x-4 mb-3">
                    <label class="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300">
                        <input type="radio" bind:group={authType} value="bearer" class="text-indigo-500 focus:ring-indigo-500" />
                        <span>Bearer Token</span>
                    </label>
                    <label class="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300">
                        <input type="radio" bind:group={authType} value="basic" class="text-indigo-500 focus:ring-indigo-500" />
                        <span>Basic Auth</span>
                    </label>
                </div>

                {#if authType === 'bearer'}
                    <input
                      type="text"
                      bind:value={authToken}
                      placeholder="Token (e.g. eyJhbGci...)"
                      class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm min-h-[44px] mb-3"
                    />
                {:else}
                    <div class="flex space-x-2 mb-3">
                        <input
                          type="text"
                          bind:value={authUsername}
                          placeholder="Username"
                          class="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm min-h-[44px]"
                        />
                        <input
                          type="password"
                          bind:value={authPassword}
                          placeholder="Password"
                          class="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm min-h-[44px]"
                        />
                    </div>
                {/if}

                <div class="flex justify-end space-x-2">
                    <Button variant="secondary" on:click={() => showAuth = false} class="min-h-[44px] text-sm py-1 px-3">Cancel</Button>
                    <Button variant="primary" on:click={applyAuth} class="min-w-[44px] min-h-[44px] text-sm py-1 px-3 bg-indigo-600 hover:bg-indigo-700">Add to Headers</Button>
                </div>
            </div>
          {/if}

          <div class="space-y-2">
            <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
            {#each headerKeys as _h, i (i)}
              <div class="flex items-center gap-2">
                <input
                  type="text"
                  bind:value={headerKeys[i]}
                  on:input={updateHeaders}
                  placeholder={(dict as any)?.builder?.headerKey || 'Key'}
                  class="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm min-h-[44px]"
                  aria-label={(dict as any)?.builder?.headerKey || 'Key'}
                />
                <input
                  type="text"
                  bind:value={headerValues[i]}
                  on:input={updateHeaders}
                  placeholder={(dict as any)?.builder?.headerValue || 'Value'}
                  class="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm min-h-[44px]"
                  aria-label={(dict as any)?.builder?.headerValue || 'Value'}
                />
                <button
                  on:click={() => removeHeader(i)}
                  class="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Remove Header"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            {/each}
          </div>
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-slate-700 dark:text-slate-300">Query Parameters</h3>
            <Button variant="secondary" on:click={addParam} class="min-w-[44px] min-h-[44px] text-sm py-1 px-3">
              <Plus class="w-4 h-4 mr-2" />
              Add Param
            </Button>
          </div>

          <div class="space-y-2 mb-6">
            <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
            {#each paramKeys as _p, i (i)}
              <div class="flex items-center gap-2">
                <input
                  type="text"
                  bind:value={paramKeys[i]}
                  on:input={updateParams}
                  placeholder="Key"
                  class="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm min-h-[44px]"
                  aria-label="Query Parameter Key"
                />
                <input
                  type="text"
                  bind:value={paramValues[i]}
                  on:input={updateParams}
                  placeholder="Value"
                  class="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm min-h-[44px]"
                  aria-label="Query Parameter Value"
                />
                <button
                  on:click={() => removeParam(i)}
                  class="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Remove Parameter"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            {/each}
          </div>

        </div>

        <!-- Body -->
        <div class="pt-4 border-t border-slate-200 dark:border-slate-800 relative">
          <div class="flex justify-between items-center mb-2">
            <label for="body-input" class="block text-sm font-medium text-slate-700 dark:text-slate-300">{(dict as any)?.builder?.body || 'Body'}</label>
            <div class="flex items-center space-x-2">
              <span class="text-xs text-slate-500 hidden sm:inline-block">Magic variables: {`{{$uuid}}`}, {`{{$timestamp}}`}, {`{{$randomInt}}`}</span>
              {#if invalidJson}
                <span class="text-xs text-red-500 animate-pulse">{(dict as any)?.export?.invalidJson || 'Invalid JSON'}</span>
              {/if}
              <button
                on:click={formatBodyJson}
                class="text-xs text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 font-medium px-2 min-h-[32px] flex items-center bg-blue-50 dark:bg-blue-900/20 rounded-md transition-colors"
              >
                {(dict as any)?.export?.formatJson || 'Format JSON'}
              </button>
            </div>
          </div>
          <textarea
            id="body-input"
            bind:value={data.body}
            on:input={() => { invalidJson = false; onSave(data); }}
            rows="6"
            class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-3 font-mono text-sm min-h-[44px] focus:ring-2 focus:ring-blue-500 {invalidJson ? 'border-red-500 ring-1 ring-red-500' : ''}"
            placeholder={`{"key": "value"}`}
          ></textarea>
        </div>

      </div>
    </div>
  </div>

  <!-- Right Side: Export & Response -->
  <div class="space-y-6 flex flex-col h-full">
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col flex-1 min-h-[300px]">
      <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-2 overflow-x-auto">
        <div class="flex space-x-1 min-h-[44px]">
          {#each [
            { id: 'curl', label: (dict as any)?.export?.curl || 'cURL', code: curlCode },
            { id: 'fetch', label: (dict as any)?.export?.fetch || 'Fetch (JS)', code: fetchCode },
            { id: 'python', label: (dict as any)?.export?.python || 'Python', code: pyCode },
            { id: 'axios', label: (dict as any)?.export?.node || 'Axios', code: axiosCode },
            { id: 'playwright', label: (dict as any)?.export?.playwright || 'Playwright', code: playwrightCode },
            { id: 'cypress', label: (dict as any)?.export?.cypress || 'Cypress', code: cypressCode },
            { id: 'typescript', label: (dict as any)?.export?.typescript || 'TypeScript', code: tsCode }
          ] as tab (tab.id)}
            <button
              on:click={() => activeTab = tab.id}
              class="px-4 py-3 text-sm font-medium whitespace-nowrap min-h-[44px] transition-colors border-b-2 {activeTab === tab.id ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'}"
            >
              {tab.label}
            </button>
          {/each}
        </div>
      </div>

      <div class="p-4 flex-1 relative bg-slate-950">
        <button
          on:click={() => copyToClipboard(
            activeTab === 'curl' ? curlCode :
            activeTab === 'fetch' ? fetchCode :
            activeTab === 'python' ? pyCode :
            activeTab === 'axios' ? axiosCode :
            activeTab === 'playwright' ? playwrightCode :
            activeTab === 'typescript' ? tsCode : cypressCode,
            activeTab
          )}
          class="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center shadow-md"
          aria-label="Copy Code"
        >
          {#if copiedStates[activeTab]}
            <Check class="w-4 h-4 text-green-400" />
          {:else}
            <Copy class="w-4 h-4" />
          {/if}
        </button>
        <pre class="font-mono text-sm text-slate-300 overflow-x-auto whitespace-pre-wrap mt-2 break-all">{
          activeTab === 'curl' ? curlCode :
          activeTab === 'fetch' ? fetchCode :
          activeTab === 'python' ? pyCode :
          activeTab === 'axios' ? axiosCode :
          activeTab === 'playwright' ? playwrightCode :
          activeTab === 'typescript' ? tsCode : cypressCode
        }</pre>
      </div>
    </div>

    <!-- Live Response Panel -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col flex-1 min-h-[300px] relative">
      <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 py-3 min-h-[44px]">
          <h3 class="font-bold text-sm text-slate-900 dark:text-white">Response</h3>
          <div class="flex items-center space-x-4">
              {#if responseStatus}
                <div class="flex space-x-2 text-xs font-mono">
                    <span class="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 {responseStatus.startsWith('2') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">{responseStatus}</span>
                    <span class="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{responseTime}</span>
                </div>
              {/if}
              {#if responseData}
                <div class="flex items-center space-x-1">
                    <button
                        on:click={() => copyToClipboard(responseData, 'response')}
                        class="p-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded min-h-[32px] min-w-[32px] flex items-center justify-center transition-colors"
                        title={(dict as any)?.export?.copyResponse || 'Copy Response'}
                    >
                        {#if copiedStates['response']}
                            <Check class="w-4 h-4 text-green-500" />
                        {:else}
                            <Copy class="w-4 h-4" />
                        {/if}
                    </button>
                    <button
                        on:click={() => {
                            const blob = new Blob([responseData], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `response_${Date.now()}.json`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                        }}
                        class="p-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded min-h-[32px] min-w-[32px] flex items-center justify-center transition-colors"
                        title={(dict as any)?.export?.downloadResponse || 'Download JSON'}
                    >
                        <ArrowDownToLine class="w-4 h-4" />
                    </button>
                </div>
              {/if}
          </div>
      </div>
      {#if responseData && !isSending}
      <div class="px-4 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center">
          <input
              type="text"
              bind:value={responseSearchTerm}
              placeholder="Search Response JSON..."
              class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm min-h-[44px] focus:ring-2 focus:ring-blue-500"
              aria-label="Search Response"
          />
      </div>
      {/if}
      <div class="p-4 flex-1 bg-slate-50 dark:bg-slate-950 overflow-y-auto">
          {#if isSending}
              <div class="flex justify-center items-center h-full text-slate-400">Sending request...</div>
          {:else if responseData}
              <pre class="font-mono text-sm text-slate-800 dark:text-slate-300 whitespace-pre-wrap break-all">{filteredResponseData}</pre>
          {:else}
              <div class="flex justify-center items-center h-full text-slate-400 text-sm">Hit "Send" to see the response here. Note: Client-side CORS limitations apply.</div>
          {/if}
      </div>
    </div>

  </div>
</div>
