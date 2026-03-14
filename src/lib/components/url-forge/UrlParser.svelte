<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let dict: any;
  export let url: string = "";

  const dispatch = createEventDispatcher();

  let parsedUrl: URL | null = null;
  let inputError = false;

  $: {
    try {
        if (url.trim()) {
            // Prepend protocol if missing for parsing purposes
            let validUrl = url;
            if (!/^https?:\/\//i.test(validUrl) && !validUrl.startsWith('data:')) {
                validUrl = 'https://' + validUrl;
            }
            parsedUrl = new URL(validUrl);
            inputError = false;
            dispatch('submit', { url });
        } else {
            parsedUrl = null;
            inputError = false;
        }
    } catch (e) {
        parsedUrl = null;
        inputError = true;
    }
  }

  function handleInput(e: Event) {
     url = (e.target as HTMLInputElement).value;
  }

  function handleClear() {
      url = "";
  }

  function copyToClipboard(text: string) {
      if (!text) return;
      navigator.clipboard.writeText(text);
  }
</script>

<div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
    <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-bold text-slate-800 dark:text-white">{dict.inputLabel}</h2>
        <button on:click={handleClear} class="text-sm text-slate-500 hover:text-red-500 transition-colors p-2 min-h-[44px] min-w-[44px]" aria-label="Clear">
            {dict.clear}
        </button>
    </div>

    <div class="relative">
        <textarea
            bind:value={url}
            on:input={handleInput}
            placeholder={dict.placeholder}
            class="w-full h-32 p-4 bg-slate-50 dark:bg-slate-900 border {inputError ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-mono text-sm text-slate-800 dark:text-slate-200 transition-all custom-scrollbar"
            spellcheck="false"
        ></textarea>
        {#if inputError && url.trim() !== ""}
            <p class="absolute -bottom-6 left-2 text-xs text-red-500 font-medium">{dict.invalidUrl}</p>
        {/if}
    </div>

    {#if parsedUrl}
        <div class="mt-8">
            <h3 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">{dict.urlParts}</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">

                <div class="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50 group relative overflow-hidden">
                    <span class="text-xs text-indigo-500 dark:text-indigo-400 font-bold block mb-1">{dict.protocol}</span>
                    <span class="font-mono text-sm text-indigo-900 dark:text-indigo-200 truncate block">{parsedUrl.protocol}</span>
                    <button on:click={() => copyToClipboard(parsedUrl?.protocol || '')} class="absolute top-2 right-2 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center opacity-0 group-hover:opacity-100 text-indigo-500 hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded transition-all" aria-label="Copy Protocol">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5v14l11-7z"/></svg>
                    </button>
                </div>

                <div class="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/50 col-span-2 group relative overflow-hidden">
                    <span class="text-xs text-emerald-500 dark:text-emerald-400 font-bold block mb-1">{dict.host}</span>
                    <span class="font-mono text-sm text-emerald-900 dark:text-emerald-200 truncate block">{parsedUrl.hostname}</span>
                    <button on:click={() => copyToClipboard(parsedUrl?.hostname || '')} class="absolute top-2 right-2 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center opacity-0 group-hover:opacity-100 text-emerald-500 hover:bg-emerald-200 dark:hover:bg-emerald-800 rounded transition-all" aria-label="Copy Host">
                         <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5v14l11-7z"/></svg>
                    </button>
                </div>

                <div class="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800/50 group relative overflow-hidden">
                    <span class="text-xs text-amber-500 dark:text-amber-400 font-bold block mb-1">{dict.port}</span>
                    <span class="font-mono text-sm text-amber-900 dark:text-amber-200 truncate block">{parsedUrl.port || 'Default'}</span>
                    <button on:click={() => copyToClipboard(parsedUrl?.port || '')} class="absolute top-2 right-2 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center opacity-0 group-hover:opacity-100 text-amber-500 hover:bg-amber-200 dark:hover:bg-amber-800 rounded transition-all" aria-label="Copy Port">
                         <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5v14l11-7z"/></svg>
                    </button>
                </div>

                <div class="bg-sky-50 dark:bg-sky-900/20 p-4 rounded-xl border border-sky-100 dark:border-sky-800/50 col-span-2 md:col-span-3 group relative overflow-hidden">
                    <span class="text-xs text-sky-500 dark:text-sky-400 font-bold block mb-1">{dict.path}</span>
                    <span class="font-mono text-sm text-sky-900 dark:text-sky-200 truncate block">{parsedUrl.pathname}</span>
                     <button on:click={() => copyToClipboard(parsedUrl?.pathname || '')} class="absolute top-2 right-2 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center opacity-0 group-hover:opacity-100 text-sky-500 hover:bg-sky-200 dark:hover:bg-sky-800 rounded transition-all" aria-label="Copy Path">
                         <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5v14l11-7z"/></svg>
                    </button>
                </div>

                <div class="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-xl border border-rose-100 dark:border-rose-800/50 group relative overflow-hidden">
                    <span class="text-xs text-rose-500 dark:text-rose-400 font-bold block mb-1">{dict.hash}</span>
                    <span class="font-mono text-sm text-rose-900 dark:text-rose-200 truncate block">{parsedUrl.hash || 'None'}</span>
                    <button on:click={() => copyToClipboard(parsedUrl?.hash || '')} class="absolute top-2 right-2 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center opacity-0 group-hover:opacity-100 text-rose-500 hover:bg-rose-200 dark:hover:bg-rose-800 rounded transition-all" aria-label="Copy Hash">
                         <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5v14l11-7z"/></svg>
                    </button>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    @apply bg-transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    @apply bg-slate-300 dark:bg-slate-600 rounded-full;
  }
  .custom-scrollbar:hover::-webkit-scrollbar-thumb {
    @apply bg-slate-400 dark:bg-slate-500;
  }
</style>
