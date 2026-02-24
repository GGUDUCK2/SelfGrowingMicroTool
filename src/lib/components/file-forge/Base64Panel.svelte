<script lang="ts">

  import { Copy, Check, Download } from 'lucide-svelte';

  export let file: File;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let dict: Record<string, any>;

  let base64 = '';
  let includeHeader = true;
  let loading = true;
  let copied = false;

  const MAX_PREVIEW_SIZE = 2 * 1024 * 1024; // 2MB

  async function generateBase64() {
    loading = true;
    try {
      if (file.size > MAX_PREVIEW_SIZE) {
        base64 = ''; // Too large for preview
        loading = false;
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // result is "data:type;base64,..."
        base64 = result.split(',')[1];
        loading = false;
      };
      reader.onerror = () => {
        base64 = 'Error generating Base64';
        loading = false;
      };
      reader.readAsDataURL(file);
    } catch (e) {
      console.error(e);
      base64 = 'Error generating Base64';
      loading = false;
    }
  }

  function getOutput() {
    if (!base64) return '';
    if (includeHeader) {
      return `data:${file.type};base64,${base64}`;
    }
    return base64;
  }

  function copy() {
    if (!base64) return;
    navigator.clipboard.writeText(getOutput());
    copied = true;
    setTimeout(() => copied = false, 2000);
  }

  function download() {
    // If file is large, we re-read it to ensure we get the content
    if (file.size > MAX_PREVIEW_SIZE) {
       loading = true;
       const reader = new FileReader();
       reader.onload = () => {
         const result = reader.result as string;
         const content = includeHeader ? result : result.split(',')[1];
         triggerDownload(content);
         loading = false;
       };
       reader.readAsDataURL(file);
    } else {
       triggerDownload(getOutput());
    }
  }

  function triggerDownload(content: string) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name}.base64.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  $: if (file) generateBase64();
</script>

<div class="space-y-4">
  <div class="flex items-center gap-2">
    <input
        type="checkbox"
        id="includeHeader"
        bind:checked={includeHeader}
        class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
    />
    <label for="includeHeader" class="text-sm text-slate-700 dark:text-slate-300">
        {dict.base64.header}
    </label>
  </div>

  <div class="relative group">
    <textarea
        readonly
        class="w-full h-64 p-4 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-300"
        value={loading ? 'Generating...' : (file.size > MAX_PREVIEW_SIZE ? 'File too large for preview. Please use Download.' : getOutput())}
    ></textarea>
  </div>

  <div class="flex gap-2">
    <button
        on:click={copy}
        disabled={loading || file.size > MAX_PREVIEW_SIZE}
        class="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
    >
        {#if copied}
            <Check size={16} />
            {dict.base64.copied || 'Copied!'}
        {:else}
            <Copy size={16} />
            {dict.base64.copy}
        {/if}
    </button>
    <button
        on:click={download}
        disabled={loading}
        class="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
    >
        <Download size={16} />
        {dict.base64.download}
    </button>
  </div>
</div>
