<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let dict: any;
  export let url: string = "";

  const dispatch = createEventDispatcher();

  let utmSource = "";
  let utmMedium = "";
  let utmCampaign = "";
  let utmTerm = "";
  let utmContent = "";

  let isUpdatingFromUrl = false;

  $: {
    if (!isUpdatingFromUrl && url) {
        try {
            let validUrl = url;
            if (!/^https?:\/\//i.test(validUrl) && !validUrl.startsWith('data:')) {
                validUrl = 'https://' + validUrl;
            }
            const parsed = new URL(validUrl);
            utmSource = parsed.searchParams.get('utm_source') || '';
            utmMedium = parsed.searchParams.get('utm_medium') || '';
            utmCampaign = parsed.searchParams.get('utm_campaign') || '';
            utmTerm = parsed.searchParams.get('utm_term') || '';
            utmContent = parsed.searchParams.get('utm_content') || '';
        } catch (e) {
            // ignore
        }
    }
  }

  function updateUrl() {
      if (!url) return;
      try {
          isUpdatingFromUrl = true;
          let validUrl = url;
          if (!/^https?:\/\//i.test(validUrl) && !validUrl.startsWith('data:')) {
              validUrl = 'https://' + validUrl;
          }
          const parsed = new URL(validUrl);

          const params = new URLSearchParams(parsed.search);

          if (utmSource) params.set('utm_source', utmSource); else params.delete('utm_source');
          if (utmMedium) params.set('utm_medium', utmMedium); else params.delete('utm_medium');
          if (utmCampaign) params.set('utm_campaign', utmCampaign); else params.delete('utm_campaign');
          if (utmTerm) params.set('utm_term', utmTerm); else params.delete('utm_term');
          if (utmContent) params.set('utm_content', utmContent); else params.delete('utm_content');

          parsed.search = params.toString();

          let finalStr = parsed.toString();
          if (!url.startsWith('http') && !url.startsWith('data:') && finalStr.startsWith('https://')) {
             finalStr = finalStr.replace('https://', '');
          }

          if (url !== finalStr) {
             url = finalStr;
             dispatch('change', { url });
          }
      } catch (e) {
         // ignore
      } finally {
          setTimeout(() => { isUpdatingFromUrl = false; }, 0);
      }
  }
</script>

<div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
    <h2 class="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
        {dict.utmBuilder}
    </h2>

    <div class="space-y-4">
        <div>
            <label for="utmSource" class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">{dict.source} <span class="text-red-500">*</span></label>
            <input
                id="utmSource"
                type="text"
                bind:value={utmSource}
                on:input={updateUrl}
                placeholder="google, newsletter, etc."
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-slate-200"
            />
        </div>

        <div>
            <label for="utmMedium" class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">{dict.medium}</label>
            <input
                id="utmMedium"
                type="text"
                bind:value={utmMedium}
                on:input={updateUrl}
                placeholder="cpc, banner, email"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-slate-200"
            />
        </div>

        <div>
            <label for="utmCampaign" class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">{dict.campaign}</label>
            <input
                id="utmCampaign"
                type="text"
                bind:value={utmCampaign}
                on:input={updateUrl}
                placeholder="spring_sale"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-slate-200"
            />
        </div>

        <div>
            <label for="utmTerm" class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">{dict.term}</label>
            <input
                id="utmTerm"
                type="text"
                bind:value={utmTerm}
                on:input={updateUrl}
                placeholder="running+shoes"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-slate-200"
            />
        </div>

        <div>
            <label for="utmContent" class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">{dict.content}</label>
            <input
                id="utmContent"
                type="text"
                bind:value={utmContent}
                on:input={updateUrl}
                placeholder="logolink, textlink"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-slate-200"
            />
        </div>
    </div>

    <div class="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
        <p class="text-xs text-slate-500 dark:text-slate-400">
            UTM parameters automatically update the main URL string in real-time.
        </p>
    </div>
</div>
