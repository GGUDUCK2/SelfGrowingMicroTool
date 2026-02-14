<script lang="ts">
  import { liveQuery } from 'dexie';
  import { db, type RhythmForgePreset } from '$lib/db';
  import { Save, Trash2, Play, Star } from 'lucide-svelte';
  import { createEventDispatcher } from 'svelte';
  import type { RhythmSettings } from '$lib/utils/rhythm-forge/types';

  export let settings: RhythmSettings;
  export let dict: any;

  const dispatch = createEventDispatcher();

  let presets = liveQuery(() => db.rhythmForgePresets.orderBy('createdAt').reverse().toArray());

  async function savePreset() {
      const name = prompt("Preset Name:", `${settings.bpm} BPM`);
      if (!name) return;

      await db.rhythmForgePresets.add({
          name,
          bpm: settings.bpm,
          signature: [...settings.signature],
          polyrhythm: settings.polyrhythmEnabled && settings.polyrhythm ? [...settings.polyrhythm] : undefined,
          soundPack: settings.soundPack,
          createdAt: new Date(),
          starred: 0
      });
  }

  function loadPreset(preset: RhythmForgePreset) {
      dispatch('load', preset);
  }

  async function deletePreset(id: number) {
      if (confirm(dict.history.deleteConfirm || "Delete?")) {
          await db.rhythmForgePresets.delete(id);
      }
  }

  async function toggleStar(preset: RhythmForgePreset) {
      if (preset.id) {
          await db.rhythmForgePresets.update(preset.id, { starred: preset.starred ? 0 : 1 });
      }
  }
</script>

<div class="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800 h-full flex flex-col">
    <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            {dict.presets}
        </h3>
        <button
            class="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
            on:click={savePreset}
            title={dict.save}
        >
            <Save size={20} />
        </button>
    </div>

    <div class="flex-1 overflow-y-auto pr-2 space-y-3 min-h-[200px]">
        {#if $presets}
            {#each $presets as preset}
                <div class="group flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all">
                    <div class="flex items-center gap-3 overflow-hidden">
                        <button
                            class="p-2 rounded-full bg-white dark:bg-slate-700 text-indigo-500 shadow-sm hover:scale-110 transition-transform"
                            on:click={() => loadPreset(preset)}
                        >
                            <Play size={14} fill="currentColor" />
                        </button>
                        <div class="min-w-0">
                            <div class="font-bold text-slate-700 dark:text-slate-200 truncate">{preset.name}</div>
                            <div class="text-xs text-slate-400 flex gap-2">
                                <span>{preset.bpm} BPM</span>
                                <span>•</span>
                                <span>{preset.signature[0]}/{preset.signature[1]}</span>
                                {#if preset.polyrhythm}
                                    <span class="text-amber-500 font-medium">({preset.polyrhythm[0]}:{preset.polyrhythm[1]})</span>
                                {/if}
                            </div>
                        </div>
                    </div>

                    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            class="p-1.5 text-slate-400 hover:text-yellow-500 transition-colors"
                            on:click={() => toggleStar(preset)}
                        >
                            <Star size={16} fill={preset.starred ? "currentColor" : "none"} class={preset.starred ? "text-yellow-500" : ""} />
                        </button>
                        <button
                            class="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                            on:click={() => preset.id && deletePreset(preset.id)}
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            {/each}

            {#if $presets.length === 0}
                <div class="text-center py-10 text-slate-400 text-sm">
                    {dict.history.empty}
                </div>
            {/if}
        {/if}
    </div>
</div>
