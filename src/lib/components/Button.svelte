<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let variant: 'primary' | 'secondary' | 'danger' = 'secondary';
  export let title: string = '';
  export let ariaLabel: string = '';

  const dispatch = createEventDispatcher();

  const baseClasses = "min-h-[44px] min-w-[44px] px-4 sm:px-6 rounded-lg font-medium transition-all duration-200 shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm flex items-center gap-2";

  $: classes =
    variant === 'primary'
      ? `${baseClasses} bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-50 disabled:cursor-not-allowed relative`
      : variant === 'danger'
      ? `${baseClasses} bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-red-400`
      : `${baseClasses} bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600`;

</script>

<button
  class={classes}
  {title}
  aria-label={ariaLabel || title}
  on:click={(e) => dispatch('click', e)}
  {...$$restProps}
>
  <slot></slot>
</button>
