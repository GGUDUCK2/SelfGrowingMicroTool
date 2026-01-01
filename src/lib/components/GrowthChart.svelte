<script lang="ts">
  import { formatMoney } from "$lib/utils";

  export let results: { year: number; nominalBalance: number; realBalance: number }[];
  export let maxBalance: number;
  export let years: number;
  export let lang: string;
</script>

<div
  class="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 min-h-[350px] relative"
  role="img"
  aria-label={lang === "ko"
    ? "시간 경과에 따른 복리 성장 그래프"
    : "Compound interest growth chart over time"}
>
  <h3 class="text-lg font-semibold text-gray-900 mb-6">
    {lang === "ko" ? "성장 그래프" : "Growth Chart"}
  </h3>

  <div class="h-[250px] w-full flex items-end gap-1 relative pl-8 pb-6">
    <!-- Y-axis labels -->
    <div
      class="absolute left-0 top-0 bottom-6 w-8 flex flex-col justify-between text-[10px] text-gray-400"
      aria-hidden="true"
    >
      <span>{formatMoney(maxBalance, lang)}</span>
      <span>{formatMoney(maxBalance / 2, lang)}</span>
      <span>0</span>
    </div>

    {#each results as result, i}
      <!-- Bar Group -->
      <div
        class="flex-1 flex flex-col justify-end gap-0 relative group h-full"
      >
        <!-- Real Value Bar (Background/Lower) -->
        <div class="w-full flex flex-col-reverse items-end h-full">
          <!-- Top part (Inflation gap) -->
          <div
            class="w-full bg-indigo-200 hover:bg-indigo-300 transition-colors cursor-pointer rounded-t-sm"
            style="height: {((result.nominalBalance - result.realBalance) /
              maxBalance) *
              100}%"
          ></div>
          <!-- Bottom part (Real Value) -->
          <div
            class="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer"
            style="height: {(result.realBalance / maxBalance) * 100}%"
          ></div>
        </div>

        <!-- Tooltip -->
        <div
          class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none"
        >
          <div class="font-bold mb-1">Year {result.year}</div>
          <div>Nominal: {formatMoney(result.nominalBalance, lang)}</div>
          <div class="text-indigo-200">
            Real: {formatMoney(result.realBalance, lang)}
          </div>
        </div>
      </div>
    {/each}

    <!-- X-axis labels -->
    <div
      class="absolute bottom-0 left-8 right-0 flex justify-between text-xs text-gray-400 pt-2"
      aria-hidden="true"
    >
      <span>Year 1</span>
      <span>Year {Math.round(years / 2)}</span>
      <span>Year {years}</span>
    </div>
  </div>

  <div class="flex justify-center gap-6 mt-6">
    <div class="flex items-center gap-2 text-xs text-gray-600">
      <div class="w-3 h-3 bg-indigo-600 rounded-sm"></div>
      {lang === "ko" ? "실질 가치" : "Real Value"}
    </div>
    <div class="flex items-center gap-2 text-xs text-gray-600">
      <div class="w-3 h-3 bg-indigo-200 rounded-sm"></div>
      {lang === "ko" ? "인플레이션 효과" : "Inflation Effect"}
    </div>
  </div>
</div>
