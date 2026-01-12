<script lang="ts">
  import { getDictionary } from '$lib/dictionaries';
  import { page } from '$app/stores';

  $: dict = getDictionary($page.params.lang || 'en').tools.stringTheory;
</script>

<div class="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
        {dict.title}
      </h1>
      <p class="mt-2 text-lg text-slate-600 dark:text-slate-400">
        {dict.description}
      </p>
    </div>

    <slot />
  </div>
</div>
