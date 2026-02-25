import type { GitignoreTemplate } from './types';

export const TEMPLATES: GitignoreTemplate[] = [
    {
        id: 'node',
        name: 'Node.js',
        tags: ['language', 'javascript', 'backend'],
        content: `# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*
.env
.DS_Store
dist/
build/
coverage/
`
    },
    {
        id: 'python',
        name: 'Python',
        tags: ['language', 'backend', 'data-science'],
        content: `# Python
__pycache__/
*.py[cod]
*$py.class
venv/
.venv/
env/
.env
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg
`
    },
    {
        id: 'macos',
        name: 'macOS',
        tags: ['os'],
        content: `# macOS
.DS_Store
.AppleDouble
.LSOverride
Icon
._*
.Spotlight-V100
.Trashes
`
    },
    {
        id: 'windows',
        name: 'Windows',
        tags: ['os'],
        content: `# Windows
Thumbs.db
ehthumbs.db
Desktop.ini
$RECYCLE.BIN/
`
    },
    {
        id: 'vscode',
        name: 'Visual Studio Code',
        tags: ['ide'],
        content: `# VS Code
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
`
    },
    {
        id: 'jetbrains',
        name: 'JetBrains (IntelliJ, WebStorm)',
        tags: ['ide'],
        content: `# JetBrains
.idea/
*.iws
*.iml
*.ipr
`
    },
    {
        id: 'java',
        name: 'Java',
        tags: ['language'],
        content: `# Java
*.class
*.log
*.ctxt
.mtj.tmp/
*.jar
*.war
*.nar
*.ear
*.zip
*.tar.gz
*.rar
`
    },
    {
        id: 'go',
        name: 'Go',
        tags: ['language'],
        content: `# Go
bin/
pkg/
src/
`
    },
    {
        id: 'rust',
        name: 'Rust',
        tags: ['language'],
        content: `# Rust
/target
**/*.rs.bk
Cargo.lock
`
    },
    {
        id: 'svelte',
        name: 'SvelteKit',
        tags: ['framework'],
        content: `# SvelteKit
.svelte-kit/
build/
.env
.env.*
!.env.example
vite.config.ts.timestamp-*
vite.config.js.timestamp-*
`
    }
];
