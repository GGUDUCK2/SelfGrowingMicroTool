<script lang="ts">
  import { slide, fade } from 'svelte/transition';
  import { Shield, ShieldAlert, ShieldCheck, Download, RefreshCw, AlertCircle } from 'lucide-svelte';
  import { stripImageMetadata, stripPdfMetadata } from '$lib/utils/file-forge/sanitize';
  import { onDestroy } from 'svelte';
  import { dictionaries } from '$lib/dictionaries';

  export let file: File;
  export let dict: typeof dictionaries.en.tools.fileForge;

  let processing = false;
  let error: string | null = null;
  let sanitizedUrl: string | null = null;
  let sanitizedBlob: Blob | null = null;
  let sanitizedSize = 0;

  // Reset on file change
  $: if (file) {
    if (sanitizedUrl) URL.revokeObjectURL(sanitizedUrl);
    sanitizedUrl = null;
    sanitizedBlob = null;
    error = null;
    processing = false;
  }

  async function handleSanitize() {
    processing = true;
    error = null;
    try {
        if (file.type.startsWith('image/')) {
            sanitizedBlob = await stripImageMetadata(file);
        } else if (file.type === 'application/pdf') {
            const pdfBytes = await stripPdfMetadata(file);
            sanitizedBlob = new Blob([pdfBytes], { type: 'application/pdf' });
        } else {
            throw new Error('Unsupported file type for sanitization. Only Images and PDFs are supported.');
        }

        sanitizedSize = sanitizedBlob.size;
        sanitizedUrl = URL.createObjectURL(sanitizedBlob);
    } catch (e) {
        error = e instanceof Error ? e.message : 'Sanitization failed';
    } finally {
        processing = false;
    }
  }

  function download() {
      if (!sanitizedUrl) return;
      const a = document.createElement('a');
      a.href = sanitizedUrl;
      const ext = file.name.split('.').pop();
      const name = file.name.replace(`.${ext}`, '');
      a.download = `${name}-clean.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  }

  // Cleanup
  onDestroy(() => {
      if (sanitizedUrl) URL.revokeObjectURL(sanitizedUrl);
  });
</script>

<div class="space-y-6">
    <div class="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-800 flex items-start gap-4">
        <Shield size={32} class="text-indigo-600 dark:text-indigo-400 shrink-0 mt-1" />
        <div>
            <h3 class="font-bold text-indigo-900 dark:text-indigo-100 text-lg mb-1">{dict?.privacy?.title || 'Metadata Wiper'}</h3>
            <p class="text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed">
                {dict?.privacy?.desc || 'Remove hidden metadata (EXIF, GPS, Author) from your files before sharing them. This process creates a clean copy of your file.'}
            </p>
        </div>
    </div>

    {#if !sanitizedUrl}
        <div class="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            {#if processing}
                <RefreshCw class="animate-spin text-indigo-500 mb-4" size={48} />
                <p class="text-slate-500 font-medium">{dict?.privacy?.processing || 'Scrubbing metadata...'}</p>
            {:else}
                <ShieldAlert class="text-slate-400 mb-4" size={48} />
                <p class="text-slate-500 mb-6 text-center max-w-md">
                    {#if file.type.startsWith('image/') || file.type === 'application/pdf'}
                        {dict?.privacy?.ready || 'Ready to sanitize. This will strip all metadata tags and recreate the file structure.'}
                    {:else}
                        {dict?.privacy?.unsupported || 'Sanitization is currently only supported for Images and PDF files.'}
                    {/if}
                </p>
                <button
                    on:click={handleSanitize}
                    disabled={!(file.type.startsWith('image/') || file.type === 'application/pdf')}
                    class="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                    <ShieldCheck size={20} />
                    {dict?.privacy?.sanitize || 'Sanitize File'}
                </button>
            {/if}
        </div>
    {:else}
        <div in:slide class="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800 p-8 text-center">
            <div class="inline-flex p-4 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 mb-4 shadow-sm">
                <ShieldCheck size={40} />
            </div>
            <h3 class="text-xl font-bold text-emerald-900 dark:text-emerald-100 mb-2">
                {dict?.privacy?.success || 'Sanitization Complete'}
            </h3>
            <p class="text-emerald-700 dark:text-emerald-300 mb-6">
                Metadata stripped successfully.
                <span class="font-mono text-xs bg-emerald-100 dark:bg-emerald-900 px-2 py-1 rounded ml-2">
                    {(sanitizedSize / 1024).toFixed(2)} KB
                </span>
            </p>

            <button
                on:click={download}
                class="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 mx-auto"
            >
                <Download size={20} />
                {dict?.privacy?.download || 'Download Clean File'}
            </button>
        </div>
    {/if}

    {#if error}
        <div in:fade class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl flex items-start gap-3">
            <AlertCircle class="text-red-500 shrink-0 mt-0.5" size={18} />
            <p class="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
    {/if}
</div>
