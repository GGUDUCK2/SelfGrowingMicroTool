<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let variant: 'primary' | 'secondary' | 'ghost' | 'danger' = 'primary';
  export let disabled: boolean = false;
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let fullWidth: boolean = false;
  export let className: string = '';

  const dispatch = createEventDispatcher();

  // Base styles
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed';

  // Variants
  const variants = {
    primary: 'bg-indigo-500 text-white hover:bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20',
    secondary: 'bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600 rounded-lg',
    ghost: 'bg-transparent text-slate-400 hover:text-white hover:bg-white/5 rounded-lg',
    danger: 'bg-red-500 text-white hover:bg-red-600 rounded-lg shadow-lg shadow-red-500/20',
  };

  // Sizes
  const sizes = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-11 px-6 text-base',
    lg: 'h-12 px-8 text-lg',
  };

  $: classes = [
    baseClasses,
    variants[variant],
    sizes[size],
    fullWidth ? 'w-full' : '',
    className
  ].filter(Boolean).join(' ');

  function handleClick(event: MouseEvent) {
    if (!disabled) {
      dispatch('click', event);
    }
  }
</script>

<button
  {type}
  class={classes}
  {disabled}
  on:click={handleClick}
  aria-label={$$props['aria-label']}
  {...$$restProps}
>
  <slot />
</button>
