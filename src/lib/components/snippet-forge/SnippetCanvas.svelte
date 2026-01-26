<script lang="ts">
  import CodeEditor from './CodeEditor.svelte';
  import { snippetStore } from '$lib/utils/snippet-forge/store';
  import { THEMES, BACKGROUNDS } from '$lib/utils/snippet-forge/constants';

  $: config = $snippetStore;

  // Find background value
  $: bgStyle = BACKGROUNDS.find(b => b.id === config.background)?.value || 'transparent';
  $: themeObj = THEMES.find(t => t.id === config.theme) || THEMES[0];
</script>

<div class="w-full h-full flex justify-center items-center overflow-auto p-4 md:p-12 bg-slate-100 dark:bg-black/50 min-h-[500px]" id="canvas-container">
    <!-- Capture Target -->
    <div
        id="snippet-capture"
        class="relative transition-all duration-300 ease-in-out shadow-sm"
        style="
            background: {bgStyle};
            padding: {config.padding}px;
        "
    >
        <!-- Window -->
        <div
            class="relative overflow-hidden rounded-lg transition-all duration-300 theme-{config.theme}"
            style="
                background-color: {themeObj.bg};
                color: {themeObj.text};
                box-shadow: {config.dropShadow ? '0 20px 60px -10px rgba(0,0,0,0.5)' : 'none'};
                width: auto;
                min-width: 300px;
                max-width: 100%;
            "
        >
            <!-- Window Controls -->
            {#if config.windowControls !== 'none'}
                <div class="flex items-center gap-2 px-4 py-3 bg-black/5 border-b border-white/5">
                    {#if config.windowControls === 'mac'}
                        <div class="flex gap-2">
                            <div class="w-3 h-3 rounded-full bg-[#ff5f56] shadow-sm"></div>
                            <div class="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-sm"></div>
                            <div class="w-3 h-3 rounded-full bg-[#27c93f] shadow-sm"></div>
                        </div>
                    {:else if config.windowControls === 'win'}
                        <div class="flex gap-2 opacity-50 text-xs font-mono">
                             <!-- Simple circles for Win style representation or actual icons -->
                             <div class="w-3 h-3 bg-current opacity-20"></div>
                             <div class="w-3 h-3 bg-current opacity-20"></div>
                        </div>
                    {/if}
                    <!-- Title -->
                    {#if config.windowTitle}
                        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                             <span class="text-xs opacity-60 font-sans font-medium">{config.windowTitle}</span>
                        </div>
                    {/if}
                </div>
            {/if}

            <!-- Editor -->
            <CodeEditor
                bind:code={$snippetStore.code}
                language={config.language}
                fontSize={config.fontSize}
                fontFamily={config.fontFamily}
            />
        </div>

        <!-- Watermark (Optional, hidden by default or add logic later) -->
        <!-- <div class="absolute bottom-2 right-4 text-[10px] text-white/30 font-sans">Snippet Forge</div> -->
    </div>
</div>

<style>
    /* Theme: Dracula */
    :global(.theme-dracula .token.comment),
    :global(.theme-dracula .token.prolog),
    :global(.theme-dracula .token.doctype),
    :global(.theme-dracula .token.cdata) { color: #6272a4; }
    :global(.theme-dracula .token.punctuation) { color: #f8f8f2; }
    :global(.theme-dracula .token.property),
    :global(.theme-dracula .token.tag),
    :global(.theme-dracula .token.constant),
    :global(.theme-dracula .token.symbol),
    :global(.theme-dracula .token.deleted) { color: #ff79c6; }
    :global(.theme-dracula .token.boolean),
    :global(.theme-dracula .token.number) { color: #bd93f9; }
    :global(.theme-dracula .token.selector),
    :global(.theme-dracula .token.attr-name),
    :global(.theme-dracula .token.string),
    :global(.theme-dracula .token.char),
    :global(.theme-dracula .token.builtin),
    :global(.theme-dracula .token.inserted) { color: #f1fa8c; }
    :global(.theme-dracula .token.operator),
    :global(.theme-dracula .token.entity),
    :global(.theme-dracula .token.url),
    :global(.theme-dracula .language-css .token.string),
    :global(.theme-dracula .style .token.string),
    :global(.theme-dracula .token.variable) { color: #f8f8f2; }
    :global(.theme-dracula .token.atrule),
    :global(.theme-dracula .token.attr-value),
    :global(.theme-dracula .token.function),
    :global(.theme-dracula .token.class-name) { color: #50fa7b; }
    :global(.theme-dracula .token.keyword) { color: #ff79c6; }
    :global(.theme-dracula .token.regex),
    :global(.theme-dracula .token.important) { color: #ffb86c; }

    /* Theme: Monokai */
    :global(.theme-monokai .token.comment) { color: #75715e; }
    :global(.theme-monokai .token.keyword) { color: #f92672; }
    :global(.theme-monokai .token.string) { color: #e6db74; }
    :global(.theme-monokai .token.function) { color: #a6e22e; }
    :global(.theme-monokai .token.number) { color: #ae81ff; }
    :global(.theme-monokai .token.operator) { color: #f8f8f2; }
    :global(.theme-monokai .token.class-name) { color: #a6e22e; }

    /* Theme: Default/Light */
    :global(.theme-default .token.comment) { color: #6a737d; }
    :global(.theme-default .token.keyword) { color: #d73a49; }
    :global(.theme-default .token.string) { color: #032f62; }
    :global(.theme-default .token.function) { color: #6f42c1; }
    :global(.theme-default .token.number) { color: #005cc5; }

    /* Theme: GitHub Dark */
    :global(.theme-github-dark .token.comment) { color: #8b949e; }
    :global(.theme-github-dark .token.keyword) { color: #ff7b72; }
    :global(.theme-github-dark .token.string) { color: #a5d6ff; }
    :global(.theme-github-dark .token.function) { color: #d2a8ff; }
    :global(.theme-github-dark .token.number) { color: #79c0ff; }

     /* Theme: Solarized Light */
    :global(.theme-solarized-light .token.comment) { color: #93a1a1; }
    :global(.theme-solarized-light .token.keyword) { color: #859900; }
    :global(.theme-solarized-light .token.string) { color: #2aa198; }
    :global(.theme-solarized-light .token.function) { color: #268bd2; }
    :global(.theme-solarized-light .token.number) { color: #d33682; }

</style>
