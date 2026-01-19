<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { RotateCcw, Keyboard as KeyboardIcon, Activity } from 'lucide-svelte';
  import { fade } from 'svelte/transition';

  export let dict: any;
  export let onLog: (event: any) => void;

  let activeKeys = new Set<string>();
  let lastEvent: KeyboardEvent | null = null;
  let history: any[] = [];
  let maxGhosting = 0;
  let startTime = 0;
  let lastTime = 0;
  let latency = 0;

  // Key Layout Data (ANSI)
  const rows = [
    [
      { code: 'Escape', label: 'Esc', w: 1 },
      { code: 'F1', label: 'F1', w: 1 }, { code: 'F2', label: 'F2', w: 1 }, { code: 'F3', label: 'F3', w: 1 }, { code: 'F4', label: 'F4', w: 1 },
      { code: 'F5', label: 'F5', w: 1 }, { code: 'F6', label: 'F6', w: 1 }, { code: 'F7', label: 'F7', w: 1 }, { code: 'F8', label: 'F8', w: 1 },
      { code: 'F9', label: 'F9', w: 1 }, { code: 'F10', label: 'F10', w: 1 }, { code: 'F11', label: 'F11', w: 1 }, { code: 'F12', label: 'F12', w: 1 }
    ],
    [
      { code: 'Backquote', label: '`', w: 1 }, { code: 'Digit1', label: '1', w: 1 }, { code: 'Digit2', label: '2', w: 1 }, { code: 'Digit3', label: '3', w: 1 },
      { code: 'Digit4', label: '4', w: 1 }, { code: 'Digit5', label: '5', w: 1 }, { code: 'Digit6', label: '6', w: 1 }, { code: 'Digit7', label: '7', w: 1 },
      { code: 'Digit8', label: '8', w: 1 }, { code: 'Digit9', label: '9', w: 1 }, { code: 'Digit0', label: '0', w: 1 }, { code: 'Minus', label: '-', w: 1 },
      { code: 'Equal', label: '=', w: 1 }, { code: 'Backspace', label: 'Backspace', w: 2 }
    ],
    [
      { code: 'Tab', label: 'Tab', w: 1.5 }, { code: 'KeyQ', label: 'Q', w: 1 }, { code: 'KeyW', label: 'W', w: 1 }, { code: 'KeyE', label: 'E', w: 1 },
      { code: 'KeyR', label: 'R', w: 1 }, { code: 'KeyT', label: 'T', w: 1 }, { code: 'KeyY', label: 'Y', w: 1 }, { code: 'KeyU', label: 'U', w: 1 },
      { code: 'KeyI', label: 'I', w: 1 }, { code: 'KeyO', label: 'O', w: 1 }, { code: 'KeyP', label: 'P', w: 1 }, { code: 'BracketLeft', label: '[', w: 1 },
      { code: 'BracketRight', label: ']', w: 1 }, { code: 'Backslash', label: '\\', w: 1.5 }
    ],
    [
      { code: 'CapsLock', label: 'Caps', w: 1.75 }, { code: 'KeyA', label: 'A', w: 1 }, { code: 'KeyS', label: 'S', w: 1 }, { code: 'KeyD', label: 'D', w: 1 },
      { code: 'KeyF', label: 'F', w: 1 }, { code: 'KeyG', label: 'G', w: 1 }, { code: 'KeyH', label: 'H', w: 1 }, { code: 'KeyJ', label: 'J', w: 1 },
      { code: 'KeyK', label: 'K', w: 1 }, { code: 'KeyL', label: 'L', w: 1 }, { code: 'Semicolon', label: ';', w: 1 }, { code: 'Quote', label: "'", w: 1 },
      { code: 'Enter', label: 'Enter', w: 2.25 }
    ],
    [
      { code: 'ShiftLeft', label: 'Shift', w: 2.25 }, { code: 'KeyZ', label: 'Z', w: 1 }, { code: 'KeyX', label: 'X', w: 1 }, { code: 'KeyC', label: 'C', w: 1 },
      { code: 'KeyV', label: 'V', w: 1 }, { code: 'KeyB', label: 'B', w: 1 }, { code: 'KeyN', label: 'N', w: 1 }, { code: 'KeyM', label: 'M', w: 1 },
      { code: 'Comma', label: ',', w: 1 }, { code: 'Period', label: '.', w: 1 }, { code: 'Slash', label: '/', w: 1 }, { code: 'ShiftRight', label: 'Shift', w: 2.75 }
    ],
    [
      { code: 'ControlLeft', label: 'Ctrl', w: 1.25 }, { code: 'MetaLeft', label: 'Win', w: 1.25 }, { code: 'AltLeft', label: 'Alt', w: 1.25 },
      { code: 'Space', label: 'Space', w: 6.25 },
      { code: 'AltRight', label: 'Alt', w: 1.25 }, { code: 'MetaRight', label: 'Win', w: 1.25 }, { code: 'ContextMenu', label: 'Menu', w: 1.25 }, { code: 'ControlRight', label: 'Ctrl', w: 1.25 }
    ]
  ];

  const navBlock = [
    [{ code: 'PrintScreen', label: 'PrtSc' }, { code: 'ScrollLock', label: 'ScLk' }, { code: 'Pause', label: 'Pause' }],
    [{ code: 'Insert', label: 'Ins' }, { code: 'Home', label: 'Home' }, { code: 'PageUp', label: 'PgUp' }],
    [{ code: 'Delete', label: 'Del' }, { code: 'End', label: 'End' }, { code: 'PageDown', label: 'PgDn' }],
    [{ code: 'ArrowUp', label: '↑' }],
    [{ code: 'ArrowLeft', label: '←' }, { code: 'ArrowDown', label: '↓' }, { code: 'ArrowRight', label: '→' }]
  ];

  function handleKeyDown(e: KeyboardEvent) {
    e.preventDefault();
    if (!activeKeys.has(e.code)) {
      activeKeys.add(e.code);
      activeKeys = activeKeys; // trigger update

      // Latency Check (rough estimate based on consistent typing)
      const now = performance.now();
      if (lastTime > 0) {
        latency = Math.round(now - lastTime);
      }
      lastTime = now;

      // Ghosting
      if (activeKeys.size > maxGhosting) {
        maxGhosting = activeKeys.size;
      }

      lastEvent = e;
      onLog({ type: 'keydown', code: e.code, key: e.key, time: new Date() });
    }
  }

  function handleKeyUp(e: KeyboardEvent) {
    e.preventDefault();
    if (activeKeys.has(e.code)) {
      activeKeys.delete(e.code);
      activeKeys = activeKeys; // trigger update
      onLog({ type: 'keyup', code: e.code, key: e.key, time: new Date() });
    }
  }

  function reset() {
    activeKeys = new Set();
    maxGhosting = 0;
    lastEvent = null;
    latency = 0;
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    }
  });
