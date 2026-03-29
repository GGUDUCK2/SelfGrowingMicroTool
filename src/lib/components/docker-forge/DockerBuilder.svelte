<script lang="ts">
  import { dictionaries } from '$lib/dictionaries';
  import Button from '$lib/components/Button.svelte';
  import { db, type DockerForgeHistory } from '$lib/db';
  import { Copy, Download, Trash2, Plus, Save, Box, Share2 } from 'lucide-svelte';
  import { fade } from 'svelte/transition';
  import HistoryPanel from './HistoryPanel.svelte';
  import { onMount, onDestroy } from 'svelte';

  export let lang: string;

  $: dict = dictionaries[lang as keyof typeof dictionaries] || dictionaries.en;
  $: d = dict.tools.dockerForge;

  let baseImage = 'node:18-alpine';
  let workdir = '/app';
  let envVars: { key: string; value: string }[] = [];
  let runCmds: string[] = ['npm install'];
  let copySteps: { src: string; dest: string }[] = [{ src: '.', dest: '.' }];
  let exposePorts: string[] = ['3000'];
  let entrypoint = '';
  let cmd = 'npm start';

  // Multi-stage support
  let isMultiStage = false;
  let buildImage = 'node:18';
  let installCmds: string[] = ['npm ci'];

  $: dockerfile = generateDockerfile(baseImage, workdir, envVars, runCmds, copySteps, exposePorts, entrypoint, cmd, isMultiStage, buildImage, installCmds);
  $: compose = generateCompose(baseImage, exposePorts, workdir);

  function handleKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      saveToHistory();
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
      if (window.getSelection()?.toString()) return;
      e.preventDefault();
      copyToClipboard(dockerfile);
    }
    if (e.key === 'Escape') {
      // Could clear form, but might be destructive without warning.
      // E.g., applyTemplate('nodejs');
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', handleKeydown);
    }
  });

  // Security Check Logic
  $: securityWarnings = computeSecurityWarnings(baseImage, envVars, runCmds);

  function computeSecurityWarnings(base: string, envs: {key:string, value:string}[], runs: string[]) {
    const warnings = [];
    if (base.endsWith(':latest') || !base.includes(':')) {
      warnings.push(d.warningLatestTag || "Using 'latest' tag is not recommended for production.");
    }
    if (base.startsWith('node') && !base.includes('alpine') && !base.includes('slim')) {
      warnings.push(d.warningFatImage || "Consider using an alpine or slim variant for a smaller attack surface.");
    }
    return warnings;
  }

  // Magic Templates
  const templates = {
    nodejs: {
      isMultiStage: false,
      buildImage: '',
      installCmds: [],
      baseImage: 'node:18-alpine',
      workdir: '/app',
      envVars: [{ key: 'NODE_ENV', value: 'production' }],
      runCmds: ['npm ci --only=production'],
      copySteps: [{ src: 'package*.json', dest: './' }, { src: '.', dest: '.' }],
      exposePorts: ['3000'],
      entrypoint: '',
      cmd: 'npm start'
    },
    nextjs: {
      isMultiStage: true,
      buildImage: 'node:18-alpine',
      installCmds: ['npm ci', 'npm run build'],
      baseImage: 'node:18-alpine',
      workdir: '/app',
      envVars: [{ key: 'NODE_ENV', value: 'production' }],
      runCmds: [],
      copySteps: [], // Handled by multi-stage logic conceptually, but for now we'll just set it.
      exposePorts: ['3000'],
      entrypoint: '',
      cmd: 'npm start'
    },
    python: {
      isMultiStage: false,
      buildImage: '',
      installCmds: [],
      baseImage: 'python:3.11-slim',
      workdir: '/app',
      envVars: [{ key: 'PYTHONDONTWRITEBYTECODE', value: '1' }, { key: 'PYTHONUNBUFFERED', value: '1' }],
      runCmds: ['pip install --no-cache-dir -r requirements.txt'],
      copySteps: [{ src: 'requirements.txt', dest: '.' }, { src: '.', dest: '.' }],
      exposePorts: ['8000'],
      entrypoint: '',
      cmd: 'uvicorn main:app --host 0.0.0.0 --port 8000'
    },
    go: {
      isMultiStage: true,
      buildImage: 'golang:1.21-alpine',
      installCmds: ['go mod download', 'go build -o main .'],
      baseImage: 'alpine:latest',
      workdir: '/app',
      envVars: [],
      runCmds: ['apk --no-cache add ca-certificates'],
      copySteps: [],
      exposePorts: ['8080'],
      entrypoint: '',
      cmd: './main'
    },
    rust: {
      isMultiStage: true,
      buildImage: 'rust:1.73-slim',
      installCmds: ['cargo build --release'],
      baseImage: 'debian:bullseye-slim',
      workdir: '/app',
      envVars: [],
      runCmds: ['apt-get update && apt-get install -y libssl-dev ca-certificates && rm -rf /var/lib/apt/lists/*'],
      copySteps: [],
      exposePorts: ['8080'],
      entrypoint: '',
      cmd: './target/release/app'
    }
  };

  function applyTemplate(type: keyof typeof templates) {
    const t = templates[type];
    isMultiStage = t.isMultiStage;
    buildImage = t.buildImage;
    installCmds = [...t.installCmds];
    baseImage = t.baseImage;
    workdir = t.workdir;
    envVars = [...t.envVars];
    runCmds = [...t.runCmds];
    copySteps = [...t.copySteps];
    exposePorts = [...t.exposePorts];
    entrypoint = t.entrypoint;
    cmd = t.cmd;
  }

  function generateDockerfile(
    base: string,
    wd: string,
    envs: { key: string; value: string }[],
    runs: string[],
    copies: { src: string; dest: string }[],
    ports: string[],
    ep: string,
    c: string,
    multi: boolean,
    bImage: string,
    iCmds: string[]
  ) {
    let lines = [];

    if (multi) {
      if (bImage) lines.push(`FROM ${bImage} AS builder`);
      if (wd) lines.push(`WORKDIR ${wd}`);
      lines.push(`COPY . .`);
      iCmds.forEach(cmd => {
        if (cmd) lines.push(`RUN ${cmd}`);
      });
      lines.push('');
    }

    if (base) lines.push(`FROM ${base}`);
    if (wd) lines.push(`WORKDIR ${wd}`);
    envs.forEach(env => {
      if (env.key && env.value) lines.push(`ENV ${env.key}=${env.value}`);
    });

    if (multi) {
      lines.push(`COPY --from=builder ${wd} ${wd}`);
    } else {
      copies.forEach(copy => {
        if (copy.src && copy.dest) lines.push(`COPY ${copy.src} ${copy.dest}`);
      });
    }

    runs.forEach(run => {
      if (run) lines.push(`RUN ${run}`);
    });
    ports.forEach(port => {
      if (port) lines.push(`EXPOSE ${port}`);
    });
    if (ep) lines.push(`ENTRYPOINT [${ep.split(' ').map(s => `"${s}"`).join(', ')}]`);
    if (c) lines.push(`CMD [${c.split(' ').map(s => `"${s}"`).join(', ')}]`);
    return lines.join('\n');
  }

  function generateCompose(base: string, ports: string[], wd: string) {
    let lines = [
      'version: "3.8"',
      'services:',
      '  app:',
      '    build: .',
    ];
    if (ports.length > 0) {
      lines.push('    ports:');
      ports.forEach(port => {
        if (port) lines.push(`      - "${port}:${port}"`);
      });
    }
    if (wd) {
      lines.push('    volumes:');
      lines.push(`      - .:${wd}`);
    }
    lines.push('    restart: unless-stopped');
    return lines.join('\n');
  }

  let copied = false;
  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
      setTimeout(() => copied = false, 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  }

  function downloadFile(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function shareCode() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Docker Forge Code',
          text: dockerfile
        });
      } catch (err) {
        console.error('Error sharing', err);
      }
    } else {
      copyToClipboard(dockerfile);
    }
  }

  function removeInstall(index: number) {
    installCmds = installCmds.filter((_, i) => i !== index);
  }

  async function saveToHistory() {
    try {
      const count = await db.dockerForgeHistory.count();
      if (count >= 100) {
        // Find oldest unstarred item first
        const oldestUnstarred = await db.dockerForgeHistory
          .filter(item => !item.starred)
          .sortBy('createdAt');

        if (oldestUnstarred.length > 0 && oldestUnstarred[0].id) {
          await db.dockerForgeHistory.delete(oldestUnstarred[0].id);
        } else {
          // Fallback if somehow all 100 items are starred
          const oldest = await db.dockerForgeHistory.orderBy('createdAt').first();
          if (oldest && oldest.id) {
             await db.dockerForgeHistory.delete(oldest.id);
          }
        }
      }

      await db.dockerForgeHistory.add({
        baseImage,
        dockerfile,
        compose,
        createdAt: new Date(),
        starred: 0
      });
    } catch (e) {
      console.error('Failed to save history', e);
    }
  }

  function handleRestore(item: DockerForgeHistory) {
    // Parse back if possible or just show read-only
    // For simplicity, we just extract base image and reset the rest to default
    // In a real app we'd parse the dockerfile back into state
    baseImage = item.baseImage;
    workdir = '/app';
    envVars = [];
    runCmds = [];
    copySteps = [{ src: '.', dest: '.' }];
    exposePorts = [];
    cmd = '';
    entrypoint = '';
    isMultiStage = false;
  }

  function removeEnv(index: number) {
    envVars = envVars.filter((_, i) => i !== index);
  }
  function removeRun(index: number) {
    runCmds = runCmds.filter((_, i) => i !== index);
  }
  function removeCopy(index: number) {
    copySteps = copySteps.filter((_, i) => i !== index);
  }
  function removePort(index: number) {
    exposePorts = exposePorts.filter((_, i) => i !== index);
  }
