<script lang="ts">
  export let password = '';
  export let ariaLabel = 'Generated Password';

  interface CharInfo {
    char: string;
    type: 'uppercase' | 'lowercase' | 'number' | 'symbol' | 'space';
  }

  $: charList = password.split('').map((char): CharInfo => {
    if (/[A-Z]/.test(char)) return { char, type: 'uppercase' };
    if (/[a-z]/.test(char)) return { char, type: 'lowercase' };
    if (/[0-9]/.test(char)) return { char, type: 'number' };
    if (char === ' ') return { char, type: 'space' };
    return { char, type: 'symbol' };
  });

  function getColorClass(type: string) {
    switch (type) {
      case 'uppercase': return 'text-emerald-600 dark:text-emerald-400 font-semibold';
      case 'lowercase': return 'text-slate-700 dark:text-slate-300';
      case 'number': return 'text-blue-600 dark:text-blue-400 font-bold';
      case 'symbol': return 'text-pink-600 dark:text-pink-400 font-bold';
      case 'space': return 'opacity-50';
      default: return 'text-slate-800 dark:text-slate-100';
    }
  }
</script>

<div
  class="w-full min-h-[44px] bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-6 text-2xl md:text-3xl font-mono text-center md:text-left focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors break-all whitespace-pre-wrap flex flex-wrap items-center justify-center md:justify-start overflow-hidden"
  role="textbox"
  tabindex="0"
  aria-readonly="true"
  aria-label={ariaLabel}
>
  {#each charList as { char, type }}
    {#if type === 'space'}
      <span class="inline-block w-4 h-1 mx-1 bg-slate-300 dark:bg-slate-600 rounded-full align-middle"></span>
    {:else}
      <span class={getColorClass(type)}>{char}</span>
    {/if}
  {/each}
</div>