</script>

<div class="space-y-6">
  <!-- Info Panel -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
    <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
       <span class="text-xs font-medium text-slate-500 uppercase">{dict.keyboard.lastPress}</span>
       <div class="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2 truncate">
         {lastEvent ? lastEvent.code : '-'}
       </div>
       <div class="text-xs text-slate-400 mt-1 flex justify-between">
          <span>Key: {lastEvent ? lastEvent.key : '-'}</span>
          <span>Which: {lastEvent ? lastEvent.which : '-'}</span>
       </div>
    </div>

    <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
       <span class="text-xs font-medium text-slate-500 uppercase">{dict.keyboard.activeKeys}</span>
       <div class="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
         {activeKeys.size}
       </div>
       <div class="text-xs text-slate-400 mt-1">
         {dict.keyboard.pressAnyKey}
       </div>
    </div>

    <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
       <span class="text-xs font-medium text-slate-500 uppercase">{dict.keyboard.ghosting}</span>
       <div class="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
         {maxGhosting} <span class="text-sm font-normal text-slate-500">keys max</span>
       </div>
       <div class="text-xs text-slate-400 mt-1">
         NKRO Check
       </div>
    </div>

    <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
       <span class="text-xs font-medium text-slate-500 uppercase">{dict.keyboard.latency}</span>
       <div class="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">
         {latency} <span class="text-sm font-normal text-slate-500">ms</span>
       </div>
       <div class="text-xs text-slate-400 mt-1">
         Inter-key latency
       </div>
    </div>
  </div>

  <!-- Visual Keyboard -->
  <div class="bg-slate-100 dark:bg-slate-950 p-6 rounded-2xl overflow-x-auto border border-slate-200 dark:border-slate-800">
    <div class="min-w-[800px] flex gap-4">
      <!-- Main Block -->
      <div class="flex flex-col gap-1.5 flex-1">
        {#each rows as row}
          <div class="flex gap-1.5">
            {#each row as key}
              <div
                class="h-12 rounded-lg border-b-4 text-xs font-medium flex items-center justify-center transition-all duration-75 select-none"
                style="flex: {key.w};"
                class:bg-white={!activeKeys.has(key.code)}
                class:dark:bg-slate-800={!activeKeys.has(key.code)}
                class:border-slate-200={!activeKeys.has(key.code)}
                class:dark:border-slate-700={!activeKeys.has(key.code)}
                class:text-slate-500={!activeKeys.has(key.code)}
                class:bg-indigo-500={activeKeys.has(key.code)}
                class:border-indigo-700={activeKeys.has(key.code)}
                class:text-white={activeKeys.has(key.code)}
                class:translate-y-1={activeKeys.has(key.code)}
                class:border-b-0={activeKeys.has(key.code)}
              >
                {key.label}
              </div>
            {/each}
          </div>
        {/each}
      </div>

      <!-- Nav Block -->
      <div class="flex flex-col gap-4 w-40">
        <!-- Top Nav -->
         <div class="flex gap-1.5 justify-between">
             {#each navBlock[0] as key}
                <div class="w-12 h-12 rounded-lg border-b-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-[10px] text-slate-500 flex items-center justify-center transition-all duration-75"
                 class:bg-indigo-500={activeKeys.has(key.code)}
                 class:text-white={activeKeys.has(key.code)}
                 class:border-indigo-700={activeKeys.has(key.code)}
                 class:translate-y-1={activeKeys.has(key.code)}
                 class:border-b-0={activeKeys.has(key.code)}
                 class:!bg-indigo-500={activeKeys.has(key.code)}
                >
                   {key.label}
                </div>
             {/each}
         </div>

         <!-- Middle Nav -->
         <div class="flex gap-1.5 justify-between">
             {#each navBlock[1] as key}
                <div class="w-12 h-12 rounded-lg border-b-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-[10px] text-slate-500 flex items-center justify-center transition-all duration-75"
                 class:bg-indigo-500={activeKeys.has(key.code)}
                 class:text-white={activeKeys.has(key.code)}
                 class:border-indigo-700={activeKeys.has(key.code)}
                 class:translate-y-1={activeKeys.has(key.code)}
                 class:border-b-0={activeKeys.has(key.code)}
                >
                   {key.label}
                </div>
             {/each}
         </div>

         <!-- Bottom Nav -->
         <div class="flex gap-1.5 justify-between">
             {#each navBlock[2] as key}
                <div class="w-12 h-12 rounded-lg border-b-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-[10px] text-slate-500 flex items-center justify-center transition-all duration-75"
                 class:bg-indigo-500={activeKeys.has(key.code)}
                 class:text-white={activeKeys.has(key.code)}
                 class:border-indigo-700={activeKeys.has(key.code)}
                 class:translate-y-1={activeKeys.has(key.code)}
                 class:border-b-0={activeKeys.has(key.code)}
                >
                   {key.label}
                </div>
             {/each}
         </div>

         <!-- Arrows -->
         <div class="mt-4 grid grid-cols-3 gap-1.5">
             <div class="col-start-2">
                 <div class="w-12 h-12 rounded-lg border-b-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 flex items-center justify-center transition-all duration-75"
                  class:bg-indigo-500={activeKeys.has(navBlock[3][0].code)}
                  class:text-white={activeKeys.has(navBlock[3][0].code)}
                  class:border-indigo-700={activeKeys.has(navBlock[3][0].code)}
                  class:translate-y-1={activeKeys.has(navBlock[3][0].code)}
                  class:border-b-0={activeKeys.has(navBlock[3][0].code)}
                 >
                   {navBlock[3][0].label}
                 </div>
             </div>
             {#each navBlock[4] as key}
                <div class="w-12 h-12 rounded-lg border-b-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 flex items-center justify-center transition-all duration-75"
                 class:bg-indigo-500={activeKeys.has(key.code)}
                 class:text-white={activeKeys.has(key.code)}
                 class:border-indigo-700={activeKeys.has(key.code)}
                 class:translate-y-1={activeKeys.has(key.code)}
                 class:border-b-0={activeKeys.has(key.code)}
                >
                   {key.label}
                </div>
             {/each}
         </div>
      </div>
    </div>
  </div>

  <div class="flex justify-end">
    <button
      class="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors text-sm font-medium flex items-center gap-2"
      on:click={reset}
    >
      <RotateCcw size={16} />
      {dict.keyboard.reset}
    </button>
  </div>
</div>
