<script lang="ts">
  import { parseCurl, generateCurl, generateFetch, generatePython, generateAxios } from '$lib/utils/curl-forge/parser';
  import { Copy, Trash2, Plus, ArrowDownToLine, Check } from 'lucide-svelte';
  import Button from '$lib/components/Button.svelte';

  export let dict: any = {};
  export let data = {
    method: 'GET',
    url: 'https://api.example.com/data',
    headers: { 'Content-Type': 'application/json' } as Record<string, string>,
    body: ''
  };

  export let onSave: (d: any) => void;

  let headerKeys = Object.keys(data.headers);
  let headerValues = Object.values(data.headers);

  $: {
    // Only resync if the parent data's header stringified doesn't match our local state
    const currentLocalHeaders = {};
    for (let i = 0; i < headerKeys.length; i++) {
      if (headerKeys[i]) currentLocalHeaders[headerKeys[i]] = headerValues[i];
    }
    if (JSON.stringify(data.headers) !== JSON.stringify(currentLocalHeaders)) {
      headerKeys = Object.keys(data.headers);
      headerValues = Object.values(data.headers);
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

  let activeTab = 'curl';

</script>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <!-- Left Side: Builder -->
  <div class="space-y-6">
    <div class="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-slate-900 dark:text-white">{dict?.builder?.title || 'Request Builder'}</h2>
        <div class="flex space-x-2">
          <Button variant="outline" on:click={() => showImport = !showImport} class="min-h-[44px] min-w-[44px] px-3">
            <ArrowDownToLine class="w-4 h-4 mr-2" />
            <span class="hidden sm:inline">{dict?.builder?.import || 'Import'}</span>
          </Button>
          <Button variant="danger" on:click={handleClear} class="min-h-[44px] min-w-[44px] flex items-center justify-center">
            <Trash2 class="w-4 h-4" />
            <span class="sr-only">{dict?.builder?.clear || 'Clear All'}</span>
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
            <Button variant="primary" on:click={handleImport} class="min-h-[44px]">Import</Button>
          </div>
        </div>
      {/if}

      <div class="space-y-4">
        <!-- Method and URL -->
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="w-full sm:w-1/3">
            <label for="method-select" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{dict?.builder?.method || 'Method'}</label>
            <select
              id="method-select"
              bind:value={data.method}
              on:change={() => onSave(data)}
              class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white min-h-[44px] focus:ring-2 focus:ring-blue-500"
            >
              {#each methods as m}
                <option value={m}>{m}</option>
              {/each}
            </select>
          </div>
          <div class="w-full sm:w-2/3">
            <label for="url-input" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{dict?.builder?.url || 'URL'}</label>
            <input
              id="url-input"
              type="text"
              bind:value={data.url}
              on:input={() => onSave(data)}
              placeholder="https://api.example.com"
              class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white min-h-[44px] focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <!-- Headers -->
        <div class="pt-4 border-t border-slate-200 dark:border-slate-800">
          <div class="flex justify-between items-center mb-2">
            <span class="block text-sm font-medium text-slate-700 dark:text-slate-300">{dict?.builder?.headers || 'Headers'}</span>
            <button on:click={addHeader} class="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center text-sm min-h-[44px] min-w-[44px] px-2 rounded-lg transition-colors">
              <Plus class="w-4 h-4 mr-1" />
              {dict?.builder?.addHeader || 'Add'}
            </button>
          </div>

          <div class="space-y-2">
            {#each headerKeys as key, i}
              <div class="flex items-center gap-2">
                <input
                  type="text"
                  bind:value={headerKeys[i]}
                  on:input={updateHeaders}
                  placeholder={dict?.builder?.headerKey || 'Key'}
                  class="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm min-h-[44px]"
                  aria-label={dict?.builder?.headerKey || 'Key'}
                />
                <input
                  type="text"
                  bind:value={headerValues[i]}
                  on:input={updateHeaders}
                  placeholder={dict?.builder?.headerValue || 'Value'}
                  class="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm min-h-[44px]"
                  aria-label={dict?.builder?.headerValue || 'Value'}
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
        </div>

        <!-- Body -->
        <div class="pt-4 border-t border-slate-200 dark:border-slate-800">
          <label for="body-input" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{dict?.builder?.body || 'Body'}</label>
          <textarea
            id="body-input"
            bind:value={data.body}
            on:input={() => onSave(data)}
            rows="6"
            class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-3 font-mono text-sm min-h-[44px] focus:ring-2 focus:ring-blue-500"
            placeholder={`{"key": "value"}`}
          ></textarea>
        </div>

      </div>
    </div>
  </div>

  <!-- Right Side: Export -->
  <div class="space-y-6">
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
      <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-2 overflow-x-auto">
        <div class="flex space-x-1 min-h-[44px]">
          {#each [
            { id: 'curl', label: dict?.export?.curl || 'cURL', code: curlCode },
            { id: 'fetch', label: dict?.export?.fetch || 'Fetch (JS)', code: fetchCode },
            { id: 'python', label: dict?.export?.python || 'Python', code: pyCode },
            { id: 'axios', label: dict?.export?.node || 'Axios', code: axiosCode }
          ] as tab}
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
            activeTab === 'python' ? pyCode : axiosCode,
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
          activeTab === 'python' ? pyCode : axiosCode
        }</pre>
      </div>
    </div>
  </div>
</div>
