<script lang="ts">
  export let t: any;

  function formatText(text: string) {
    if (!text) return "";
    return text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-200">$1</strong>');
  }
</script>

<div class="bg-slate-800 rounded-2xl p-8 border border-slate-700 mt-12 prose prose-invert max-w-none">
   <h2 class="text-2xl font-bold text-white mb-4">{t.title}</h2>
   <p class="text-slate-300 mb-6">{t.intro}</p>

   <div class="grid md:grid-cols-2 gap-6 mb-8">
     <div class="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
       <h3 class="text-indigo-400 font-semibold mb-2">{t.featuresTitle}</h3>
       <ul class="text-sm text-slate-400 space-y-2 list-disc pl-4">
         <li>{@html formatText(t.f1)}</li>
         <li>{@html formatText(t.f2)}</li>
         <li>{@html formatText(t.f3)}</li>
       </ul>
     </div>

     <div class="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
       <h3 class="text-emerald-400 font-semibold mb-2">{t.tipsTitle}</h3>
       <ul class="text-sm text-slate-400 space-y-2 list-disc pl-4">
          <li>{@html formatText(t.tip1)}</li>
          <li>{@html formatText(t.tip2)}</li>
          <li>{@html formatText(t.tip3)}</li>
       </ul>
     </div>
   </div>

   <slot />
</div>
