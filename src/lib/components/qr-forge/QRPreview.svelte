<script lang="ts">
  import { generatePayload, generateQRCodeDataURL } from '$lib/utils/qr-forge/generator';
  import type { QRState } from '$lib/utils/qr-forge/types';
  import QRCode from 'qrcode';
  import { Download, Copy, Check } from 'lucide-svelte';
  import { fade } from 'svelte/transition';

  export let state: QRState;
  export let dictionary: any;

  let dataUrl = '';
  let error = '';
  let copied = false;

  let timeout: any;

  // Reactive generation
  $: generate(state);

  const generate = async (s: QRState) => {
    clearTimeout(timeout);
    timeout = setTimeout(async () => {
        const payload = generatePayload(s);
        if (!payload) {
            // If empty, maybe show a placeholder or keep previous?
            // Better to show empty state.
            // dataUrl = '';
            return;
        }
        try {
            dataUrl = await generateQRCodeDataURL(payload, s.design);
            error = '';
        } catch (e) {
            console.error(e);
            error = 'Generation failed';
        }
    }, 100);
  };

  const downloadPNG = () => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `qr-forge-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadSVG = async () => {
     const payload = generatePayload(state);
     if (!payload) return;
     try {
         const svg = await QRCode.toString(payload, {
             type: 'svg',
             errorCorrectionLevel: state.design.errorCorrectionLevel,
             margin: state.design.margin,
             color: {
                 dark: state.design.colorDark,
                 light: state.design.colorLight
             }
         });
         const blob = new Blob([svg], { type: 'image/svg+xml' });
         const url = URL.createObjectURL(blob);
         const link = document.createElement('a');
         link.href = url;
         link.download = `qr-forge-${Date.now()}.svg`;
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
         URL.revokeObjectURL(url);
     } catch (e) {
         console.error(e);
     }
  };

  const copyToClipboard = async () => {
      if (!dataUrl) return;
      try {
          const blob = await (await fetch(dataUrl)).blob();
          await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
          ]);
          copied = true;
          setTimeout(() => copied = false, 2000);
      } catch (e) {
          console.error('Copy failed', e);
      }
  };

  const d = dictionary.tools.qrForge || {};
</script>

<div class="bg-slate-800 rounded-xl border border-slate-700 shadow-lg p-6 flex flex-col items-center justify-center sticky top-6">
  {#if dataUrl}
    <div class="bg-white p-4 rounded-lg shadow-inner mb-6 transition-all duration-300">
        <img src={dataUrl} alt="QR Code" class="max-w-full h-auto" style="min-width: 200px; min-height: 200px;" />
    </div>
  {:else}
    <div class="w-64 h-64 bg-slate-700/50 rounded-lg flex items-center justify-center mb-6 animate-pulse">
        <span class="text-slate-500">Generating...</span>
    </div>
  {/if}

  <div class="grid grid-cols-2 gap-3 w-full">
    <button
        on:click={downloadPNG}
        class="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors"
    >
        <Download size={18} />
        <span>PNG</span>
    </button>
    <button
        on:click={downloadSVG}
        class="flex items-center justify-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg transition-colors border border-slate-600"
    >
        <Download size={18} />
        <span>SVG</span>
    </button>
    <button
        on:click={copyToClipboard}
        class="col-span-2 flex items-center justify-center space-x-2 bg-slate-700 hover:bg-slate-600 text-slate-200 py-2 px-4 rounded-lg transition-colors border border-slate-600 group"
    >
        {#if copied}
            <Check size={18} class="text-green-400" />
            <span class="text-green-400">{d.copied || 'Copied!'}</span>
        {:else}
            <Copy size={18} class="group-hover:text-white" />
            <span>{d.copyImage || 'Copy Image'}</span>
        {/if}
    </button>
  </div>
</div>
