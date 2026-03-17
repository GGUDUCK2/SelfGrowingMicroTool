<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';
  import type { KeyForgeState, GameConfig } from '$lib/utils/key-forge/types';
  import { audioEngine } from '$lib/utils/key-forge/audio';

  export let state: KeyForgeState;
  export let config: GameConfig;
  export let focused = false;

  const dispatch = createEventDispatcher();
  let container: HTMLDivElement;
  let cursorRef: HTMLDivElement;

  function handleKeydown(e: KeyboardEvent) {
      if (!focused) return;

      // Prevent scrolling
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault();
      }

      if (e.key === 'Tab') {
          e.preventDefault();
          dispatch('restart');
          return;
      }

      if (e.key.length === 1 || e.key === 'Backspace') {
          if (config.sound !== 'mute') {
             audioEngine.playClick(config.sound);
          }
          dispatch('type', e.key);
      }
  }

  // Auto-scroll cursor into view
  $: if (cursorRef && container) {
      const cursorRect = cursorRef.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const relativeTop = cursorRect.top - containerRect.top;
      const containerHeight = container.clientHeight;

      // Keep cursor in middle
      if (relativeTop > containerHeight / 2) {
         container.scrollTop += (relativeTop - (containerHeight / 2));
      }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  bind:this={container}
  class="relative w-full max-w-4xl h-64 overflow-y-hidden bg-white dark:bg-slate-800 rounded-xl shadow-inner border-2 border-slate-200 dark:border-slate-700 p-8 font-mono text-2xl leading-relaxed outline-none transition-all duration-200 {focused ? 'border-indigo-500 dark:border-indigo-500 ring-4 ring-indigo-500 ring-opacity-20' : ''}"
  on:click={() => dispatch('focus')}
  role="textbox"
  tabindex="0"
>
    {#if !focused}
        <div class="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-10 cursor-pointer" transition:fade>
            <p class="text-slate-500 dark:text-slate-400 font-bold text-lg">Click to Focus</p>
        </div>
    {/if}

    <div class="relative break-words whitespace-pre-wrap select-none" style="tab-size: 4;">
        {#each state.content.split('') as char, i}
            <span
                class="relative transition-colors duration-75 inline-block {i > state.cursor ? 'text-slate-400 dark:text-slate-600' : ''} {i === state.cursor ? 'text-slate-800 dark:text-slate-200' : ''} {i < state.cursor && state.input[i] === char ? 'text-indigo-600 dark:text-indigo-400' : ''} {i < state.cursor && state.input[i] !== char ? 'text-red-500 bg-red-100 dark:bg-red-900/30' : ''} {i < state.cursor && state.input[i] !== char && char === ' ' ? 'underline decoration-red-500' : ''}"
            >
                {char === '\n' ? '↵' : char}
                {#if char === '\n'}<br/>{/if}
                {#if i === state.cursor && focused}
                    <div
                        bind:this={cursorRef}
                        class="absolute left-0 -top-1 w-0.5 h-8 bg-indigo-600 dark:bg-indigo-400 animate-pulse z-20"
                    ></div>
                {/if}
            </span>
        {/each}
    </div>
</div>
