<script lang="ts">
  import { onMount, tick } from 'svelte';
  import JsBarcode from 'jsbarcode';
  import type { BarcodeState } from './types';
  import Download from '@lucide/svelte/icons/download';
  import Code from '@lucide/svelte/icons/code';
  import AlertCircle from '@lucide/svelte/icons/alert-circle';

  export let state: BarcodeState;
  export let dictionary: Record<string, any>;

  let svgElement: SVGSVGElement;
  let canvasElement: HTMLCanvasElement;
  let containerRef: HTMLDivElement;
  let validationError: string | null = null;
  let isGenerating = false;

  $: if (state && (svgElement || canvasElement)) {
    generateBarcode();
  }

  $: t = dictionary?.tools?.barcodeForge || {};

  async function generateBarcode() {
      if (!state.value.trim() && state.type !== 'bulk') {
          validationError = t.validation?.invalid || "Invalid value";
          return;
      }
      isGenerating = true;
      validationError = null;
      await tick();

      try {
          // Render to SVG for display and SVG export
          if (svgElement) {
            JsBarcode(svgElement, state.value, {
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
                lineColor: state.design.lineColor,
                valid: function (valid: boolean) {
                    if (!valid) {
                       validationError = t.validation?.invalid || "Invalid format for value";
                    }
                }
            });
          }

          // Render to hidden canvas for PNG export
          if (canvasElement && !validationError) {
             JsBarcode(canvasElement, state.value, {
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
          }
      } catch (err: any) {
          validationError = err.message || t.validation?.invalid || "Invalid format";
      } finally {
          isGenerating = false;
      }
  }

  function downloadSVG() {
      if (!svgElement || validationError) return;
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      downloadBlob(blob, `barcode-${state.value}.svg`);
  }

  function downloadPNG() {
      if (!canvasElement || validationError) return;
      canvasElement.toBlob((blob) => {
          if (blob) {
              downloadBlob(blob, `barcode-${state.value}.png`);
          }
      }, 'image/png');
  }

  function downloadBlob(blob: Blob, filename: string) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
  }

  onMount(() => {
      generateBarcode();
  });
</script>

<div class="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700/50" bind:this={containerRef}>
  <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-200">Preview</h2>
      {#if validationError}
        <div class="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 px-3 py-1 rounded-full">
            <AlertCircle size={14} />
            <span>{validationError}</span>
        </div>
      {:else if isGenerating}
         <div class="text-sm text-slate-600 dark:text-slate-400">{t.validation?.calculating || 'Calculating...'}</div>
      {:else}
         <div class="text-sm text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full">{t.validation?.valid || 'Valid'}</div>
      {/if}
  </div>

  <div class="bg-white dark:bg-slate-900 rounded-xl p-8 flex items-center justify-center min-h-[300px] overflow-x-auto relative">
      {#if state.type === 'bulk'}
         <div class="text-slate-500 dark:text-slate-500 flex flex-col items-center">
             <Code size={48} class="mb-4 opacity-50" />
             <p>Bulk Mode Active</p>
         </div>
      {:else}
         <div class="opacity-0 absolute pointer-events-none">
             <canvas bind:this={canvasElement}></canvas>
         </div>
         <svg bind:this={svgElement} class="max-w-full h-auto drop-shadow-xl" aria-label="Barcode Preview"></svg>
      {/if}
  </div>

  {#if state.type !== 'bulk'}
  <div class="grid grid-cols-2 gap-4 mt-6">
      <button
          on:click={downloadSVG}
          disabled={!!validationError || isGenerating}
          class="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-colors min-h-[44px]"
      >
          <Code size={18} />
          <span>{t.downloadSvg || 'Download SVG'}</span>
      </button>
      <button
          on:click={downloadPNG}
           disabled={!!validationError || isGenerating}
          class="flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 dark:text-white font-medium py-3 px-4 rounded-xl transition-colors min-h-[44px]"
      >
          <Download size={18} />
          <span>{t.downloadPng || 'Download PNG'}</span>
      </button>
  </div>
  {/if}
</div>
