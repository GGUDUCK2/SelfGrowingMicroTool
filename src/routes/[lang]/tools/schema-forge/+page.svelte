<script lang="ts">
  import FAQSection from '$lib/components/FAQSection.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import Head from '$lib/components/Head.svelte';
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { fade, slide, fly } from 'svelte/transition';
  import { getDictionary } from '$lib/dictionaries';
  import { schemaForgeWorkspace } from '$lib/db/schema-forge';
  import type { SchemaProject, Table, SchemaSnapshot } from '$lib/types/schema-forge';
  import { nanoid } from 'nanoid';
  import TableList from '$lib/components/schema-forge/TableList.svelte';
  import TableEditor from '$lib/components/schema-forge/TableEditor.svelte';
  import SchemaVisualizer from '$lib/components/schema-forge/SchemaVisualizer.svelte';
  import CodePreview from '$lib/components/schema-forge/CodePreview.svelte';
  import { generateCode } from '$lib/utils/schema-forge/generators';
  import { TEMPLATES } from '$lib/utils/schema-forge/templates';
  import { parseSQL } from '$lib/utils/schema-forge/sql-parser';
  import { generateMockData } from '$lib/utils/schema-forge/mock-generator';
  import { Save, FolderOpen, Plus, Trash2, Layout, Database, Code, FileCode, Wand2, Upload, History, Share2, Table as TableIcon, RefreshCw, Copy, Download, X } from '@lucide/svelte';

  $: lang = $page.params.lang || 'en';
  $: t = (getDictionary(lang) as any).tools?.schemaForge || (getDictionary('en') as any).tools.schemaForge;

  // State
  let activeProject: SchemaProject = {
      name: 'Untitled Project',
      tables: [],
      relations: [],
      createdAt: new Date(),
      updatedAt: new Date()
  };

  let activeTableId: string | null = null;
  let activeTab: 'design' | 'diagram' | 'data' | 'sql' | 'prisma' | 'typescript' = 'design';
  let isSaving = false;
  let showProjects = false;
  let showTemplates = false;
  let showImport = false;
  let showHistory = false;
  let importSqlContent = '';
  let projects: SchemaProject[] = [];
  let generatedData: any[] = [];
  let showToast = false;
  let toastMessage = '';

  // Derived
  $: activeTable = activeProject.tables.find(t => t.id === activeTableId);

  // Methods
  async function loadProjects() {
      projects = await schemaForgeWorkspace.loadAll();
  }

  async function createProject() {
      const newProject: SchemaProject = {
          name: `Project ${new Date().toLocaleDateString()}`,
          tables: [],
          relations: [],
          createdAt: new Date(),
          updatedAt: new Date()
      };
      const id = await schemaForgeWorkspace.save(newProject);
      newProject.id = id;
      activeProject = newProject;
      activeTableId = null;
      activeTab = 'design';
      loadProjects();
  }

  async function loadTemplate(templateId: string) {
      const template = TEMPLATES.find(t => t.id === templateId);
      if (template) {
          const newProject = template.factory();
          const id = await schemaForgeWorkspace.save(newProject);
          newProject.id = id;
          activeProject = newProject;
          activeTableId = newProject.tables[0]?.id || null;
          activeTab = 'design';
          showTemplates = false;
          loadProjects();
      }
  }

  async function importSQL() {
      if (!importSqlContent.trim()) return;

      const tables = parseSQL(importSqlContent);
      if (tables.length > 0) {
          const newProject: SchemaProject = {
            name: `Imported ${new Date().toLocaleDateString()}`,
            tables: tables,
            relations: [], // Basic parser doesn't extract foreign keys yet
            createdAt: new Date(),
            updatedAt: new Date()
          };

          const id = await schemaForgeWorkspace.save(newProject);
          newProject.id = id;
          activeProject = newProject;
          activeTableId = tables[0]?.id || null;
          showImport = false;
          importSqlContent = '';
          loadProjects();
      } else {
          alert(t.messages.noTablesFound);
      }
  }

  async function loadProject(id: number) {
      const p = await schemaForgeWorkspace.get(id);
      if (p) {
          activeProject = p;
          activeTableId = null;
          showProjects = false;
      }
  }

  async function deleteProject(id: number, e: Event) {
      e.stopPropagation();
      if (confirm('Delete project?')) {
          await schemaForgeWorkspace.delete(id);
          if (activeProject.id === id) {
              await createProject();
          } else {
              loadProjects();
          }
      }
  }

  async function save() {
      isSaving = true;
      try {
        const id = await schemaForgeWorkspace.save(activeProject, activeProject.id);
        if (!activeProject.id) activeProject.id = id;
        loadProjects(); // Update list name
      } catch (e) {
          console.error(e);
      } finally {
        setTimeout(() => isSaving = false, 800);
      }
  }

  function handleAddTable() {
      const newTable: Table = {
          id: nanoid(),
          name: `table_${activeProject.tables.length + 1}`,
          columns: []
      };
      activeProject.tables = [...activeProject.tables, newTable];
      activeTableId = newTable.id;
      activeTab = 'design';
      save();
  }

  function handleDeleteTable(e: CustomEvent<string>) {
      const id = e.detail;
      activeProject.tables = activeProject.tables.filter(t => t.id !== id);
      if (activeTableId === id) activeTableId = null;
      save();
  }

  function handleTableChange() {
      activeProject = activeProject; // trigger updates
      save();
  }

  // --- Creative Features ---

  async function takeSnapshot() {
      if (!activeProject.snapshots) activeProject.snapshots = [];
      const snapshot: SchemaSnapshot = {
          id: nanoid(),
          name: `Snapshot ${new Date().toLocaleTimeString()}`,
          date: new Date(),
          data: JSON.parse(JSON.stringify({ tables: activeProject.tables, relations: activeProject.relations }))
      };
      activeProject.snapshots = [snapshot, ...activeProject.snapshots].slice(0, 10);
      await save();
      showToastMessage(t.history.saved);
  }

  function restoreSnapshot(snapshot: SchemaSnapshot) {
      if (confirm('Restore this snapshot? Current unsaved changes will be lost.')) {
          activeProject.tables = JSON.parse(JSON.stringify(snapshot.data.tables));
          activeProject.relations = JSON.parse(JSON.stringify(snapshot.data.relations));
          save();
          showHistory = false;
          showToastMessage(t.history.restored);
      }
  }

  function generateData() {
      if (activeTable) {
          generatedData = generateMockData(activeTable, 10);
      }
  }

  // Watch for active table change to regen data or clear it
  $: if (activeTab === 'data' && activeTable) {
      generateData();
  }

  async function shareProject() {
      const json = JSON.stringify(activeProject);
      const encoded = btoa(encodeURIComponent(json));
      const url = `${window.location.origin}${window.location.pathname}?share=${encoded}`;
      await navigator.clipboard.writeText(url);
      showToastMessage(t.messages.linkCopied);
  }

  function showToastMessage(msg: string) {
      toastMessage = msg;
      showToast = true;
      setTimeout(() => showToast = false, 3000);
  }

  function loadSharedProject() {
      const urlParams = new URLSearchParams(window.location.search);
      const shared = urlParams.get('share');
      if (shared) {
          try {
              const json = decodeURIComponent(atob(shared));
              const project = JSON.parse(json);
              project.name = `Shared: ${project.name}`;
              delete project.id; // Force new ID
              project.createdAt = new Date();
              project.snapshots = []; // Don't load snapshots
              activeProject = project;
              save();
              window.history.replaceState({}, '', window.location.pathname);
              showToastMessage(t.messages.sharedLoaded);
              return true;
          } catch (e) {
              console.error('Failed to load shared project', e);
          }
      }
      return false;
  }

  function handleKeydown(e: KeyboardEvent) {
      // Ctrl+S to Save
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 's') {
          e.preventDefault();
          save();
      }
      // Ctrl+Shift+S to Snapshot
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 's') {
          e.preventDefault();
          takeSnapshot();
      }
      // Ctrl+D to Generate Data (only if active tab is data)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && activeTab === 'data') {
          e.preventDefault();
          generateData();
      }
  }

  onMount(async () => {
      window.addEventListener('keydown', handleKeydown);
      const loadedShared = loadSharedProject();
      if (!loadedShared) {
          await loadProjects();
          if (projects.length > 0) {
              activeProject = projects[0];
          } else {
              save();
          }
      } else {
          loadProjects(); // Just to load list
      }
  });

  onDestroy(() => {
      if (typeof window !== 'undefined') {
          window.removeEventListener('keydown', handleKeydown);
      }
  });

  // Generator Helpers
  $: sqlCode = generateCode(activeProject, 'mysql');
  $: prismaCode = generateCode(activeProject, 'prisma');
  $: tsCode = generateCode(activeProject, 'typescript');


  $: jsonLd = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
        "@id": "https://selfgrowingmicrotool.com/" + lang + "/tools/schema-forge",
        "isAccessibleForFree": true,
      "name": t?.title,
      "description": t?.description,
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "Visual Database Schema Design",
        "SQL Export (MySQL, Postgres, SQLite)",
        "Prisma Schema Generation",
        "TypeScript Interface Generation",
        "Entity Relationship Diagram (ERD)",
        "Smart Column Inference",
        "Instant Mock Data Generation",
        "Snapshot History"
      ]
    };

  $: breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `https://microfactory.site/${lang}`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Tools",
        "item": `https://microfactory.site/${lang}/tools`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": t?.title,
        "item": `https://microfactory.site/${lang}/tools/schema-forge`
      }
    ]
  };

  $: jsonLd2 = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": t?.q1,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t?.a1
        }
      },
      {
        "@type": "Question",
        "name": t?.q2,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t?.a2
        }
      },
      {
        "@type": "Question",
        "name": t?.q3,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t?.a3
        }
      }
    ]
  };
