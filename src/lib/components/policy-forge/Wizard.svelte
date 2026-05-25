<script lang="ts">
  import { policyStore } from '$lib/stores/policy-forge';
  import { fade } from 'svelte/transition';
  import { ChevronRight, ChevronLeft } from '@lucide/svelte';
  import type { PolicyData } from '$lib/types/policy-forge';

  export let dict: any;

  let steps = [
    { id: 'identity', label: 'step1' },
    { id: 'features', label: 'step2' },
    { id: 'collection', label: 'step3' },
    { id: 'legal', label: 'step4' }
  ];

  let currentStep = 0;

  function next() {
    if (currentStep < steps.length - 1) currentStep++;
  }

  function prev() {
    if (currentStep > 0) currentStep--;
  }

  const step1Keys: (keyof PolicyData)[] = ['canRegister', 'hasNewsletter', 'hasAds', 'collectPayment', 'collectSocial'];
  const step2Keys: (keyof PolicyData)[] = ['collectName', 'collectEmail', 'collectPhone', 'collectAddress', 'collectDevice', 'collectCookies'];

</script>

<div class="flex flex-col h-full bg-white dark:bg-slate-900">
  <!-- Stepper Header -->
  <div class="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
    {#each steps as step, i}
      <button
        class="flex-1 min-w-[80px] p-3 text-sm font-medium text-center border-b-2 transition-colors min-h-[44px] min-w-[44px] {currentStep === i ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}"
        on:click={() => currentStep = i}
      >
        {dict.wizard[step.label]}
      </button>
    {/each}
  </div>

  <!-- Form Content -->
  <div class="flex-1 overflow-y-auto p-6">
    {#if currentStep === 0}
      <div in:fade={{ duration: 200 }} class="space-y-6">
        <div class="space-y-4">
            <label class="block">
                <span class="text-slate-700 dark:text-slate-300 text-sm font-medium">{dict.fields.companyName}</span>
                <input type="text" bind:value={$policyStore.companyName} class="mt-1 block w-full min-h-[44px] rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 text-slate-900 dark:text-white" />
            </label>
            <label class="block">
                <span class="text-slate-700 dark:text-slate-300 text-sm font-medium">{dict.fields.websiteUrl}</span>
                <input type="url" bind:value={$policyStore.websiteUrl} class="mt-1 block w-full min-h-[44px] rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 text-slate-900 dark:text-white" />
            </label>
            <label class="block">
                <span class="text-slate-700 dark:text-slate-300 text-sm font-medium">{dict.fields.email}</span>
                <input type="email" bind:value={$policyStore.email} class="mt-1 block w-full min-h-[44px] rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 text-slate-900 dark:text-white" />
            </label>
            <label class="block">
                <span class="text-slate-700 dark:text-slate-300 text-sm font-medium">{dict.fields.address}</span>
                <textarea rows="2" bind:value={$policyStore.address} class="mt-1 block w-full min-h-[44px] rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 text-slate-900 dark:text-white"></textarea>
            </label>
            <div class="grid grid-cols-2 gap-4">
                <label class="block">
                    <span class="text-slate-700 dark:text-slate-300 text-sm font-medium">{dict.fields.country}</span>
                    <input type="text" bind:value={$policyStore.country} class="mt-1 block w-full min-h-[44px] rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 text-slate-900 dark:text-white" />
                </label>
                <label class="block">
                    <span class="text-slate-700 dark:text-slate-300 text-sm font-medium">{dict.fields.foundedYear}</span>
                    <input type="text" bind:value={$policyStore.foundedYear} class="mt-1 block w-full min-h-[44px] rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 text-slate-900 dark:text-white" />
                </label>
            </div>
        </div>
      </div>
    {:else if currentStep === 1}
      <div in:fade={{ duration: 200 }} class="space-y-6">
        <div class="space-y-4">
            {#each step1Keys as key}
                <div class="flex items-center justify-between min-h-[44px]">
                    <span class="text-slate-700 dark:text-slate-300 text-sm font-medium">{dict.toggles[key]}</span>
                    <label class="relative inline-flex items-center cursor-pointer min-h-[44px] min-w-[44px] flex items-center">
                        <input type="checkbox" bind:checked={$policyStore[key]} class="sr-only peer">
                        <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                    </label>
                </div>
            {/each}

            <div class="pt-4 border-t border-slate-100 dark:border-slate-800">
                <label class="block">
                    <span class="text-slate-700 dark:text-slate-300 text-sm font-medium">{dict.fields.minAge}</span>
                    <input type="number" bind:value={$policyStore.minAge} class="mt-1 block w-full min-h-[44px] rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 text-slate-900 dark:text-white" />
                </label>
            </div>
        </div>
      </div>
    {:else if currentStep === 2}
      <div in:fade={{ duration: 200 }} class="space-y-6">
        <h4 class="font-medium text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">User Data</h4>
        <div class="space-y-4">
             {#each step2Keys as key}
                <div class="flex items-center justify-between min-h-[44px]">
                    <span class="text-slate-700 dark:text-slate-300 text-sm font-medium">{dict.toggles[key]}</span>
                    <label class="relative inline-flex items-center cursor-pointer min-h-[44px] min-w-[44px] flex items-center">
                        <input type="checkbox" bind:checked={$policyStore[key]} class="sr-only peer">
                        <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                    </label>
                </div>
            {/each}
        </div>

        <h4 class="font-medium text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 pt-4">Tracking</h4>
        <div class="space-y-4">
            <label class="block">
                <span class="text-slate-700 dark:text-slate-300 text-sm font-medium">{dict.analytics.label}</span>
                <select bind:value={$policyStore.analytics} class="mt-1 block w-full min-h-[44px] rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 text-slate-900 dark:text-white">
                    <option value="google">{dict.analytics.google}</option>
                    <option value="plausible">{dict.analytics.plausible}</option>
                    <option value="none">{dict.analytics.none}</option>
                </select>
            </label>
        </div>
      </div>
    {:else if currentStep === 3}
      <div in:fade={{ duration: 200 }} class="space-y-6">
        <div class="space-y-4">
            <label class="block">
                <span class="text-slate-700 dark:text-slate-300 text-sm font-medium">{dict.fields.governingLaw}</span>
                <input type="text" bind:value={$policyStore.governingLaw} class="mt-1 block w-full min-h-[44px] rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 text-slate-900 dark:text-white" />
            </label>
            <label class="block">
                <span class="text-slate-700 dark:text-slate-300 text-sm font-medium">{dict.fields.refundPeriod}</span>
                <input type="number" bind:value={$policyStore.refundPeriod} class="mt-1 block w-full min-h-[44px] rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 text-slate-900 dark:text-white" />
            </label>

            <div class="flex items-center justify-between min-h-[44px]">
                <span class="text-slate-700 dark:text-slate-300 text-sm font-medium">{dict.toggles.termination}</span>
                <label class="relative inline-flex items-center cursor-pointer min-h-[44px] min-w-[44px] flex items-center">
                    <input type="checkbox" bind:checked={$policyStore.termination} class="sr-only peer">
                    <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                </label>
            </div>

            <label class="block">
                <span class="text-slate-700 dark:text-slate-300 text-sm font-medium">{dict.fields.lastUpdated}</span>
                <input type="date" bind:value={$policyStore.lastUpdated} class="mt-1 block w-full min-h-[44px] rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 text-slate-900 dark:text-white" />
            </label>
        </div>
      </div>
    {/if}
  </div>

  <!-- Footer Navigation -->
  <div class="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between bg-slate-50 dark:bg-slate-900/50">
    <button
        class="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center gap-1 min-h-[44px] min-w-[44px]"
        disabled={currentStep === 0}
        on:click={prev}
    >
        <ChevronLeft size={16} /> Back
    </button>

    <button
        class="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-1 min-h-[44px] min-w-[44px]"
        disabled={currentStep === steps.length - 1}
        on:click={next}
    >
        Next <ChevronRight size={16} />
    </button>
  </div>
</div>
