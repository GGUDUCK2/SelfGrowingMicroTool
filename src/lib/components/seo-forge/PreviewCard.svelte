<script lang="ts">
  import type { MetaTags } from '$lib/utils/seo';

  export let tags: MetaTags;
  export let dictionary: any;

  // Simple truncation helper
  function truncate(str: string, len: number) {
    if (!str) return '';
    return str.length > len ? str.substring(0, len) + '...' : str;
  }

  // Get domain from URL
  function getDomain(url: string) {
    try {
      return new URL(url).hostname;
    } catch {
      return 'example.com';
    }
  }
</script>

<div class="space-y-8 p-4">

  <!-- Google Search Result -->
  <div class="space-y-2">
    <h3 class="text-sm font-semibold text-slate-500 uppercase tracking-wider">{dictionary.social.google}</h3>
    <div class="bg-white p-4 rounded-lg shadow-sm border border-slate-200 font-sans max-w-[600px]">
      <div class="flex items-center gap-2 mb-1">
          <div class="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-xs text-slate-500">
             {#if tags.url}
               <img src={`https://www.google.com/s2/favicons?domain=${tags.url}`} alt="" class="w-4 h-4"/>
             {:else}
                G
             {/if}
          </div>
          <div class="text-sm text-slate-800">
             <div class="font-medium">{getDomain(tags.url) || 'example.com'}</div>
             <div class="text-xs text-slate-500 truncate max-w-[300px]">{tags.url || 'https://example.com/page'}</div>
          </div>
      </div>
      <div class="text-[#1a0dab] text-xl font-medium hover:underline cursor-pointer truncate">
        {tags.title || 'Page Title'}
      </div>
      <div class="text-sm text-slate-600 mt-1 line-clamp-2">
         {#if tags.datePublished}
             <span class="text-slate-500">{new Date(tags.datePublished).toLocaleDateString()} — </span>
         {/if}
         {tags.description || 'This is how your page description will appear in Google search results. Keep it between 150-160 characters for best results.'}
      </div>
    </div>
  </div>

  <!-- Facebook / Open Graph -->
  <div class="space-y-2">
    <h3 class="text-sm font-semibold text-slate-500 uppercase tracking-wider">{dictionary.social.facebook}</h3>
    <div class="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden max-w-[500px]">
        {#if tags.ogImage}
          <div class="w-full h-[260px] bg-slate-100 relative">
             <img src={tags.ogImage} alt="OG" class="w-full h-full object-cover" />
          </div>
        {:else}
           <div class="w-full h-[260px] bg-slate-100 flex items-center justify-center text-slate-400">
             No Image
           </div>
        {/if}
        <div class="p-3 bg-[#f0f2f5] border-t border-slate-200">
            <div class="text-xs text-slate-500 uppercase truncate mb-1">{getDomain(tags.url).toUpperCase() || 'EXAMPLE.COM'}</div>
            <div class="font-bold text-slate-900 leading-tight mb-1 line-clamp-2">
                {tags.ogTitle || tags.title || 'Your Page Title'}
            </div>
            <div class="text-sm text-slate-600 line-clamp-1">
                {tags.ogDesc || tags.description || 'A brief description of the content.'}
            </div>
        </div>
    </div>
  </div>

  <!-- Twitter Card (Summary Large Image) -->
  <div class="space-y-2">
    <h3 class="text-sm font-semibold text-slate-500 uppercase tracking-wider">{dictionary.social.twitter}</h3>
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden max-w-[500px]">
        {#if tags.twitterCard === 'summary_large_image'}
            {#if tags.ogImage}
                <div class="w-full h-[260px] bg-slate-100 relative">
                     <img src={tags.ogImage} alt="Twitter" class="w-full h-full object-cover" />
                </div>
            {:else}
                <div class="w-full h-[260px] bg-slate-100 flex items-center justify-center text-slate-400">No Image</div>
            {/if}
            <div class="p-3 bg-white border-t border-slate-100">
                 <div class="text-sm text-slate-500 mb-1 truncate">{getDomain(tags.url) || 'example.com'}</div>
                 <div class="font-bold text-slate-900 mb-1">{tags.ogTitle || tags.title || 'Title'}</div>
                 <div class="text-sm text-slate-600 line-clamp-2">{tags.ogDesc || tags.description || 'Description'}</div>
            </div>
        {:else}
             <!-- Summary Card -->
             <div class="flex">
                 <div class="w-[140px] h-[140px] bg-slate-100 flex-shrink-0">
                    {#if tags.ogImage}
                        <img src={tags.ogImage} alt="Twitter" class="w-full h-full object-cover" />
                    {:else}
                        <div class="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Image</div>
                    {/if}
                 </div>
                 <div class="p-3 flex flex-col justify-center border-l border-slate-100 w-full overflow-hidden">
                      <div class="text-sm text-slate-500 mb-1 truncate">{getDomain(tags.url) || 'example.com'}</div>
                      <div class="font-bold text-slate-900 mb-1 line-clamp-2">{tags.ogTitle || tags.title || 'Title'}</div>
                      <div class="text-sm text-slate-600 line-clamp-2">{tags.ogDesc || tags.description || 'Description'}</div>
                 </div>
             </div>
        {/if}
    </div>
  </div>

  <!-- LinkedIn -->
  <div class="space-y-2">
    <h3 class="text-sm font-semibold text-slate-500 uppercase tracking-wider">{dictionary.social.linkedin || 'LinkedIn'}</h3>
    <div class="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden max-w-[500px]">
        {#if tags.ogImage}
          <div class="w-full h-[260px] bg-slate-100 relative">
             <img src={tags.ogImage} alt="LinkedIn" class="w-full h-full object-cover" />
          </div>
        {:else}
           <div class="w-full h-[260px] bg-slate-100 flex items-center justify-center text-slate-400">
             No Image
           </div>
        {/if}
        <div class="p-4 bg-white border-t border-slate-200">
            <div class="font-semibold text-slate-900 leading-tight mb-1 truncate">
                {tags.ogTitle || tags.title || 'Page Title'}
            </div>
            <div class="text-xs text-slate-500 truncate">
                {getDomain(tags.url) || 'example.com'}
            </div>
        </div>
    </div>
  </div>

  <!-- Slack -->
  <div class="space-y-2">
    <h3 class="text-sm font-semibold text-slate-500 uppercase tracking-wider">{dictionary.social.slack}</h3>
    <div class="bg-white rounded pl-3 border-l-[3px] border-slate-300 p-2 max-w-[500px]">
        <div class="flex gap-3">
             <div class="flex-grow">
                 <div class="text-xs text-slate-500 font-bold mb-1 flex items-center gap-1">
                     <img src={`https://www.google.com/s2/favicons?domain=${tags.url}`} alt="" class="w-3 h-3"/>
                     {getDomain(tags.url) || 'example.com'}
                 </div>
                 <div class="text-blue-600 font-bold mb-1 hover:underline cursor-pointer">
                     {tags.ogTitle || tags.title || 'Page Title'}
                 </div>
                 <div class="text-sm text-slate-700">
                     {tags.ogDesc || tags.description || 'Description'}
                 </div>
             </div>
             {#if tags.ogImage}
                 <div class="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                     <img src={tags.ogImage} alt="Slack" class="w-full h-full object-cover" />
                 </div>
             {/if}
        </div>
    </div>
  </div>
</div>
