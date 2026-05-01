<script lang="ts">
  import { dictionaries } from '$lib/dictionaries';
  import Button from '$lib/components/Button.svelte';
  import { saveToHistory as workspaceSave, loadLastSession as workspaceLoadLastSession, type ToolHistoryItem } from '$lib/db/workspace';
  import { Copy, Download, Trash2, Plus, Save, Box, Share2, FileArchive, Star } from 'lucide-svelte';
  import { fade } from 'svelte/transition';
  import HistoryPanel from './HistoryPanel.svelte';
  import { onMount, onDestroy } from 'svelte';
  import JSZip from 'jszip';
  import Prism from 'prismjs';
  import 'prismjs/components/prism-docker';
  import 'prismjs/components/prism-yaml';
  import 'prismjs/components/prism-makefile';
  import 'prismjs/themes/prism-tomorrow.css';

  export let lang: string;

  $: dict = dictionaries[lang as keyof typeof dictionaries] || dictionaries.en;
  $: d = dict?.tools?.dockerForge || dictionaries.en.tools.dockerForge;

  let baseImage = 'node:18-alpine';
  let workdir = '/app';
  let envVars: { key: string; value: string }[] = [];
  let runCmds: string[] = ['npm install'];
  let copySteps: { src: string; dest: string }[] = [{ src: '.', dest: '.' }];
  let exposePorts: string[] = ['3000'];
  let entrypoint = '';
  let cmd = 'npm start';

  // Healthcheck support
  let isHealthcheck = false;
  let hcCmd = 'curl -f http://localhost:3000/ || exit 1';
  let hcInterval = '30s';
  let hcTimeout = '30s';
  let hcRetries = '3';
  let hcStartPeriod = '5s';

  // Multi-stage support
  let isMultiStage = false;
  let buildImage = 'node:18';
  let installCmds: string[] = ['npm ci'];

  // Visual Size Estimator
  const imageSizeMap: Record<string, number> = {
    'alpine:latest': 5,
    'node:18-alpine': 175,
    'node:18': 1000,
    'python:3.11-slim': 150,
    'python:3.11': 1000,
    'golang:1.21-alpine': 300,
    'golang:1.21': 800,
    'rust:1.73-slim': 700,
    'ubuntu:latest': 70,
    'debian:bullseye-slim': 80
  };

  function parseLayerSizeStr(line: string): number {
    const l = line.trim().toLowerCase();
    if (l.startsWith('from ')) {
      const img = l.substring(5).split(' ')[0];
      return imageSizeMap[img] || 100; // Default 100MB unknown
    }
    if (l.startsWith('run ')) {
      if (l.includes('npm ci') || l.includes('npm install')) return 150;
      if (l.includes('pip install')) return 80;
      if (l.includes('apt-get') || l.includes('apk add')) return 30;
      if (l.includes('go build') || l.includes('cargo build')) return 20;
      return 5;
    }
    if (l.startsWith('copy ')) return 2;
    return 0;
  }

  function estimateLayerSizeStr(line: string): string | null {
     const size = parseLayerSizeStr(line);
     if (size === 0) return null;
     if (size < 5) return '< 5MB';
     return `~${size}MB`;
  }

  $: dockerfileLinesWithSizes = dockerfile.split('\n').map(line => {
    return { line, size: estimateLayerSizeStr(line), rawSize: parseLayerSizeStr(line) };
  });

  // Total size estimation
  $: totalEstimatedSizeMB = dockerfileLinesWithSizes.reduce((acc, curr) => acc + curr.rawSize, 0);
  $: estimatedSizeStr = totalEstimatedSizeMB > 1024 ? `~${(totalEstimatedSizeMB/1024).toFixed(1)}GB` : `~${totalEstimatedSizeMB}MB`;

  // For the visual bar
  $: layerBreakdown = [
     { name: 'Base OS/Image', size: dockerfileLinesWithSizes.find(l => l.line.startsWith('FROM '))?.rawSize || 0, color: 'bg-slate-400' },
     { name: 'Dependencies', size: dockerfileLinesWithSizes.filter(l => l.line.startsWith('RUN ')).reduce((a,c) => a + c.rawSize, 0), color: 'bg-blue-500' },
     { name: 'Source/Assets', size: dockerfileLinesWithSizes.filter(l => l.line.startsWith('COPY ')).reduce((a,c) => a + c.rawSize, 0), color: 'bg-green-500' },
  ].filter(l => l.size > 0);

  $: totalBreakdownSize = layerBreakdown.reduce((a, c) => a + c.size, 0) || 1; // avoid division by zero


  // Smart Port Suggestions based on image or template
  $: {
    const baseLower = baseImage.toLowerCase();
    const ports = [];
    if (baseLower.includes('node') || baseLower.includes('next')) ports.push('3000');
    else if (baseLower.includes('python') || baseLower.includes('fastapi') || baseLower.includes('django')) ports.push('8000');
    else if (baseLower.includes('nginx') || baseLower.includes('php')) ports.push('80');
    else if (baseLower.includes('go') || baseLower.includes('rust') || baseLower.includes('tomcat') || baseLower.includes('java')) ports.push('8080');
    else if (baseLower.includes('ruby')) ports.push('3000');

    if (ports.length > 0 && exposePorts.length === 0) {
      exposePorts = ports;
    }
  }

  let services: Record<string, boolean> = { postgres: false, mysql: false, mongodb: false, redis: false };

  $: dockerfile = generateDockerfile(baseImage, workdir, envVars, runCmds, copySteps, exposePorts, entrypoint, cmd, isMultiStage, buildImage, installCmds, getHealthcheckConfig());
  $: compose = generateCompose(exposePorts, workdir, services);

  // Build & Run Script Generator (Makefile)
  $: makefileCode = generateMakefile(exposePorts, services);

  // Deploy Script Generator
  $: deployScriptCode = generateDeployScript(exposePorts, services);

  function generateDeployScript(ports: string[], svcs: Record<string, boolean>) {
    const hasCompose = Object.values(svcs).some(v => v) || ports.length > 0;
    const appName = 'app';
    const primaryPort = ports.length > 0 ? ports[0] : '';

    let lines = [
      '#!/bin/bash',
      'set -e',
      '',
      'echo "🚀 Deploying Docker Forge Project..."',
      '',
      '# Pull latest code (if using git)',
      '# git pull origin main',
      ''
    ];

    if (hasCompose) {
      lines.push('echo "📦 Starting services via Docker Compose..."');
      lines.push('docker-compose pull # Optional: Pull latest images');
      lines.push('docker-compose up -d --build --remove-orphans');
    } else {
      lines.push('echo "🔨 Building Docker image manually..."');
      lines.push(`docker build -t ${appName} .`);
      lines.push('');
      lines.push('echo "🛑 Stopping old container if exists..."');
      lines.push(`docker rm -f ${appName} || true`);
      lines.push('');
      lines.push('echo "🚢 Starting new container..."');
      let runCmd = `docker run -d --restart unless-stopped --name ${appName}`;
      if (primaryPort) runCmd += ` -p ${primaryPort}:${primaryPort}`;
      runCmd += ` ${appName}`;
      lines.push(runCmd);
    }

    lines.push('');
    lines.push('echo "✅ Deployment successful!"');
    lines.push('docker ps');

    return lines.join('\n');
  }

  function generateMakefile(ports: string[], svcs: Record<string, boolean>) {
    const appName = 'app';
    const primaryPort = ports.length > 0 ? ports[0] : '';
    const hasCompose = Object.values(svcs).some(v => v) || ports.length > 0;

    let lines = [
      '.PHONY: build run up down clean',
      '',
      '# Build the Docker image manually',
      'build:',
      `\tdocker build -t ${appName} .`,
      '',
      '# Run the container manually',
      'run:',
    ];

    let runCmd = `\tdocker run -d --name ${appName}`;
    if (primaryPort) runCmd += ` -p ${primaryPort}:${primaryPort}`;
    runCmd += ` ${appName}`;
    lines.push(runCmd);

    lines.push('');
    lines.push('# Stop and remove the manual container');
    lines.push('clean:');
    lines.push(`\tdocker rm -f ${appName} || true`);

    if (hasCompose) {
        lines.push('');
        lines.push('# Start all services using docker-compose');
        lines.push('up:');
        lines.push('\tdocker-compose up -d --build');
        lines.push('');
        lines.push('# Stop all services');
        lines.push('down:');
        lines.push('\tdocker-compose down');
    }

    return lines.join('\n');
  }

  // CI/CD Generator
  let ciProvider: 'github' | 'gitlab' = 'github';
  $: ciPipelineCode = ciProvider === 'github' ? generateGithubActions() : generateGitlabCi();

  function generateGitlabCi() {
    return `image: docker:20.10.16

services:
  - docker:20.10.16-dind

variables:
  DOCKER_TLS_CERTDIR: "/certs"

before_script:
  - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY

build:
  stage: build
  script:
    - docker build -t $CI_REGISTRY_IMAGE:latest .
    - docker push $CI_REGISTRY_IMAGE:latest
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
`;
  }

  function generateGithubActions() {
    return `name: Docker Build and Publish

on:
  push:
    branches: [ "main" ]
    tags: [ 'v*.*.*' ]
  pull_request:
    branches: [ "main" ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: \${{ github.repository }}

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
      id-token: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3.0.0

      - name: Log into registry \${{ env.REGISTRY }}
        if: github.event_name != 'pull_request'
        uses: docker/login-action@v3.0.0
        with:
          registry: \${{ env.REGISTRY }}
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}

      - name: Extract Docker metadata
        id: meta
        uses: docker/metadata-action@v5.0.0
        with:
          images: \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}

      - name: Build and push Docker image
        id: build-and-push
        uses: docker/build-push-action@v5.0.0
        with:
          context: .
          push: \${{ github.event_name != 'pull_request' }}
          tags: \${{ steps.meta.outputs.tags }}
          labels: \${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max`;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      copyToClipboard(dockerfile);
      saveToHistory();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      saveToHistory();
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      clearForm();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      clearForm();
    }
  }

  function clearForm() {
      baseImage = '';
      workdir = '';
      envVars = [];
      runCmds = [];
      copySteps = [{ src: '.', dest: '.' }];
      exposePorts = [];
      entrypoint = '';
      cmd = '';
      isMultiStage = false;
      buildImage = '';
      installCmds = [];
      isHealthcheck = false;
      hcCmd = 'curl -f http://localhost:3000/ || exit 1';
      hcInterval = '30s';
      hcTimeout = '30s';
      hcRetries = '3';
      hcStartPeriod = '5s';
  }

  async function loadLastSession() {
    try {
      const latest = await workspaceLoadLastSession('docker-forge');
      if (latest) {
        handleRestore(latest);
      }
    } catch (e) {
      console.error('Failed to load last session', e);
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
    loadLastSession();
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', handleKeydown);
    }
  });

  // Security Check Logic
  $: securityWarnings = computeSecurityWarnings(baseImage, dockerfile);

  function computeSecurityWarnings(base: string, dfString: string) {
    const warnings: { type: 'warning' | 'optimization', text: string }[] = [];
    if (base.endsWith(':latest') || !base.includes(':')) {
      warnings.push({ type: 'warning', text: d?.warningLatestTag || "Using 'latest' tag is not recommended for production. Pin a specific version."});
    }
    if (base.startsWith('node') && !base.includes('alpine') && !base.includes('slim')) {
      warnings.push({ type: 'optimization', text: d?.warningFatImage || "Consider using an alpine or slim variant for a smaller attack surface and faster pulls."});
    }

    // Check for missing USER directive
    if (!dfString.includes('\nUSER ') && !dfString.startsWith('USER ')) {
       warnings.push({ type: 'warning', text: d?.warningUser || "Running as root. Consider adding a 'USER' directive for better security."});
    }

    // Check for consecutive RUN commands
    const lines = dfString.split('\n');
    let consecutiveRuns = 0;
    let foundCopyAll = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.startsWith('RUN ')) {
            consecutiveRuns++;
            if (consecutiveRuns > 1) {
                warnings.push({ type: 'optimization', text: d?.warningMultipleRuns || "Multiple consecutive RUN commands found. Consider chaining them with '&&' to reduce image layers."});
                break;
            }
        } else if (line !== '') {
            consecutiveRuns = 0;
        }

        // Cache Buster Analysis
        if (line.startsWith('COPY . .') || line.startsWith('COPY . /app') || line.startsWith('ADD . .')) {
            foundCopyAll = true;
        }
        if (foundCopyAll && line.startsWith('RUN ')) {
            if (line.includes('npm install') || line.includes('npm ci') || line.includes('pip install') || line.includes('go mod download')) {
                 warnings.push({ type: 'optimization', text: d?.warningCacheBust || "Cache Buster Detected: You are copying all source files before installing dependencies. Copy only package.json/requirements.txt first to leverage Docker's layer cache."});
            }
        }

        // Secret Scanner
        if (line.startsWith('ENV ') || line.startsWith('ARG ')) {
            const secretKeywords = ['PASSWORD', 'SECRET', 'TOKEN', 'API_KEY', 'AWS_ACCESS_KEY', 'PRIVATE_KEY'];
            if (secretKeywords.some(keyword => line.toUpperCase().includes(keyword))) {
                 warnings.push({ type: 'warning', text: d?.warningSecret || "Hardcoded Secret Detected: Avoid putting secrets directly in ENV or ARG. Use Docker Secrets or inject them at runtime."});
            }
        }
    }

    // Check package manager caches
    if (dfString.includes('apt-get install') && !dfString.includes('rm -rf /var/lib/apt/lists/')) {
        warnings.push({ type: 'optimization', text: "Clean up apt cache (rm -rf /var/lib/apt/lists/*) to reduce image size." });
    }
    if (dfString.includes('apk add') && !dfString.includes('--no-cache')) {
        warnings.push({ type: 'optimization', text: "Use 'apk add --no-cache' to avoid storing the index locally." });
    }
    if (dfString.includes('pip install') && !dfString.includes('--no-cache-dir')) {
        warnings.push({ type: 'optimization', text: "Use 'pip install --no-cache-dir' to save space." });
    }
    if (dfString.includes('npm install') && !dfString.includes('npm ci')) {
        warnings.push({ type: 'optimization', text: "Consider using 'npm ci' instead of 'npm install' for reproducible builds." });
    }

    return warnings;
  }

  // .dockerignore Generator
  let currentStack: 'nodejs' | 'nextjs' | 'python' | 'go' | 'rust' | 'custom' = 'custom';
  $: dockerignore = generateDockerignore(currentStack);

  function generateDockerignore(stack: string) {
    const baseIgnore = `.git
.gitignore
.env
Dockerfile
docker-compose.yml
.dockerignore
.DS_Store
*.md
.github
`;
    let stackIgnore = '';
    switch (stack) {
      case 'nodejs':
      case 'nextjs':
        stackIgnore = `node_modules/
npm-debug.log
yarn-debug.log
yarn-error.log
pnpm-debug.log
dist/
build/
coverage/
.next/
out/
`;
        break;
      case 'python':
        stackIgnore = `__pycache__/
*.py[cod]
*$py.class
.pytest_cache/
.coverage
htmlcov/
.tox/
.env
venv/
env/
.venv/
`;
        break;
      case 'go':
        stackIgnore = `bin/
obj/
*.test
*.out
vendor/
`;
        break;
      case 'rust':
        stackIgnore = `target/
Cargo.lock
**/*.rs.bk
`;
        break;
    }
    return baseIgnore + stackIgnore;
  }

  // Smart Parser
  let pasteContent = '';
  let parseError = '';
  let isDraggingFile = false;

  function handleFileDrop(e: DragEvent) {
    e.preventDefault();
    isDraggingFile = false;
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        analyzeProjectFile(file.name, text);
      };
      reader.readAsText(file);
    }
  }

  function analyzeProjectFile(filename: string, content: string) {
    parseError = '';
    try {
      if (filename.toLowerCase() === 'package.json') {
        const pkg = JSON.parse(content);
        const hasNext = pkg.dependencies?.next;

        if (hasNext) {
           applyTemplate('nextjs');
        } else {
           applyTemplate('nodejs');
        }

        // Try to infer start command
        if (pkg.scripts && pkg.scripts.start) {
            cmd = 'npm start';
        }
        showToast(`Analyzed ${filename} successfully!`, 'success');

      } else if (filename.toLowerCase() === 'requirements.txt' || filename.toLowerCase() === 'pipfile') {
        applyTemplate('python');
        showToast(`Analyzed ${filename} successfully!`, 'success');
      } else if (filename.toLowerCase() === 'go.mod') {
        applyTemplate('go');
        showToast(`Analyzed ${filename} successfully!`, 'success');
      } else if (filename.toLowerCase() === 'cargo.toml') {
        applyTemplate('rust');
        showToast(`Analyzed ${filename} successfully!`, 'success');
      } else {
         parseError = d.unsupportedFile || "Unsupported file format. Try package.json or requirements.txt.";
      }
    } catch {
      parseError = "Failed to parse file.";
    }
  }

  function handleOptimize() {
    let optimized = false;

    // 1. Optimize Base Image
    // Use alpine to be consistent and to guarantee that the `addgroup -S` command added below works on the generated image
    if (baseImage && !baseImage.includes('alpine')) {
        if (baseImage.startsWith('node')) baseImage = 'node:18-alpine';
        else if (baseImage.startsWith('python')) baseImage = 'python:3.11-alpine';
        else if (baseImage.startsWith('golang')) baseImage = 'golang:1.21-alpine';
        else if (baseImage.startsWith('ubuntu') || baseImage.startsWith('debian')) baseImage = 'alpine:latest';
        else if (!baseImage.includes(':')) baseImage = baseImage + ':alpine';
        else baseImage = baseImage.split(':')[0] + ':alpine'; // try best effort
        optimized = true;
    }

    // 2. Add non-root user
    const hasUserCreate = runCmds.some(cmd => cmd.includes('useradd') || cmd.includes('adduser'));
    let userDirectiveAdded = false;

    // Check if the base image uses alpine or debian/ubuntu-like system to determine the correct adduser command
    let userAddCmd = '';
    if (baseImage.includes('alpine')) {
        userAddCmd = 'addgroup -S nonroot && adduser -S nonroot -G nonroot';
    } else if (baseImage.includes('slim') || baseImage.startsWith('node') || baseImage.startsWith('python') || baseImage.startsWith('ubuntu') || baseImage.startsWith('debian')) {
        userAddCmd = 'groupadd -r nonroot && useradd -r -g nonroot nonroot';
    }

    if (!hasUserCreate && userAddCmd && !runCmds.some(cmd => cmd === 'USER nonroot')) {
        runCmds = [
            ...runCmds,
            userAddCmd
        ];
        userDirectiveAdded = true;
        optimized = true;
    }

    // 3. Merge RUN commands
    if (runCmds.length > 1) {
        const mergedRuns = [];
        let currentChain = [];
        for (const cmd of runCmds) {
            if (cmd === 'USER nonroot') {
               // Skip, this was from previous implementation
            } else {
                currentChain.push(cmd);
            }
        }
        if (currentChain.length > 0) {
            mergedRuns.push(currentChain.join(' && \\\n    '));
        }

        if (mergedRuns.length < runCmds.length || userDirectiveAdded) {
            runCmds = mergedRuns;
            optimized = true;
        }
    }

    if (optimized) {
        showToast(d.optimizeSuccess || 'Optimized configuration!', 'success');
        saveToHistory();
    } else {
        showToast(d.alreadyOptimized || 'Already optimized!', 'success');
    }
  }

  function handleSmartPaste() {
    parseError = '';
    if (!pasteContent.trim()) {
      parseError = d.emptyPaste || 'Please paste a Dockerfile content first.';
      return;
    }

    const lines = pasteContent.split('\n');
    let inBuilderStage = false;
    let foundStages = 0;

    clearForm();
    copySteps = []; // Because clearForm leaves one empty copyStep

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (!line || line.startsWith('#')) continue;

      // Handle multiline
      while (line.endsWith('\\') && i < lines.length - 1) {
          i++;
          line = line.slice(0, -1) + ' ' + lines[i].trim();
      }

      const parts = line.split(/\s+/);
      const directive = parts[0].toUpperCase();
      const args = line.substring(directive.length).trim();

      switch (directive) {
        case 'FROM':
          foundStages++;
          if (foundStages === 1 && line.toLowerCase().includes(' as ')) {
              isMultiStage = true;
              inBuilderStage = true;
              buildImage = parts[1];
          } else if (foundStages === 1) {
              baseImage = parts[1];
          } else if (foundStages === 2) {
              inBuilderStage = false;
              baseImage = parts[1];
          }
          break;
        case 'WORKDIR':
          workdir = args;
          break;
        case 'ENV':
          // Can be ENV KEY=VALUE or ENV KEY VALUE
          if (args.includes('=')) {
              const eqIndex = args.indexOf('=');
              envVars = [...envVars, { key: args.substring(0, eqIndex).trim(), value: args.substring(eqIndex + 1).trim() }];
          } else {
              const argParts = args.split(/\s+/);
              envVars = [...envVars, { key: argParts[0], value: argParts.slice(1).join(' ') }];
          }
          break;
        case 'RUN':
          if (inBuilderStage) {
              installCmds = [...installCmds, args];
          } else {
              runCmds = [...runCmds, args];
          }
          break;
        case 'COPY':
          if (args.includes('--from=')) {
              // Ignore copy from builder in our state as it's auto-generated if multi-stage
          } else {
              // Usually COPY src dest. Might use JSON array, simplistic parser here:
              if (args.startsWith('[')) {
                  // simplistic JSON array fallback
                  const unbracket = args.replace(/[[\]"]/g, '').split(',');
                  if (unbracket.length >= 2) {
                      copySteps = [...copySteps, { src: unbracket[0].trim(), dest: unbracket[unbracket.length-1].trim() }];
                  }
              } else {
                  const cParts = args.split(/\s+/);
                  if (cParts.length >= 2) {
                      copySteps = [...copySteps, { src: cParts.slice(0, -1).join(' '), dest: cParts[cParts.length-1] }];
                  }
              }
          }
          break;
        case 'EXPOSE':
          exposePorts = [...exposePorts, ...args.split(/\s+/)];
          break;
        case 'ENTRYPOINT':
          // Simplistic
          entrypoint = args.replace(/[[\]"]/g, '').split(',').map(s=>s.trim()).join(' ');
          break;
        case 'CMD':
          cmd = args.replace(/[[\]"]/g, '').split(',').map(s=>s.trim()).join(' ');
          break;
        case 'HEALTHCHECK': {
          isHealthcheck = true;
          // Basic parser for HEALTHCHECK
          const hcArgs = args.split(/\s+/);
          let parsedCmd = [];
          for (let hcArg of hcArgs) {
            if (hcArg.startsWith('--interval=')) hcInterval = hcArg.split('=')[1];
            else if (hcArg.startsWith('--timeout=')) hcTimeout = hcArg.split('=')[1];
            else if (hcArg.startsWith('--retries=')) hcRetries = hcArg.split('=')[1];
            else if (hcArg.startsWith('--start-period=')) hcStartPeriod = hcArg.split('=')[1];
            else if (hcArg === 'CMD') parsedCmd = []; // start collecting cmd
            else parsedCmd.push(hcArg);
          }
          if (parsedCmd.length > 0) hcCmd = parsedCmd.join(' ');
          break;
        }
      }
    }

    if (copySteps.length === 0 && !isMultiStage) {
      copySteps = [{ src: '.', dest: '.' }];
    }

    pasteContent = ''; // clear after success
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

  function getHealthcheckConfig() {
    return { isHealthcheck, hcCmd, hcInterval, hcTimeout, hcRetries, hcStartPeriod };
  }

  function applyTemplate(type: keyof typeof templates) {
    currentStack = type;
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

    // Auto-save when template is applied
    setTimeout(() => {
      saveToHistory();
    }, 100);
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
    iCmds: string[],
    hcConfig: ReturnType<typeof getHealthcheckConfig>
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

    // Add USER nonroot if optimized
    // Best effort check to see if we should add USER nonroot
    const hasUserCreateCmd = runs.some(run => run.includes('adduser') || run.includes('useradd'));
    if (hasUserCreateCmd && !lines.some(line => line.startsWith('USER '))) {
        lines.push(`USER nonroot`);
    }
    ports.forEach(port => {
      if (port) lines.push(`EXPOSE ${port}`);
    });

    if (hcConfig.isHealthcheck && hcConfig.hcCmd) {
      lines.push(`HEALTHCHECK --interval=${hcConfig.hcInterval} --timeout=${hcConfig.hcTimeout} --start-period=${hcConfig.hcStartPeriod} --retries=${hcConfig.hcRetries} \\`);
      lines.push(`  CMD ${hcConfig.hcCmd}`);
    }

    if (ep) lines.push(`ENTRYPOINT [${ep.split(' ').map(s => `"${s}"`).join(', ')}]`);
    if (c) lines.push(`CMD [${c.split(' ').map(s => `"${s}"`).join(', ')}]`);
    return lines.join('\n');
  }


  function generateCompose(ports: string[], wd: string, svcs: Record<string, boolean>) {
    let lines = [
      'version: "3.8"',
      'services:',
      '  app:',
      '    build: .',
    ];

    const activeServices = Object.keys(svcs).filter(k => svcs[k]);

    if (activeServices.length > 0) {
      lines.push('    depends_on:');
      activeServices.forEach(svc => lines.push(`      - ${svc}`));
    }

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

    if (activeServices.length > 0) {
      lines.push('    environment:');
      if (svcs.postgres) lines.push('      - POSTGRES_URL=postgres://user:password@postgres:5432/dbname');
      if (svcs.mysql) lines.push('      - MYSQL_URL=mysql://user:password@mysql:3306/dbname');
      if (svcs.mongodb) lines.push('      - MONGO_URL=mongodb://root:example@mongodb:27017/');
      if (svcs.redis) lines.push('      - REDIS_URL=redis://redis:6379');
    }
    lines.push('    restart: unless-stopped');

    if (svcs.postgres) {
      lines.push('');
      lines.push('  postgres:');
      lines.push('    image: postgres:15-alpine');
      lines.push('    environment:');
      lines.push('      - POSTGRES_USER=user');
      lines.push('      - POSTGRES_PASSWORD=password');
      lines.push('      - POSTGRES_DB=dbname');
      lines.push('    volumes:');
      lines.push('      - pgdata:/var/lib/postgresql/data');
      lines.push('    restart: unless-stopped');
    }

    if (svcs.mysql) {
      lines.push('');
      lines.push('  mysql:');
      lines.push('    image: mysql:8');
      lines.push('    environment:');
      lines.push('      - MYSQL_USER=user');
      lines.push('      - MYSQL_PASSWORD=password');
      lines.push('      - MYSQL_DATABASE=dbname');
      lines.push('      - MYSQL_ROOT_PASSWORD=rootpassword');
      lines.push('    volumes:');
      lines.push('      - mysqldata:/var/lib/mysql');
      lines.push('    restart: unless-stopped');
    }

    if (svcs.mongodb) {
      lines.push('');
      lines.push('  mongodb:');
      lines.push('    image: mongo:latest');
      lines.push('    environment:');
      lines.push('      - MONGO_INITDB_ROOT_USERNAME=root');
      lines.push('      - MONGO_INITDB_ROOT_PASSWORD=example');
      lines.push('    volumes:');
      lines.push('      - mongodata:/data/db');
      lines.push('    restart: unless-stopped');
    }

    if (svcs.redis) {
      lines.push('');
      lines.push('  redis:');
      lines.push('    image: redis:alpine');
      lines.push('    restart: unless-stopped');
    }

    if (svcs.postgres || svcs.mysql || svcs.mongodb) {
      lines.push('');
      lines.push('volumes:');
      if (svcs.postgres) lines.push('  pgdata:');
      if (svcs.mysql) lines.push('  mysqldata:');
      if (svcs.mongodb) lines.push('  mongodata:');
    }

    return lines.join('\n');
  }

  // Kubernetes Manifest Generator
  $: k8sManifests = generateK8s(exposePorts, services, envVars);

  function generateK8s(ports: string[], svcs: Record<string, boolean>, envs: { key: string; value: string }[]) {
    const appName = 'app';
    let deployment = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${appName}
  labels:
    app: ${appName}
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ${appName}
  template:
    metadata:
      labels:
        app: ${appName}
    spec:
      containers:
      - name: ${appName}
        image: ${appName}:latest
        ports:`;

    for (const port of ports) {
      if (port) {
        deployment += `
        - containerPort: ${port}`;
      }
    }

    if (ports.length === 0) {
      deployment += `
        - containerPort: 80`;
    }

    if (envs.length > 0 || Object.values(svcs).some(v => v)) {
      deployment += `
        env:`;
      for (const env of envs) {
        if (env.key) {
          deployment += `
        - name: ${env.key}
          value: "${env.value}"`;
        }
      }
      if (svcs.postgres) deployment += `
        - name: POSTGRES_URL
          value: "postgres://user:password@postgres:5432/dbname"`;
      if (svcs.mysql) deployment += `
        - name: MYSQL_URL
          value: "mysql://user:password@mysql:3306/dbname"`;
      if (svcs.mongodb) deployment += `
        - name: MONGO_URL
          value: "mongodb://root:example@mongodb:27017/"`;
      if (svcs.redis) deployment += `
        - name: REDIS_URL
          value: "redis://redis:6379"`;
    }

    let service = `apiVersion: v1
kind: Service
metadata:
  name: ${appName}-svc
spec:
  selector:
    app: ${appName}
  ports:`;

    for (const port of ports) {
      if (port) {
        service += `
  - port: ${port}
    targetPort: ${port}`;
      }
    }

    if (ports.length === 0) {
      service += `
  - port: 80
    targetPort: 80`;
    }

    service += `
  type: ClusterIP`;

    return { deployment, service };
  }


  let toastMessage = '';
  let toastType: 'success' | 'error' = 'success';
  let toastTimeout: ReturnType<typeof setTimeout>;

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    toastMessage = message;
    toastType = type;
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastMessage = '';
    }, 3000);
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(d.copied || 'Copied successfully!', 'success');
    } catch (err) {
      console.error('Failed to copy', err);
      showToast('Failed to copy', 'error');
    }
  }

  function downloadFile(content: string, filename: string) {
    try {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      showToast(d.downloadSuccess || `Downloaded ${filename}`, 'success');
    } catch (err) {
      console.error('Failed to download', err);
      showToast('Failed to download', 'error');
    }
  }

  async function shareCode() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Docker Forge Code',
          text: dockerfile
        });
        showToast(d.shareSuccess || 'Shared successfully!', 'success');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing', err);
          showToast('Failed to share', 'error');
        }
      }
    } else {
      copyToClipboard(dockerfile);
    }
  }

  function removeInstall(index: number) {
    installCmds = installCmds.filter((_, i) => i !== index);
  }


  function generateEnvExample(envs: { key: string; value: string }[], svcs: Record<string, boolean>) {
    let lines = [
      '# Environment Variables',
      '# Copy this file to .env and replace with actual secrets',
      ''
    ];
    envs.forEach(env => {
      if (env.key) lines.push(`${env.key}=${env.value || 'your_value_here'}`);
    });

    if (svcs.postgres || svcs.mysql || svcs.mongodb || svcs.redis) {
      lines.push('');
      lines.push('# Database URLs (Local Compose Setup)');
    }
    if (svcs.postgres) lines.push('POSTGRES_URL=postgres://user:password@postgres:5432/dbname');
    if (svcs.mysql) lines.push('MYSQL_URL=mysql://user:password@mysql:3306/dbname');
    if (svcs.mongodb) lines.push('MONGO_URL=mongodb://root:example@mongodb:27017/');
    if (svcs.redis) lines.push('REDIS_URL=redis://redis:6379');

    return lines.join('\n');
  }

  async function downloadZip() {
    const zip = new JSZip();
    zip.file("Dockerfile", dockerfile);
    zip.file("docker-compose.yml", compose);
    zip.file(".dockerignore", dockerignore);
    zip.file("Makefile", makefileCode);

    const envExample = generateEnvExample(envVars, services);
    zip.file(".env.example", envExample);


    // K8s Export
    const k8sFolder = zip.folder("k8s");
    if (k8sFolder) {
        k8sFolder.file("deployment.yaml", k8sManifests.deployment);
        k8sFolder.file("service.yaml", k8sManifests.service);
    }

    // CI/CD Export based on provider
    if (ciProvider === 'github') {
        const githubFolder = zip.folder(".github");
        if (githubFolder) {
            const workflowsFolder = githubFolder.folder("workflows");
            if (workflowsFolder) {
                 workflowsFolder.file("build.yml", ciPipelineCode);
            }
        }
    } else if (ciProvider === 'gitlab') {
        zip.file(".gitlab-ci.yml", ciPipelineCode);
    }

    // Add a README
    const readme = `# Docker Forge Project

Generated by Docker Forge (https://web-factory.vercel.app/en/tools/docker-forge)

## Getting Started
1. Review the \`Dockerfile\` and \`docker-compose.yml\`.
2. Run \`docker-compose up -d --build\` to build and start your containers.
3. Access your app!
`;
    zip.file("README.md", readme);

    try {
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'docker-forge-project.zip';
      a.click();
      URL.revokeObjectURL(url);
      showToast(d.downloadSuccess || 'Downloaded ZIP successfully!', 'success');
    } catch (err) {
      console.error('Error generating zip:', err);
      showToast('Failed to generate ZIP', 'error');
    }
  }


  let historyPanel: HistoryPanel;

  async function saveToHistory() {
    try {
      const input = { baseImage, workdir, envVars, runCmds, copySteps, exposePorts, entrypoint, cmd, isMultiStage, buildImage, installCmds, services };
      const result = { dockerfile, compose, k8s: k8sManifests };

      await workspaceSave('docker-forge', input, result);

      if (historyPanel) historyPanel.refreshHistory();
      showToast(d.saveSuccess || 'Saved to Workspace', 'success');
    } catch (e) {
      console.error('Failed to save history', e);
      showToast('Failed to save', 'error');
    }
  }

  interface DockerResult {
    dockerfile: string;
    compose?: string;
    k8s?: { deployment: string, service: string };
  }

  function handleRestore(item: ToolHistoryItem) {
    const result = item.result as DockerResult;
    if (result && result.dockerfile) {
      pasteContent = result.dockerfile;
      handleSmartPaste();
    }
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

  const examples = [
    {
      name: "SvelteKit App",
      dockerfile: `FROM node:18-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\nRUN npm prune --production\n\nFROM node:18-alpine\nWORKDIR /app\nCOPY --from=builder /app/build build/\nCOPY --from=builder /app/node_modules node_modules/\nCOPY package.json .\nEXPOSE 3000\nENV NODE_ENV=production\nCMD ["node", "build/index.js"]`
    },
    {
      name: "FastAPI + Gunicorn",
      dockerfile: `FROM python:3.11-slim\nWORKDIR /app\nENV PYTHONDONTWRITEBYTECODE=1\nENV PYTHONUNBUFFERED=1\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\nCOPY . .\nEXPOSE 8000\nCMD ["gunicorn", "main:app", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]`
    },
    {
      name: "Go Microservice",
      dockerfile: `FROM golang:1.21-alpine AS builder\nWORKDIR /app\nCOPY go.mod go.sum ./\nRUN go mod download\nCOPY . .\nRUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .\n\nFROM alpine:latest\nRUN apk --no-cache add ca-certificates\nWORKDIR /root/\nCOPY --from=builder /app/main .\nEXPOSE 8080\nCMD ["./main"]`
    }
  ];

  function loadExample(content: string) {
    pasteContent = content;
    handleSmartPaste();
  }
</script>

<!-- Toast Notification -->
{#if toastMessage}
  <div
    class="fixed bottom-4 right-4 px-6 py-3 rounded-xl shadow-lg border text-sm font-medium z-50 transition-all flex items-center gap-2"
    class:bg-green-50={toastType === 'success'}
    class:border-green-200={toastType === 'success'}
    class:text-green-800={toastType === 'success'}
    class:dark:bg-green-900_30={toastType === 'success'}
    class:dark:border-green-800={toastType === 'success'}
    class:dark:text-green-300={toastType === 'success'}
    class:bg-red-50={toastType === 'error'}
    class:border-red-200={toastType === 'error'}
    class:text-red-800={toastType === 'error'}
    class:dark:bg-red-900_30={toastType === 'error'}
    class:dark:border-red-800={toastType === 'error'}
    class:dark:text-red-300={toastType === 'error'}
    transition:fade={{ duration: 200 }}
    role="alert"
    aria-live="polite"
  >
    {#if toastType === 'success'}
      <span class="text-green-500">✓</span>
    {:else}
      <span class="text-red-500">⚠</span>
    {/if}
    {toastMessage}
  </div>
{/if}

<div class="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
  <div class="lg:col-span-2 space-y-6">

    <!-- Smart Examples -->
    <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700/80 rounded-xl shadow-sm border border-blue-100 dark:border-slate-600 p-4">
      <div class="flex items-center justify-between mb-3 min-h-[44px]">
        <div class="flex items-center gap-2">
          <Star size={18} class="text-blue-500" />
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">{d.quickStart || 'Quick Start Examples'}</h3>
        </div>
      </div>
      <div class="flex flex-wrap gap-2">
        {#each examples as example (example.name)}
          <button style="min-height: 44px; min-width: 44px;"
            class="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2 min-h-[44px] min-w-[44px]"
            on:click={() => loadExample(example.dockerfile)}
            aria-label={`Load example: ${example.name}`}
          >
            {example.name}
          </button>
        {/each}
      </div>
    </div>

    <!-- Smart Analyzer / Dropzone -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border-2 border-dashed transition-colors p-4 relative"
      class:border-blue-400={isDraggingFile}
      class:bg-blue-50={isDraggingFile}
      class:dark:bg-blue-900_20={isDraggingFile}
      class:border-slate-300={!isDraggingFile}
      class:dark:border-slate-700={!isDraggingFile}
      on:dragenter|preventDefault={() => isDraggingFile = true}
      on:dragleave|preventDefault={() => isDraggingFile = false}
      on:dragover|preventDefault
      on:drop|preventDefault={handleFileDrop}
    >
      <div class="flex flex-col gap-2">
        <label for="smartPaste" class="text-sm font-bold text-slate-900 dark:text-white">
          {d.smartAnalyzer || "Smart Project Analyzer"}
        </label>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          {d.smartAnalyzerDesc || "Drag and drop your package.json, requirements.txt, go.mod, or Cargo.toml here to auto-configure the environment. Or paste an existing Dockerfile below."}
        </p>

        <div class="relative mt-2">
            <textarea
              id="smartPaste"
              bind:value={pasteContent}
              class="w-full h-24 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 z-10 relative"
              placeholder="FROM node:18&#10;WORKDIR /app&#10;COPY package.json .&#10;RUN npm install..."
            ></textarea>

            {#if isDraggingFile}
              <div class="absolute inset-0 z-20 bg-blue-50 dark:bg-blue-900/50 rounded-lg flex items-center justify-center border-2 border-blue-400 border-dashed backdrop-blur-sm pointer-events-none">
                 <span class="text-blue-600 dark:text-blue-400 font-bold">Drop file to analyze!</span>
              </div>
            {/if}
        </div>

        <div class="flex items-center justify-between mt-2">
          <span class="text-xs text-red-500">{parseError}</span>
          <div class="flex gap-2">
            <Button variant="secondary" class="text-sm min-h-[44px] min-w-[44px] flex items-center justify-center border-blue-500 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/30" aria-label={d.optimizeAction || "1-Click Auto-Optimize"} on:click={handleOptimize} title={d.optimizeDesc || "Automatically refactor to best practices"}>
              <span class="mr-1">✨</span> {d.optimizeAction || "1-Click Auto-Optimize"}
            </Button>
            <Button variant="primary" class="text-sm min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label={d.parseAction || "Parse Dockerfile"} on:click={handleSmartPaste}>
              {d.parseAction || "Parse Dockerfile"}
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Magic Templates -->
    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
      <div class="flex flex-col mb-2 min-h-[44px] justify-center">
        <span class="text-sm font-bold text-slate-900 dark:text-white">{d.magicTemplates || "Magic Templates"}</span>
        {#if d.shortcuts?.help}
          <span class="text-xs text-slate-500 dark:text-slate-400 mt-1">{d.shortcuts?.help}: Ctrl/Cmd + Enter to save, Ctrl/Cmd + S to copy, Ctrl/Cmd + K to clear</span>
        {:else}
          <span class="text-xs text-slate-500 dark:text-slate-400 mt-1">Keyboard Shortcuts: Ctrl/Cmd + Enter to save, Ctrl/Cmd + S to copy, Ctrl/Cmd + K to clear</span>
        {/if}
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <button
          class="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          on:click={() => applyTemplate('nodejs')}
          aria-label="Magic Template Node.js"
        >
          Node.js
        </button>
        <button
          class="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          on:click={() => applyTemplate('nextjs')}
          aria-label="Magic Template Next.js"
        >
          Next.js
        </button>
        <button
          class="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          on:click={() => applyTemplate('python')}
          aria-label="Magic Template Python FastAPI"
        >
          Python FastAPI
        </button>
        <button
          class="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          on:click={() => applyTemplate('go')}
          aria-label="Magic Template Go"
        >
          Go
        </button>
        <button
          class="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          on:click={() => applyTemplate('rust')}
          aria-label="Magic Template Rust"
        >
          Rust
        </button>
      </div>
    </div>

    <!-- Intelligent Linter / Optimizer Warnings -->
    {#if securityWarnings.length > 0}
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-amber-200 dark:border-amber-700/50 p-4 flex flex-col gap-3">
        <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
           <span class="text-amber-500">✨</span> Dockerfile Optimizer
        </h3>
        <div class="space-y-2">
          {#each securityWarnings as warning (warning.text)}
            <div class="flex items-start text-sm {warning.type === 'warning' ? 'text-amber-800 dark:text-amber-300' : 'text-blue-800 dark:text-blue-300'} bg-{warning.type === 'warning' ? 'amber' : 'blue'}-50 dark:bg-{warning.type === 'warning' ? 'amber' : 'blue'}-900/20 p-2 rounded-lg border border-{warning.type === 'warning' ? 'amber' : 'blue'}-100 dark:border-{warning.type === 'warning' ? 'amber' : 'blue'}-800/50">
              <span class="mr-2 mt-0.5">{warning.type === 'warning' ? '⚠️' : '💡'}</span>
              <span>{warning.text}</span>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Multi-stage Toggle -->
          <div class="flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg min-h-[44px]">
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">{d.multiStage || 'Multi-Stage Build'}</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Separate build dependencies from runtime.</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer min-h-[44px] min-w-[44px] justify-center" aria-label="Toggle Multi-Stage">
              <input type="checkbox" class="sr-only peer" bind:checked={isMultiStage}>
              <div class="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <!-- Add Database / Services Toggles -->
          <div class="flex flex-col bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg space-y-3">
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">{d.composeServicesLabel || 'Add Services to Compose'}</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">{d.composeServicesDesc || 'Include popular databases in docker-compose.yml'}</p>
            </div>
            <div class="grid grid-cols-2 gap-3">
              {#each Object.keys(services) as svc (svc)}
                <div class="flex items-center justify-between min-h-[44px]">
                  <span class="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">{svc}</span>
                  <label class="relative inline-flex items-center cursor-pointer min-h-[44px] min-w-[44px] justify-center" aria-label={`Toggle ${svc}`}>
                    <input type="checkbox" class="sr-only peer" bind:checked={services[svc]}>
                    <div class="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              {/each}
            </div>
          </div>
        </div>

        <!-- Compose Service Architecture Visualizer -->
        <div class="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4 border border-slate-200 dark:border-slate-700 relative overflow-hidden">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Box size={16} class="text-indigo-500" /> {d.architectureVisualizer || 'Service Architecture'}
            </h3>
          </div>
          <div class="flex flex-col items-center justify-center p-4 relative min-h-[160px]">
             <!-- Main App Node -->
             <div class="z-10 bg-blue-500 text-white px-6 py-3 rounded-xl shadow-md font-bold border-2 border-blue-600 flex items-center gap-2">
                <Box size={20} />
                App
             </div>

             {#if Object.values(services).some(v => v)}
               <!-- Connectors Wrapper -->
               <div class="w-full flex justify-center mt-8 gap-4 relative">
                  <!-- Horizontal connection line connecting branches -->
                  <div class="absolute w-[calc(100%-80px)] max-w-[300px] h-[2px] bg-slate-300 dark:bg-slate-600 top-[-16px] z-0 mx-auto"></div>
                  <!-- Vertical trunk to app -->
                  <div class="absolute w-[2px] h-[16px] bg-slate-300 dark:bg-slate-600 top-[-32px] z-0 mx-auto"></div>

                  <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
                  {#each Object.entries(services).filter(([_, v]) => v) as [svc] (svc)}
                     <div class="z-10 flex flex-col items-center relative px-2" transition:fade>
                        <!-- Branch to service -->
                        <div class="w-[2px] h-[16px] bg-slate-300 dark:bg-slate-600 absolute top-[-16px]"></div>
                        <div class="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 text-sm font-medium capitalize flex items-center gap-2">
                          {#if svc === 'postgres' || svc === 'mysql'}
                             <span class="text-blue-500">🗄️</span>
                          {:else if svc === 'mongodb'}
                             <span class="text-green-500">🍃</span>
                          {:else if svc === 'redis'}
                             <span class="text-red-500">⚡</span>
                          {/if}
                          {svc}
                        </div>
                     </div>
                  {/each}
               </div>
             {:else}
               <div class="mt-4 text-xs text-slate-400 dark:text-slate-500 italic">
                 {d.noServicesAdded || 'No additional services connected'}
               </div>
             {/if}
          </div>
        </div>

        <!-- Healthcheck Configurator -->
        <div class="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
        <div class="flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg min-h-[44px]">
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {d.healthcheck || 'Healthcheck'}
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">{d.healthcheckDesc || 'Configure Healthcheck to monitor container state'}</p>
            </div>
          <label class="relative inline-flex items-center cursor-pointer min-h-[44px] min-w-[44px] justify-center" aria-label="Toggle Healthcheck">
              <input type="checkbox" class="sr-only peer" bind:checked={isHealthcheck}>
              <div class="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          {#if isHealthcheck}
            <div class="p-4 border-t border-slate-200 dark:border-slate-700 space-y-4" transition:fade>
              <div>
                <label for="hcCmd" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{d.healthcheckCmd || 'Check Command (e.g. curl -f http://localhost:3000/ || exit 1)'}</label>
                <input
                  id="hcCmd"
                  type="text"
                  bind:value={hcCmd}
                  class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                  placeholder="curl -f http://localhost:3000/health || exit 1"
                />
              </div>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label for="hcInterval" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{d.healthcheckInterval || 'Interval (s)'}</label>
                  <input
                    id="hcInterval"
                    type="text"
                    bind:value={hcInterval}
                    class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                  />
                </div>
                <div>
                  <label for="hcTimeout" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{d.healthcheckTimeout || 'Timeout (s)'}</label>
                  <input
                    id="hcTimeout"
                    type="text"
                    bind:value={hcTimeout}
                    class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                  />
                </div>
                <div>
                  <label for="hcStartPeriod" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{d.healthcheckStartPeriod || 'Start Period (s)'}</label>
                  <input
                    id="hcStartPeriod"
                    type="text"
                    bind:value={hcStartPeriod}
                    class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                  />
                </div>
                <div>
                  <label for="hcRetries" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{d.healthcheckRetries || 'Retries'}</label>
                  <input
                    id="hcRetries"
                    type="number"
                    bind:value={hcRetries}
                    class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                  />
                </div>
              </div>
            </div>
          {/if}
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

                {#each installCmds as installItem, i (i + installItem)}
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

        <!-- Layer Size Visualizer -->
        <div class="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
           <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                 <Box size={16} class="text-blue-500" /> {d.sizeEstimator || 'Storage Profile Estimate'}
              </h3>
              <span class="text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                 {d.totalSize || 'Total'}: {estimatedSizeStr}
              </span>
           </div>

           <div class="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex mb-2">
              {#each layerBreakdown as layer (layer.name)}
                 <div
                   class="{layer.color} h-full transition-all duration-500"
                   style="width: {(layer.size / totalBreakdownSize) * 100}%"
                   title="{layer.name}: ~{layer.size}MB"
                 ></div>
              {/each}
           </div>
           <div class="flex items-center gap-4 flex-wrap text-xs text-slate-500 dark:text-slate-400">
              {#each layerBreakdown as layer (layer.name)}
                 <div class="flex items-center gap-1">
                    <div class="w-2 h-2 rounded-full {layer.color}"></div>
                    <span>{layer.name} ({Math.round((layer.size / totalBreakdownSize) * 100)}%)</span>
                 </div>
              {/each}
           </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div class="flex justify-between items-center mb-1">
              <label for="baseImage" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {#if isMultiStage}Runtime Image{:else}{d.baseImage}{/if}
              </label>
            </div>
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
              {#each envVars as env, i (i)}
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
                {#each copySteps as copy, i (i)}
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

              <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
              {#each runCmds as _, i (i)}
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

              <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
              {#each exposePorts as _, i (i)}
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
            <Copy size={16} />
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
      <div class="p-0 overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <tbody class="text-slate-300 font-mono text-sm">
            {#each dockerfileLinesWithSizes as { line, size }, i (i)}
              <tr class="hover:bg-slate-800/50 transition-colors group">
                <td class="py-1 px-4 whitespace-pre">
                  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                  <code class="language-docker">{@html Prism.highlight(line, Prism.languages.docker, 'docker')}</code>
                </td>
                <td class="py-1 px-4 text-right text-xs text-slate-500 w-32 border-l border-slate-800">
                  {#if size}
                    <span class="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider select-none pointer-events-none">{size}</span>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
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
            on:click={() => copyToClipboard(compose, 'compose')}
            title={d.copyToClipboard}
            aria-label={d.copyToClipboard}
          >
            <Copy size={16} />
          </button>
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
        <pre class="text-slate-300 font-mono text-sm leading-relaxed whitespace-pre-wrap select-all"><code class="language-yaml"><!-- eslint-disable svelte/no-at-html-tags -->{@html Prism.highlight(compose, Prism.languages.yaml, 'yaml')}</code></pre>
      </div>
    </div>

    <!-- Makefile Section -->
    <div class="bg-slate-900 rounded-xl shadow-lg overflow-hidden border border-slate-700">
      <div class="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-950">
        <div class="text-slate-300 font-mono text-sm flex items-center">
          <Box size={16} class="mr-2 text-yellow-400" />
          Makefile
        </div>
        <div class="flex space-x-2">
          <button
            class="text-slate-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center p-2 transition-colors"
            on:click={() => copyToClipboard(makefileCode)}
            title={d.copyToClipboard}
            aria-label={d.copyToClipboard}
          >
            <Copy size={16} />
          </button>
          <button
            class="text-slate-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center p-2 transition-colors"
            on:click={() => downloadFile(makefileCode, 'Makefile')}
            title="Download Makefile"
            aria-label="Download Makefile"
          >
            <Download size={16} />
          </button>
        </div>
      </div>
      <div class="p-4 overflow-x-auto">
        <pre class="text-slate-300 font-mono text-sm leading-relaxed whitespace-pre-wrap select-all"><code class="language-makefile"><!-- eslint-disable svelte/no-at-html-tags -->{@html Prism.highlight(makefileCode, Prism.languages.makefile || Prism.languages.bash, 'makefile')}</code></pre>
      </div>
    </div>

    <div class="bg-slate-900 rounded-xl shadow-lg overflow-hidden border border-slate-700">
      <div class="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-950">
        <div class="text-slate-300 font-mono text-sm flex items-center">
          <Box size={16} class="mr-2 text-indigo-400" />
          <select bind:value={ciProvider} class="bg-transparent border-none outline-none text-slate-300 focus:ring-0 text-sm cursor-pointer hover:text-white min-h-[44px]" aria-label="Select CI/CD Provider">
            <option value="github">.github/workflows/build.yml</option>
            <option value="gitlab">.gitlab-ci.yml</option>
          </select>
        </div>
        <div class="flex space-x-2">
          <button
            class="text-slate-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center p-2 transition-colors"
            on:click={() => copyToClipboard(ciPipelineCode)}
            title={d.copyToClipboard}
            aria-label={d.copyToClipboard}
          >
            <Copy size={16} />
          </button>
          <button
            class="text-slate-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center p-2 transition-colors"
            on:click={() => downloadFile(ciPipelineCode, ciProvider === 'github' ? 'build.yml' : '.gitlab-ci.yml')}
            title={d.downloadGha || 'Download CI/CD Pipeline'}
            aria-label={d.downloadGha || 'Download CI/CD Pipeline'}
          >
            <Download size={16} />
          </button>
        </div>
      </div>
      <div class="p-4 overflow-x-auto">
        {#key ciPipelineCode}
          <pre class="text-slate-300 font-mono text-sm leading-relaxed whitespace-pre-wrap select-all"><code class="language-yaml"><!-- eslint-disable svelte/no-at-html-tags -->{@html Prism.highlight(ciPipelineCode, Prism.languages.yaml, 'yaml')}</code></pre>
        {/key}
      </div>
    </div>

    <!-- Deploy Script Section -->
    <div class="bg-slate-900 rounded-xl shadow-lg overflow-hidden border border-slate-700">
      <div class="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-950">
        <div class="text-slate-300 font-mono text-sm flex items-center">
          <Box size={16} class="mr-2 text-blue-400" />
          deploy.sh
        </div>
        <div class="flex space-x-2">
          <button
            class="text-slate-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center p-2 transition-colors"
            on:click={() => copyToClipboard(deployScriptCode)}
            title={d?.copyToClipboard}
            aria-label={d?.copyToClipboard}
          >
            <Copy size={16} />
          </button>
          <button
            class="text-slate-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center p-2 transition-colors"
            on:click={() => downloadFile(deployScriptCode, 'deploy.sh')}
            title={d?.downloadDeploy || 'Download Deploy Script'}
            aria-label={d?.downloadDeploy || 'Download Deploy Script'}
          >
            <Download size={16} />
          </button>
        </div>
      </div>
      <div class="p-4 overflow-x-auto">
        <pre class="text-slate-300 font-mono text-sm leading-relaxed whitespace-pre-wrap select-all"><code class="language-bash"><!-- eslint-disable svelte/no-at-html-tags -->{@html Prism.highlight(deployScriptCode, Prism.languages.bash || Prism.languages.javascript, 'bash')}</code></pre>
      </div>
    </div>

    <div class="bg-slate-900 rounded-xl shadow-lg overflow-hidden border border-slate-700">
      <div class="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-950">
        <div class="text-slate-300 font-mono text-sm flex items-center">
          <Box size={16} class="mr-2 text-green-400" />
          .dockerignore
        </div>
        <div class="flex space-x-2">
          <button
            class="text-slate-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center p-2 transition-colors"
            on:click={() => copyToClipboard(dockerignore)}
            title={d.copyToClipboard}
            aria-label={d.copyToClipboard}
          >
            <Copy size={16} />
          </button>
          <button
            class="text-slate-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center p-2 transition-colors"
            on:click={() => downloadFile(dockerignore, '.dockerignore')}
            title="Download .dockerignore"
            aria-label="Download .dockerignore"
          >
            <Download size={16} />
          </button>
        </div>
      </div>
      <div class="p-4 overflow-x-auto">
        <pre class="text-slate-300 font-mono text-sm leading-relaxed whitespace-pre-wrap select-all"><code class="language-docker"><!-- eslint-disable svelte/no-at-html-tags -->{@html Prism.highlight(dockerignore, Prism.languages.docker, 'docker')}</code></pre>
      </div>
    </div>

    <div class="bg-slate-900 rounded-xl shadow-lg overflow-hidden border border-slate-700">
      <div class="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-950">
        <div class="text-slate-300 font-mono text-sm flex items-center">
          <Box size={16} class="mr-2 text-blue-400" />
          {d.k8sManifests || 'Kubernetes Manifests'}
        </div>
        <div class="flex space-x-2">
          <button
            class="text-slate-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center p-2 transition-colors"
            on:click={() => copyToClipboard(k8sManifests.deployment + '\n---\n' + k8sManifests.service)}
            title={d.copyToClipboard || 'Copy to Clipboard'}
            aria-label={d.copyToClipboard || 'Copy to Clipboard'}
          >
            <Copy size={16} />
          </button>
          <button
            class="text-slate-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center p-2 transition-colors"
            on:click={() => downloadFile(k8sManifests.deployment + '\n---\n' + k8sManifests.service, 'k8s-manifests.yaml')}
            title={d.downloadK8s || 'Download K8s YAML'}
            aria-label={d.downloadK8s || 'Download K8s YAML'}
          >
            <Download size={16} />
          </button>
        </div>
      </div>
      <div class="p-4 overflow-x-auto">
        <pre class="text-slate-300 font-mono text-sm leading-relaxed whitespace-pre-wrap select-all"><code class="language-yaml"><!-- eslint-disable svelte/no-at-html-tags -->{@html Prism.highlight(k8sManifests.deployment + '\n---\n' + k8sManifests.service, Prism.languages.yaml, 'yaml')}</code></pre>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div class="grid grid-cols-2 gap-2">
        <Button variant="primary" class="w-full min-h-[44px] flex items-center justify-center gap-2" aria-label={d.save} on:click={saveToHistory}>
          <Save size={18} /> {d.save}
        </Button>
        <Button variant="secondary" class="w-full min-h-[44px] flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white border-none" aria-label={d.downloadZip || 'Download ZIP'} on:click={downloadZip}>
          <FileArchive size={18} /> {d.downloadZip || 'Download ZIP'}
        </Button>
      </div>
    </div>



    <HistoryPanel {lang} onRestore={handleRestore} bind:this={historyPanel} />
  </div>
</div>
