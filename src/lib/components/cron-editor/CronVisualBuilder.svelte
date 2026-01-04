<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { slide } from 'svelte/transition';

  export let lang: string = 'en';
  export let value: string = '* * * * *';

  const dispatch = createEventDispatcher();

  // Internal state for the visual builder
  // We break the cron expression into 5 parts: minute, hour, day(month), month, day(week)
  let parts = ['*', '*', '*', '*', '*'];
  let activeTab = 0; // 0: Minutes, 1: Hours, 2: Days, 3: Months, 4: Weekdays

  const TABS = [
    { id: 'minute', label: { en: 'Minutes', ko: '분' } },
    { id: 'hour', label: { en: 'Hours', ko: '시' } },
    { id: 'day', label: { en: 'Day', ko: '일' } },
    { id: 'month', label: { en: 'Month', ko: '월' } },
    { id: 'weekday', label: { en: 'Weekday', ko: '요일' } }
  ];

  // Helper to parse existing string back to UI state
  // This is complex because we support raw editing.
  // We will simple try to split by space. If it matches 5 parts, we update.
  $: {
      const split = value.trim().split(/\s+/);
      if (split.length === 5) {
          parts = split;
      }
  }

  function updatePart(index: number, val: string) {
      const newParts = [...parts];
      newParts[index] = val;
      const newValue = newParts.join(' ');
      if (newValue !== value) {
          dispatch('change', newValue);
      }
  }

  // --- Sub-components logic for each tab ---
  // To keep this file clean, I'll inline the logic for selecting "Every", "Specific", etc.
  // Each tab has a `mode` (every, specific, range, step)

  let tabModes = ['every', 'every', 'every', 'every', 'every']; // modes for each tab

  // Helper to generate range
  const range = (start: number, end: number) => Array.from({length: end - start + 1}, (_, i) => start + i);

  const OPTIONS = {
      minutes: range(0, 59),
      hours: range(0, 23),
      days: range(1, 31),
      months: range(1, 12).map(m => ({ val: m, label: { en: new Date(2000, m-1, 1).toLocaleString('en', {month:'short'}), ko: `${m}월` } })),
      weekdays: range(0, 6).map(d => ({ val: d, label: { en: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d], ko: ['일','월','화','수','목','금','토'][d] } }))
  };

  function setMode(tabIndex: number, mode: string) {
      tabModes[tabIndex] = mode;
      // Reset value for that part based on mode
      if (mode === 'every') updatePart(tabIndex, '*');
  }

  function toggleSpecific(tabIndex: number, val: number | string) {
      const current = parts[tabIndex];
      let selected: (string|number)[] = [];

      if (current !== '*' && !current.includes('/')) {
         selected = current.split(',').map(s => isNaN(Number(s)) ? s : Number(s));
      }

      // If switching from * to specific, start empty
      if (tabModes[tabIndex] !== 'specific') {
          selected = [];
          tabModes[tabIndex] = 'specific';
      }

      const idx = selected.indexOf(val);
      if (idx >= 0) {
          selected.splice(idx, 1);
      } else {
          selected.push(val);
      }

      // Sort numbers
      selected.sort((a,b) => Number(a) - Number(b));

      if (selected.length === 0) {
          updatePart(tabIndex, '*');
          tabModes[tabIndex] = 'every'; // Reset if empty
      } else {
          updatePart(tabIndex, selected.join(','));
      }
  }

  function isSelected(tabIndex: number, val: number | string) {
       if (parts[tabIndex] === '*') return false;
       const list = parts[tabIndex].split(',');
       return list.includes(String(val));
  }

  // Step handler
  let stepState = { start: 0, step: 1 };
  function updateStep(tabIndex: number) {
     updatePart(tabIndex, `${stepState.start}/${stepState.step}`);
  }

</script>

