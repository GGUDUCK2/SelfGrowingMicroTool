<script lang="ts">
  import { MathEngine } from '$lib/utils/math-forge/engine';
  import { createEventDispatcher } from 'svelte';

  export let dict: any;
  const dispatch = createEventDispatcher();
  const engine = new MathEngine();

  let input = '';
  let result = '';
  let error = '';

  const buttons = [
    ['(', ')', '%', 'AC'],
    ['7', '8', '9', '/'],
    ['4', '5', '6', '*'],
    ['1', '2', '3', '-'],
    ['0', '.', '=', '+'],
    ['sin', 'cos', 'tan', '^'],
    ['sqrt', 'log', 'pi', 'e']
  ];

  function handleInput(val: string) {
    if (val === 'AC') {
      input = '';
      result = '';
      error = '';
    } else if (val === '=') {
      calculate();
    } else {
      input += val;
    }
  }

  function calculate() {
    try {
      const res = engine.evaluate(input);
      // Format precision
      result = parseFloat(res.toPrecision(12)).toString();
      error = '';
      dispatch('history', { input, result });
    } catch (e) {
      error = dict.error || 'Error';
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') calculate();
    else if (e.key === 'Backspace') {
       // Handled naturally by input, but if input is not focused?
       // We bind value to input, so if user focuses input, it works.
    }
  }
</script>

<div class="max-w-md mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
  <div class="p-6 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
    <div class="text-right h-8 text-slate-500 dark:text-slate-400 font-mono text-sm mb-1">{result}</div>
    <input
      type="text"
      bind:value={input}
      class="w-full bg-transparent text-right text-3xl font-bold text-slate-900 dark:text-white outline-none font-mono min-h-[44px]"
      placeholder="0"
      aria-label="Calculator Input"
      on:keydown={handleKeydown}
    />
    {#if error}
      <div class="text-right text-red-500 text-xs mt-1">{error}</div>
    {/if}
  </div>

  <div class="p-4 grid grid-cols-4 gap-2">
    {#each buttons as row}
      {#each row as btn}
        <button
          class="min-h-[44px] min-w-[44px] h-12 rounded-lg font-medium text-lg transition-colors
            {btn === '=' ? 'bg-indigo-600 hover:bg-indigo-700 text-white col-span-1' :
             ['AC'].includes(btn) ? 'bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
             ['+', '-', '*', '/', '^', '%'].includes(btn) ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' :
             'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200'}"
          on:click={() => handleInput(btn)}
        >
          {btn}
        </button>
      {/each}
    {/each}
  </div>
</div>
