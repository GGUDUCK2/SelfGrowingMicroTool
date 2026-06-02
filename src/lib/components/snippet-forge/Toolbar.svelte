<script lang="ts">
  import { toPng } from 'html-to-image';
  import { createEventDispatcher } from 'svelte';
  import { Download, Copy, Save, Check } from '@lucide/svelte';

  export let dict: any;

  const dispatch = createEventDispatcher();
  let copying = false;
  let downloading = false;
  let copied = false;
  let downloaded = false;

  async function handleCopy() {
      if (copying) return;
      copying = true;
      try {
          const node = document.getElementById('snippet-capture');
          if (node) {
               // Must generate a Blob for ClipboardItem
               const dataUrl = await toPng(node, { pixelRatio: 2 });
               const res = await fetch(dataUrl);
               const blob = await res.blob();

               if (blob) {
                   await navigator.clipboard.write([
                       new ClipboardItem({ 'image/png': blob })
                   ]);
                   copied = true;
                   setTimeout(() => copied = false, 2000);
               }
          }
      } catch (e) {
          console.error('Copy failed', e);
          alert('Failed to copy image. Browser security might block it. Try Download instead.');
      }
      copying = false;
  }

  async function handleDownload() {
      if (downloading) return;
      downloading = true;
      try {
          const node = document.getElementById('snippet-capture');
          if (node) {
              const dataUrl = await toPng(node, { pixelRatio: 2 });
              const link = document.createElement('a');
              link.download = `snippet-${new Date().getTime()}.png`;
              link.href = dataUrl;
              link.click();
              downloaded = true;
              setTimeout(() => downloaded = false, 2000);
          }
      } catch (e) {
          console.error(e);
      }
      downloading = false;
  }

  function handleSave() {
      dispatch('save');
  }
</script>

<div class="flex items-center gap-2">
    <button
        class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
        on:click={handleSave}
    >
        <Save size={16} />
        <span class="hidden sm:inline">{dict.save}</span>
    </button>

    <div class="h-6 w-px bg-slate-300 dark:bg-slate-700 mx-1"></div>

    <button
        class="flex items-center gap-2 px-3 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all shadow-sm min-w-[110px] justify-center"
        on:click={handleCopy}
        disabled={copying}
    >
        {#if copied}
            <Check size={16} />
            <span>{dict.copied.split(' ')[0]}</span>
        {:else if copying}
            <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        {:else}
            <Copy size={16} />
            <span>{dict.copy}</span>
        {/if}
    </button>

    <button
        class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm"
        on:click={handleDownload}
        disabled={downloading}
        title={dict.download}
    >
        {#if downloaded}
            <Check size={16} />
        {:else if downloading}
             <div class="w-4 h-4 border-2 border-slate-500 border-t-indigo-600 rounded-full animate-spin"></div>
        {:else}
            <Download size={16} />
        {/if}
    </button>
</div>
