<script lang="ts">
  import { generatePayload } from '$lib/utils/qr-forge/generator';
  import type { QRState } from '$lib/utils/qr-forge/types';
  import QRCode from 'qrcode';
  import { Download, Copy, Check } from '@lucide/svelte';
  import { dictionaries } from '$lib/dictionaries';

  export let state: QRState;

  type Dictionary = typeof dictionaries.en;
  export let dictionary: Dictionary;

  let canvas: HTMLCanvasElement;
  let finalDataUrl = '';
  let error = '';
  let copied = false;
  let timeout: ReturnType<typeof setTimeout>;

  // Reactive generation
  $: generate(state);

  const generate = async (s: QRState) => {
    clearTimeout(timeout);
    timeout = setTimeout(async () => {
        const payload = generatePayload(s);
        if (!payload) return;

        try {
            // 1. Generate Basic QR (always High error correction if logo used is better, but stick to user choice)
            const qrDataUrl = await QRCode.toDataURL(payload, {
                errorCorrectionLevel: s.design.errorCorrectionLevel,
                margin: s.design.margin,
                width: 1000, // High res for canvas ops
                color: {
                    dark: s.design.colorDark,
                    light: s.design.colorLight
                }
            });

            // 2. Render to Canvas
            await renderToCanvas(qrDataUrl, s);
            error = '';
        } catch (e) {
            console.error(e);
            error = 'Generation failed';
        }
    }, 100);
  };

  const renderToCanvas = async (qrDataUrl: string, s: QRState) => {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.src = qrDataUrl;
      await new Promise(r => img.onload = r);

      // Set canvas size
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw QR
      ctx.drawImage(img, 0, 0);

      // Draw Logo
      if (s.design.logo) {
          const logoImg = new Image();
          logoImg.src = s.design.logo;
          await new Promise((r, j) => {
             logoImg.onload = r;
             logoImg.onerror = r; // Don't fail if logo invalid
          });

          const size = img.width * (s.design.logoSize || 0.2);
          const x = (img.width - size) / 2;
          const y = (img.height - size) / 2;

          // Draw Image
          ctx.drawImage(logoImg, x, y, size, size);
      }

      // Draw Frame
      if (s.design.frame && s.design.frame !== 'none') {
         if (s.design.frame === 'scan_me') {
            const extraHeight = 100; // px
            const oldData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            canvas.height += extraHeight;

            // Fill background
            ctx.fillStyle = s.design.colorLight;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Put QR back
            ctx.putImageData(oldData, 0, 0);

            // Draw Text
            ctx.fillStyle = s.design.colorDark;
            ctx.font = 'bold 60px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(s.design.frameText || 'SCAN ME', canvas.width / 2, canvas.height - 30);
         }
         else if (s.design.frame === 'simple') {
             const border = 20;
             const oldData = ctx.getImageData(0, 0, canvas.width, canvas.height);
             canvas.width += border * 2;
             canvas.height += border * 2;

             ctx.fillStyle = s.design.colorLight;
             ctx.fillRect(0, 0, canvas.width, canvas.height);
             ctx.putImageData(oldData, border, border);

             ctx.strokeStyle = s.design.colorDark;
             ctx.lineWidth = border;
             ctx.strokeRect(border/2, border/2, canvas.width - border, canvas.height - border);
         }
      }

      finalDataUrl = canvas.toDataURL('image/png');
  };

  const downloadPNG = () => {
    if (!finalDataUrl) return;
    const link = document.createElement('a');
    link.href = finalDataUrl;
    link.download = `qr-forge-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadSVG = async () => {
     // SVG with embedded logo is complex with node-qrcode.
     // We will stick to basic SVG if no logo, or warn user.
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
      if (!finalDataUrl) return;
      try {
          const blob = await (await fetch(finalDataUrl)).blob();
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
  <div class="bg-white p-4 rounded-lg shadow-inner mb-6 transition-all duration-300 relative">
      <!-- Hidden canvas for processing -->
      <canvas bind:this={canvas} class="hidden"></canvas>

      {#if finalDataUrl}
        <img src={finalDataUrl} alt="QR Code" class="max-w-full h-auto" style="min-width: 200px; min-height: 200px;" />
      {:else}
        <div class="w-64 h-64 flex items-center justify-center">
            <span class="text-slate-500">Generating...</span>
        </div>
      {/if}
  </div>

  <div class="grid grid-cols-2 gap-3 w-full">
    <button
        on:click={downloadPNG}
        class="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors min-h-[44px] min-w-[44px]"
    >
        <Download size={18} />
        <span>PNG</span>
    </button>
    <button
        on:click={downloadSVG}
        class="flex items-center justify-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg transition-colors border border-slate-600 min-h-[44px] min-w-[44px]"
        title="SVG does not support logo embedding currently"
    >
        <Download size={18} />
        <span>SVG</span>
    </button>
    <button
        on:click={copyToClipboard}
        class="col-span-2 flex items-center justify-center space-x-2 bg-slate-700 hover:bg-slate-600 text-slate-200 py-2 px-4 rounded-lg transition-colors border border-slate-600 group min-h-[44px] min-w-[44px]"
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
