<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  import JsBarcode from 'jsbarcode';

  export let value: string;
  export let format: string;
  export let options: any = {};
  export let valid: boolean = false;

  let svgElement: SVGSVGElement;
  let errorMsg = '';

  const generate = () => {
    if (!svgElement) return;
    errorMsg = '';
    valid = false;

    try {
      if (!value) {
        // Clear if empty
        svgElement.innerHTML = '';
        return;
      }

      // Check for EAN-13 specific validation to prevent JsBarcode from throwing uncaught errors
      // or to handle them gracefully if JsBarcode throws.
      // However, JsBarcode usually handles validity internally or throws.

      JsBarcode(svgElement, value, {
        format: format === 'auto' ? undefined : format,
        ...options,
        valid: (v) => {
            valid = v;
            if (!v) {
                errorMsg = 'Invalid input for selected format';
            }
        }
      });
      // Double check validity flag if JsBarcode didn't set it (some versions differ)
      // Actually JsBarcode returns the API object, validation is callback-based or try-catch for some formats.
      // Let's rely on try-catch for immediate feedback as well.

      valid = true;
    } catch (e) {
      console.warn(e);
      valid = false;
      errorMsg = (e as Error).message || 'Invalid format';
      // Clear the SVG on error
      svgElement.innerHTML = '';
    }
  };

  $: if (value || format || options) {
    generate();
  }

  onMount(() => {
    generate();
  });
</script>

<div class="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-sm border border-slate-200 min-h-[200px] w-full overflow-hidden relative">
  {#if errorMsg}
    <div class="text-rose-500 font-medium text-center animate-pulse">
        {errorMsg}
    </div>
  {/if}

  <svg bind:this={svgElement} class="max-w-full h-auto"></svg>
</div>
