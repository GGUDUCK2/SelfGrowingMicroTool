<script lang="ts">
  export let dict: any;
  export let url: string = "";


  function encodeFullUrl() {
      if (!url) return;
      try {
          const parsed = new URL(url);
          // Only encode query parameters to prevent breaking the URL parser
          parsed.searchParams.forEach((value, key) => {
             parsed.searchParams.set(key, encodeURIComponent(value));
          });
          url = parsed.toString();
      } catch (e) {
          // Fallback to encodeURI
          url = encodeURI(url);
      }
  }

  function decodeFullUrl() {
      if (!url) return;
      try {
          const parsed = new URL(url);
          parsed.searchParams.forEach((value, key) => {
             parsed.searchParams.set(key, decodeURIComponent(value));
          });
          url = parsed.toString();
      } catch(e) {
          url = decodeURI(url);
      }
  }
</script>

<div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
    <h2 class="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
        {dict.encodeDecode}
    </h2>

    <div class="flex gap-4">
        <button
            on:click={encodeFullUrl}
            class="flex-1 px-4 py-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-800/50 text-indigo-700 dark:text-indigo-300 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 touch-manipulation min-h-[44px] min-w-[44px]"
        >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            {dict.encodeBtn}
        </button>

        <button
            on:click={decodeFullUrl}
            class="flex-1 px-4 py-3 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-800/50 text-emerald-700 dark:text-emerald-300 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 touch-manipulation min-h-[44px] min-w-[44px]"
        >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
            {dict.decodeBtn}
        </button>
    </div>
</div>
