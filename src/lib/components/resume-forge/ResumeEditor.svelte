<script lang="ts">
  import { resumeStore } from '$lib/utils/resume-forge/store';
  import { createWork, createEducation, createSkill, createProject, createProfile, createAward } from '$lib/utils/resume-forge/types';
  import { Plus, Trash2, ChevronDown, ChevronUp, User, Briefcase, GraduationCap, Code, FolderGit2, Award, Link } from '@lucide/svelte';
  import { slide } from 'svelte/transition';

  export let dict: any;
  $: d = dict.editor;

  let activeTab = 'basics';
  let expanded: Record<string, boolean> = {};

  function toggle(id: string) {
    expanded[id] = !expanded[id];
  }

  function addWork() {
    const item = createWork();
    $resumeStore.work = [...$resumeStore.work, item];
    expanded[item.id] = true;
  }

  function addEdu() {
    const item = createEducation();
    $resumeStore.education = [...$resumeStore.education, item];
    expanded[item.id] = true;
  }

  function addSkill() {
    const item = createSkill();
    $resumeStore.skills = [...$resumeStore.skills, item];
    expanded[item.id] = true;
  }

  function addProject() {
    const item = createProject();
    $resumeStore.projects = [...$resumeStore.projects, item];
    expanded[item.id] = true;
  }

  function addAward() {
    const item = createAward();
    $resumeStore.awards = [...$resumeStore.awards, item];
    expanded[item.id] = true;
  }

  function addProfile() {
    const item = createProfile();
    $resumeStore.basics.profiles = [...$resumeStore.basics.profiles, item];
    expanded[item.id] = true;
  }

  function remove(list: string, id: string) {
    if (list === 'profiles') {
        $resumeStore.basics.profiles = $resumeStore.basics.profiles.filter(i => i.id !== id);
    } else {
        // @ts-ignore
        $resumeStore[list] = $resumeStore[list].filter(i => i.id !== id);
    }
  }

  // Handle highlights (textarea to array)
  function updateHighlights(item: any, text: string) {
    item.highlights = text.split('\n').filter(l => l.trim());
    $resumeStore = $resumeStore; // Trigger update
  }
</script>

