<script lang="ts">
  import { Music, Activity, Clock, Split } from 'lucide-svelte';
  import type { RhythmSettings, SoundPack } from '$lib/utils/rhythm-forge/types';

  export let settings: RhythmSettings;
  export let dict: any;

  const sounds: { id: SoundPack; label: string }[] = [
      { id: 'click', label: dict.sounds.click },
      { id: 'wood', label: dict.sounds.wood },
      { id: 'drum', label: dict.sounds.drum },
      { id: 'beep', label: dict.sounds.beep }
  ];
</script>

<div class="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100 dark:border-slate-800 space-y-8">

    <!-- Sound Pack -->
    <div class="space-y-4">
        <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Music size={16} />
            {dict.sound}
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            {#each sounds as sound}
                <button
                    class="py-3 px-4 rounded-xl text-sm font-bold transition-all border-2 {settings.soundPack === sound.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'}"
                    on:click={() => settings.soundPack = sound.id}
                >
                    {sound.label}
                </button>
            {/each}
        </div>
    </div>

    <div class="h-px bg-slate-100 dark:bg-slate-800"></div>

    <!-- Time Signature -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="space-y-4">
            <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Clock size={16} />
                {dict.signature}
            </h3>
            <div class="flex items-center gap-3">
                <div class="flex-1">
                    <input
                        type="number"
                        bind:value={settings.signature[0]}
                        min="1"
                        max="32"
                        class="w-full text-center text-xl font-bold bg-slate-100 dark:bg-slate-800 rounded-xl py-3 border-2 border-transparent focus:border-indigo-500 focus:outline-none"
                    />
                </div>
                <span class="text-2xl text-slate-300 dark:text-slate-600">/</span>
                <div class="flex-1">
                    <input
                        type="number"
                        bind:value={settings.signature[1]}
                        min="1"
                        max="32"
                        class="w-full text-center text-xl font-bold bg-slate-100 dark:bg-slate-800 rounded-xl py-3 border-2 border-transparent focus:border-indigo-500 focus:outline-none"
                    />
                </div>
            </div>
        </div>

        <!-- Polyrhythm -->
        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Split size={16} />
                    {dict.polyrhythm}
                </h3>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" bind:checked={settings.polyrhythmEnabled} class="sr-only peer">
                    <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                </label>
            </div>

            <div class="flex items-center gap-3 {settings.polyrhythmEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'} transition-opacity">
                {#if settings.polyrhythm}
                    <div class="flex-1">
                        <input
                            type="number"
                            bind:value={settings.polyrhythm[0]}
                            min="1"
                            max="32"
                            class="w-full text-center text-xl font-bold bg-slate-100 dark:bg-slate-800 rounded-xl py-3 border-2 border-transparent focus:border-amber-500 focus:outline-none text-amber-600 dark:text-amber-500"
                        />
                    </div>
                    <span class="text-sm font-medium text-slate-400 uppercase">{dict.ratio}</span>
                    <div class="flex-1">
                        <input
                            type="number"
                            bind:value={settings.polyrhythm[1]}
                            min="1"
                            max="32"
                            class="w-full text-center text-xl font-bold bg-slate-100 dark:bg-slate-800 rounded-xl py-3 border-2 border-transparent focus:border-indigo-500 focus:outline-none"
                        />
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>
