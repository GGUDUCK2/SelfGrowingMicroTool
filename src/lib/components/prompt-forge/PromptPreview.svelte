<script lang="ts">
  import { fade, slide } from 'svelte/transition';
  import { MessageSquare, FileText, Send } from 'lucide-svelte';
  import type { PromptForgeDictionary } from '$lib/types/prompt-forge';

  export let compiledSystem: string = "";
  export let compiledUser: string = "";
  export let dict: PromptForgeDictionary;

  let viewMode: 'raw' | 'chat' = 'raw';
  let chatInput = "";
  let chatHistory: Array<{ role: 'user' | 'assistant', content: string }> = [];

  let copiedSystem = false;
  let copiedUser = false;

  function copy(text: string, type: 'system' | 'user') {
    navigator.clipboard.writeText(text);
    if (type === 'system') {
        copiedSystem = true;
        setTimeout(() => copiedSystem = false, 2000);
    } else {
        copiedUser = true;
        setTimeout(() => copiedUser = false, 2000);
    }
  }

  function handleChatSend() {
      if (!chatInput.trim()) return;
      chatHistory = [...chatHistory, { role: 'user', content: chatInput }];

      // Simulate response (mock)
      setTimeout(() => {
          chatHistory = [...chatHistory, { role: 'assistant', content: "This is a simulated response. In a real app, this would connect to an LLM API." }];
      }, 600);

      chatInput = "";
  }
</script>

<div class="flex flex-col h-full gap-4 relative">

  <!-- View Toggle -->
  <div class="flex items-center justify-between">
      <h3 class="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
         {dict.editor.preview}
      </h3>

      <div class="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
          <button
             class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors {viewMode === 'raw' ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}"
             on:click={() => viewMode = 'raw'}
             aria-label={dict.preview?.raw || "Raw Text"}
          >
             <FileText class="w-3.5 h-3.5" />
             {dict.preview?.raw || "Raw"}
          </button>
          <button
             class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors {viewMode === 'chat' ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}"
             on:click={() => viewMode = 'chat'}
             aria-label={dict.preview?.chat || "Chat Sim"}
          >
             <MessageSquare class="w-3.5 h-3.5" />
             {dict.preview?.chat || "Chat"}
          </button>
      </div>
  </div>

  {#if viewMode === 'raw'}
    <!-- Raw Text Mode -->
    <div class="flex flex-col gap-4 h-full" transition:fade={{ duration: 200 }}>
        {#if compiledSystem}
        <div class="flex-none flex flex-col">
            <div class="flex justify-between items-center mb-2">
                <span class="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">System</span>
                <button
                    on:click={() => copy(compiledSystem, 'system')}
                    class="text-xs px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors {copiedSystem ? 'text-green-500' : 'text-slate-500'}"
                    aria-label={copiedSystem ? dict.toolbar.copied : dict.toolbar.copy}
                >
                    {copiedSystem ? dict.toolbar.copied : dict.toolbar.copy}
                </button>
            </div>
            <div class="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-sm font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-h-48 overflow-y-auto custom-scrollbar shadow-inner">
                {compiledSystem}
            </div>
        </div>
        {/if}

        <div class="flex-1 flex flex-col min-h-0">
            <div class="flex justify-between items-center mb-2">
                <span class="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">User</span>
                <button
                    on:click={() => copy(compiledUser, 'user')}
                    class="text-xs px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors {copiedUser ? 'text-green-500' : 'text-slate-500'}"
                    aria-label={copiedUser ? dict.toolbar.copied : dict.toolbar.copy}
                >
                    {copiedUser ? dict.toolbar.copied : dict.toolbar.copy}
                </button>
            </div>
            <div class="flex-1 w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-sm font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap overflow-y-auto custom-scrollbar shadow-inner">
                {compiledUser || '...'}
            </div>
        </div>
    </div>
  {:else}
    <!-- Chat Simulation Mode -->
    <div class="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden" transition:fade={{ duration: 200 }}>
        <div class="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            <!-- System Message Bubble -->
            {#if compiledSystem}
                <div class="flex justify-center mb-6">
                    <div class="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs px-3 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 max-w-[90%] text-center shadow-sm">
                        <span class="font-bold mr-1">System:</span> {compiledSystem.slice(0, 100)}{compiledSystem.length > 100 ? '...' : ''}
                    </div>
                </div>
            {/if}

            <!-- User Initial Prompt Bubble -->
            {#if compiledUser}
                <div class="flex justify-end">
                    <div class="bg-indigo-500 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-[85%] text-sm shadow-md">
                        {compiledUser}
                    </div>
                </div>
            {/if}

            <!-- Chat History -->
            {#each chatHistory as msg}
                <div class="flex {msg.role === 'user' ? 'justify-end' : 'justify-start'}" transition:slide|local>
                    <div class="{msg.role === 'user' ? 'bg-indigo-500 text-white rounded-tr-sm' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-sm'} px-4 py-2.5 rounded-2xl max-w-[85%] text-sm shadow-sm">
                        {msg.content}
                    </div>
                </div>
            {/each}
        </div>

        <div class="p-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
            <form class="flex gap-2" on:submit|preventDefault={handleChatSend}>
                <input
                    type="text"
                    bind:value={chatInput}
                    placeholder={dict.preview?.chatPlaceholder || "Type a message..."}
                    class="flex-1 h-10 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    class="p-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Send Message"
                >
                    <Send class="w-5 h-5" />
                </button>
            </form>
        </div>
    </div>
  {/if}
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 20px;
  }
</style>
