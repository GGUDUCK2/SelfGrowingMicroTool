<script lang="ts">
  import { onMount } from "svelte";
  import { fade, slide } from "svelte/transition";
  import { db } from "$lib/db";
  import { dictionaries } from "$lib/dictionaries";

  export let data;
  $: lang = (data.lang as "en" | "ko") || "en";
  $: dict =
    dictionaries[lang]?.tools?.compoundInterest ||
    dictionaries.en.tools.compoundInterest;

  // State
  // Initialize from URL if in browser, otherwise defaults
  // We need to parse URL params synchronously if possible or rely on onMount to override before sync kicks in?
  // Actually, we can check $page.url directly during init if we are careful.
  // But $page is a store.

  let principal = 10000;
  let rate = 5;
  let years = 10;
  let contribution = 500;
  let inflationRate = 0;
  let compoundFrequency = 12; // 12 = Monthly, 4 = Quarterly, 1 = Annually

  // Validation State
  let errors: Record<string, string> = {};

  // Load data from IndexedDB on mount
  onMount(async () => {
    try {
      const config = await db.compoundInterestConfig
        .orderBy("updatedAt")
        .last();
      if (config) {
        principal = config.principal;
        rate = config.rate;
        years = config.years;
        contribution = config.contribution;
        inflationRate = config.inflationRate ?? 0;
        compoundFrequency = config.compoundFrequency ?? 12;
      }
    } catch (error) {
      console.error("Failed to load data from IndexedDB:", error);
    }
  });

  // Save data to IndexedDB whenever state changes
  async function saveData() {
    if (Object.keys(errors).length > 0) return; // Don't save if there are errors

    try {
      await db.compoundInterestConfig.put({
        id: 1, // Single record for now
        principal,
        rate,
        years,
        contribution,
        inflationRate,
        compoundFrequency,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Failed to save data to IndexedDB:", error);
    }
  }

  $: {
    // Trigger save when values change
    // We put this in a reactive block but we want to debounce it slightly in a real app.
    // For now, let's just call it.
    if (principal && rate && years && contribution !== undefined) {
      saveData();
    }
  }

  // Validation
  $: {
    errors = {};
    if (principal < 0)
      errors.principal =
        lang === "ko"
          ? "0 이상의 값을 입력하세요."
          : "Value must be 0 or greater.";
    if (contribution < 0)
      errors.contribution =
        lang === "ko"
          ? "0 이상의 값을 입력하세요."
          : "Value must be 0 or greater.";
    if (rate < 0)
      errors.rate =
        lang === "ko"
          ? "0 이상의 값을 입력하세요."
          : "Value must be 0 or greater.";
    if (years <= 0)
      errors.years =
        lang === "ko"
          ? "0보다 큰 값을 입력하세요."
          : "Value must be greater than 0.";
    if (inflationRate < 0)
      errors.inflationRate =
        lang === "ko"
          ? "0 이상의 값을 입력하세요."
          : "Value must be 0 or greater.";
  }

  $: results = calculateCompoundInterest(
    principal,
    rate,
    years,
    contribution,
    inflationRate,
    compoundFrequency,
  );
  $: totalInvested = principal + contribution * 12 * years;
  $: totalInterest =
    results.length > 0
      ? results[results.length - 1].nominalBalance - totalInvested
      : 0;
  $: realValue =
    results.length > 0 ? results[results.length - 1].realBalance : 0;

  function calculateCompoundInterest(
    p: number,
    r: number,
    y: number,
    c: number,
    inflation: number,
    freq: number,
  ) {
    if (p < 0 || r < 0 || y <= 0 || c < 0 || inflation < 0) return [];

    let nominalBalance = p;
    let realBalance = p;
    const nominalRatePerPeriod = r / 100 / freq;
    // const inflationRatePerMonth = inflation / 100 / 12; // Unused for now as we apply annually effectively

    const data = [];

    // We simulate month by month for accuracy with monthly contributions
    // let currentMonth = 0; // Unused
    const totalMonths = y * 12;

    for (let i = 1; i <= totalMonths; i++) {
      // Add contribution at the end of the month
      nominalBalance += c;
      realBalance += c;

      // Apply interest based on frequency
      // If frequency is 12 (monthly), apply every month.
      // If frequency is 1 (annually), apply every 12 months.
      if (i % (12 / freq) === 0) {
        nominalBalance *= 1 + nominalRatePerPeriod;
      }

      // Apply inflation deflation monthly for the real balance
      // Real Balance = Nominal Balance / (1 + inflation)^years
      // Or iteratively: Real Balance gets "eaten" by inflation.
      // A simpler standard approach: Discount the nominal balance at the end.

      // Let's stick to standard formula for Real Value: Future Value / (1 + inflationRate)^years

      if (i % 12 === 0) {
        const currentYear = i / 12;
        const discountFactor = Math.pow(1 + inflation / 100, currentYear);
        data.push({
          year: currentYear,
          nominalBalance: Math.round(nominalBalance),
          realBalance: Math.round(nominalBalance / discountFactor),
        });
      }
    }
    return data;
  }

  function formatMoney(amount: number) {
    return new Intl.NumberFormat(lang === "ko" ? "ko-KR" : "en-US", {
      style: "currency",
      currency: lang === "ko" ? "KRW" : "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  function downloadCSV() {
    const headers = [
      lang === "ko" ? "연도" : "Year",
      lang === "ko" ? "명목 금액" : "Nominal Balance",
      lang === "ko"
        ? "실질 금액 (인플레이션 반영)"
        : "Real Balance (Inflation Adjusted)",
    ];

    const rows = results.map((r) => [r.year, r.nominalBalance, r.realBalance]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      rows.map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "compound_interest_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // SVG Chart Helpers
  $: maxBalance =
    results.length > 0 ? results[results.length - 1].nominalBalance : 100;

  // History (placeholder - no history feature yet)
  let history: { id?: number; data: any; createdAt: Date }[] = [];
  function restoreHistory(_item: any) {
    /* Not implemented */
  }
  function deleteHistory(_id: number) {
    /* Not implemented */
  }
</script>

<div class="max-w-6xl mx-auto py-12 space-y-12 px-4">
  <div class="text-center space-y-4">
    <h1 class="text-4xl font-bold text-gray-900">
      {lang === "ko" ? "복리 계산기" : "Compound Interest Calculator"}
    </h1>
    <p class="text-gray-500 max-w-2xl mx-auto">
      {lang === "ko"
        ? "시간이 지남에 따라 자산이 어떻게 성장하는지 확인하세요. 인플레이션까지 고려한 복리의 마법을 경험해보세요."
        : "Visualize how your investment grows over time with the power of compound interest, adjusted for inflation."}
    </p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <!-- Input Form -->
    <div
      class="lg:col-span-1 bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 h-fit space-y-6"
    >
      <h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-sliders-horizontal text-indigo-600"
          ><line x1="21" x2="14" y1="4" y2="4" /><line
            x1="10"
            x2="3"
            y1="4"
            y2="4"
          /><line x1="21" x2="12" y1="12" y2="12" /><line
            x1="8"
            x2="3"
            y1="12"
            y2="12"
          /><line x1="21" x2="16" y1="20" y2="20" /><line
            x1="12"
            x2="3"
            y1="20"
            y2="20"
          /><line x1="14" y1="2" y2="6" /><line x1="8" y1="10" y2="14" /><line
            x1="16"
            y1="18"
            y2="22"
          /></svg
        >
        {dict.config}
      </h2>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {lang === "ko" ? "초기 투자금" : "Initial Investment"}
            <div class="relative mt-1">
              <span
                class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                >$</span
              >
              <input
                type="number"
                bind:value={principal}
                class="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                class:border-red-500={errors.principal}
              />
            </div>
          </label>
          {#if errors.principal}<p class="text-red-500 text-xs mt-1">
              {errors.principal}
            </p>{/if}
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {lang === "ko" ? "월 적립금" : "Monthly Contribution"}
            <div class="relative mt-1">
              <span
                class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                >$</span
              >
              <input
                type="number"
                bind:value={contribution}
                class="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                class:border-red-500={errors.contribution}
              />
            </div>
          </label>
          {#if errors.contribution}<p class="text-red-500 text-xs mt-1">
              {errors.contribution}
            </p>{/if}
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {lang === "ko" ? "연 수익률 (%)" : "Interest Rate (%)"}
            <div class="relative mt-1">
              <input
                type="number"
                step="0.1"
                bind:value={rate}
                class="w-full pl-4 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                class:border-red-500={errors.rate}
              />
              <span
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >%</span
              >
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="0.1"
              bind:value={rate}
              class="w-full mt-2 accent-indigo-600 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </label>
          {#if errors.rate}<p class="text-red-500 text-xs mt-1">
              {errors.rate}
            </p>{/if}
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {lang === "ko"
              ? "물가 상승률 (인플레이션 %)"
              : "Inflation Rate (%)"}
            <div class="relative mt-1">
              <input
                type="number"
                step="0.1"
                bind:value={inflationRate}
                class="w-full pl-4 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                class:border-red-500={errors.inflationRate}
              />
              <span
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >%</span
              >
            </div>
          </label>
          {#if errors.inflationRate}<p class="text-red-500 text-xs mt-1">
              {errors.inflationRate}
            </p>{/if}
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {lang === "ko" ? "복리 주기" : "Compound Frequency"}
            <select
              bind:value={compoundFrequency}
              class="w-full px-4 py-2 mt-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-white"
            >
              <option value={12}
                >{lang === "ko" ? "매월 (12회/년)" : "Monthly (12/yr)"}</option
              >
              <option value={4}
                >{lang === "ko"
                  ? "분기별 (4회/년)"
                  : "Quarterly (4/yr)"}</option
              >
              <option value={2}
                >{lang === "ko"
                  ? "반기별 (2회/년)"
                  : "Semiannually (2/yr)"}</option
              >
              <option value={1}
                >{lang === "ko" ? "매년 (1회/년)" : "Annually (1/yr)"}</option
              >
            </select>
          </label>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {lang === "ko" ? "투자 기간 (년)" : "Years to Grow"}
            <div class="flex items-center gap-4 mt-1">
              <input
                type="range"
                min="1"
                max="50"
                bind:value={years}
                class="flex-1 accent-indigo-600 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span class="font-bold text-indigo-600 w-12 text-right"
                >{years}</span
              >
            </div>
          </label>
          {#if errors.years}<p class="text-red-500 text-xs mt-1">
              {errors.years}
            </p>{/if}
        </div>

        <button
          on:click={downloadCSV}
          class="w-full flex justify-center items-center gap-2 py-2 px-4 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium text-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-download"
            ><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline
              points="7 10 12 15 17 10"
            /><line x1="12" x2="12" y1="15" y2="3" /></svg
          >
          {lang === "ko" ? "데이터 내보내기 (CSV)" : "Export to CSV"}
        </button>
      </div>
    </div>

    <!-- Results Display -->
    <div class="lg:col-span-2 space-y-8">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
          <div
            class="text-indigo-600 text-xs font-semibold mb-1 uppercase tracking-wide"
          >
            {lang === "ko" ? "총 평가액" : "Future Balance"}
          </div>
          <div
            class="text-xl lg:text-2xl font-bold text-gray-900 truncate"
            title={formatMoney(
              results.length > 0
                ? results[results.length - 1].nominalBalance
                : 0,
            )}
          >
            {formatMoney(
              results.length > 0
                ? results[results.length - 1].nominalBalance
                : 0,
            )}
          </div>
        </div>
        <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div
            class="text-purple-600 text-xs font-semibold mb-1 uppercase tracking-wide"
          >
            {lang === "ko" ? "실질 가치 (물가반영)" : "Real Value"}
          </div>
          <div
            class="text-lg lg:text-xl font-bold text-gray-900 truncate"
            title={formatMoney(realValue)}
          >
            {formatMoney(realValue)}
          </div>
        </div>
        <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div
            class="text-gray-500 text-xs font-semibold mb-1 uppercase tracking-wide"
          >
            {lang === "ko" ? "총 투자 원금" : "Total Invested"}
          </div>
          <div class="text-lg font-bold text-gray-900 truncate">
            {formatMoney(totalInvested)}
          </div>
        </div>
        <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div
            class="text-emerald-600 text-xs font-semibold mb-1 uppercase tracking-wide"
          >
            {lang === "ko" ? "총 이자 수익" : "Total Interest"}
          </div>
          <div class="text-lg font-bold text-emerald-600 truncate">
            +{formatMoney(totalInterest)}
          </div>
        </div>
      </div>

      <!-- Chart -->
      <div
        class="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 min-h-[350px] relative"
      >
        <h3 class="text-lg font-semibold text-gray-900 mb-6">
          {lang === "ko" ? "성장 그래프" : "Growth Chart"}
        </h3>

        <div class="h-[250px] w-full flex items-end gap-1 relative pl-8 pb-6">
          <!-- Y-axis labels -->
          <div
            class="absolute left-0 top-0 bottom-6 w-8 flex flex-col justify-between text-[10px] text-gray-400"
          >
            <span>{formatMoney(maxBalance)}</span>
            <span>{formatMoney(maxBalance / 2)}</span>
            <span>0</span>
          </div>

          {#each results as result, i}
            <!-- Bar Group -->
            <div
              class="flex-1 flex flex-col justify-end gap-0 relative group h-full"
            >
              <!-- Real Value Bar (Background/Lower) -->
              <!-- We stack them visually. Real Value is always <= Nominal Value (assuming positive inflation) -->
              <!-- Actually, to show both, we can make Real Value overlap Nominal. -->

              <div class="w-full flex flex-col-reverse items-end h-full">
                <!-- Top part (Inflation gap) -->
                <div
                  class="w-full bg-indigo-200 hover:bg-indigo-300 transition-colors cursor-pointer rounded-t-sm"
                  style="height: {((result.nominalBalance -
                    result.realBalance) /
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
                <div>Nominal: {formatMoney(result.nominalBalance)}</div>
                <div class="text-indigo-200">
                  Real: {formatMoney(result.realBalance)}
                </div>
              </div>
            </div>
          {/each}

          <!-- X-axis labels -->
          <div
            class="absolute bottom-0 left-8 right-0 flex justify-between text-xs text-gray-400 pt-2"
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

      <!-- History Section -->
      {#if history.length > 0}
        <div
          class="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
          transition:slide
        >
          <h3
            class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-history"
              ><path
                d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12"
              /><path d="M3 3v9h9" /><path d="M12 7v5l4 2" /></svg
            >
            {dict.history}
          </h3>
          <div class="space-y-3">
            {#each history as item (item.id)}
              <div
                class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <button
                  class="text-left cursor-pointer flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1"
                  on:click={() => restoreHistory(item)}
                >
                  <div class="font-medium text-gray-900">
                    {formatMoney(item.data.finalBalance)}
                  </div>
                  <div class="text-sm text-gray-500">
                    {formatMoney(item.data.principal)} + {formatMoney(
                      item.data.contribution,
                    )}/mo @ {item.data.rate}%
                  </div>
                  <div class="text-xs text-gray-400 mt-1">
                    {item.createdAt.toLocaleString()}
                  </div>
                </button>
                <button
                  on:click={() => item.id && deleteHistory(item.id)}
                  class="p-2 text-gray-400 hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full"
                  aria-label={dict.delete}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="lucide lucide-trash-2"
                    ><path d="M3 6h18" /><path
                      d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"
                    /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line
                      x1="10"
                      x2="10"
                      y1="11"
                      y2="17"
                    /><line x1="14" x2="14" y1="11" y2="17" /></svg
                  >
                </button>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- FAQ Section -->
      <div class="bg-indigo-900 text-white p-8 rounded-2xl shadow-lg">
        <h3 class="text-xl font-bold mb-6 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-help-circle"
            ><circle cx="12" cy="12" r="10" /><path
              d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
            /><path d="M12 17h.01" /></svg
          >
          {dict.faqTitle}
        </h3>
        <div class="space-y-6">
          <div>
            <h4 class="font-semibold text-indigo-200 mb-2">{dict.q1}</h4>
            <p class="text-indigo-100 text-sm leading-relaxed">{dict.a1}</p>
          </div>
          <div>
            <h4 class="font-semibold text-indigo-200 mb-2">{dict.q2}</h4>
            <p class="text-indigo-100 text-sm leading-relaxed">{dict.a2}</p>
          </div>
          <div>
            <h4 class="font-semibold text-indigo-200 mb-2">{dict.q3}</h4>
            <p class="text-indigo-100 text-sm leading-relaxed">{dict.a3}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
