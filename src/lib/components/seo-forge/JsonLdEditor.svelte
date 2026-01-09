<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { JsonLdData } from '$lib/utils/seo';

  export let data: JsonLdData;
  export let dictionary: any;

  const dispatch = createEventDispatcher();

  function handleInput() {
    dispatch('change', data);
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
          on:change={handleInput}
          class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
        >
            <option value="Website">Website</option>
            <option value="Article">Article</option>
            <option value="Product">Product</option>
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
</div>
