<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { MetaTags } from '$lib/utils/seo';

  export let tags: MetaTags;
  export let dictionary: any;

  const dispatch = createEventDispatcher();

  function handleInput() {
    dispatch('change', tags);
  }

  function handleImageUpload(e: Event) {
      const input = e.target as HTMLInputElement;
      if (input.files && input.files[0]) {
          const reader = new FileReader();
          reader.onload = (e) => {
              tags.ogImage = e.target?.result as string;
              handleInput();
          };
          reader.readAsDataURL(input.files[0]);
      }
  }
</script>

<div class="space-y-4">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <!-- OG Title -->
    <div class="space-y-1">
      <label for="ogTitle" class="text-sm font-medium text-slate-700 dark:text-slate-300">
        {dictionary.social.ogTitle}
      </label>
      <input
        id="ogTitle"
        type="text"
        bind:value={tags.ogTitle}
        on:input={handleInput}
        placeholder={tags.title}
        class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
      />
      <p class="text-xs text-slate-500">Defaults to Page Title if empty.</p>
    </div>

    <!-- OG Type -->
    <div class="space-y-1">
        <label for="ogType" class="text-sm font-medium text-slate-700 dark:text-slate-300">
          {dictionary.social.ogType}
        </label>
        <select
          id="ogType"
          bind:value={tags.ogType}
          on:change={handleInput}
          class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
        >
            <option value="website">website</option>
            <option value="article">article</option>
            <option value="profile">profile</option>
            <option value="book">book</option>
            <option value="music.song">music.song</option>
        </select>
    </div>

    <!-- OG Description -->
    <div class="col-span-1 md:col-span-2 space-y-1">
      <label for="ogDesc" class="text-sm font-medium text-slate-700 dark:text-slate-300">
        {dictionary.social.ogDesc}
      </label>
      <textarea
        id="ogDesc"
        bind:value={tags.ogDesc}
        on:input={handleInput}
        rows="2"
        placeholder={tags.description}
        class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
      ></textarea>
      <p class="text-xs text-slate-500">Defaults to Meta Description if empty.</p>
    </div>

    <!-- Twitter Card -->
    <div class="space-y-1">
        <label for="twitterCard" class="text-sm font-medium text-slate-700 dark:text-slate-300">
          {dictionary.social.twitterCard}
        </label>
        <select
          id="twitterCard"
          bind:value={tags.twitterCard}
          on:change={handleInput}
          class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
        >
            <option value="summary">summary</option>
            <option value="summary_large_image">summary_large_image</option>
            <option value="app">app</option>
            <option value="player">player</option>
        </select>
    </div>

     <!-- OG Image -->
     <div class="col-span-1 md:col-span-2 space-y-1">
        <label for="ogImage" class="text-sm font-medium text-slate-700 dark:text-slate-300">
          {dictionary.social.ogImage}
        </label>
        <div class="flex gap-2">
            <input
                id="ogImage"
                type="text"
                bind:value={tags.ogImage}
                on:input={handleInput}
                class="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                placeholder="https://example.com/image.jpg"
            />
             <label class="cursor-pointer px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors flex items-center justify-center">
                <input type="file" accept="image/*" class="hidden" on:change={handleImageUpload} />
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-upload"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
             </label>
        </div>
        {#if tags.ogImage}
             <div class="mt-2 w-full h-32 bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-700">
                 <img src={tags.ogImage} alt="Preview" class="h-full w-full object-contain" />
             </div>
        {/if}
      </div>

  </div>
</div>
