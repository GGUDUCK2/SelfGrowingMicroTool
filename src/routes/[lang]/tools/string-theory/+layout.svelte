<script lang="ts">
  import { getDictionary } from '$lib/dictionaries';
  import { page } from '$app/stores';

  $: lang = $page.params.lang || 'en';
  $: dict = getDictionary(lang).tools.stringTheory;
  $: common = getDictionary(lang).common;
</script>

<div class="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8 flex items-center gap-4">
      <a href="/{lang}" aria-label={common.back} class="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center p-2 -ml-2 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </a>
      <div>
        <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
          {dict.title}
        </h1>
        <p class="mt-2 text-lg text-slate-600 dark:text-slate-400">
          {dict.description}
        </p>
      </div>
    </div>

    <slot />
  </div>
</div>
