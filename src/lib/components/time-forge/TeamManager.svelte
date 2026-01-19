<script lang="ts">
  import { onMount } from 'svelte';
  import { timeStore, cityTimes } from '$lib/utils/time-forge/store';
  import { type City } from '$lib/utils/time-forge/cities';
  import { getTeams, saveTeam, deleteTeam, type TimeForgeTeam } from '$lib/utils/time-forge/db';
  import { Users, Save, Trash2, FolderOpen } from 'lucide-svelte';

  let teams: TimeForgeTeam[] = [];
  let isSaving = false;
  let newTeamName = '';
  let showSaveModal = false;
  let showLoadModal = false;

  async function loadTeams() {
    teams = await getTeams();
  }

  onMount(() => {
    loadTeams();
  });

  async function handleSaveTeam() {
    if (!newTeamName.trim()) return;

    await saveTeam(newTeamName, $timeStore.selectedCities);
    newTeamName = '';
    showSaveModal = false;
    await loadTeams();
  }

  async function handleLoadTeam(team: TimeForgeTeam) {
    // We need to map cityIds back to City objects.
    // This requires access to the full city list.
    // We can import POPULAR_CITIES again.
    const { POPULAR_CITIES } = await import('$lib/utils/time-forge/cities');

    const cities = team.cityIds.map(id => POPULAR_CITIES.find(c => c.id === id)).filter(Boolean) as City[];

    timeStore.reorderCities(cities);
    showLoadModal = false;
  }

  async function handleDeleteTeam(id: number) {
    if (confirm('Delete this team?')) {
        await deleteTeam(id);
        await loadTeams();
    }
  }
</script>

<div class="flex items-center space-x-3 mb-6">
  <button
    type="button"
    class="flex items-center px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-colors border border-slate-600"
    on:click={() => showSaveModal = true}
  >
    <Save class="w-4 h-4 mr-2" />
    Save Team
  </button>

  <button
    type="button"
    class="flex items-center px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-colors border border-slate-600"
    on:click={() => showLoadModal = true}
  >
    <FolderOpen class="w-4 h-4 mr-2" />
    Load Team
  </button>
</div>

<!-- Save Modal -->
{#if showSaveModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div class="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-2xl w-full max-w-sm">
      <h3 class="text-lg font-semibold text-white mb-4">Save Team Workspace</h3>
      <input
        type="text"
        bind:value={newTeamName}
        placeholder="e.g. Engineering Team, Client A..."
        class="w-full h-11 px-4 bg-slate-700 text-slate-50 border border-slate-600 rounded-lg focus:border-indigo-500 mb-4 focus:outline-none"
        autoFocus
      />
      <div class="flex justify-end space-x-3">
        <button
            class="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            on:click={() => showSaveModal = false}
        >Cancel</button>
        <button
            class="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors"
            on:click={handleSaveTeam}
        >Save</button>
      </div>
    </div>
  </div>
{/if}

<!-- Load Modal -->
{#if showLoadModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div class="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-2xl w-full max-w-md">
      <h3 class="text-lg font-semibold text-white mb-4">Load Team</h3>

      {#if teams.length === 0}
        <p class="text-slate-400 text-sm mb-4">No saved teams found.</p>
      {:else}
        <ul class="space-y-2 mb-4 max-h-60 overflow-y-auto pr-2">
            {#each teams as team}
                <li class="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                    <button
                        class="flex-1 text-left"
                        on:click={() => handleLoadTeam(team)}
                    >
                        <span class="block text-slate-200 font-medium">{team.name}</span>
                        <span class="text-xs text-slate-500">{team.cityIds.length} cities • {team.createdAt.toLocaleDateString()}</span>
                    </button>
                    <button
                        class="p-2 text-slate-500 hover:text-red-400 transition-colors"
                        on:click={() => handleDeleteTeam(team.id!)}
                        title="Delete Team"
                    >
                        <Trash2 class="w-4 h-4" />
                    </button>
                </li>
            {/each}
        </ul>
      {/if}

      <div class="flex justify-end">
        <button
            class="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            on:click={() => showLoadModal = false}
        >Close</button>
      </div>
    </div>
  </div>
{/if}
