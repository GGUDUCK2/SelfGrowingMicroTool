<script lang="ts">
  import { dictionaries } from '$lib/dictionaries';
  import JSZip from 'jszip';
  import JsBarcode from 'jsbarcode';
  import { Download } from '@lucide/svelte';
  import { slide } from 'svelte/transition';

  export let lang: string = 'en';
  export let options: any;
  export let format: string;

  $: dict = dictionaries[lang as keyof typeof dictionaries] || dictionaries.en;
  $: d = (dict as any).tools.barcodeForge;

  let input = '';
  let generating = false;
  let progress = 0;

  const generateZip = async () => {
    if (!input.trim()) return;

    generating = true;
    progress = 0;
    const zip = new JSZip();
    const lines = input.split('\n').map(l => l.trim()).filter(l => l);
    const total = lines.length;

    // Create a temporary canvas for generation
    const canvas = document.createElement('canvas');

    try {
        for (let i = 0; i < total; i++) {
            const value = lines[i];

            // Clear canvas context
            const ctx = canvas.getContext('2d');
            if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Generate
            try {
                JsBarcode(canvas, value, {
                    format: format === 'auto' ? undefined : format,
                    ...options
                });

                // Convert to blob
                const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
                if (blob) {
                    zip.file(`barcode-${value}.png`, blob);
                }
            } catch (e) {
                console.warn(`Failed to generate barcode for ${value}`, e);
                zip.file(`error-${value}.txt`, `Failed: ${(e as Error).message}`);
            }

            progress = Math.round(((i + 1) / total) * 100);
            // Yield to UI
            await new Promise(r => setTimeout(r, 0));
        }

        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'barcodes.zip';
        a.click();
        URL.revokeObjectURL(url);

    } catch (e) {
        console.error(e);
        alert('Generation failed');
    } finally {
        generating = false;
        progress = 0;
    }
  };
</script>

<div class="space-y-4" in:slide>
  <div>
    <label for="bulk-input" class="block text-xs font-medium text-slate-500 mb-1">{d.bulkPlaceholder}</label>
    <textarea
        id="bulk-input"
        bind:value={input}
        rows="10"
        class="min-h-[44px] w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 font-mono"
        placeholder="123456789012&#10;123456789013&#10;123456789014"
    ></textarea>
    <p class="text-xs text-slate-400 mt-1 text-right">
        {input.split('\n').filter(l => l.trim()).length} items
    </p>
  </div>

  <button
    disabled={generating || !input.trim()}
    on:click={generateZip}
    class="min-h-[44px] w-full flex items-center justify-center space-x-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {#if generating}
        <span>{d.validation.calculating} {progress}%</span>
    {:else}
        <Download size={18} />
        <span>{d.generateZip}</span>
    {/if}
  </button>
</div>
