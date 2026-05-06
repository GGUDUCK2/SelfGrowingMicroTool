<script lang="ts">
  export let url: string;
  export let dictionary: Record<string, any>;

  let status: 'idle' | 'loading' | 'success' | 'error' = 'idle';
  let dimensions = { w: 0, h: 0 };
  let errorMsg = '';

  $: if (url) {
      checkImage(url);
  } else {
      status = 'idle';
  }

  function checkImage(src: string) {
      if (!src.startsWith('http')) {
          status = 'idle';
          return;
      }

      status = 'loading';
      const img = new Image();
      img.onload = () => {
          dimensions = { w: img.naturalWidth, h: img.naturalHeight };
          status = 'success';
      };
      img.onerror = () => {
          status = 'error';
          errorMsg = dictionary.imageValidator.error || "Could not load image";
      };
      img.src = src;
  }
</script>

<div class="mt-2 text-xs">
  {#if status === 'loading'}
      <span class="text-slate-500 flex items-center gap-1">
          <svg class="animate-spin h-3 w-3 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Checking...
      </span>
  {:else if status === 'success'}
      <div class="flex items-center gap-2">
          <span class="font-medium {dimensions.w >= 1200 && dimensions.h >= 630 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}">
              {dimensions.w}x{dimensions.h}px
          </span>
          <span class="text-slate-400">|</span>
          <span class="text-slate-500">
              {Number(dimensions.w / dimensions.h).toFixed(2)} Ratio
          </span>
      </div>
      {#if dimensions.w < 1200 || dimensions.h < 630}
          <div class="text-amber-600 dark:text-amber-400 mt-1 flex items-start gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
              <span>{dictionary.warnings?.imgSmall?.replace('{w}', '1200').replace('{h}', '630') || "Image is smaller than recommended 1200x630."}</span>
          </div>
      {/if}
  {:else if status === 'error'}
      <span class="text-red-500 flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          {errorMsg}
      </span>
  {/if}
</div>
