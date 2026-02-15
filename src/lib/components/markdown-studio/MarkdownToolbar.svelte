<script lang="ts">
  import {
    Bold,
    Italic,
    Heading1,
    Link,
    Image,
    List,
    ListOrdered,
    Quote,
    Code,
    Table,
    Minus,
    Download,
    Printer,
    Copy,
    FileCode,
    Save,
    Trash2,
    RotateCcw
  } from 'lucide-svelte';
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';

  export let dictionary: any;
  export let hasContent: boolean = false;

  const dispatch = createEventDispatcher();

  function action(type: string) {
    dispatch('action', type);
  }
</script>

<div class="flex flex-wrap items-center gap-1 p-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 rounded-t-lg">
  <!-- Formatting Group -->
  <div class="flex items-center gap-1 pr-2 border-r border-slate-300 dark:border-slate-600">
    <button
      class="p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
      on:click={() => action('bold')}
      title={dictionary.actions.bold}
      aria-label={dictionary.actions.bold}
    >
      <Bold size={18} />
    </button>
    <button
      class="p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
      on:click={() => action('italic')}
      title={dictionary.actions.italic}
      aria-label={dictionary.actions.italic}
    >
      <Italic size={18} />
    </button>
    <button
      class="p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
      on:click={() => action('heading')}
      title={dictionary.actions.heading}
      aria-label={dictionary.actions.heading}
    >
      <Heading1 size={18} />
    </button>
  </div>

  <!-- Structure Group -->
  <div class="flex items-center gap-1 px-2 border-r border-slate-300 dark:border-slate-600">
    <button
      class="p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
      on:click={() => action('link')}
      title={dictionary.actions.link}
      aria-label={dictionary.actions.link}
    >
      <Link size={18} />
    </button>
    <button
      class="p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
      on:click={() => action('image')}
      title={dictionary.actions.image}
      aria-label={dictionary.actions.image}
    >
      <Image size={18} />
    </button>
    <button
      class="p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
      on:click={() => action('quote')}
      title={dictionary.actions.quote}
      aria-label={dictionary.actions.quote}
    >
      <Quote size={18} />
    </button>
  </div>

  <!-- List Group -->
  <div class="flex items-center gap-1 px-2 border-r border-slate-300 dark:border-slate-600">
    <button
      class="p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
      on:click={() => action('listUl')}
      title={dictionary.actions.listUl}
      aria-label={dictionary.actions.listUl}
    >
      <List size={18} />
    </button>
    <button
      class="p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
      on:click={() => action('listOl')}
      title={dictionary.actions.listOl}
      aria-label={dictionary.actions.listOl}
    >
      <ListOrdered size={18} />
    </button>
  </div>

  <!-- Advanced Group -->
  <div class="flex items-center gap-1 px-2 border-r border-slate-300 dark:border-slate-600 hidden sm:flex">
    <button
      class="p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
      on:click={() => action('code')}
      title={dictionary.actions.code}
      aria-label={dictionary.actions.code}
    >
      <Code size={18} />
    </button>
    <button
      class="p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
      on:click={() => action('table')}
      title={dictionary.actions.table}
      aria-label={dictionary.actions.table}
    >
      <Table size={18} />
    </button>
    <button
      class="p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
      on:click={() => action('rule')}
      title={dictionary.actions.rule}
      aria-label={dictionary.actions.rule}
    >
      <Minus size={18} />
    </button>
  </div>

  <!-- Actions Group -->
  <div class="flex items-center gap-1 ml-auto">
    <button
      class="p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
      on:click={() => action('copy')}
      title={dictionary.copy}
      aria-label={dictionary.copy}
      disabled={!hasContent}
    >
      <Copy size={18} />
    </button>
    <button
      class="p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors hidden sm:block"
      on:click={() => action('copyHtml')}
      title={dictionary.copyHtml}
      aria-label={dictionary.copyHtml}
      disabled={!hasContent}
    >
      <FileCode size={18} />
    </button>
    <button
      class="p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
      on:click={() => action('download')}
      title={dictionary.download}
      aria-label={dictionary.download}
      disabled={!hasContent}
    >
      <Download size={18} />
    </button>
    <button
      class="p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
      on:click={() => action('print')}
      title={dictionary.print}
      aria-label={dictionary.print}
      disabled={!hasContent}
    >
      <Printer size={18} />
    </button>

    <div class="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1"></div>

    <button
      class="p-2.5 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors"
      on:click={() => action('save')}
      title={dictionary.save}
      aria-label={dictionary.save}
    >
      <Save size={18} />
    </button>
    <button
      class="p-2.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
      on:click={() => action('clear')}
      title={dictionary.clear}
      aria-label={dictionary.clear}
      disabled={!hasContent}
    >
      <Trash2 size={18} />
    </button>
  </div>
</div>
