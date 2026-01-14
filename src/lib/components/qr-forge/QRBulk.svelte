<script lang="ts">
  import type { QRState } from '$lib/utils/qr-forge/types';
  import QRCode from 'qrcode';
  import JSZip from 'jszip';
  import { Download, Loader2 } from 'lucide-svelte';
  import { dictionaries } from '$lib/dictionaries';

  export let state: QRState;
  type Dictionary = typeof dictionaries.en;
  export let dictionary: Dictionary;

  let isGenerating = false;
  let progress = 0;
  let total = 0;

  // Use partial type access safely
  const d: any = dictionary.tools.qrForge || {};

  const generateZip = async () => {
      if (!state.bulk?.items) return;

      isGenerating = true;
      progress = 0;
      const lines = state.bulk.items.split('\n').filter(l => l.trim());
      total = lines.length;

      if (total === 0) {
          isGenerating = false;
          return;
      }

      const zip = new JSZip();
      const prefix = state.bulk.prefix || '';

      try {
          for (let i = 0; i < total; i++) {
              const line = lines[i].trim();
              const content = prefix + line;
              // Clean filename
              const cleanLine = line.substring(0, 15).replace(/[^a-z0-9]/gi, '_');
              const filename = `qr-${i + 1}-${cleanLine}.png`;

              // Generate QR Buffer/DataURL
              const dataUrl = await QRCode.toDataURL(content, {
                  errorCorrectionLevel: state.design.errorCorrectionLevel,
                  margin: state.design.margin,
                  width: 500,
                  color: {
                      dark: state.design.colorDark,
                      light: state.design.colorLight
                  }
              });

              // Remove header
              const base64 = dataUrl.split(',')[1];
              zip.file(filename, base64, { base64: true });

              progress = i + 1;
              // Allow UI update
              await new Promise(r => setTimeout(r, 10));
          }

          const blob = await zip.generateAsync({ type: 'blob' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `qr-bulk-${Date.now()}.zip`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

      } catch (e) {
          console.error(e);
          alert('Failed to generate ZIP');
      } finally {
          isGenerating = false;
      }
  };
</script>

<div class="space-y-4" role="region" aria-label="Bulk QR Generator">
    <div>
        <label class="block">
            <span class="block text-sm font-medium text-slate-300 mb-1">{d.bulkInputLabel || 'Bulk Input (One per line)'}</span>
            <textarea
                bind:value={state.bulk.items}
                rows="8"
                class="w-full bg-slate-700 border-slate-600 rounded-lg px-4 py-2 text-slate-50 focus:ring-2 focus:ring-indigo-500 font-mono text-sm placeholder-slate-400"
                placeholder={d.bulkPlaceholder || 'https://site1.com\nhttps://site2.com\n...'}
            ></textarea>
        </label>
        <div class="text-xs text-slate-400 mt-1 flex justify-between">
            <span>{state.bulk.items?.split('\n').filter(l => l.trim()).length || 0} items</span>
        </div>
    </div>

    <div>
         <label class="block">
            <span class="block text-sm font-medium text-slate-300 mb-1">{d.bulkPrefix || 'Prefix (Optional)'}</span>
            <input
                type="text"
                bind:value={state.bulk.prefix}
                placeholder="https://"
                class="w-full bg-slate-700 border-slate-600 rounded-lg px-4 py-2 text-slate-50 focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
            />
        </label>
    </div>

    <button
        on:click={generateZip}
        disabled={isGenerating || !state.bulk?.items}
        class="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/20"
    >
        {#if isGenerating}
            <Loader2 class="animate-spin" size={20} />
            <span>Generating {progress}/{total}</span>
        {:else}
            <Download size={20} />
            <span>{d.generateZip || 'Generate ZIP'}</span>
        {/if}
    </button>
</div>
