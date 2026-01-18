<script lang="ts">
  import { Download, Loader2, FileArchive, CheckCircle2 } from 'lucide-svelte';
  import { IconProcessor, type IconConfig, type GeneratedAsset } from '$lib/utils/icon-forge/processor';
  import JSZip from 'jszip';

  export let file: File | null;
  export let config: IconConfig;
  export let t: any;

  let isGenerating = false;
  let progress = 0;
  let isDone = false;

  async function handleDownload() {
    if (!file) return;

    try {
      isGenerating = true;
      progress = 10;
      isDone = false;

      // Generate Assets
      const assets = await IconProcessor.generate(file, config);
      progress = 50;

      // Create Zip
      const zip = new JSZip();

      assets.forEach(asset => {
        zip.file(asset.name, asset.blob);
      });

      progress = 80;

      const content = await zip.generateAsync({ type: "blob" });
      progress = 100;

      // Download
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'icon-forge-assets.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      isDone = true;
      setTimeout(() => isDone = false, 3000);
    } catch (e) {
      console.error(e);
      alert('Failed to generate icons');
    } finally {
      isGenerating = false;
    }
  }
</script>

<div class="bg-slate-800 rounded-xl border border-slate-700 p-6">
  <div class="flex items-center justify-between mb-6">
    <h3 class="text-lg font-medium text-slate-200">{t.export.title}</h3>
    <div class="p-2 bg-indigo-500/10 rounded-lg">
      <FileArchive class="w-5 h-5 text-indigo-400" />
    </div>
  </div>

  <div class="space-y-4 mb-6">
    <div class="flex items-center justify-between text-sm text-slate-400">
       <span>{t.export.favicon}</span>
       <span class="text-xs bg-slate-700 px-2 py-0.5 rounded">16, 32, 48px</span>
    </div>
    <div class="flex items-center justify-between text-sm text-slate-400">
       <span>{t.export.pwa}</span>
       <span class="text-xs bg-slate-700 px-2 py-0.5 rounded">192, 512px</span>
    </div>
    <div class="flex items-center justify-between text-sm text-slate-400">
        <span>Apple Touch Icon</span>
        <span class="text-xs bg-slate-700 px-2 py-0.5 rounded">180px</span>
     </div>
    <div class="flex items-center justify-between text-sm text-slate-400">
       <span>{t.export.manifest}</span>
       <span class="text-xs bg-slate-700 px-2 py-0.5 rounded">JSON</span>
    </div>
  </div>

  <button
    on:click={handleDownload}
    disabled={!file || isGenerating}
    class="w-full h-11 flex items-center justify-center space-x-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
  >
    {#if isGenerating}
      <Loader2 class="w-5 h-5 animate-spin" />
      <span>{t.export.generating} {progress}%</span>
    {:else if isDone}
      <CheckCircle2 class="w-5 h-5" />
      <span>{t.export.downloaded}</span>
    {:else}
      <Download class="w-5 h-5" />
      <span>{t.export.download}</span>
    {/if}
  </button>
</div>
