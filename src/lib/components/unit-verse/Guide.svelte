<script lang="ts">
  export let t: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  function formatText(text: string) {
    if (!text) return "";
    return text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900 dark:text-slate-200">$1</strong>');
  }
</script>

<div class="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-gray-200 dark:border-slate-700 mt-12 prose dark:prose-invert max-w-none">
   <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t.title}</h2>
   <p class="text-gray-700 dark:text-slate-300 mb-6">{t.intro}</p>

   <div class="grid md:grid-cols-2 gap-6 mb-8">
     <div class="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-xl border border-gray-200 dark:border-slate-700/50">
       <h3 class="text-indigo-600 dark:text-indigo-400 font-semibold mb-2">{t.featuresTitle}</h3>
       <ul class="text-sm text-gray-600 dark:text-slate-400 space-y-2 list-disc pl-4">
         <li>{@html formatText(t.f1)}</li>
         <li>{@html formatText(t.f2)}</li>
         <li>{@html formatText(t.f3)}</li>
       </ul>
     </div>

     <div class="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-xl border border-gray-200 dark:border-slate-700/50">
       <h3 class="text-emerald-600 dark:text-emerald-400 font-semibold mb-2">{t.tipsTitle}</h3>
       <ul class="text-sm text-gray-600 dark:text-slate-400 space-y-2 list-disc pl-4">
          <li>{@html formatText(t.tip1)}</li>
          <li>{@html formatText(t.tip2)}</li>
          <li>{@html formatText(t.tip3)}</li>
       </ul>
     </div>
   </div>

   <slot />
</div>
