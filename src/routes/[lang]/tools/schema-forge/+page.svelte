<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { fade, slide } from 'svelte/transition';
  import { getDictionary } from '$lib/dictionaries';
  import { schemaForgeWorkspace } from '$lib/db/schema-forge';
  import type { SchemaProject, Table } from '$lib/types/schema-forge';
  import { nanoid } from 'nanoid';
  import TableList from '$lib/components/schema-forge/TableList.svelte';
  import TableEditor from '$lib/components/schema-forge/TableEditor.svelte';
  import SchemaVisualizer from '$lib/components/schema-forge/SchemaVisualizer.svelte';
  import CodePreview from '$lib/components/schema-forge/CodePreview.svelte';
  import { generateCode } from '$lib/utils/schema-forge/generators';
  import { TEMPLATES } from '$lib/utils/schema-forge/templates';
  import { parseSQL } from '$lib/utils/schema-forge/sql-parser';
  import { Save, FolderOpen, Plus, Trash2, Check, Layout, Database, Code, FileCode, Wand2, Upload } from 'lucide-svelte';

  $: lang = $page.params.lang || 'en';
  $: t = getDictionary(lang).tools?.schemaForge || getDictionary('en').tools.schemaForge;
  $: common = getDictionary(lang).common;

  // State
  let activeProject: SchemaProject = {
      name: 'Untitled Project',
      tables: [],
      relations: [],
      createdAt: new Date(),
      updatedAt: new Date()
  };

  let activeTableId: string | null = null;
  let activeTab: 'design' | 'diagram' | 'sql' | 'prisma' | 'typescript' = 'design';
  let isSaving = false;
  let showProjects = false;
  let showTemplates = false;
  let showImport = false;
  let importSqlContent = '';
  let projects: SchemaProject[] = [];

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
          alert('No tables found in SQL');
      }
  }

  async function loadProject(id: number) {
      const p = await schemaForgeWorkspace.get(id);
      if (p) {
          activeProject = p;
          activeTableId = null; // p.tables[0]?.id || null;
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

  // Load latest project on mount
  onMount(async () => {
      await loadProjects();
      if (projects.length > 0) {
          activeProject = projects[0];
      } else {
          // Initialize default project
          save();
      }
  });

  // Generator Helpers
  $: sqlCode = generateCode(activeProject, 'mysql'); // Default MySQL for now, maybe add selector later
  $: prismaCode = generateCode(activeProject, 'prisma');
  $: tsCode = generateCode(activeProject, 'typescript');

</script>

<svelte:head>
  <title>{t.title} - MicroFactory</title>
  <meta name="description" content={t.description} />
  <meta name="keywords" content="database schema, sql generator, prisma schema, db diagram, entity relationship diagram, mysql, postgres, sqlite" />
  <link rel="canonical" href="https://microfactory.app/en/tools/schema-forge" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://microfactory.app/{lang}/tools/schema-forge" />
  <meta property="og:title" content={t.title} />
  <meta property="og:description" content={t.description} />
  <meta property="og:image" content="https://microfactory.app/og/schema-forge.png" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={t.title} />
  <meta name="twitter:description" content={t.description} />
  <meta name="twitter:image" content="https://microfactory.app/og/schema-forge.png" />

  <!-- JSON-LD -->
  {@html `<script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "${t.title}",
      "description": "${t.description}",
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
        "Smart Column Inference"
      ]
    }
  </script>`}
</svelte:head>

<div class="h-[calc(100vh-64px)] flex flex-col bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-white overflow-hidden">

    <!-- Toolbar -->
    <header class="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 z-20">
        <div class="flex items-center gap-4">
            <div class="relative">
                <button
                    class="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
                    on:click={() => showProjects = !showProjects}
                >
                    <FolderOpen size={18} class="text-indigo-600 dark:text-indigo-400" />
                    <span class="max-w-[150px] truncate">{activeProject.name}</span>
                </button>

                {#if showProjects}
                    <div class="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-50" transition:slide>
                        <div class="flex justify-between items-center mb-2 px-2">
                             <span class="text-xs font-bold text-slate-500 uppercase">My Projects</span>
                             <button class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded" on:click={createProject}>
                                 <Plus size={14} />
                             </button>
                        </div>
                        <div class="max-h-60 overflow-y-auto space-y-1">
                            {#each projects as p}
                                <div class="flex items-center group rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <button
                                        class="flex-1 text-left px-3 py-2 text-sm truncate"
                                        on:click={() => loadProject(p.id || 0)}
                                    >
                                        {p.name}
                                    </button>
                                    <button
                                        class="p-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity"
                                        on:click={(e) => deleteProject(p.id || 0, e)}
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
                class="bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-600 dark:text-slate-300 w-48 hover:bg-slate-100 dark:hover:bg-slate-800 rounded px-2"
                placeholder="Project Name"
            />
        </div>

        <div class="flex items-center gap-2">
            <!-- New Features: Templates & Import -->
            <div class="flex items-center gap-2 mr-2">
                <div class="relative">
                    <button
                        class="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold flex items-center gap-2 transition-colors"
                        on:click={() => showTemplates = !showTemplates}
                    >
                        <Wand2 size={14} />
                        Templates
                    </button>
                    {#if showTemplates}
                        <div class="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-50" transition:slide>
                            <div class="text-xs font-bold text-slate-500 uppercase px-2 mb-2">Start with...</div>
                            <div class="space-y-1">
                                {#each TEMPLATES as tmpl}
                                    <button
                                        class="w-full text-left px-3 py-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700/50"
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
                    class="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold flex items-center gap-2 transition-colors"
                    on:click={() => showImport = true}
                >
                    <Upload size={14} />
                    Import SQL
                </button>
            </div>

            <div class="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 mr-4">
                <button
                    class="px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition-all {activeTab === 'design' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
                    on:click={() => activeTab = 'design'}
                >
                    <Layout size={14} />
                    {t.tabs.design}
                </button>
                <button
                    class="px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition-all {activeTab === 'diagram' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
                    on:click={() => activeTab = 'diagram'}
                >
                    <Database size={14} />
                    {t.tabs.diagram}
                </button>
                <div class="w-px bg-slate-300 dark:bg-slate-700 mx-1 my-1"></div>
                <button
                    class="px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition-all {activeTab === 'sql' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
                    on:click={() => activeTab = 'sql'}
                >
                    <Code size={14} />
                    {t.tabs.sql}
                </button>
                <button
                    class="px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition-all {activeTab === 'prisma' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
                    on:click={() => activeTab = 'prisma'}
                >
                    <FileCode size={14} />
                    {t.tabs.prisma}
                </button>
                <button
                    class="px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition-all {activeTab === 'typescript' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
                    on:click={() => activeTab = 'typescript'}
                >
                    <span class="text-xs font-mono">TS</span>
                    {t.tabs.typescript}
                </button>
            </div>

            <button
                class="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                on:click={save}
                disabled={isSaving}
            >
                {#if isSaving}
                    <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {:else}
                    <Save size={16} />
                {/if}
                {t.toolbar.save}
            </button>
        </div>
    </header>

    <!-- Content -->
    <div class="flex-1 flex overflow-hidden">
        <!-- Sidebar -->
        <TableList
            schema={activeProject}
            bind:activeTableId
            on:addTable={handleAddTable}
            on:select={(e) => { activeTableId = e.detail; activeTab = 'design'; }}
            on:delete={handleDeleteTable}
        />

        <!-- Main Area -->
        <main class="flex-1 overflow-hidden bg-slate-100 dark:bg-black/50 relative">
             {#if activeTab === 'design'}
                {#if activeTable}
                    <TableEditor table={activeTable} on:change={handleTableChange} />
                {:else}
                    <div class="h-full flex flex-col items-center justify-center text-slate-400">
                        <Database size={64} class="mb-4 opacity-20" />
                        <h2 class="text-xl font-bold text-slate-600 dark:text-slate-300">Select a table to edit</h2>
                        <p class="text-sm">Or add a new one from the sidebar.</p>
                    </div>
                {/if}
             {:else if activeTab === 'diagram'}
                <SchemaVisualizer schema={activeProject} />
             {:else if activeTab === 'sql'}
                <CodePreview code={sqlCode} language="sql" />
             {:else if activeTab === 'prisma'}
                <CodePreview code={prismaCode} language="go" /> <!-- Prisma uses Go-like syntax for highlighting mostly -->
             {:else if activeTab === 'typescript'}
                <CodePreview code={tsCode} language="typescript" />
             {/if}
        </main>
    </div>
</div>

<!-- Import Modal -->
{#if showImport}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" transition:fade>
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-slate-200 dark:border-slate-800">
            <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <h3 class="font-bold text-lg">Import SQL</h3>
                <button class="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded" on:click={() => showImport = false}>
                     <!-- Using generic close or icon -->
                     <span class="text-xl">&times;</span>
                </button>
            </div>
            <div class="p-4 flex-1 overflow-hidden flex flex-col">
                <p class="text-sm text-slate-500 mb-2">Paste your <code class="bg-slate-100 dark:bg-slate-800 px-1 rounded">CREATE TABLE</code> statements here.</p>
                <textarea
                    bind:value={importSqlContent}
                    class="w-full flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 font-mono text-sm resize-none focus:border-indigo-500 focus:ring-0"
                    placeholder="CREATE TABLE users ( id INT PRIMARY KEY... );"
                ></textarea>
            </div>
            <div class="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                    class="px-4 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                    on:click={() => showImport = false}
                >
                    Cancel
                </button>
                <button
                    class="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                    on:click={importSQL}
                >
                    Import Tables
                </button>
            </div>
        </div>
    </div>
{/if}

<div class="min-h-screen flex flex-col bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-white">
    <!-- Tool Area -->
    <div class="h-[800px] flex flex-col border-b border-slate-200 dark:border-slate-800 shrink-0">
       <!-- (The Toolbar and Main Content as before) -->
       <!-- Re-inserting the toolbar and main content code here but wrapped -->
        <header class="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 z-20">
             <!-- ... Toolbar content ... -->
             <div class="flex items-center gap-4">
                <div class="relative">
                    <button
                        class="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
                        on:click={() => showProjects = !showProjects}
                    >
                        <FolderOpen size={18} class="text-indigo-600 dark:text-indigo-400" />
                        <span class="max-w-[150px] truncate">{activeProject.name}</span>
                    </button>

                    {#if showProjects}
                        <div class="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-50" transition:slide>
                            <div class="flex justify-between items-center mb-2 px-2">
                                 <span class="text-xs font-bold text-slate-500 uppercase">My Projects</span>
                                 <button class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded" on:click={createProject}>
                                     <Plus size={14} />
                                 </button>
                            </div>
                            <div class="max-h-60 overflow-y-auto space-y-1">
                                {#each projects as p}
                                    <div class="flex items-center group rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        <button
                                            class="flex-1 text-left px-3 py-2 text-sm truncate"
                                            on:click={() => loadProject(p.id || 0)}
                                        >
                                            {p.name}
                                        </button>
                                        <button
                                            class="p-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity"
                                            on:click={(e) => deleteProject(p.id || 0, e)}
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
                    class="bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-600 dark:text-slate-300 w-48 hover:bg-slate-100 dark:hover:bg-slate-800 rounded px-2"
                    placeholder="Project Name"
                />
            </div>

            <div class="flex items-center gap-2">
                <div class="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 mr-4">
                    <button
                        class="px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition-all {activeTab === 'design' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
                        on:click={() => activeTab = 'design'}
                    >
                        <Layout size={14} />
                        {t.tabs.design}
                    </button>
                    <button
                        class="px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition-all {activeTab === 'diagram' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
                        on:click={() => activeTab = 'diagram'}
                    >
                        <Database size={14} />
                        {t.tabs.diagram}
                    </button>
                    <div class="w-px bg-slate-300 dark:bg-slate-700 mx-1 my-1"></div>
                    <button
                        class="px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition-all {activeTab === 'sql' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
                        on:click={() => activeTab = 'sql'}
                    >
                        <Code size={14} />
                        {t.tabs.sql}
                    </button>
                    <button
                        class="px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition-all {activeTab === 'prisma' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
                        on:click={() => activeTab = 'prisma'}
                    >
                        <FileCode size={14} />
                        {t.tabs.prisma}
                    </button>
                    <button
                        class="px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition-all {activeTab === 'typescript' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
                        on:click={() => activeTab = 'typescript'}
                    >
                        <span class="text-xs font-mono">TS</span>
                        {t.tabs.typescript}
                    </button>
                </div>

                <button
                    class="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    on:click={save}
                    disabled={isSaving}
                >
                    {#if isSaving}
                        <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {:else}
                        <Save size={16} />
                    {/if}
                    {t.toolbar.save}
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
                            <h2 class="text-xl font-bold text-slate-600 dark:text-slate-300">Select a table to edit</h2>
                            <p class="text-sm">Or add a new one from the sidebar.</p>
                        </div>
                    {/if}
                 {:else if activeTab === 'diagram'}
                    <SchemaVisualizer schema={activeProject} />
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
    <article class="prose dark:prose-invert max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2>{t.guide.title}</h2>
        <p>{t.guide.intro}</p>

        <h3>{t.guide.featuresTitle}</h3>
        <ul>
          <li><span class="markdown-body">{@html t.guide.f1.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span></li>
          <li><span class="markdown-body">{@html t.guide.f2.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span></li>
          <li><span class="markdown-body">{@html t.guide.f3.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span></li>
        </ul>

        <h3>{t.guide.tipsTitle}</h3>
        <ul>
          <li><span class="markdown-body">{@html t.guide.tip1.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span></li>
          <li><span class="markdown-body">{@html t.guide.tip2.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span></li>
          <li><span class="markdown-body">{@html t.guide.tip3.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span></li>
        </ul>

        <h3>{t.faqTitle}</h3>
        <div class="space-y-4">
          <div>
            <h4 class="font-bold">{t.q1}</h4>
            <p>{t.a1}</p>
          </div>
          <div>
            <h4 class="font-bold">{t.q2}</h4>
            <p>{t.a2}</p>
          </div>
           <div>
            <h4 class="font-bold">{t.q3}</h4>
            <p>{t.a3}</p>
          </div>
        </div>
    </article>
</div>
