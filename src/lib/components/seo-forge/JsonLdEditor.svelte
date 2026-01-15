<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { JsonLdData } from '$lib/utils/seo';

  export let data: JsonLdData;
  export let dictionary: any;

  const dispatch = createEventDispatcher();

  function handleInput() {
    dispatch('change', data);
  }

  function handleTypeChange() {
      if (data.type === 'BreadcrumbList' && (!data.breadcrumbs || data.breadcrumbs.length === 0)) {
          data.breadcrumbs = [{ name: 'Home', item: 'https://example.com' }];
      }
      if (data.type === 'FAQPage' && (!data.faq || data.faq.length === 0)) {
          data.faq = [{ question: '', answer: '' }];
      }
      handleInput();
  }

  function addCrumb() {
      data.breadcrumbs = [...(data.breadcrumbs || []), { name: '', item: '' }];
      handleInput();
  }

  function removeCrumb(index: number) {
      if (!data.breadcrumbs) return;
      data.breadcrumbs = data.breadcrumbs.filter((_, i) => i !== index);
      handleInput();
  }

  function addFaq() {
      data.faq = [...(data.faq || []), { question: '', answer: '' }];
      handleInput();
  }

  function removeFaq(index: number) {
      if (!data.faq) return;
      data.faq = data.faq.filter((_, i) => i !== index);
      handleInput();
  }
</script>

