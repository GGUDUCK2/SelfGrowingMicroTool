<script lang="ts">
  export let title: string;
  export let intro: string;
  export let featuresTitle: string;
  export let f1: string;
  export let f2: string;
  export let f3: string;
  export let tipsTitle: string;
  export let tip1: string;
  export let tip2: string;
  export let tip3: string;

  // Function to process markdown-like bold syntax (**text**)
  function formatText(text: string) {
    if (!text) return "";
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  }
</script>

<div class="space-y-12 py-12 border-t border-gray-100 dark:border-slate-800 transition-colors duration-300">
  <!-- Introduction -->
  <div class="text-center max-w-3xl mx-auto space-y-4">
    <h2 class="text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>
    <p class="text-lg text-gray-600 dark:text-slate-400 leading-relaxed">
      {intro}
    </p>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
    <!-- Key Features -->
    <div class="bg-indigo-50 dark:bg-slate-800/50 rounded-2xl p-8 space-y-6 border border-indigo-100 dark:border-slate-700">
      <h3 class="text-xl font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-600 dark:text-indigo-400"><path d="M12 2v20"/><path d="M2 12h20"/><path d="m4.93 4.93 14.14 14.14"/><path d="m19.07 4.93-14.14 14.14"/></svg>
        {featuresTitle}
      </h3>
      <ul class="space-y-4">
        <li class="flex gap-3 text-indigo-800 dark:text-slate-300">
          <span class="mt-1 text-indigo-500 dark:text-indigo-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </span>
          <span>{@html formatText(f1)}</span>
        </li>
        <li class="flex gap-3 text-indigo-800 dark:text-slate-300">
          <span class="mt-1 text-indigo-500 dark:text-indigo-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </span>
          <span>{@html formatText(f2)}</span>
        </li>
        <li class="flex gap-3 text-indigo-800 dark:text-slate-300">
            <span class="mt-1 text-indigo-500 dark:text-indigo-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </span>
            <span>{@html formatText(f3)}</span>
          </li>
      </ul>
    </div>

    <!-- Pro Tips -->
    <div class="bg-emerald-50 dark:bg-slate-800/50 rounded-2xl p-8 space-y-6 border border-emerald-100 dark:border-slate-700">
      <h3 class="text-xl font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-600 dark:text-emerald-400"><path d="M2 12h10"/><path d="M9 4v16"/><path d="m3 9 3 3-3 3"/><path d="M12 7v10"/><path d="m16 7 4 5-4 5"/></svg>
        {tipsTitle}
      </h3>
      <ul class="space-y-4">
        <li class="flex gap-3 text-emerald-800 dark:text-slate-300">
          <span class="mt-1 text-emerald-500 dark:text-emerald-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
          </span>
          <span>{@html formatText(tip1)}</span>
        </li>
        <li class="flex gap-3 text-emerald-800 dark:text-slate-300">
          <span class="mt-1 text-emerald-500 dark:text-emerald-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
          </span>
          <span>{@html formatText(tip2)}</span>
        </li>
        <li class="flex gap-3 text-emerald-800 dark:text-slate-300">
            <span class="mt-1 text-emerald-500 dark:text-emerald-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
            </span>
            <span>{@html formatText(tip3)}</span>
          </li>
      </ul>
    </div>
  </div>
</div>
