<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { slide } from 'svelte/transition';
  import { generatePassword, calculateEntropy, estimateCrackTime, type PasswordOptions } from '$lib/utils/cipher/password';
  import { Copy, Save, RefreshCw } from 'lucide-svelte';

  export let dict: any;

  // Restore options via binding or method if needed, but for now we keep local state
  export const restore = (savedOptions: Partial<PasswordOptions>) => {
     options = { ...options, ...savedOptions };
     generate();
  };

  let options: PasswordOptions = {
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    ambiguous: true
  };

  let password = '';
  let entropy = 0;
  let crackTime = '';
  let strength: 'weak' | 'fair' | 'good' | 'strong' = 'weak';

  const dispatch = createEventDispatcher();

  function generate() {
    password = generatePassword(options);
    entropy = calculateEntropy(password);
    crackTime = estimateCrackTime(entropy);

    if (entropy < 35) strength = 'weak';
    else if (entropy < 60) strength = 'fair';
    else if (entropy < 90) strength = 'good';
    else strength = 'strong';
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(password);
    dispatch('copy');
  }

  function saveToHistory() {
    if (password) {
      dispatch('save', {
        type: 'password',
        content: password,
        details: `Entropy: ${entropy} bits`,
        settings: JSON.stringify(options)
      });
    }
  }

  onMount(() => {
    generate();
  });
</script>

<div class="space-y-6" in:slide>
  <!-- Main Display -->
  <div class="relative group">
    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
       {#if strength === 'weak'}
          <div class="w-2 h-2 rounded-full bg-red-500"></div>
       {:else if strength === 'fair'}
          <div class="w-2 h-2 rounded-full bg-yellow-500"></div>
       {:else if strength === 'good'}
          <div class="w-2 h-2 rounded-full bg-blue-500"></div>
       {:else}
          <div class="w-2 h-2 rounded-full bg-green-500"></div>
       {/if}
    </div>
    <input
      type="text"
      readonly
      value={password}
      aria-label="Generated Password"
      class="w-full text-center text-2xl font-mono py-4 rounded-xl border-2 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none transition-colors
      {strength === 'weak' ? 'border-red-200 dark:border-red-900' :
       strength === 'fair' ? 'border-yellow-200 dark:border-yellow-900' :
       strength === 'good' ? 'border-blue-200 dark:border-blue-900' :
       'border-green-200 dark:border-green-900'}"
    />
    <div class="absolute inset-y-0 right-0 pr-2 flex items-center space-x-1">
      <button
        on:click={generate}
        class="p-2 text-slate-400 hover:text-indigo-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title={dict.generate}
        aria-label={dict.generate}
      >
        <RefreshCw size={20} />
      </button>
    </div>
  </div>

  <!-- Entropy Bar -->
  <div class="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
     <div
       class="h-full transition-all duration-500 ease-out"
       style="width: {Math.min(100, (entropy / 128) * 100)}%; background-color: {strength === 'weak' ? '#ef4444' : strength === 'fair' ? '#eab308' : strength === 'good' ? '#3b82f6' : '#22c55e'}"
     ></div>
  </div>

  <!-- Actions -->
  <div class="flex justify-center space-x-4">
     <button
        on:click={copyToClipboard}
        aria-label={dict.copy}
        class="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
     >
       <Copy size={16} />
       <span>{dict.copy}</span>
     </button>
     <button
        on:click={saveToHistory}
        aria-label={dict.save}
        class="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
     >
       <Save size={16} />
       <span>{dict.save}</span>
     </button>
  </div>

  <!-- Metrics -->
  <div class="grid grid-cols-2 gap-4 text-center">
    <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
      <span class="block text-xs text-slate-500 uppercase tracking-wide">{dict.entropy}</span>
      <span class="text-lg font-bold text-slate-800 dark:text-slate-200">{entropy} bits</span>
    </div>
    <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
      <span class="block text-xs text-slate-500 uppercase tracking-wide">{dict.password.strengthRating.crackTime}</span>
      <span class="text-lg font-bold text-slate-800 dark:text-slate-200">{crackTime}</span>
    </div>
  </div>

  <!-- Options -->
  <div class="p-4 border border-slate-200 dark:border-slate-700 rounded-xl space-y-4">
     <h3 class="text-sm font-medium text-slate-900 dark:text-white mb-2">{dict.options}</h3>

     <div class="space-y-4">
       <div>
         <label for="length" class="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-1">
           <span>{dict.length}</span>
           <span class="font-mono font-bold text-indigo-600">{options.length}</span>
         </label>
         <input
           id="length"
           type="range"
           min="6"
           max="64"
           bind:value={options.length}
           on:input={generate}
           class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
         />
       </div>

       <div class="grid grid-cols-2 gap-2">
         <label class="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300">
           <input type="checkbox" bind:checked={options.uppercase} on:change={generate} class="rounded text-indigo-600 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-600" />
           <span>{dict.password.uppercase}</span>
         </label>
         <label class="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300">
           <input type="checkbox" bind:checked={options.lowercase} on:change={generate} class="rounded text-indigo-600 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-600" />
           <span>{dict.password.lowercase}</span>
         </label>
         <label class="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300">
           <input type="checkbox" bind:checked={options.numbers} on:change={generate} class="rounded text-indigo-600 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-600" />
           <span>{dict.password.numbers}</span>
         </label>
         <label class="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300">
           <input type="checkbox" bind:checked={options.symbols} on:change={generate} class="rounded text-indigo-600 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-600" />
           <span>{dict.password.symbols}</span>
         </label>
         <label class="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300 col-span-2">
           <input type="checkbox" bind:checked={options.ambiguous} on:change={generate} class="rounded text-indigo-600 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-600" />
           <span>{dict.password.ambiguous}</span>
         </label>
       </div>
     </div>
  </div>
</div>
