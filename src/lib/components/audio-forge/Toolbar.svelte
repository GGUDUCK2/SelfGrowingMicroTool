<script lang="ts">
  import { Scissors, Download, FileAudio, Music, Plus, FolderOpen, Save } from 'lucide-svelte';

  export let hasSelection = false;
  export let hasAudio = false;
  export let dict: any;

  export let onTrim: () => void;
  export let onExportWav: () => void;
  export let onExportWebM: () => void;
  export let onNew: () => void;
  export let onOpen: () => void;
  export let onSave: () => void;
  export let onGenerate: () => void;

</script>

<div class="flex flex-wrap items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
  <div class="flex items-center gap-1">
    <button on:click={onNew} class="btn-tool" title={dict.actions.new}>
      <Plus class="w-4 h-4" /> <span class="hidden sm:inline">{dict.actions.new}</span>
    </button>
    <button on:click={onOpen} class="btn-tool" title={dict.actions.open}>
      <FolderOpen class="w-4 h-4" /> <span class="hidden sm:inline">{dict.actions.open}</span>
    </button>
     <button on:click={onSave} class="btn-tool" title={dict.actions.save} disabled={!hasAudio}>
      <Save class="w-4 h-4" /> <span class="hidden sm:inline">{dict.actions.save}</span>
    </button>
  </div>

  <div class="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1"></div>

  <div class="flex items-center gap-1">
    <button on:click={onTrim} class="btn-tool" disabled={!hasSelection} title={dict.actions.trim}>
      <Scissors class="w-4 h-4" /> <span class="hidden sm:inline">{dict.actions.trim}</span>
    </button>
    <button on:click={onGenerate} class="btn-tool" title={dict.actions.generate}>
      <Music class="w-4 h-4" /> <span class="hidden sm:inline">{dict.actions.generate}</span>
    </button>
  </div>

  <div class="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1"></div>

  <div class="flex items-center gap-1">
    <button on:click={onExportWav} class="btn-tool" disabled={!hasAudio} title={dict.actions.exportWav}>
      <FileAudio class="w-4 h-4" /> <span class="hidden sm:inline">WAV</span>
    </button>
     <button on:click={onExportWebM} class="btn-tool" disabled={!hasAudio} title={dict.actions.exportWebM}>
      <Download class="w-4 h-4" /> <span class="hidden sm:inline">WebM</span>
    </button>
  </div>
</div>

<style>
  .btn-tool {
    @apply flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-slate-200 dark:hover:border-slate-700;
  }
</style>
