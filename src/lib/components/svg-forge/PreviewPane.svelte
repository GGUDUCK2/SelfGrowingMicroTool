<script lang="ts">
  import Button from '$lib/components/Button.svelte';

  export let optimizedSvg: string = '';
  export let error: string | undefined = undefined;
  export let originalSize: number = 0;
  export let optimizedSize: number = 0;
  export let t: any;
  export let onToast: (msg: string) => void;

  $: savings = originalSize > 0 ? ((originalSize - optimizedSize) / originalSize) * 100 : 0;
  $: savingsFormatted = savings.toFixed(1);

  function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

  function copyCode() {
    if (!optimizedSvg) return;
    navigator.clipboard.writeText(optimizedSvg);
    onToast(t.preview.copied);
  }

  function downloadSvg() {
    if (!optimizedSvg) return;
    const blob = new Blob([optimizedSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'optimized.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onToast(t.preview.downloaded);
  }
</script>

<div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-full min-h-[400px]">
  <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
    <h2 class="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h4l3-9 5 18 3-9h5"/></svg>
      {t.preview.title}
    </h2>
    <div class="flex gap-2">
      <Button variant="secondary" size="sm" onclick={copyCode} disabled={!optimizedSvg || !!error} class="min-h-[44px]">
        {t.preview.copy}
      </Button>
      <Button variant="primary" size="sm" onclick={downloadSvg} disabled={!optimizedSvg || !!error} class="min-h-[44px]">
        {t.preview.download}
      </Button>
    </div>
  </div>

  <div class="p-4 flex-grow relative bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/ENAEAWgw8FqCAwO/N2BgYBg1AAAKZAkHh+w4YwAAAABJRU5ErkJggg==')] dark:bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAKUlEQVQ4T2NkoBAwUqifYdQAhtEwIJAN8AcCmiAADQZeS3Bg4PcGEA8AJgQHh+w4YwAAAABJRU5ErkJggg==')] bg-repeat flex items-center justify-center overflow-auto">
    {#if error}
      <div class="p-4 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg text-sm max-w-full overflow-hidden">
        {error}
      </div>
    {:else if optimizedSvg}
      <div class="w-full h-full flex items-center justify-center p-4">
        {@html optimizedSvg}
      </div>
    {:else}
      <div class="text-slate-400 dark:text-slate-500 text-sm">
        {t.preview.empty}
      </div>
    {/if}
  </div>

  {#if optimizedSvg && !error}
    <div class="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 grid grid-cols-3 gap-4 text-center">
      <div>
        <div class="text-xs text-slate-500 dark:text-slate-400 mb-1">{t.preview.original}</div>
        <div class="text-sm font-medium text-slate-800 dark:text-slate-200">{formatBytes(originalSize)}</div>
      </div>
      <div>
        <div class="text-xs text-slate-500 dark:text-slate-400 mb-1">{t.preview.optimized}</div>
        <div class="text-sm font-medium text-slate-800 dark:text-slate-200">{formatBytes(optimizedSize)}</div>
      </div>
      <div>
        <div class="text-xs text-slate-500 dark:text-slate-400 mb-1">{t.preview.savings}</div>
        <div class="text-sm font-bold text-emerald-600 dark:text-emerald-400">{savingsFormatted}%</div>
      </div>
    </div>
  {/if}
</div>