<div class="rounded-xl border border-white/10 bg-black/20 backdrop-blur-sm">
  <!-- Tab Headers -->
  <div class="flex overflow-x-auto border-b border-white/10">
    {#each TABS as tab, i}
      <button
        class="flex-1 px-4 py-3 text-sm font-medium transition-colors hover:bg-white/5 focus:outline-none whitespace-nowrap
        {activeTab === i ? 'bg-white/10 text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400'}"
        on:click={() => activeTab = i}
      >
        {lang === 'ko' ? tab.label.ko : tab.label.en}
        <span class="ml-2 rounded bg-black/40 px-1.5 py-0.5 text-xs text-gray-500 font-mono">
           {parts[i]}
        </span>
      </button>
    {/each}
  </div>

  <!-- Tab Content -->
  <div class="p-6 min-h-[300px]">
    <div class="mb-4 flex space-x-4 border-b border-white/5 pb-4">
        <label class="flex items-center space-x-2 cursor-pointer">
            <input type="radio" name="mode-{activeTab}" value="every" checked={parts[activeTab] === '*'} on:change={() => updatePart(activeTab, '*')} class="text-indigo-500 focus:ring-indigo-500 bg-gray-700 border-gray-600">
            <span class="text-sm text-gray-300">{lang === 'ko' ? '매 ' + (activeTab === 0 ? '분' : activeTab === 1 ? '시' : activeTab === 2 ? '일' : activeTab === 3 ? '월' : '요일') : 'Every ' + TABS[activeTab].label.en} (*)</span>
        </label>
        <label class="flex items-center space-x-2 cursor-pointer">
            <input type="radio" name="mode-{activeTab}" value="specific" checked={parts[activeTab] !== '*' && !parts[activeTab].includes('/')} on:change={() => { /* Handled by clicks below */ }} class="text-indigo-500 focus:ring-indigo-500 bg-gray-700 border-gray-600">
            <span class="text-sm text-gray-300">{lang === 'ko' ? '특정 선택' : 'Specific'}</span>
        </label>
         <label class="flex items-center space-x-2 cursor-pointer">
            <input type="radio" name="mode-{activeTab}" value="step" checked={parts[activeTab].includes('/')} on:change={() => updateStep(activeTab)} class="text-indigo-500 focus:ring-indigo-500 bg-gray-700 border-gray-600">
            <span class="text-sm text-gray-300">{lang === 'ko' ? '주기/간격' : 'Step/Interval'}</span>
        </label>
    </div>

    <!-- Specific Grid -->
    {#if activeTab === 0}
       <div class="grid grid-cols-10 gap-2">
         {#each OPTIONS.minutes as m}
           <button
             class="rounded p-1 text-xs font-mono transition-colors
             {isSelected(0, m) ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}"
             on:click={() => toggleSpecific(0, m)}
           >
             {m}
           </button>
         {/each}
       </div>
    {:else if activeTab === 1}
        <div class="grid grid-cols-6 gap-2">
         {#each OPTIONS.hours as h}
           <button
             class="rounded p-2 text-sm font-mono transition-colors
             {isSelected(1, h) ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}"
             on:click={() => toggleSpecific(1, h)}
           >
             {String(h).padStart(2, '0')}:00
           </button>
         {/each}
       </div>
    {:else if activeTab === 2}
        <div class="grid grid-cols-7 gap-2">
         {#each OPTIONS.days as d}
           <button
             class="rounded p-2 text-sm font-mono transition-colors
             {isSelected(2, d) ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}"
             on:click={() => toggleSpecific(2, d)}
           >
             {d}
           </button>
         {/each}
       </div>
    {:else if activeTab === 3}
        <div class="grid grid-cols-4 gap-2">
         {#each OPTIONS.months as m}
           <button
             class="rounded p-2 text-sm transition-colors
             {isSelected(3, m.val) ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}"
             on:click={() => toggleSpecific(3, m.val)}
           >
             {lang === 'ko' ? m.label.ko : m.label.en}
           </button>
         {/each}
       </div>
    {:else if activeTab === 4}
        <div class="grid grid-cols-4 gap-2">
         {#each OPTIONS.weekdays as d}
           <button
             class="rounded p-2 text-sm transition-colors
             {isSelected(4, d.val) ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}"
             on:click={() => toggleSpecific(4, d.val)}
           >
             {lang === 'ko' ? d.label.ko : d.label.en}
           </button>
         {/each}
       </div>
    {/if}

    <!-- Step Options -->
    {#if parts[activeTab].includes('/')}
       <div class="mt-4 p-4 bg-white/5 rounded-lg">
           <div class="flex items-center space-x-4">
               <span class="text-gray-300">{lang === 'ko' ? '시작' : 'Start'}:</span>
               <input type="number" min="0" max="60" class="bg-black/20 border border-white/10 rounded px-2 py-1 text-white w-20" bind:value={stepState.start} on:change={() => updateStep(activeTab)} />
               <span class="text-gray-300">/</span>
               <span class="text-gray-300">{lang === 'ko' ? '간격' : 'Step'}:</span>
               <input type="number" min="1" max="60" class="bg-black/20 border border-white/10 rounded px-2 py-1 text-white w-20" bind:value={stepState.step} on:change={() => updateStep(activeTab)} />
           </div>
           <p class="mt-2 text-xs text-gray-500">
               {lang === 'ko' ? '예: */5는 5마다, 2/10은 2에서 시작하여 10마다' : 'Example: */5 means every 5. 2/10 means starting at 2, every 10.'}
           </p>
       </div>
    {/if}

  </div>
</div>
