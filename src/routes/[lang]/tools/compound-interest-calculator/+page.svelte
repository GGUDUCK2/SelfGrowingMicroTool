<script lang="ts">
  import { fade, slide } from 'svelte/transition';
  
  export let data;
  $: lang = data.lang; // layout data
  
  // State
  let principal = 10000;
  let rate = 5;
  let years = 10;
  let contribution = 500;
  
  $: results = calculateCompoundInterest(principal, rate, years, contribution);
  $: totalInvested = principal + (contribution * 12 * years);
  $: totalInterest = results[results.length - 1].balance - totalInvested;
  
  function calculateCompoundInterest(p: number, r: number, y: number, c: number) {
    let balance = p;
    const monthlyRate = r / 100 / 12;
    const data = [];
    
    for (let i = 1; i <= y; i++) {
      for (let m = 0; m < 12; m++) {
        balance = (balance + c) * (1 + monthlyRate);
      }
      data.push({ year: i, balance: Math.round(balance) });
    }
    return data;
  }
  
  function formatMoney(amount: number) {
    return new Intl.NumberFormat(lang === 'ko' ? 'ko-KR' : 'en-US', {
      style: 'currency',
      currency: lang === 'ko' ? 'KRW' : 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  }

  // SVG Chart Helpers
  $: maxBalance = results[results.length - 1].balance;
  $: chartHeight = 200;
  $: barWidth = 100 / results.length;
</script>

<div class="max-w-5xl mx-auto py-12 space-y-12">
  <div class="text-center space-y-4">
    <h1 class="text-4xl font-bold text-gray-900">{lang === 'ko' ? '복리 계산기' : 'Compound Interest Calculator'}</h1>
    <p class="text-gray-500 max-w-2xl mx-auto">
      {lang === 'ko' 
        ? '시간이 지남에 따라 자산이 어떻게 성장하는지 확인하세요. 복리의 마법을 경험해보세요.' 
        : 'Visualize how your investment grows over time with the power of compound interest.'}
    </p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <!-- Input Form -->
    <div class="lg:col-span-1 bg-white p-8 rounded-2xl shadow-lg border border-gray-100 h-fit space-y-6">
      <h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sliders-horizontal text-indigo-600"><line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" y1="2" y2="6"/><line x1="8" y1="10" y2="14"/><line x1="16" y1="18" y2="22"/></svg>
        {lang === 'ko' ? '설정' : 'Configuration'}
      </h2>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {lang === 'ko' ? '초기 투자금' : 'Initial Investment'}
          </label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input type="number" bind:value={principal} class="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" />
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {lang === 'ko' ? '월 적립금' : 'Monthly Contribution'}
          </label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input type="number" bind:value={contribution} class="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" />
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {lang === 'ko' ? '연 수익률 (%)' : 'Interest Rate (%)'}
          </label>
          <div class="relative">
             <input type="number" step="0.1" bind:value={rate} class="w-full pl-4 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" />
             <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
          </div>
          <input type="range" min="1" max="20" step="0.1" bind:value={rate} class="w-full mt-2 accent-indigo-600 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {lang === 'ko' ? '투자 기간 (년)' : 'Years to Grow'}
          </label>
          <div class="flex items-center gap-4">
            <input type="range" min="1" max="50" bind:value={years} class="flex-1 accent-indigo-600 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
            <span class="font-bold text-indigo-600 w-12 text-right">{years}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Results Display -->
    <div class="lg:col-span-2 space-y-8">
       <!-- Summary Cards -->
       <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div class="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
           <div class="text-indigo-600 text-sm font-semibold mb-1 uppercase tracking-wide">{lang === 'ko' ? '총 평가액' : 'Future Balance'}</div>
           <div class="text-2xl lg:text-3xl font-bold text-gray-900">{formatMoney(results[results.length - 1].balance)}</div>
         </div>
         <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
           <div class="text-gray-500 text-sm font-semibold mb-1 uppercase tracking-wide">{lang === 'ko' ? '총 투자 원금' : 'Total Invested'}</div>
           <div class="text-xl font-bold text-gray-900">{formatMoney(totalInvested)}</div>
         </div>
         <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
           <div class="text-emerald-600 text-sm font-semibold mb-1 uppercase tracking-wide">{lang === 'ko' ? '총 이자 수익' : 'Total Interest'}</div>
           <div class="text-xl font-bold text-emerald-600">+{formatMoney(totalInterest)}</div>
         </div>
       </div>
       
       <!-- Chart -->
       <div class="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 min-h-[300px] relative">
         <h3 class="text-lg font-semibold text-gray-900 mb-6">{lang === 'ko' ? '성장 그래프' : 'Growth Chart'}</h3>
         
         <div class="h-[200px] w-full flex items-end gap-1">
           {#each results as result, i}
             <div 
               class="flex-1 bg-indigo-500 hover:bg-indigo-600 transition-colors rounded-t-sm relative group cursor-pointer"
               style="height: {(result.balance / maxBalance) * 100}%"
             >
               <!-- Tooltip -->
               <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                 Year {result.year}: {formatMoney(result.balance)}
               </div>
             </div>
           {/each}
         </div>
         <div class="flex justify-between mt-2 text-xs text-gray-400">
           <span>Year 1</span>
           <span>Year {years}</span>
         </div>
       </div>
    </div>
  </div>
</div>
