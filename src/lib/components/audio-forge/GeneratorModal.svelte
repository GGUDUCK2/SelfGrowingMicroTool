<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { X } from 'lucide-svelte';

  export let show = false;
  export let dict: any;

  const dispatch = createEventDispatcher();

  let type: OscillatorType | 'white-noise' | 'pink-noise' = 'sine';
  let frequency = 440;
  let duration = 2;

  function handleGenerate() {
    dispatch('generate', { type, frequency, duration });
    show = false;
  }
</script>

{#if show}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
      <div class="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <h3 class="font-bold text-lg text-slate-900 dark:text-white">{dict.modal.title}</h3>
        <button on:click={() => show = false} class="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{dict.modal.type}</label>
          <select bind:value={type} class="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
            <optgroup label="Oscillator">
              <option value="sine">Sine</option>
              <option value="square">Square</option>
              <option value="sawtooth">Sawtooth</option>
              <option value="triangle">Triangle</option>
            </optgroup>
            <optgroup label="Noise">
              <option value="white-noise">White Noise</option>
              <option value="pink-noise">Pink Noise</option>
            </optgroup>
          </select>
        </div>

        {#if !type.includes('noise')}
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{dict.modal.frequency}</label>
          <input type="number" bind:value={frequency} min="20" max="20000" class="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg" />
        </div>
        {/if}

        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{dict.modal.duration}</label>
          <input type="number" bind:value={duration} min="0.1" max="60" step="0.1" class="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg" />
        </div>

        <div class="pt-4 flex justify-end gap-2">
          <button on:click={() => show = false} class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">{dict.modal.cancel}</button>
          <button on:click={handleGenerate} class="px-4 py-2 bg-indigo-600 text-white font-medium hover:bg-indigo-700 rounded-lg">{dict.modal.generate}</button>
        </div>
      </div>
    </div>
  </div>
{/if}
