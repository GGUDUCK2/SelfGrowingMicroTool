<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { MetaTags } from '$lib/utils/seo';

  export let tags: MetaTags;
  export let dictionary: any;

  const dispatch = createEventDispatcher();

  function handleInput() {
    dispatch('change', tags);
  }
</script>

<div class="space-y-4">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <!-- Title -->
    <div class="space-y-1">
      <label for="title" class="text-sm font-medium text-slate-700 dark:text-slate-300">
        {dictionary.meta.title}
      </label>
      <input
        id="title"
        type="text"
        bind:value={tags.title}
        on:input={handleInput}
        class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
        placeholder="My Awesome Page"
      />
      <div class="flex justify-between text-xs">
        <span class:text-green-500={tags.title.length >= 30 && tags.title.length <= 60} class:text-yellow-500={tags.title.length < 30 || tags.title.length > 60}>
          {tags.title.length} / 60
        </span>
      </div>
    </div>

    <!-- URL -->
    <div class="space-y-1">
      <label for="url" class="text-sm font-medium text-slate-700 dark:text-slate-300">
        {dictionary.meta.url}
      </label>
      <input
        id="url"
        type="text"
        bind:value={tags.url}
        on:input={handleInput}
        class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
        placeholder="https://example.com"
      />
    </div>

    <!-- Description -->
    <div class="col-span-1 md:col-span-2 space-y-1">
      <label for="description" class="text-sm font-medium text-slate-700 dark:text-slate-300">
        {dictionary.meta.description}
      </label>
      <textarea
        id="description"
        bind:value={tags.description}
        on:input={handleInput}
        rows="3"
        class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
        placeholder="A brief description of your page..."
      ></textarea>
      <div class="flex justify-between text-xs">
         <span class:text-green-500={tags.description.length >= 50 && tags.description.length <= 160} class:text-yellow-500={tags.description.length < 50 || tags.description.length > 160}>
          {tags.description.length} / 160
        </span>
      </div>
    </div>

     <!-- Keywords -->
     <div class="space-y-1">
      <label for="keywords" class="text-sm font-medium text-slate-700 dark:text-slate-300">
        {dictionary.meta.keywords}
      </label>
      <input
        id="keywords"
        type="text"
        bind:value={tags.keywords}
        on:input={handleInput}
        class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
        placeholder="seo, tools, generator"
      />
    </div>

    <!-- Author -->
    <div class="space-y-1">
      <label for="author" class="text-sm font-medium text-slate-700 dark:text-slate-300">
        {dictionary.meta.author}
      </label>
      <input
        id="author"
        type="text"
        bind:value={tags.author}
        on:input={handleInput}
        class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
        placeholder="John Doe"
      />
    </div>

    <!-- Theme Color -->
    <div class="space-y-1">
      <label for="themeColor" class="text-sm font-medium text-slate-700 dark:text-slate-300">
        {dictionary.meta.themeColor}
      </label>
      <div class="flex items-center gap-2">
          <input
            id="themeColorPicker"
            type="color"
            bind:value={tags.themeColor}
            on:input={handleInput}
            class="h-10 w-10 p-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer"
          />
          <input
            id="themeColor"
            type="text"
            bind:value={tags.themeColor}
            on:input={handleInput}
            class="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
          />
      </div>
    </div>
  </div>
</div>
