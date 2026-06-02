<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Gamepad2, AlertCircle } from '@lucide/svelte';

  export let dict: any;
  export let onLog: (event: any) => void;

  let gamepads: (Gamepad | null)[] = [];
  let requestRef: number;
  let hasConnected = false;

  function scanGamepads() {
    const rawGamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    // Convert to array and force reactivity
    gamepads = Array.from(rawGamepads);

    // Log buttons if needed (debounce or change detection would be needed for a log,
    // but for now we just visualize. Real-time logging floods the log.)

    if (gamepads.some(g => g !== null)) {
        hasConnected = true;
    }

    requestRef = requestAnimationFrame(scanGamepads);
  }

  onMount(() => {
    window.addEventListener("gamepadconnected", (e) => {
      onLog({ type: 'gamepad', detail: 'Connected', id: e.gamepad.id, time: new Date() });
      hasConnected = true;
    });

    window.addEventListener("gamepaddisconnected", (e) => {
      onLog({ type: 'gamepad', detail: 'Disconnected', id: e.gamepad.id, time: new Date() });
    });

    scanGamepads();
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
        cancelAnimationFrame(requestRef);
    }
  });

  function getButtonColor(value: number) {
      // value is 0-1.
      if (value > 0.1) return `rgba(99, 102, 241, ${0.2 + value * 0.8})`; // Indigo
      return '';
  }
</script>

<div class="space-y-6">
  {#if !hasConnected && gamepads.every(g => g === null)}
    <div class="flex flex-col items-center justify-center py-20 text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
        <Gamepad2 size={48} class="mb-4 opacity-50" />
        <p class="text-lg font-medium">{dict.gamepad.connect}</p>
        <p class="text-sm mt-2">{dict.faqTitle} -> {dict.faq.q2}</p>
    </div>
  {:else}
    {#each gamepads as gamepad, i}
      {#if gamepad}
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm relative overflow-hidden">
            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <Gamepad2 size={24} />
                    </div>
                    <div>
                        <h3 class="font-bold text-lg">{gamepad.id}</h3>
                        <div class="text-xs text-slate-500 font-mono">Index: {gamepad.index} | Timestamp: {gamepad.timestamp.toFixed(0)}</div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <!-- Axes -->
                <div class="space-y-4">
                    <h4 class="text-sm font-medium text-slate-500 uppercase tracking-wider">{dict.gamepad.axes}</h4>
                    <div class="grid grid-cols-2 gap-4">
                        {#each gamepad.axes as axis, axisIndex}
                            <div class="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                <div class="flex justify-between text-xs text-slate-500 mb-2">
                                    <span>AXIS {axisIndex}</span>
                                    <span class="font-mono">{axis.toFixed(4)}</span>
                                </div>
                                <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden relative">
                                    <div
                                        class="absolute top-0 bottom-0 w-2 bg-indigo-500 rounded-full transition-transform duration-75"
                                        style="left: 50%; transform: translateX({axis * 100 * 0.5}%) translateX(-50%);"
                                    ></div>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>

                <!-- Buttons -->
                <div class="space-y-4">
                    <h4 class="text-sm font-medium text-slate-500 uppercase tracking-wider">{dict.gamepad.buttons}</h4>
                    <div class="grid grid-cols-4 sm:grid-cols-6 gap-3">
                        {#each gamepad.buttons as button, btnIndex}
                            <div
                                class="aspect-square rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-75 relative overflow-hidden"
                                class:border-slate-200={!button.pressed}
                                class:dark:border-slate-700={!button.pressed}
                                class:border-indigo-500={button.pressed}
                                style="background: {getButtonColor(button.value)}"
                            >
                                <span class="text-xs font-bold z-10" class:text-indigo-700={button.pressed} class:dark:text-indigo-300={button.pressed}>B{btnIndex}</span>
                                <div class="text-[10px] text-slate-400 z-10 font-mono mt-1">{button.value.toFixed(2)}</div>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>

            <!-- Vibration Test -->
            <div class="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                 <button
                    class="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors"
                    on:click={() => {
                        if (gamepad.vibrationActuator) {
                            gamepad.vibrationActuator.playEffect("dual-rumble", {
                                startDelay: 0,
                                duration: 1000,
                                weakMagnitude: 0.5,
                                strongMagnitude: 0.5,
                            });
                            onLog({ type: 'gamepad', detail: 'Vibration Test', time: new Date() });
                        }
                    }}
                 >
                    {dict.gamepad.vibration}
                 </button>
            </div>
        </div>
      {/if}
    {/each}
  {/if}
</div>