<div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden">
  <!-- Tabs -->
  <div class="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 scrollbar-hide">
    {#each [
      { id: 'basics', icon: User, label: d.basics },
      { id: 'work', icon: Briefcase, label: d.work },
      { id: 'education', icon: GraduationCap, label: d.education },
      { id: 'skills', icon: Code, label: d.skills },
      { id: 'projects', icon: FolderGit2, label: d.projects },
      { id: 'awards', icon: Award, label: d.awards }
    ] as tab}
      <button
        class="flex-none px-4 py-3 flex items-center space-x-2 text-sm font-medium transition-colors border-b-2
        {activeTab === tab.id
          ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/10'
          : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'}"
        on:click={() => activeTab = tab.id}
      >
        <svelte:component this={tab.icon} size={16} />
        <span>{tab.label}</span>
      </button>
    {/each}
  </div>

  <!-- Content -->
  <div class="flex-1 overflow-y-auto p-6 space-y-6">
    {#if activeTab === 'basics'}
      <div class="space-y-4" transition:slide>
        <div class="grid md:grid-cols-2 gap-4">
          <label class="block">
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{d.basicsFields.name}</span>
            <input type="text" class="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2" bind:value={$resumeStore.basics.name} />
          </label>
          <label class="block">
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{d.basicsFields.label}</span>
            <input type="text" class="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2" bind:value={$resumeStore.basics.label} />
          </label>
          <label class="block">
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{d.basicsFields.email}</span>
            <input type="email" class="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2" bind:value={$resumeStore.basics.email} />
          </label>
          <label class="block">
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{d.basicsFields.phone}</span>
            <input type="tel" class="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2" bind:value={$resumeStore.basics.phone} />
          </label>
          <label class="block">
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{d.basicsFields.url}</span>
            <input type="url" class="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2" bind:value={$resumeStore.basics.url} />
          </label>
          <label class="block">
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{d.basicsFields.location}</span>
            <input type="text" class="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2" bind:value={$resumeStore.basics.location.city} placeholder="City, Country" />
          </label>
        </div>
        <label class="block">
          <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{d.basicsFields.summary}</span>
          <textarea rows="4" class="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2" bind:value={$resumeStore.basics.summary}></textarea>
        </label>

        <!-- Profiles -->
        <div class="pt-4 border-t border-slate-100 dark:border-slate-800">
             <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-200">{d.profiles}</h3>
                <button class="min-h-[44px] min-w-[44px] text-xs flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline" on:click={addProfile}>
                    <Plus size={14} /> {d.add}
                </button>
             </div>
             <div class="space-y-3">
                {#each $resumeStore.basics.profiles as profile (profile.id)}
                   <div class="flex gap-2 items-start group">
                      <div class="grid grid-cols-3 gap-2 flex-1">
                          <input type="text" placeholder="Network (LinkedIn)" class="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs px-2 py-1.5" bind:value={profile.network} />
                          <input type="text" placeholder="Username" class="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs px-2 py-1.5" bind:value={profile.username} />
                          <input type="text" placeholder="URL" class="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs px-2 py-1.5" bind:value={profile.url} />
                      </div>
                      <button class="min-h-[44px] min-w-[44px] p-1.5 text-slate-400 hover:text-red-500" on:click={() => remove('profiles', profile.id)}>
                        <Trash2 size={14} />
                      </button>
                   </div>
                {/each}
             </div>
        </div>
      </div>

    {:else if activeTab === 'work'}
      <div class="space-y-4" transition:slide>
        {#each $resumeStore.work as item (item.id)}
          <div class="border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <button class="min-h-[44px] w-full text-left flex items-center justify-between p-3 cursor-pointer select-none" on:click={() => toggle(item.id)}>
              <div class="flex items-center gap-3">
                 <div class="text-slate-400">
                    {#if expanded[item.id]}<ChevronUp size={16}/>{:else}<ChevronDown size={16}/>{/if}
                 </div>
                 <div>
                    <div class="font-medium text-slate-900 dark:text-white text-sm">{item.company || 'New Company'}</div>
                    <div class="text-xs text-slate-500">{item.position || 'Position'}</div>
                 </div>
              </div>
              <div class="min-h-[44px] min-w-[44px] p-2 text-slate-400 hover:text-red-500" role="button" tabindex="0" on:click|stopPropagation={() => remove('work', item.id)} on:keydown|stopPropagation={(e) => e.key === 'Enter' && remove('work', item.id)}>
                <Trash2 size={16} />
              </div>
            </button>

            {#if expanded[item.id]}
              <div class="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-b-lg space-y-4">
                 <div class="grid grid-cols-2 gap-4">
                    <input type="text" placeholder={d.workFields.company} class="input-sm" bind:value={item.name} />
                    <input type="text" placeholder={d.workFields.position} class="input-sm" bind:value={item.position} />
                    <input type="text" placeholder={d.workFields.startDate} class="input-sm" bind:value={item.startDate} />
                    <input type="text" placeholder={d.workFields.endDate} class="input-sm" bind:value={item.endDate} />
                    <input type="url" placeholder={d.workFields.website} class="input-sm col-span-2" bind:value={item.url} />
                 </div>
                 <textarea placeholder={d.workFields.summary} rows="2" class="input-area" bind:value={item.summary}></textarea>
                 <label class="block">
                    <span class="text-xs font-medium text-slate-500 mb-1 block">{d.workFields.highlights}</span>
                    <textarea
                        rows="4"
                        class="input-area font-mono text-xs"
                        value={item.highlights.join('\n')}
                        on:input={(e) => updateHighlights(item, e.currentTarget.value)}
                    ></textarea>
                 </label>
              </div>
            {/if}
          </div>
        {/each}
        <button class="min-h-[44px] w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 hover:border-indigo-500 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2 font-medium" on:click={addWork}>
            <Plus size={18} /> {d.add}
        </button>
      </div>

    {:else if activeTab === 'education'}
      <div class="space-y-4" transition:slide>
        {#each $resumeStore.education as item (item.id)}
          <div class="border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <button class="min-h-[44px] w-full text-left flex items-center justify-between p-3 cursor-pointer select-none" on:click={() => toggle(item.id)}>
              <div class="flex items-center gap-3">
                 <div class="text-slate-400">
                    {#if expanded[item.id]}<ChevronUp size={16}/>{:else}<ChevronDown size={16}/>{/if}
                 </div>
                 <div>
                    <div class="font-medium text-slate-900 dark:text-white text-sm">{item.institution || 'New Institution'}</div>
                    <div class="text-xs text-slate-500">{item.area || 'Area'}</div>
                 </div>
              </div>
              <div class="min-h-[44px] min-w-[44px] p-2 text-slate-400 hover:text-red-500" role="button" tabindex="0" on:click|stopPropagation={() => remove('education', item.id)} on:keydown|stopPropagation={(e) => e.key === 'Enter' && remove('education', item.id)}>
                <Trash2 size={16} />
              </div>
            </button>

            {#if expanded[item.id]}
              <div class="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-b-lg space-y-4">
                 <div class="grid grid-cols-2 gap-4">
                    <input type="text" placeholder={d.eduFields.institution} class="input-sm" bind:value={item.institution} />
                    <input type="text" placeholder={d.eduFields.area} class="input-sm" bind:value={item.area} />
                    <input type="text" placeholder={d.eduFields.studyType} class="input-sm" bind:value={item.studyType} />
                    <input type="text" placeholder={d.eduFields.gpa} class="input-sm" bind:value={item.score} />
                    <input type="text" placeholder={d.eduFields.startDate} class="input-sm" bind:value={item.startDate} />
                    <input type="text" placeholder={d.eduFields.endDate} class="input-sm" bind:value={item.endDate} />
                 </div>
              </div>
            {/if}
          </div>
        {/each}
        <button class="min-h-[44px] w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 hover:border-indigo-500 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2 font-medium" on:click={addEdu}>
            <Plus size={18} /> {d.add}
        </button>
      </div>

    {:else if activeTab === 'skills'}
      <div class="space-y-4" transition:slide>
         {#each $resumeStore.skills as item (item.id)}
          <div class="flex items-center gap-2">
             <input type="text" placeholder="Skill Name (e.g. JavaScript)" class="input-sm flex-1" bind:value={item.name} />
             <input type="text" placeholder="Level (e.g. Expert)" class="input-sm w-32" bind:value={item.level} />
             <button class="min-h-[44px] min-w-[44px] p-2 text-slate-400 hover:text-red-500" on:click={() => remove('skills', item.id)}>
                <Trash2 size={16} />
             </button>
          </div>
         {/each}
         <button class="min-h-[44px] w-full py-2 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 hover:border-indigo-500 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium" on:click={addSkill}>
            <Plus size={16} /> {d.add}
        </button>
      </div>

    {:else if activeTab === 'projects'}
        <div class="space-y-4" transition:slide>
        {#each $resumeStore.projects as item (item.id)}
          <div class="border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <button class="min-h-[44px] w-full text-left flex items-center justify-between p-3 cursor-pointer select-none" on:click={() => toggle(item.id)}>
              <div class="flex items-center gap-3">
                 <div class="text-slate-400">
                    {#if expanded[item.id]}<ChevronUp size={16}/>{:else}<ChevronDown size={16}/>{/if}
                 </div>
                 <div>
                    <div class="font-medium text-slate-900 dark:text-white text-sm">{item.name || 'New Project'}</div>
                 </div>
              </div>
              <div class="min-h-[44px] min-w-[44px] p-2 text-slate-400 hover:text-red-500" role="button" tabindex="0" on:click|stopPropagation={() => remove('projects', item.id)} on:keydown|stopPropagation={(e) => e.key === 'Enter' && remove('projects', item.id)}>
                <Trash2 size={16} />
              </div>
            </button>

            {#if expanded[item.id]}
              <div class="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-b-lg space-y-4">
                 <div class="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Project Name" class="input-sm" bind:value={item.name} />
                    <input type="url" placeholder="URL" class="input-sm" bind:value={item.url} />
                    <input type="text" placeholder="Start Date" class="input-sm" bind:value={item.startDate} />
                    <input type="text" placeholder="End Date" class="input-sm" bind:value={item.endDate} />
                 </div>
                 <textarea placeholder="Description" rows="2" class="input-area" bind:value={item.description}></textarea>
                 <label class="block">
                    <span class="text-xs font-medium text-slate-500 mb-1 block">Keywords / Tech Stack (Comma separated)</span>
                    <input type="text" class="input-sm" value={item.keywords.join(', ')} on:input={(e) => item.keywords = e.currentTarget.value.split(',').map(s => s.trim())} />
                 </label>
              </div>
            {/if}
          </div>
        {/each}
        <button class="min-h-[44px] w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 hover:border-indigo-500 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2 font-medium" on:click={addProject}>
            <Plus size={18} /> {d.add}
        </button>
      </div>

    {:else if activeTab === 'awards'}
        <div class="space-y-4" transition:slide>
         {#each $resumeStore.awards as item (item.id)}
          <div class="border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3 flex gap-2 items-start">
             <div class="flex-1 space-y-2">
                 <input type="text" placeholder="Award Title" class="input-sm" bind:value={item.title} />
                 <div class="flex gap-2">
                     <input type="text" placeholder="Awarder" class="input-sm flex-1" bind:value={item.awarder} />
                     <input type="text" placeholder="Date" class="input-sm w-32" bind:value={item.date} />
                 </div>
                 <textarea placeholder="Summary" rows="1" class="input-area" bind:value={item.summary}></textarea>
             </div>
             <button class="min-h-[44px] min-w-[44px] p-2 text-slate-400 hover:text-red-500" on:click={() => remove('awards', item.id)}>
                <Trash2 size={16} />
             </button>
          </div>
         {/each}
         <button class="min-h-[44px] w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 hover:border-indigo-500 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2 font-medium" on:click={addAward}>
            <Plus size={18} /> {d.add}
        </button>
      </div>

    {/if}
  </div>
</div>

<style lang="postcss">
    .input-sm {
        @apply block w-full rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm px-3 py-2;
    }
    .input-area {
        @apply block w-full rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm px-3 py-2;
    }
    .scrollbar-hide::-webkit-scrollbar {
        display: none;
    }
    .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
</style>
