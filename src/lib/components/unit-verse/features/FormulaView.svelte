<script lang="ts">
  import { Calculator, ArrowRight } from 'lucide-svelte';

  export let formula: string; // e.g., "x * 1.609"
  export let inputValue: number;
  export let fromUnitSymbol: string;
  export let toUnitSymbol: string;
  export let resultValue: number;
  export let t: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  // Parse simple formula to show steps
  // Most formulas are "x * factor" or "(x - off) * factor"
  // We want to visualize: "100 km * 0.621 = 62.1 mi"

  $: steps = parseFormula(formula, inputValue);

  function parseFormula(f: string, x: number) {
      if (!f) return [];

      // Replace 'x' with actual value highlighted
      const displayFormula = f.replace(/x/g, `<span class="text-indigo-400 font-bold">${x}</span>`);

      return [
          { label: t.formula || 'Formula', val: displayFormula },
          { label: t.calculation || 'Calculation', val: `${x} ${fromUnitSymbol} → ${parseFloat(resultValue.toFixed(6))} ${toUnitSymbol}` }
      ];
  }
</script>

<div class="mt-4 bg-slate-900/80 rounded-xl border border-slate-700 p-4 space-y-3">
    <div class="flex items-center gap-2 text-slate-400 text-xs uppercase font-bold tracking-wider mb-2">
        <Calculator size={14} />
        {t.howItWorks || 'How it works'}
    </div>

    <div class="flex flex-col md:flex-row md:items-center gap-4 text-sm font-mono">
         <div class="flex-1">
             <div class="text-slate-500 mb-1 text-xs">{t.formula || 'Formula'}</div>
             <div class="text-slate-200 bg-slate-800 px-3 py-2 rounded border border-slate-700/50">
                 {@html steps[0].val}
             </div>
         </div>

         <ArrowRight size={20} class="hidden md:block text-slate-600" />

         <div class="flex-1">
             <div class="text-slate-500 mb-1 text-xs">{t.result || 'Result'}</div>
              <div class="text-emerald-300 bg-slate-800 px-3 py-2 rounded border border-slate-700/50 flex justify-between">
                  <span>{inputValue} {fromUnitSymbol}</span>
                  <span>=</span>
                  <span class="font-bold">{parseFloat(resultValue.toFixed(6))} {toUnitSymbol}</span>
              </div>
         </div>
    </div>
</div>
