<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let secret = '';
  export let isValid: boolean | null = null;
  export let dictionary: Record<string, any>;

  const dispatch = createEventDispatcher();

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    secret = target.value;
    dispatch('change', secret);
  }
</script>

<div class="bg-white dark:bg-slate-800 rounded-xl border-l-4 shadow-sm overflow-hidden {isValid === true ? 'border-emerald-500' : isValid === false ? 'border-red-500' : 'border-blue-500'}">
  <div class="px-4 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
    <div>
      <h3 class="font-medium {isValid === true ? 'text-emerald-500' : isValid === false ? 'text-red-500' : 'text-blue-500'}">
        {dictionary.jwtForge.signature}
      </h3>
      <p class="text-xs text-slate-500">Verify Integrity</p>
    </div>
     <div class="text-xs font-mono {isValid === true ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : isValid === false ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'} px-2 py-1 rounded">
        {isValid === true ? dictionary.jwtForge.isVerified : isValid === false ? dictionary.jwtForge.isInvalid : dictionary.jwtForge.verify}
      </div>
  </div>

  <div class="p-4 space-y-3">
    <div class="relative">
      <input
        type="text"
        class="w-full min-h-[44px] pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        placeholder={dictionary.jwtForge.secret}
        value={secret}
        on:input={handleInput}
      />
      <div class="absolute left-3 top-2.5 text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      </div>
    </div>

    {#if isValid === false}
        <div class="text-xs text-red-500 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Signature does not match the payload and secret.
        </div>
    {/if}
  </div>
</div>
