<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { db } from "$lib/db";
  import { dictionaries } from "$lib/dictionaries";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { debounce, formatMoney } from "$lib/utils";
  import FAQSection from "$lib/components/FAQSection.svelte";
  import GrowthChart from "$lib/components/GrowthChart.svelte";
  import HistoryList from "$lib/components/HistoryList.svelte";

  export let data;
  $: lang = (data.lang as "en" | "ko") || "en";
  $: dict =
    dictionaries[lang]?.tools?.compoundInterest ||
    dictionaries.en.tools.compoundInterest;

  // State
  let principal = 10000;
  let rate = 5;
  let years = 10;
  let contribution = 500;
  let inflationRate = 0;
  let compoundFrequency = 12; // 12 = Monthly, 4 = Quarterly, 1 = Annually
  let isLoaded = false;

  // Validation State
  let errors: Record<string, string> = {};

  // Load data from URL or IndexedDB on mount
  onMount(async () => {
    try {
      // 1. Try URL Params first
      const params = $page.url.searchParams;
      if (params.has("principal")) {
        principal = Number(params.get("principal"));
        rate = Number(params.get("rate"));
        years = Number(params.get("years"));
        contribution = Number(params.get("contribution"));
        inflationRate = Number(params.get("inflationRate") || 0);
        compoundFrequency = Number(params.get("compoundFrequency") || 12);
      } else {
        // 2. Fallback to IndexedDB
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
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      isLoaded = true;
    }
  });

  // Save data to IndexedDB
  async function saveData() {
    if (Object.keys(errors).length > 0) return;

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

  // Sync state to URL and DB (Debounced)
  const syncState = debounce(async () => {
    if (!isLoaded) return;
    if (Object.keys(errors).length > 0) return;

    // Update URL
    const url = new URL($page.url);
    url.searchParams.set("principal", String(principal));
    url.searchParams.set("rate", String(rate));
    url.searchParams.set("years", String(years));
    url.searchParams.set("contribution", String(contribution));
    url.searchParams.set("inflationRate", String(inflationRate));
    url.searchParams.set("compoundFrequency", String(compoundFrequency));

    await goto(url, { replaceState: true, noScroll: true, keepFocus: true });

    // Save to DB
    await saveData();
  }, 500);

  $: {
    if (
      isLoaded &&
      principal !== undefined &&
      rate !== undefined &&
      years !== undefined &&
      contribution !== undefined &&
      inflationRate !== undefined &&
      compoundFrequency !== undefined
    ) {
      syncState();
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
    // Limit years to avoid freezing
    if (y > 100) y = 100;

    if (p < 0 || r < 0 || y <= 0 || c < 0 || inflation < 0) return [];

    let nominalBalance = p;
    // For real balance, we discount future value to present terms usually,
    // but here we want to show "purchasing power at that future time relative to today".
    // So Future Real Value = Future Nominal Value / (1 + inflation)^years.
    // Yes, this is correct.

    const nominalRatePerPeriod = r / 100 / freq;
    const data = [];
    const totalMonths = y * 12;

    for (let i = 1; i <= totalMonths; i++) {
      // Add contribution at the end of the month
      nominalBalance += c;

      // Apply interest based on frequency
      if (i % (12 / freq) === 0) {
        nominalBalance *= 1 + nominalRatePerPeriod;
      }

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

  // History (placeholder)
  let history: { id?: number; data: any; createdAt: Date }[] = [];
  function restoreHistory(_item: any) {
    /* Not implemented */
  }
  function deleteHistory(_id: number) {
    /* Not implemented */
  }

  // FAQ Data
  $: faqItems = [
    { q: dict.q1, a: dict.a1 },
    { q: dict.q2, a: dict.a2 },
    { q: dict.q3, a: dict.a3 },
  ];
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
              aria-label={lang === "ko"
                ? "연 수익률 슬라이더"
                : "Interest Rate Slider"}
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
                aria-label={lang === "ko"
                  ? "투자 기간 슬라이더"
                  : "Investment Years Slider"}
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
              lang
            )}
          >
            {formatMoney(
              results.length > 0
                ? results[results.length - 1].nominalBalance
                : 0,
              lang
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
            title={formatMoney(realValue, lang)}
          >
            {formatMoney(realValue, lang)}
          </div>
        </div>
        <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div
            class="text-gray-500 text-xs font-semibold mb-1 uppercase tracking-wide"
          >
            {lang === "ko" ? "총 투자 원금" : "Total Invested"}
          </div>
          <div class="text-lg font-bold text-gray-900 truncate">
            {formatMoney(totalInvested, lang)}
          </div>
        </div>
        <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div
            class="text-emerald-600 text-xs font-semibold mb-1 uppercase tracking-wide"
          >
            {lang === "ko" ? "총 이자 수익" : "Total Interest"}
          </div>
          <div class="text-lg font-bold text-emerald-600 truncate">
            +{formatMoney(totalInterest, lang)}
          </div>
        </div>
      </div>

      <!-- Chart -->
      <GrowthChart {results} {maxBalance} {years} {lang} />

      <!-- History Section -->
      {#if history.length > 0}
        <div transition:fade>
          <HistoryList
            {history}
            {lang}
            title={dict.history}
            deleteLabel={dict.delete}
            {restoreHistory}
            {deleteHistory}
          />
        </div>
      {/if}

      <!-- FAQ Section -->
      <FAQSection title={dict.faqTitle} items={faqItems} />
    </div>
  </div>
</div>
