<script lang="ts">
  import { Music, Activity, Clock, Split, Zap, Ghost } from '@lucide/svelte';
  import type { RhythmSettings, SoundPack, RhythmForgeDictionary } from '$lib/utils/rhythm-forge/types';

  export let settings: RhythmSettings;
  export let dict: RhythmForgeDictionary;

  const sounds: { id: SoundPack; label: string }[] = [
      { id: 'click', label: dict.sounds?.click || 'Click' },
      { id: 'wood', label: dict.sounds?.wood || 'Wood' },
      { id: 'drum', label: dict.sounds?.drum || 'Drum' },
      { id: 'beep', label: dict.sounds?.beep || 'Beep' }
  ];
</script>

<div class="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100 dark:border-slate-800 space-y-8">

    <!-- Sound Pack -->
    <div class="space-y-4">
        <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Music size={16} />
            {dict.sound || 'Sound'}
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
                {dict.signature || 'Signature'}
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
                    {dict.polyrhythm || 'Polyrhythm'}
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
                    <span class="text-sm font-medium text-slate-400 uppercase">{dict.ratio || 'Ratio'}</span>
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

    <div class="h-px bg-slate-100 dark:bg-slate-800"></div>

    <!-- Speed Trainer -->
    <div class="space-y-4">
        <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Zap size={16} />
                {(dict.trainer as any)?.title || 'Speed Trainer'}
            </h3>
            <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" bind:checked={settings.trainer.enabled} class="sr-only peer">
                <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 {settings.trainer.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'} transition-opacity">
            <div class="space-y-1">
                <span class="text-xs font-medium text-slate-500 dark:text-slate-400">{(dict.trainer as any)?.inc || 'Increment'}</span>
                <input
                    type="number"
                    bind:value={settings.trainer.increment}
                    class="w-full bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
            </div>
            <div class="space-y-1">
                <span class="text-xs font-medium text-slate-500 dark:text-slate-400">{(dict.trainer as any)?.bars || 'Bars'}</span>
                <input
                    type="number"
                    min="1"
                    bind:value={settings.trainer.interval}
                    class="w-full bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
            </div>
            <div class="space-y-1">
                <span class="text-xs font-medium text-slate-500 dark:text-slate-400">{(dict.trainer as any)?.end || 'Target BPM'}</span>
                <input
                    type="number"
                    min="30"
                    max="300"
                    bind:value={settings.trainer.endBpm}
                    class="w-full bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
            </div>
        </div>
    </div>

    <!-- Ghost Mode -->
    <div class="space-y-4">
        <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Ghost size={16} />
                {(dict.ghost as any)?.title || 'Ghost Mode'}
            </h3>
            <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" bind:checked={settings.ghost.enabled} class="sr-only peer">
                <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
            </label>
        </div>

        <div class="grid grid-cols-2 gap-4 {settings.ghost.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'} transition-opacity">
            <div class="space-y-1">
                <span class="text-xs font-medium text-slate-500 dark:text-slate-400">{(dict.ghost as any)?.play || 'Play Bars'}</span>
                <input
                    type="number"
                    min="1"
                    bind:value={settings.ghost.playBars}
                    class="w-full bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
            </div>
            <div class="space-y-1">
                <span class="text-xs font-medium text-slate-500 dark:text-slate-400">{(dict.ghost as any)?.mute || 'Mute Bars'}</span>
                <input
                    type="number"
                    min="1"
                    bind:value={settings.ghost.muteBars}
                    class="w-full bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
            </div>
        </div>
    </div>

</div>
