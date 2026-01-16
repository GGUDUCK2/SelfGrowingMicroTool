<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { type MetaTags, extractKeywords } from '$lib/utils/seo';
  import KeywordSuggester from './KeywordSuggester.svelte';

  export let tags: MetaTags;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let dictionary: any;

  const dispatch = createEventDispatcher();

  function handleInput(field: keyof MetaTags) {
    dispatch('change', { field, value: tags[field] });
  }

  function suggestKeywords() {
      const source = `${tags.title} ${tags.description}`;
      if (!source.trim()) return;

      const suggested = extractKeywords(source, 8);
      if (suggested.length > 0) {
          tags.keywords = suggested.join(', ');
          handleInput('keywords');
      }
  }

  let imgValidating = false;
  let imgError = false;
  let imgWarning = '';

  function handleImageLoad(e: Event) {
      const img = e.target as HTMLImageElement;
      imgValidating = false;
      imgError = false;
      if (img.naturalWidth < 200 || img.naturalHeight < 200) {
          imgWarning = dictionary.warnings.imgSmall
              .replace('{w}', img.naturalWidth)
              .replace('{h}', img.naturalHeight);
      } else {
          imgWarning = '';
      }
  }

  function handleImageError() {
      imgValidating = false;
      imgError = true;
      imgWarning = dictionary.warnings.imgUnreachable;
  }
</script>

<div class="space-y-4">
    <!-- Title -->
    <div class="space-y-1">
        <div class="flex justify-between">
            <label for="title" class="text-sm font-medium text-slate-700 dark:text-slate-300">
                {dictionary.meta.title}
            </label>
            <span class="text-xs text-slate-400 {tags.title.length > 60 ? 'text-red-500' : ''}">
                {tags.title.length}/60
            </span>
        </div>
        <input
            id="title"
            type="text"
            bind:value={tags.title}
            on:input={() => handleInput('title')}
            placeholder="Page Title"
            class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
        />
    </div>

    <!-- Description -->
    <div class="space-y-1">
        <div class="flex justify-between">
            <label for="description" class="text-sm font-medium text-slate-700 dark:text-slate-300">
                {dictionary.meta.description}
            </label>
            <span class="text-xs text-slate-400 {tags.description.length > 160 ? 'text-red-500' : ''}">
                {tags.description.length}/160
            </span>
        </div>
        <textarea
            id="description"
            bind:value={tags.description}
            on:input={() => handleInput('description')}
            rows="3"
            placeholder="Meta Description..."
            class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
        ></textarea>
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
            on:input={() => handleInput('url')}
            placeholder="https://example.com/page"
            class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
        />
    </div>

    <!-- Keywords -->
    <div class="space-y-1">
        <div class="flex justify-between items-center">
            <label for="keywords" class="text-sm font-medium text-slate-700 dark:text-slate-300">
                {dictionary.meta.keywords}
            </label>
        </div>
        <input
            id="keywords"
            type="text"
            bind:value={tags.keywords}
            on:input={() => handleInput('keywords')}
            placeholder="seo, tools, generator"
            class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
        />

        <KeywordSuggester bind:tags {dictionary} />
    </div>

    <!-- OG Image Warning (Integrated here for visibility) -->
    {#if tags.ogImage}
        <div class="hidden">
             <!-- Hidden image for validation -->
             <img src={tags.ogImage} alt="validation" on:load={handleImageLoad} on:error={handleImageError} />
        </div>
        {#if imgWarning || imgError}
            <div class="text-xs px-3 py-2 rounded bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-800">
                {imgWarning}
            </div>
        {/if}
    {/if}

    <!-- Advanced Grid -->
    <div class="grid grid-cols-2 gap-4 pt-2">
        <div class="space-y-1">
            <label for="author" class="text-sm font-medium text-slate-700 dark:text-slate-300">
                {dictionary.meta.author}
            </label>
            <input
                id="author"
                type="text"
                bind:value={tags.author}
                on:input={() => handleInput('author')}
                class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            />
        </div>
        <div class="space-y-1">
            <label for="themeColor" class="text-sm font-medium text-slate-700 dark:text-slate-300">
                {dictionary.meta.themeColor}
            </label>
            <div class="flex gap-2">
                 <input
                    type="color"
                    bind:value={tags.themeColor}
                    on:input={() => handleInput('themeColor')}
                    class="h-10 w-10 p-0 border-0 rounded overflow-hidden cursor-pointer"
                />
                <input
                    id="themeColor"
                    type="text"
                    bind:value={tags.themeColor}
                    on:input={() => handleInput('themeColor')}
                    class="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                />
            </div>
        </div>
        <div class="space-y-1">
            <label for="robots" class="text-sm font-medium text-slate-700 dark:text-slate-300">
                {dictionary.meta.robots}
            </label>
            <select
                id="robots"
                bind:value={tags.robots}
                on:change={() => handleInput('robots')}
                class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            >
                <option value="index, follow">Index, Follow</option>
                <option value="noindex, follow">No Index, Follow</option>
                <option value="index, nofollow">Index, No Follow</option>
                <option value="noindex, nofollow">No Index, No Follow</option>
            </select>
        </div>
        <div class="space-y-1">
             <label for="viewport" class="text-sm font-medium text-slate-700 dark:text-slate-300">
                {dictionary.meta.viewport}
            </label>
            <input
                id="viewport"
                type="text"
                bind:value={tags.viewport}
                on:input={() => handleInput('viewport')}
                class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            />
        </div>
    </div>
</div>