</script>
<Head
  title={t?.title}
  description={t?.description}
  keywords="database schema, sql generator, prisma schema, db diagram, entity relationship diagram, mysql, postgres, sqlite"
/>


<svelte:head>

  <!-- Twitter -->

  <!-- JSON-LD -->
  {@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}</scr` + `ipt>`}
  {@html `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</scr` + `ipt>`}
  {@html `<script type="application/ld+json">${JSON.stringify(jsonLd2)}</scr` + `ipt>`}

</svelte:head>

<!-- Toast -->
{#if showToast}
    <div class="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium" transition:fly={{ y: -20 }}>
        {toastMessage}
    </div>
{/if}

<!-- Import Modal -->
{#if showImport}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" transition:fade>
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-slate-200 dark:border-slate-800">
            <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <h3 class="font-bold text-lg">{t.messages.importTitle}</h3>
                <button class="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded min-h-[44px] min-w-[44px] flex items-center justify-center min-h-[44px] min-w-[44px]" on:click={() => showImport = false} aria-label="Close">
                     <X size={20} />
                </button>
            </div>
            <div class="p-4 flex-1 overflow-hidden flex flex-col">
                <p class="text-sm text-slate-500 mb-2">Paste your <code class="bg-slate-100 dark:bg-slate-800 px-1 rounded">CREATE TABLE</code> statements here.</p>
                <textarea
                    bind:value={importSqlContent}
                    class="w-full flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 font-mono text-sm resize-none focus:border-indigo-500 focus:ring-0"
                    placeholder={t.messages.importPlaceholder}
                ></textarea>
            </div>
            <div class="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                    class="px-4 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors min-h-[44px] min-w-[44px]"
                    on:click={() => showImport = false}
                >
                    {t.messages.cancel}
                </button>
                <button
                    class="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors min-h-[44px] min-w-[44px]"
                    on:click={importSQL}
                >
                    {t.messages.import}
                </button>
            </div>
        </div>
    </div>
{/if}

<div class="min-h-screen flex flex-col bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-white">
    <!-- Tool Area -->
    <div class="h-[calc(100vh-64px)] flex flex-col border-b border-slate-200 dark:border-slate-800 shrink-0">
        <header class="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 z-20">
             <!-- Left: Project Selector -->
             <div class="flex items-center gap-4">
                <div class="relative">
                    <button
                        class="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-medium min-h-[44px] min-w-[44px]"
                        on:click={() => showProjects = !showProjects}
                        aria-label={t?.toolbar?.select}
                    >
                        <FolderOpen size={18} class="text-indigo-600 dark:text-indigo-400" />
                        <span class="max-w-[150px] truncate">{activeProject.name}</span>
                    </button>

                    {#if showProjects}
                        <div class="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-50" transition:slide>
                            <div class="flex justify-between items-center mb-2 px-2">
                                 <span class="text-xs font-bold text-slate-500 uppercase">{t?.toolbar?.myProjects}</span>
                                 <button
                                  class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded min-h-[44px] min-w-[44px] flex items-center justify-center"
                                  on:click={createProject}
                                  aria-label={t?.toolbar?.newProject}
                                 >
                                     <Plus size={14} />
                                 </button>
                            </div>
                            <div class="max-h-60 overflow-y-auto space-y-1">
                                {#each projects as p}
                                    <div class="flex items-center group rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        <button
                                            class="flex-1 text-left px-3 py-2 text-sm truncate min-h-[44px] min-w-[44px]"
                                            on:click={() => loadProject(p.id || 0)}
                                        >
                                            {p.name}
                                        </button>
                                        <button
                                            class="p-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity min-h-[44px] min-w-[44px] flex items-center justify-center"
                                            on:click={(e) => deleteProject(p.id || 0, e)}
                                            aria-label={t?.toolbar?.delete}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/if}
                </div>

                <input
                    type="text"
                    bind:value={activeProject.name}
                    on:change={save}
                    class="bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-600 dark:text-slate-300 w-48 hover:bg-slate-100 dark:hover:bg-slate-800 rounded px-2 min-h-[44px]"
                    placeholder={t?.toolbar?.projectName}
                    aria-label={t?.toolbar?.projectName}
                />
            </div>

            <!-- Right: Actions & Tabs -->
            <div class="flex items-center gap-2">
                <!-- Utilities -->
                <div class="flex items-center gap-2 mr-2">
                     <div class="relative">
                        <button
                            class="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold flex items-center gap-2 transition-colors min-h-[44px] min-w-[44px]"
                            on:click={() => showHistory = !showHistory}
                            aria-label={t?.toolbar?.history}
                        >
                            <History size={14} />
                            {t?.toolbar?.history}
                        </button>
                        {#if showHistory}
                             <div class="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-50" transition:slide>
                                <button
                                    class="w-full flex items-center gap-2 px-3 py-2 mb-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors min-h-[44px] min-w-[44px]"
                                    on:click={takeSnapshot}
                                >
                                    <Plus size={14} />
                                    {t?.history?.takeSnapshot}
                                </button>
                                <div class="text-xs font-bold text-slate-500 uppercase px-2 mb-2">{t?.history?.snapshots}</div>
                                <div class="space-y-1 max-h-60 overflow-y-auto">
                                    {#if activeProject.snapshots && activeProject.snapshots.length > 0}
                                        {#each activeProject.snapshots as snap}
                                            <button
                                                class="w-full text-left px-3 py-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700/50 group min-h-[44px] min-w-[44px]"
                                                on:click={() => restoreSnapshot(snap)}
                                            >
                                                <div class="flex justify-between items-center">
                                                    <span class="text-sm font-medium text-slate-900 dark:text-white">{snap.name}</span>
                                                </div>
                                                <div class="text-xs text-slate-500">{new Date(snap.date).toLocaleString()}</div>
                                            </button>
                                        {/each}
                                    {:else}
                                        <div class="px-3 py-2 text-sm text-slate-400 italic">{t?.history?.empty}</div>
                                    {/if}
                                </div>
                            </div>
                        {/if}
                    </div>

                    <button
                        class="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold flex items-center gap-2 transition-colors min-h-[44px] min-w-[44px]"
                        on:click={shareProject}
                        aria-label={t?.toolbar?.share}
                    >
                        <Share2 size={14} />
                        {t?.toolbar?.share}
                    </button>

                    <div class="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1"></div>

                    <div class="relative">
                        <button
                            class="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold flex items-center gap-2 transition-colors min-h-[44px] min-w-[44px]"
                            on:click={() => showTemplates = !showTemplates}
                            aria-label={t?.toolbar?.templates}
                        >
                            <Wand2 size={14} />
                            {t?.toolbar?.templates}
                        </button>
                        {#if showTemplates}
                            <div class="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-50" transition:slide>
                                <div class="text-xs font-bold text-slate-500 uppercase px-2 mb-2">Start with...</div>
                                <div class="space-y-1">
                                    {#each TEMPLATES as tmpl}
                                        <button
                                            class="w-full text-left px-3 py-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700/50 min-h-[44px] min-w-[44px]"
                                            on:click={() => loadTemplate(tmpl.id)}
                                        >
                                            <div class="text-sm font-medium text-slate-900 dark:text-white">{tmpl.name}</div>
                                            <div class="text-xs text-slate-500">{tmpl.description}</div>
                                        </button>
                                    {/each}
                                </div>
                            </div>
                        {/if}
                    </div>

                    <button
                        class="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold flex items-center gap-2 transition-colors min-h-[44px] min-w-[44px]"
                        on:click={() => showImport = true}
                        aria-label={t?.toolbar?.import}
                    >
                        <Upload size={14} />
                        {t?.toolbar?.import}
                    </button>
                </div>

                <!-- Tabs -->
                <div class="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 mr-4">
                    <button
                        class="px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition-all {activeTab === 'design' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'} min-h-[44px] min-w-[44px]"
                        on:click={() => activeTab = 'design'}
                        aria-label={t?.tabs?.design}
                    >
                        <Layout size={14} />
                        {t?.tabs?.design}
                    </button>
                    <button
                        class="px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition-all {activeTab === 'diagram' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'} min-h-[44px] min-w-[44px]"
                        on:click={() => activeTab = 'diagram'}
                        aria-label={t?.tabs?.diagram}
                    >
                        <Database size={14} />
                        {t?.tabs?.diagram}
                    </button>
                    <button
                        class="px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition-all {activeTab === 'data' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'} min-h-[44px] min-w-[44px]"
                        on:click={() => activeTab = 'data'}
                        aria-label={t?.tabs?.data}
                    >
                        <TableIcon size={14} />
                        {t?.tabs?.data}
                    </button>
                    <div class="w-px bg-slate-300 dark:bg-slate-700 mx-1 my-1"></div>
                    <button
                        class="px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition-all {activeTab === 'sql' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'} min-h-[44px] min-w-[44px]"
                        on:click={() => activeTab = 'sql'}
                        aria-label={t?.tabs?.sql}
                    >
                        <Code size={14} />
                        {t?.tabs?.sql}
                    </button>
                    <button
                        class="px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition-all {activeTab === 'prisma' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'} min-h-[44px] min-w-[44px]"
                        on:click={() => activeTab = 'prisma'}
                        aria-label={t?.tabs?.prisma}
                    >
                        <FileCode size={14} />
                        {t?.tabs?.prisma}
                    </button>
                    <button
                        class="px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition-all {activeTab === 'typescript' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'} min-h-[44px] min-w-[44px]"
                        on:click={() => activeTab = 'typescript'}
                        aria-label={t?.tabs?.typescript}
                    >
                        <span class="text-xs font-mono">TS</span>
                        {t?.tabs?.typescript}
                    </button>
                </div>

                <button
                    class="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 min-h-[44px] min-w-[44px]"
                    on:click={save}
                    disabled={isSaving}
                    aria-label={t?.toolbar?.save}
                >
                    {#if isSaving}
                        <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {:else}
                        <Save size={16} />
                    {/if}
                    {t?.toolbar?.save}
                </button>
            </div>
        </header>

        <div class="flex-1 flex overflow-hidden">
            <TableList
                schema={activeProject}
                bind:activeTableId
                on:addTable={handleAddTable}
                on:select={(e) => { activeTableId = e.detail; activeTab = 'design'; }}
                on:delete={handleDeleteTable}
            />
            <main class="flex-1 overflow-hidden bg-slate-100 dark:bg-black/50 relative">
                 {#if activeTab === 'design'}
                    {#if activeTable}
                        <TableEditor table={activeTable} on:change={handleTableChange} />
                    {:else}
                        <div class="h-full flex flex-col items-center justify-center text-slate-400">
                            <Database size={64} class="mb-4 opacity-20" />
                            <h2 class="text-xl font-bold text-slate-600 dark:text-slate-300">{t?.tables?.title}</h2>
                            <p class="text-sm">{t?.tables?.start}</p>
                        </div>
                    {/if}
                 {:else if activeTab === 'diagram'}
                    <SchemaVisualizer schema={activeProject} />
                 {:else if activeTab === 'data'}
                    {#if activeTable}
                        <div class="h-full flex flex-col">
                            <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
                                <h3 class="font-bold text-lg">{activeTable.name} {t?.tabs?.data}</h3>
                                <button class="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-sm font-medium flex items-center gap-2 min-h-[44px] min-w-[44px]" on:click={generateData}>
                                    <RefreshCw size={14} />
                                    {t?.data?.regenerate}
                                </button>
                            </div>
                            <div class="flex-1 overflow-auto p-4">
                                <div class="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                                    <table class="w-full text-sm text-left">
                                        <thead class="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800">
                                            <tr>
                                                {#each activeTable.columns as col}
                                                    <th class="px-6 py-3">{col.name}</th>
                                                {/each}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {#each generatedData as row}
                                                <tr class="bg-white border-b dark:bg-slate-900 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                                                    {#each activeTable.columns as col}
                                                        <td class="px-6 py-4 max-w-xs truncate" title={String(row[col.name])}>
                                                            {typeof row[col.name] === 'object' ? JSON.stringify(row[col.name]) : row[col.name]}
                                                        </td>
                                                    {/each}
                                                </tr>
                                            {/each}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    {:else}
                         <div class="h-full flex flex-col items-center justify-center text-slate-400">
                            <TableIcon size={64} class="mb-4 opacity-20" />
                            <h2 class="text-xl font-bold text-slate-600 dark:text-slate-300">{t?.tables?.title}</h2>
                            <p class="text-sm">{t?.data?.empty}</p>
                        </div>
                    {/if}
                 {:else if activeTab === 'sql'}
                    <CodePreview code={sqlCode} language="sql" />
                 {:else if activeTab === 'prisma'}
                    <CodePreview code={prismaCode} language="go" />
                 {:else if activeTab === 'typescript'}
                    <CodePreview code={tsCode} language="typescript" />
                 {/if}
            </main>
        </div>
    </div>

    <!-- Documentation -->
    <div class="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
            <GuideSection {...t?.guide} />
            <div class="mt-12">
                <AdPlaceholder />
                <FAQSection
                    title={t?.faqTitle}
                    items={[
                        { q: t?.q1, a: t?.a1 },
                        { q: t?.q2, a: t?.a2 },
                        { q: t?.q3, a: t?.a3 }
                    ]}
                />
                <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="schema-forge" currentCategory="dev" />
            </div>
        </div>
    </div>
</div>
