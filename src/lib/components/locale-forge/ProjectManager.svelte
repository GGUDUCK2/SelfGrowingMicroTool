<script lang="ts">
  import { projectStore } from '$lib/utils/locale-forge/store';
  import { localeForgeWorkspace } from '$lib/db/locale-forge';
  import { liveQuery } from 'dexie';
  import { browser } from '$app/environment';
  import { FolderOpen, Save, Trash2, Plus } from '@lucide/svelte';

  let projects = liveQuery(() => localeForgeWorkspace.loadAll());
  let showList = false;
  let isSaving = false;

  async function saveProject() {
      if (!$projectStore.data.length) return;
      isSaving = true;
      try {
          const id = await localeForgeWorkspace.save($projectStore, $projectStore.id);
          projectStore.update(s => ({ ...s, id }));
          alert('Project saved!');
      } catch (e) {
          console.error(e);
          alert('Failed to save');
      } finally {
          isSaving = false;
      }
  }

  async function loadProject(id: number) {
      const project = await localeForgeWorkspace.get(id);
      if (project) {
          projectStore.set(project);
          showList = false;
      }
  }

  async function deleteProject(id: number) {
      if (confirm('Delete project?')) {
          await localeForgeWorkspace.delete(id);
          if ($projectStore.id === id) {
              projectStore.update(s => ({ ...s, id: undefined }));
          }
      }
  }

  function newProject() {
      projectStore.set({
          name: 'Untitled Project',
          languages: ['en'],
          data: [],
          createdAt: new Date(),
          updatedAt: new Date()
      });
      showList = false;
  }
</script>

<div class="flex items-center gap-2 mb-4 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
    <div class="relative">
        <button
            class="flex items-center gap-2 px-3 py-2 min-h-[44px] min-w-[44px] text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
            on:click={() => showList = !showList}
        >
            <FolderOpen size={18} />
            <span class="max-w-[150px] truncate">{$projectStore.name}</span>
        </button>

        {#if showList && browser}
            <div class="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-50">
                <div class="flex justify-between items-center mb-2 px-2">
                    <span class="text-xs font-bold text-slate-500 uppercase">Projects</span>
                    <button class="p-1 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 rounded" on:click={newProject}>
                        <Plus size={14} />
                    </button>
                </div>
                <div class="max-h-60 overflow-y-auto space-y-1">
                    {#if $projects}
                        {#each $projects as p}
                            <div class="flex items-center group rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                <button
                                    class="flex-1 text-left px-3 py-2 min-h-[44px] text-sm truncate"
                                    on:click={() => loadProject(p.id!)}
                                >
                                    {p.name}
                                </button>
                                <button
                                    class="p-2 min-h-[44px] min-w-[44px] opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity flex items-center justify-center"
                                    on:click={() => deleteProject(p.id!)}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>
        {/if}
    </div>

    <input
        type="text"
        bind:value={$projectStore.name}
        class="bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-600 dark:text-slate-300 w-48 min-h-[44px]"
        placeholder="Project Name"
    />

    <div class="flex-1"></div>

    <button
        class="flex items-center gap-2 px-3 py-2 min-h-[44px] min-w-[44px] text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md transition-colors"
        on:click={saveProject}
        disabled={isSaving}
    >
        <Save size={18} />
        {isSaving ? 'Saving...' : 'Save'}
    </button>
</div>
