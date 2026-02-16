<script lang="ts">
  import { liveQuery } from 'dexie';
  import { db, type RhythmForgePlaylist } from '$lib/db';
  import { Plus, Play, Trash2, ListMusic, Save, MoreVertical, ChevronUp, ChevronDown } from 'lucide-svelte';
  import { createEventDispatcher } from 'svelte';
  import type { RhythmSettings, RhythmForgeDictionary } from '$lib/utils/rhythm-forge/types';

  export let settings: RhythmSettings;
  export let dict: RhythmForgeDictionary;

  const dispatch = createEventDispatcher<{
      load: RhythmSettings
  }>();

  let playlists = liveQuery(() => db.rhythmForgePlaylists.orderBy('createdAt').reverse().toArray());
  let activePlaylist: RhythmForgePlaylist | null = null;
  let isEditing = false;

  async function createPlaylist() {
      const name = prompt("Playlist Name:", "New Setlist");
      if (!name) return;

      const id = await db.rhythmForgePlaylists.add({
          name,
          tracks: [],
          createdAt: new Date(),
          starred: 0
      });

      // Auto-select the new playlist (Dexie returns id as number or string depending on config, usually number here)
      // We can't synchronously get the object back immediately from liveQuery, but we can fetch it.
      const newPlaylist = await db.rhythmForgePlaylists.get(id);
      if (newPlaylist) activePlaylist = newPlaylist;
  }

  async function addCurrentTrack() {
      if (!activePlaylist || !activePlaylist.id) return;

      const track = { ...settings }; // Snapshot
      const updatedTracks = [...activePlaylist.tracks, track];

      await db.rhythmForgePlaylists.update(activePlaylist.id, { tracks: updatedTracks });
      activePlaylist = await db.rhythmForgePlaylists.get(activePlaylist.id) || null;
  }

  async function removeTrack(index: number) {
      if (!activePlaylist || !activePlaylist.id) return;
      const updatedTracks = activePlaylist.tracks.filter((_, i) => i !== index);
      await db.rhythmForgePlaylists.update(activePlaylist.id, { tracks: updatedTracks });
      activePlaylist = await db.rhythmForgePlaylists.get(activePlaylist.id) || null;
  }

  async function deletePlaylist(id: number) {
      if (confirm("Delete this playlist?")) {
          await db.rhythmForgePlaylists.delete(id);
          if (activePlaylist?.id === id) activePlaylist = null;
      }
  }

  function loadTrack(track: RhythmSettings) {
      dispatch('load', track);
  }

  async function moveTrack(index: number, direction: 'up' | 'down') {
      if (!activePlaylist || !activePlaylist.id) return;
      const tracks = [...activePlaylist.tracks];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;

      if (targetIndex >= 0 && targetIndex < tracks.length) {
          [tracks[index], tracks[targetIndex]] = [tracks[targetIndex], tracks[index]];
          await db.rhythmForgePlaylists.update(activePlaylist.id, { tracks });
          activePlaylist = await db.rhythmForgePlaylists.get(activePlaylist.id) || null;
      }
  }
</script>

<div class="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800 h-full flex flex-col min-h-[400px]">
    {#if !activePlaylist}
        <!-- Playlist List View -->
        <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <ListMusic class="text-indigo-500" />
                Playlists
            </h3>
            <button
                class="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                on:click={createPlaylist}
                aria-label="New Playlist"
            >
                <Plus size={20} />
            </button>
        </div>

        <div class="space-y-3 flex-1 overflow-y-auto">
            {#if $playlists}
                {#each $playlists as playlist}
                    <div
                        class="w-full text-left group flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm hover:shadow-md cursor-pointer"
                        on:click={() => activePlaylist = playlist}
                        on:keydown={(e) => e.key === 'Enter' && (activePlaylist = playlist)}
                        role="button"
                        tabindex="0"
                    >
                        <div>
                            <div class="font-bold text-slate-700 dark:text-slate-200">{playlist.name}</div>
                            <div class="text-xs text-slate-400">{playlist.tracks.length} tracks • {new Date(playlist.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="p-2 rounded-full bg-indigo-50 dark:bg-slate-700 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Play size={16} fill="currentColor" />
                            </div>
                            <button
                                class="p-2 text-slate-300 hover:text-red-500 transition-colors z-10"
                                on:click|stopPropagation={() => playlist.id && deletePlaylist(playlist.id)}
                                aria-label="Delete Playlist"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                {/each}
                {#if $playlists.length === 0}
                    <div class="text-center py-10 text-slate-400 text-sm">
                        Create a playlist to organize your setlist.
                    </div>
                {/if}
            {/if}
        </div>

    {:else}
        <!-- Single Playlist View -->
        <div class="flex items-center justify-between mb-6">
            <button
                class="text-sm font-bold text-slate-500 hover:text-indigo-500 flex items-center gap-1"
                on:click={() => activePlaylist = null}
            >
                ← Back
            </button>
            <h3 class="text-lg font-bold text-slate-800 dark:text-white truncate max-w-[150px]">
                {activePlaylist.name}
            </h3>
            <button
                class="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex items-center gap-2"
                on:click={addCurrentTrack}
            >
                <Plus size={16} />
                Add Current
            </button>
        </div>

        <div class="space-y-2 flex-1 overflow-y-auto pr-1">
            {#each activePlaylist.tracks as track, i}
                <div class="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 group">
                    <div class="text-xs font-bold text-slate-300 w-4">{i + 1}</div>

                    <button
                        class="flex-1 text-left"
                        on:click={() => loadTrack(track)}
                    >
                        <div class="font-bold text-slate-700 dark:text-slate-200">
                            {track.bpm} <span class="text-xs font-normal text-slate-400">BPM</span>
                        </div>
                        <div class="text-xs text-slate-400 flex gap-2">
                            {track.signature[0]}/{track.signature[1]}
                            {#if track.polyrhythmEnabled && track.polyrhythm}
                                <span class="text-amber-500">Poly {track.polyrhythm[0]}:{track.polyrhythm[1]}</span>
                            {/if}
                        </div>
                    </button>

                    <div class="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button class="text-slate-400 hover:text-indigo-500" on:click={() => moveTrack(i, 'up')} disabled={i===0}>
                            <ChevronUp size={14} />
                        </button>
                        <button class="text-slate-400 hover:text-indigo-500" on:click={() => moveTrack(i, 'down')} disabled={i===activePlaylist.tracks.length-1}>
                            <ChevronDown size={14} />
                        </button>
                    </div>

                    <button
                        class="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        on:click={() => removeTrack(i)}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            {/each}

            {#if activePlaylist.tracks.length === 0}
                <div class="text-center py-10 text-slate-400 text-sm border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    Playlist is empty.<br>Configure the metronome and click "Add Current".
                </div>
            {/if}
        </div>
    {/if}
</div>
