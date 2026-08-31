<script lang="ts">
  import type { BarcodeState } from './types';
  import JSZip from 'jszip';
  import JsBarcode from 'jsbarcode';
  import Download from '@lucide/svelte/icons/download';
  import FileArchive from '@lucide/svelte/icons/file-archive';

  export let state: BarcodeState;
  export let dictionary: Record<string, any>;

  $: t = dictionary?.tools?.barcodeForge || {};
  let isGeneratingZip = false;

  async function generateZIP() {
      const values = state.bulk.values.split('\n').map(v => v.trim()).filter(v => v);
      if (values.length === 0) return;

      isGeneratingZip = true;
      const zip = new JSZip();
      const canvas = document.createElement('canvas');

      for (let i = 0; i < values.length; i++) {
          const val = values[i];
          try {
              JsBarcode(canvas, val, {
                  format: state.format,
                  width: state.design.width,
                  height: state.design.height,
                  margin: state.design.margin,
                  displayValue: state.design.displayValue,
                  fontOptions: state.design.fontOptions,
                  font: state.design.font,
                  textAlign: state.design.textAlign,
                  textPosition: state.design.textPosition,
                  textMargin: state.design.textMargin,
                  fontSize: state.design.fontSize,
                  background: state.design.background,
                  lineColor: state.design.lineColor
              });

              // Convert canvas to blob
              const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
              if (blob) {
                 const arrayBuffer = await blob.arrayBuffer();
                 zip.file(`barcode_${i + 1}_${val.replace(/[^a-z0-9]/gi, '_')}.png`, arrayBuffer);
              }
          } catch (e) {
              console.warn(`Failed to generate barcode for value: ${val}`);
          }
      }

      try {
          const content = await zip.generateAsync({ type: 'blob' });
          const url = URL.createObjectURL(content);
          const link = document.createElement('a');
          link.href = url;
          link.download = `barcodes_${state.format}.zip`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
      } catch (err) {
          console.error("ZIP Generation failed", err);
      } finally {
          isGeneratingZip = false;
      }
  }

  $: validLinesCount = state.bulk.values.split('\n').map(v => v.trim()).filter(v => v).length;
</script>

<div class="space-y-4">
    <label class="block">
        <span class="block text-sm font-medium text-slate-900 dark:text-slate-300 mb-2">
            {t.bulkPlaceholder || 'Enter one value per line...'}
        </span>
        <textarea
            bind:value={state.bulk.values}
            rows="8"
            class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 font-mono min-h-[120px]"
            placeholder="1234567890&#10;0987654321&#10;..."
        ></textarea>
    </label>

    <div class="flex items-center justify-between">
        <span class="text-sm text-slate-600 dark:text-slate-400">
            {validLinesCount} items detected
        </span>
        <button
            on:click={generateZIP}
            disabled={isGeneratingZip || validLinesCount === 0}
            class="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-colors min-h-[44px]"
        >
            {#if isGeneratingZip}
                <div class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Generating...</span>
            {:else}
                <FileArchive size={18} />
                <span>{t.generateZip || 'Generate ZIP'}</span>
            {/if}
        </button>
    </div>
</div>