</script>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
  <div class="lg:col-span-2 space-y-6">

    <!-- Magic Templates -->
    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-sm font-medium text-slate-700 dark:text-slate-300 mr-2">{d.magicTemplates || "Magic Templates"}:</span>
        <button class="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors min-h-[44px]" on:click={() => applyTemplate('nodejs')}>
          Node.js
        </button>
        <button class="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors min-h-[44px]" on:click={() => applyTemplate('nextjs')}>
          Next.js
        </button>
        <button class="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors min-h-[44px]" on:click={() => applyTemplate('python')}>
          Python FastAPI
        </button>
        <button class="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors min-h-[44px]" on:click={() => applyTemplate('go')}>
          Go
        </button>
        <button class="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors min-h-[44px]" on:click={() => applyTemplate('rust')}>
          Rust
        </button>
      </div>
    </div>

    <!-- Security Warnings -->
    {#if securityWarnings.length > 0}
      <div class="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/50 rounded-xl p-4 flex flex-col gap-2">
        {#each securityWarnings as warning}
          <div class="flex items-start text-sm text-amber-800 dark:text-amber-200">
            <span class="mr-2">⚠️</span>
            <span>{warning}</span>
          </div>
        {/each}
      </div>
    {/if}

    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <div class="space-y-6">
        <!-- Multi-stage Toggle -->
        <div class="flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
          <div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">{d.multiStage || 'Multi-Stage Build'}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Separate build dependencies from runtime for a smaller image.</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" class="sr-only peer" bind:checked={isMultiStage}>
            <div class="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 min-h-[44px] min-w-[44px]"></div>
          </label>
        </div>

        {#if isMultiStage}
          <div class="p-4 border border-blue-200 dark:border-blue-900/50 rounded-lg bg-blue-50/50 dark:bg-blue-900/10 space-y-4" transition:fade>
            <div>
              <label for="buildImage" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{d.buildImage || 'Build Image'} (Builder)</label>
              <input
                id="buildImage"
                type="text"
                bind:value={buildImage}
                class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                placeholder="e.g. node:18"
              />
            </div>
            <div role="group" aria-labelledby="install-cmds-label">
              <div class="flex justify-between items-center mb-2">
                <p id="install-cmds-label" class="block text-sm font-medium text-slate-700 dark:text-slate-300">{d.installCmds || 'Install Commands'}</p>
                <button
                  class="text-blue-500 hover:text-blue-600 flex items-center text-sm font-medium min-h-[44px] min-w-[44px] justify-center"
                  on:click={() => installCmds = [...installCmds, '']}
                >
                  <Plus size={16} class="mr-1" /> {d.addInstall || 'Add'}
                </button>
              </div>
              <div class="space-y-2">
                {#each installCmds as cmd, i}
                  <div class="flex items-center gap-2">
                    <input
                      type="text"
                      bind:value={installCmds[i]}
                      class="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                      placeholder="npm ci"
                      aria-label="Install Command"
                    />
                    <button
                      class="text-slate-400 hover:text-red-500 min-h-[44px] min-w-[44px] flex items-center justify-center p-2"
                      on:click={() => removeInstall(i)}
                      aria-label="Remove Command"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        {/if}

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="baseImage" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {#if isMultiStage}Runtime Image{:else}{d.baseImage}{/if}
            </label>
            <input
              id="baseImage"
              type="text"
              bind:value={baseImage}
              class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 min-h-[44px]"
              placeholder="e.g. node:18-alpine"
            />
          </div>
          <div>
            <label for="workdir" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{d.workdir}</label>
            <input
              id="workdir"
              type="text"
              bind:value={workdir}
              class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 min-h-[44px]"
              placeholder="/app"
            />
          </div>
        </div>

        <div role="group" aria-labelledby="env-vars-label">
          <div class="flex justify-between items-center mb-2">
            <p id="env-vars-label" class="block text-sm font-medium text-slate-700 dark:text-slate-300">{d.envVars}</p>
            <button
              class="text-blue-500 hover:text-blue-600 flex items-center text-sm font-medium min-h-[44px] min-w-[44px] justify-center"
              on:click={() => envVars = [...envVars, { key: '', value: '' }]}
            >
              <Plus size={16} class="mr-1" /> {d.addEnv}
            </button>
          </div>
          <div class="space-y-2">
            {#each envVars as env, i}
              <div class="flex items-center gap-2">
                <input
                  type="text"
                  bind:value={env.key}
                  class="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                  placeholder="KEY"
                  aria-label="Environment Key"
                />
                <input
                  type="text"
                  bind:value={env.value}
                  class="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                  placeholder="VALUE"
                  aria-label="Environment Value"
                />
                <button
                  class="text-slate-400 hover:text-red-500 min-h-[44px] min-w-[44px] flex items-center justify-center p-2"
                  on:click={() => removeEnv(i)}
                  aria-label="Remove Environment Variable"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            {/each}
          </div>
        </div>

        {#if !isMultiStage}
          <div role="group" aria-labelledby="copy-files-label">
            <div class="flex justify-between items-center mb-2">
              <p id="copy-files-label" class="block text-sm font-medium text-slate-700 dark:text-slate-300">{d.copyFiles}</p>
              <button
                class="text-blue-500 hover:text-blue-600 flex items-center text-sm font-medium min-h-[44px] min-w-[44px] justify-center"
                on:click={() => copySteps = [...copySteps, { src: '', dest: '' }]}
              >
                <Plus size={16} class="mr-1" /> {d.addCopy}
              </button>
            </div>
            <div class="space-y-2">
              {#each copySteps as copy, i}
                <div class="flex items-center gap-2">
                  <input
                    type="text"
                    bind:value={copy.src}
                    class="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                    placeholder="package*.json"
                    aria-label={d.sourcePath}
                  />
                  <input
                    type="text"
                    bind:value={copy.dest}
                    class="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                    placeholder="./"
                    aria-label={d.destPath}
                  />
                  <button
                    class="text-slate-400 hover:text-red-500 min-h-[44px] min-w-[44px] flex items-center justify-center p-2"
                    on:click={() => removeCopy(i)}
                    aria-label="Remove Copy Step"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              {/each}
            </div>
          </div>
        {/if}

        <div role="group" aria-labelledby="run-cmds-label">
          <div class="flex justify-between items-center mb-2">
            <p id="run-cmds-label" class="block text-sm font-medium text-slate-700 dark:text-slate-300">{d.runCmds}</p>
            <button
              class="text-blue-500 hover:text-blue-600 flex items-center text-sm font-medium min-h-[44px] min-w-[44px] justify-center"
              on:click={() => runCmds = [...runCmds, '']}
            >
              <Plus size={16} class="mr-1" /> {d.addRun}
            </button>
          </div>
          <div class="space-y-2">
            {#each runCmds as run, i}
              <div class="flex items-center gap-2">
                <input
                  type="text"
                  bind:value={runCmds[i]}
                  class="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                  placeholder="npm install"
                  aria-label="Run Command"
                />
                <button
                  class="text-slate-400 hover:text-red-500 min-h-[44px] min-w-[44px] flex items-center justify-center p-2"
                  on:click={() => removeRun(i)}
                  aria-label="Remove Command"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            {/each}
          </div>
        </div>

        <div role="group" aria-labelledby="expose-ports-label">
          <div class="flex justify-between items-center mb-2">
            <p id="expose-ports-label" class="block text-sm font-medium text-slate-700 dark:text-slate-300">{d.exposePorts}</p>
            <button
              class="text-blue-500 hover:text-blue-600 flex items-center text-sm font-medium min-h-[44px] min-w-[44px] justify-center"
              on:click={() => exposePorts = [...exposePorts, '']}
            >
              <Plus size={16} class="mr-1" /> {d.addPort}
            </button>
          </div>
          <div class="flex flex-wrap gap-2">
            {#each exposePorts as port, i}
              <div class="flex items-center gap-1 w-32">
                <input
                  type="text"
                  bind:value={exposePorts[i]}
                  class="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                  placeholder="3000"
                  aria-label="Port"
                />
                <button
                  class="text-slate-400 hover:text-red-500 min-h-[44px] min-w-[44px] flex items-center justify-center p-2"
                  on:click={() => removePort(i)}
                  aria-label="Remove Port"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            {/each}
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="entrypoint" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{d.entrypoint}</label>
            <input
              id="entrypoint"
              type="text"
              bind:value={entrypoint}
              class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 min-h-[44px]"
              placeholder="e.g. node"
            />
          </div>
          <div>
            <label for="cmd" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{d.cmd}</label>
            <input
              id="cmd"
              type="text"
              bind:value={cmd}
              class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 min-h-[44px]"
              placeholder="e.g. server.js"
            />
          </div>
        </div>

      </div>
    </div>
  </div>

  <div class="space-y-6">
    <div class="bg-slate-900 rounded-xl shadow-lg overflow-hidden border border-slate-700">
      <div class="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-950">
        <div class="text-slate-300 font-mono text-sm flex items-center">
          <Box size={16} class="mr-2 text-blue-400" />
          Dockerfile
        </div>
        <div class="flex space-x-2">
          <button
            class="text-slate-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center p-2 transition-colors"
            on:click={() => copyToClipboard(dockerfile)}
            title={d.copyToClipboard}
            aria-label={d.copyToClipboard}
          >
            {#if copied}
              <span class="text-green-400 text-xs" transition:fade>{d.copied}</span>
            {:else}
              <Copy size={16} />
            {/if}
          </button>
          <button
            class="text-slate-400 hover:text-blue-400 min-h-[44px] min-w-[44px] flex items-center justify-center p-2 transition-colors"
            on:click={() => downloadFile(dockerfile, 'Dockerfile')}
            title={d.download}
            aria-label={d.download}
          >
            <Download size={16} />
          </button>
          <button
            class="text-slate-400 hover:text-indigo-400 min-h-[44px] min-w-[44px] flex items-center justify-center p-2 transition-colors"
            on:click={shareCode}
            title={d.share || 'Share Code'}
            aria-label={d.share || 'Share Code'}
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>
      <div class="p-4 overflow-x-auto">
        <pre class="text-slate-300 font-mono text-sm leading-relaxed whitespace-pre-wrap select-all">{dockerfile}</pre>
      </div>
    </div>

    <div class="bg-slate-900 rounded-xl shadow-lg overflow-hidden border border-slate-700">
      <div class="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-950">
        <div class="text-slate-300 font-mono text-sm flex items-center">
          <Box size={16} class="mr-2 text-blue-400" />
          docker-compose.yml
        </div>
        <div class="flex space-x-2">
          <button
            class="text-slate-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center p-2 transition-colors"
            on:click={() => downloadFile(compose, 'docker-compose.yml')}
            title={d.downloadCompose}
            aria-label={d.downloadCompose}
          >
            <Download size={16} />
          </button>
        </div>
      </div>
      <div class="p-4 overflow-x-auto">
        <pre class="text-slate-300 font-mono text-sm leading-relaxed whitespace-pre-wrap select-all">{compose}</pre>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <Button variant="primary" class="w-full min-h-[44px] flex items-center justify-center gap-2" on:click={saveToHistory}>
        <Save size={18} /> {d.save}
      </Button>
    </div>

    <HistoryPanel {lang} onRestore={handleRestore} />
  </div>
</div>
