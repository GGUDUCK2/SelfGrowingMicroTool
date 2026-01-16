<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  export let imageUrl: string = '';

  let status: 'idle' | 'loading' | 'success' | 'error' = 'idle';
  let width = 0;
  let height = 0;
  let type = '';

  $: if (imageUrl) {
      checkImage(imageUrl);
  } else {
      status = 'idle';
  }

  async function checkImage(url: string) {
      if (!url) return;
      status = 'loading';

      const img = new Image();
      img.onload = () => {
          width = img.naturalWidth;
          height = img.naturalHeight;
          status = 'success';
      };
      img.onerror = () => {
          status = 'error';
      };
      // Add random query param to avoid cache if needed, but for preview we want cache usually.
      // However, to check validity of *new* url, standard load is fine.
      img.src = url;
  }

  function getDimensionClass(w: number, h: number) {
      if (w < 200 || h < 200) return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      if (w < 1200 || h < 630) return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400';
      return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
  }

  function getMessage(w: number, h: number) {
      if (w < 200 || h < 200) return 'Too Small';
      if (w < 600) return 'Low Res';
      if (w < 1200) return 'Acceptable';
      return 'High Res';
  }
</script>

{#if status !== 'idle'}
<div class="p-4 bg-white dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700 mt-4" transition:fade>
    <h4 class="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
        Image Analysis
    </h4>

    {#if status === 'loading'}
        <div class="flex items-center gap-2 text-sm text-slate-500">
            <div class="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            Checking image...
        </div>
    {:else if status === 'error'}
        <div class="text-sm text-red-500 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-triangle"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            Could not load image. Check URL or CORS permissions.
        </div>
    {:else if status === 'success'}
        <div class="space-y-3">
            <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">Dimensions:</span>
                <span class="font-mono font-medium">{width} x {height}px</span>
            </div>

            <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">Aspect Ratio:</span>
                <span class="font-mono font-medium">{(width / height).toFixed(2)}</span>
            </div>

            <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">Quality Score:</span>
                <span class="px-2 py-0.5 rounded text-xs font-bold {getDimensionClass(width, height)}">
                    {getMessage(width, height)}
                </span>
            </div>

            {#if width < 1200 || height < 630}
                <div class="text-xs text-orange-600 bg-orange-50 dark:bg-orange-900/20 p-2 rounded border border-orange-100 dark:border-orange-800">
                    Recommend 1200x630px for best results on high-DPI screens.
                </div>
            {/if}
        </div>
    {/if}
</div>
{/if}