<div class="space-y-4">
    <div class="space-y-1">
        <label for="jsonType" class="text-sm font-medium text-slate-700 dark:text-slate-300">
          {dictionary.jsonld.type}
        </label>
        <select
          id="jsonType"
          bind:value={data.type}
          on:change={handleTypeChange}
          class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
        >
            <option value="Website">Website</option>
            <option value="Article">Article</option>
            <option value="Product">Product</option>
            <option value="Organization">Organization</option>
            <option value="BreadcrumbList">Breadcrumb List</option>
            <option value="FAQPage">FAQ Page</option>
        </select>
    </div>

    {#if data.type === 'Website'}
        <div class="space-y-1">
            <label for="jsonName" class="text-sm font-medium text-slate-700 dark:text-slate-300">
                {dictionary.jsonld.name}
            </label>
            <input
                id="jsonName"
                type="text"
                bind:value={data.name}
                on:input={handleInput}
                class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            />
        </div>
        <div class="space-y-1">
            <label for="jsonUrl" class="text-sm font-medium text-slate-700 dark:text-slate-300">
                {dictionary.meta.url}
            </label>
            <input
                id="jsonUrl"
                type="text"
                bind:value={data.url}
                on:input={handleInput}
                class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            />
        </div>
    {/if}

    {#if data.type === 'Organization'}
         <div class="space-y-1">
            <label for="orgName" class="text-sm font-medium text-slate-700 dark:text-slate-300">
                Name
            </label>
            <input
                id="orgName"
                type="text"
                bind:value={data.name}
                on:input={handleInput}
                class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            />
        </div>
        <div class="space-y-1">
            <label for="orgUrl" class="text-sm font-medium text-slate-700 dark:text-slate-300">
                URL
            </label>
            <input
                id="orgUrl"
                type="text"
                bind:value={data.url}
                on:input={handleInput}
                class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            />
        </div>
         <div class="space-y-1">
            <label for="orgLogo" class="text-sm font-medium text-slate-700 dark:text-slate-300">
                Logo URL
            </label>
            <input
                id="orgLogo"
                type="text"
                bind:value={data.logo}
                on:input={handleInput}
                class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            />
        </div>
    {/if}

    {#if data.type === 'Article'}
         <div class="space-y-1">
            <label for="jsonHeadline" class="text-sm font-medium text-slate-700 dark:text-slate-300">
                {dictionary.jsonld.headline}
            </label>
            <input
                id="jsonHeadline"
                type="text"
                bind:value={data.headline}
                on:input={handleInput}
                class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            />
        </div>
         <div class="space-y-1">
            <label for="jsonImage" class="text-sm font-medium text-slate-700 dark:text-slate-300">
                {dictionary.jsonld.image}
            </label>
            <input
                id="jsonImage"
                type="text"
                bind:value={data.image}
                on:input={handleInput}
                class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            />
        </div>
        <div class="space-y-1">
             <label for="jsonAuthor" class="text-sm font-medium text-slate-700 dark:text-slate-300">
                {dictionary.jsonld.authorName}
            </label>
            <input
                id="jsonAuthor"
                type="text"
                bind:value={data.authorName}
                on:input={handleInput}
                class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            />
        </div>
        <div class="space-y-1">
             <label for="jsonDate" class="text-sm font-medium text-slate-700 dark:text-slate-300">
                {dictionary.jsonld.datePublished}
            </label>
            <input
                id="jsonDate"
                type="date"
                bind:value={data.datePublished}
                on:input={handleInput}
                class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            />
        </div>
    {/if}

     {#if data.type === 'Product'}
         <div class="space-y-1">
            <label for="jsonName" class="text-sm font-medium text-slate-700 dark:text-slate-300">
                {dictionary.jsonld.name}
            </label>
            <input
                id="jsonName"
                type="text"
                bind:value={data.name}
                on:input={handleInput}
                class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            />
        </div>
        <div class="space-y-1">
            <label for="jsonDescription" class="text-sm font-medium text-slate-700 dark:text-slate-300">
                {dictionary.jsonld.description}
            </label>
            <textarea
                id="jsonDescription"
                bind:value={data.description}
                on:input={handleInput}
                rows="2"
                class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            ></textarea>
        </div>
        <div class="space-y-1">
             <label for="jsonImage" class="text-sm font-medium text-slate-700 dark:text-slate-300">
                {dictionary.jsonld.image}
            </label>
            <input
                id="jsonImage"
                type="text"
                bind:value={data.image}
                on:input={handleInput}
                class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            />
        </div>
    {/if}

    {#if data.type === 'BreadcrumbList' && data.breadcrumbs}
        <div class="space-y-3">
             <div class="flex justify-between items-center">
                 <h4 class="text-sm font-medium text-slate-700 dark:text-slate-300">Breadcrumbs</h4>
                 <button on:click={addCrumb} class="text-xs text-indigo-600 hover:underline">+ Add</button>
             </div>
             {#each data.breadcrumbs as crumb, i}
                <div class="flex gap-2 items-center">
                    <span class="text-xs text-slate-500 w-4">{i + 1}.</span>
                    <input
                        type="text"
                        placeholder="Name"
                        bind:value={crumb.name}
                        on:input={handleInput}
                        class="flex-1 px-3 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                     <input
                        type="text"
                        placeholder="URL"
                        bind:value={crumb.item}
                        on:input={handleInput}
                        class="flex-1 px-3 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                    <button on:click={() => removeCrumb(i)} class="text-red-500 hover:text-red-700 px-1">×</button>
                </div>
             {/each}
        </div>
    {/if}

    {#if data.type === 'FAQPage' && data.faq}
        <div class="space-y-3">
             <div class="flex justify-between items-center">
                 <h4 class="text-sm font-medium text-slate-700 dark:text-slate-300">Questions & Answers</h4>
                 <button on:click={addFaq} class="text-xs text-indigo-600 hover:underline">+ Add</button>
             </div>
             {#each data.faq as item, i}
                <div class="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                    <div class="flex justify-between">
                         <span class="text-xs text-slate-500">Question #{i + 1}</span>
                         <button on:click={() => removeFaq(i)} class="text-red-500 hover:text-red-700 text-xs">Remove</button>
                    </div>
                    <input
                        type="text"
                        placeholder="Question"
                        bind:value={item.question}
                        on:input={handleInput}
                        class="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                    <textarea
                        placeholder="Answer"
                        bind:value={item.answer}
                        on:input={handleInput}
                        rows="2"
                        class="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    ></textarea>
                </div>
             {/each}
        </div>
    {/if}
</div>
