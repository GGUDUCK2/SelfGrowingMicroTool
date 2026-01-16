<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let imageUrl: string = '';

  let imageStatus: 'idle' | 'loading' | 'success' | 'error' = 'idle';
  let imageDetails: { width: number; height: number; ratio: number } | null = null;

  const dispatch = createEventDispatcher();

  function validateImage() {
    if (!imageUrl) return;
    imageStatus = 'loading';

    const img = new Image();
    img.onload = () => {
      imageStatus = 'success';
      const ratio = img.width / img.height;
      imageDetails = {
        width: img.width,
        height: img.height,
        ratio: Number(ratio.toFixed(2))
      };

      // Check for Facebook reccomendation (1200x630, ~1.91:1)
      const isOptimal = img.width >= 1200 && img.height >= 630 && ratio >= 1.9 && ratio <= 1.92;

      dispatch('validate', {
        valid: true,
        details: imageDetails,
        isOptimal
      });
    };

    img.onerror = () => {
      imageStatus = 'error';
      imageDetails = null;
      dispatch('validate', { valid: false });
    };

    // Cross-origin might fail for some images without CORS headers,
    // but we can still try.
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
  }

  $: if(imageUrl) {
      validateImage();
  }
</script>

{#if imageUrl}
  <div class="mt-4 p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-100 dark:border-slate-700 text-sm">
    <div class="flex items-center gap-2 mb-2">
      <span class="font-semibold text-slate-700 dark:text-slate-300">Image Analysis</span>
      {#if imageStatus === 'loading'}
        <span class="text-xs text-slate-500 animate-pulse">Checking...</span>
      {:else if imageStatus === 'error'}
         <span class="text-xs text-red-500">Could not load image (CORS or Invalid URL)</span>
      {:else if imageStatus === 'success' && imageDetails}
         <span class="text-xs text-green-600 dark:text-green-400 font-medium">Loaded Successfully</span>
      {/if}
    </div>

    {#if imageStatus === 'success' && imageDetails}
      <div class="grid grid-cols-3 gap-2 text-xs">
         <div class="bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-600">
            <div class="text-slate-500 dark:text-slate-400">Dimensions</div>
            <div class="font-mono font-medium">{imageDetails.width} x {imageDetails.height}px</div>
         </div>
         <div class="bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-600">
            <div class="text-slate-500 dark:text-slate-400">Aspect Ratio</div>
            <div class="font-mono font-medium flex items-center gap-1">
                {imageDetails.ratio}:1
                {#if imageDetails.ratio >= 1.9 && imageDetails.ratio <= 1.92}
                    <span class="text-green-500" title="Perfect for OG">✓</span>
                {:else}
                    <span class="text-amber-500" title="Recommended: 1.91:1">⚠</span>
                {/if}
            </div>
         </div>
         <div class="bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-600">
            <div class="text-slate-500 dark:text-slate-400">Quality Score</div>
            <div class="font-mono font-medium">
                {#if imageDetails.width >= 1200}
                    <span class="text-green-600">High Resolution</span>
                {:else if imageDetails.width >= 600}
                    <span class="text-amber-600">Acceptable</span>
                {:else}
                    <span class="text-red-500">Too Small</span>
                {/if}
            </div>
         </div>
      </div>
      {#if imageDetails.width < 1200 || imageDetails.height < 630}
         <div class="mt-2 text-xs text-amber-600 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-triangle"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            Recommend 1200x630px for best results on high-DPI screens.
         </div>
      {/if}
    {/if}
  </div>
{/if}
