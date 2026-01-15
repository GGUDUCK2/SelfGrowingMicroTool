<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { MetaTags } from '$lib/utils/seo';

  export let tags: MetaTags;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let dictionary: any;

  const dispatch = createEventDispatcher();

  function handleInput(field: keyof MetaTags) {
    dispatch('change', { field, value: tags[field] });
  }

  function handleImageUpload(e: Event) {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
              tags.ogImage = e.target?.result as string;
              handleInput('ogImage');
          };
          reader.readAsDataURL(file);
      }
  }
</script>

<div class="space-y-4">
    <!-- OG Title -->
    <div class="space-y-1">
        <label for="ogTitle" class="text-sm font-medium text-slate-700 dark:text-slate-300">
            {dictionary.social.ogTitle}
        </label>
        <div class="relative">
             <input
                id="ogTitle"
                type="text"
                bind:value={tags.ogTitle}
                on:input={() => handleInput('ogTitle')}
                placeholder={tags.title || "Same as Page Title"}
                class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all pr-20"
            />
            {#if !tags.ogTitle && tags.title}
                <span class="absolute right-3 top-2.5 text-xs text-slate-400 pointer-events-none">Auto</span>
            {/if}
        </div>
    </div>

    <!-- OG Description -->
    <div class="space-y-1">
        <label for="ogDesc" class="text-sm font-medium text-slate-700 dark:text-slate-300">
            {dictionary.social.ogDesc}
        </label>
        <div class="relative">
            <textarea
                id="ogDesc"
                bind:value={tags.ogDesc}
                on:input={() => handleInput('ogDesc')}
                rows="3"
                placeholder={tags.description || "Same as Meta Description"}
                class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            ></textarea>
        </div>
    </div>

    <!-- OG Image -->
    <div class="space-y-1">
        <label for="ogImage" class="text-sm font-medium text-slate-700 dark:text-slate-300">
            {dictionary.social.ogImage}
        </label>
        <div class="flex gap-2">
            <input
                id="ogImage"
                type="text"
                bind:value={tags.ogImage}
                on:input={() => handleInput('ogImage')}
                placeholder="https://example.com/image.jpg"
                class="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            />
        </div>
        <div class="mt-2">
             <label class="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-upload"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                 {dictionary.social.uploadImage}
                 <input type="file" accept="image/*" class="hidden" on:change={handleImageUpload} />
             </label>
             <p class="text-[10px] text-slate-500 mt-1 ml-1">Local preview only. Image is not uploaded.</p>
        </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
        <div class="space-y-1">
            <label for="ogType" class="text-sm font-medium text-slate-700 dark:text-slate-300">
                {dictionary.social.ogType}
            </label>
            <select
                id="ogType"
                bind:value={tags.ogType}
                on:change={() => handleInput('ogType')}
                class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            >
                <option value="website">Website</option>
                <option value="article">Article</option>
                <option value="product">Product</option>
                <option value="profile">Profile</option>
                <option value="video.movie">Video</option>
            </select>
        </div>
        <div class="space-y-1">
             <label for="twitterCard" class="text-sm font-medium text-slate-700 dark:text-slate-300">
                {dictionary.social.twitterCard}
            </label>
            <select
                id="twitterCard"
                bind:value={tags.twitterCard}
                on:change={() => handleInput('twitterCard')}
                class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            >
                <option value="summary">Summary</option>
                <option value="summary_large_image">Summary Large Image</option>
                <option value="app">App</option>
                <option value="player">Player</option>
            </select>
        </div>
    </div>
</div>
