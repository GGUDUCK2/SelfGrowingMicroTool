<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { slide } from 'svelte/transition';
  import { parseJwt, verifyJwtSignature, type ParsedJWT } from '$lib/utils/cipher/jwt';
  import { Copy, Save, CheckCircle, XCircle } from '@lucide/svelte';
  import Prism from 'prismjs';
  import 'prismjs/components/prism-json';
  import type { CipherDictionary } from '$lib/types/cipher';

  export let dict: CipherDictionary;

  let token = '';
  let parsed: ParsedJWT | null = null;
  let secret = '';
  let verificationStatus: 'idle' | 'valid' | 'invalid' = 'idle';

  const dispatch = createEventDispatcher();

  export const restore = (savedState: any) => {
      // JWT usually just restores the input (token) and maybe the secret key if it was saved
      // But typically we don't save secret keys in history for security, but user might want to.
      // We will assume only input is safe to restore from 'input' field.
      // But wait, the 'input' field in history is usually the source content.
      // In JWT debugger, 'token' is the input.

      // If we saved 'input' in history when saving (which we didn't before), we could restore it.
      // Let's modify saveToHistory to save input as well.
      if (savedState.input) {
         token = savedState.input;
      }

      // Secret is sensitive, maybe avoid restoring it unless explicitly saved?
      // For now, let's not restore secret.
  };


  $: {
    if (token) {
      parsed = parseJwt(token);
    } else {
      parsed = null;
      verificationStatus = 'idle';
    }
  }

  async function verify() {
    if (!token || !secret) return;
    const isValid = await verifyJwtSignature(token, secret);
    verificationStatus = isValid ? 'valid' : 'invalid';
  }

  function highlight(code: string) {
    return Prism.highlight(code, Prism.languages.json, 'json');
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    dispatch('copy');
  }

  function saveToHistory() {
    if (parsed) {
      dispatch('save', {
        type: 'jwt',
        content: JSON.stringify(parsed.payload), // Save payload as content
        details: 'JWT Decode',
        input: token,
        settings: JSON.stringify({}) // No specific settings for JWT debug
      });
    }
  }
</script>

<div class="space-y-6" in:slide>
  <!-- Input -->
  <div class="space-y-2">
    <label for="jwt-input" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
      JWT Token
    </label>
    <textarea
      id="jwt-input"
      bind:value={token}
      rows="3"
      class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono break-all text-xs"
      placeholder={dict.jwt.paste}
    ></textarea>
  </div>

  {#if parsed}
    <div class="grid md:grid-cols-2 gap-6" transition:slide>
      <!-- Header -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-red-500">{dict.jwt.header}</span>
          <button on:click={() => copyToClipboard(JSON.stringify(parsed?.header, null, 2))} class="text-xs text-slate-400 hover:text-indigo-500 min-h-[44px] min-w-[44px] flex justify-center items-center" aria-label={dict.copy}>
             <Copy size={12}/>
          </button>
        </div>
        <pre class="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg text-xs overflow-auto max-h-40 border-l-4 border-red-500">
          {@html highlight(JSON.stringify(parsed.header, null, 2))}
        </pre>
      </div>

      <!-- Payload -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-purple-500">{dict.jwt.payload}</span>
          <div class="flex space-x-2">
             <button on:click={saveToHistory} class="text-xs text-slate-400 hover:text-indigo-500 min-h-[44px] min-w-[44px] flex justify-center items-center" aria-label={dict.save}>
               <Save size={12}/>
             </button>
             <button on:click={() => copyToClipboard(JSON.stringify(parsed?.payload, null, 2))} class="text-xs text-slate-400 hover:text-indigo-500 min-h-[44px] min-w-[44px] flex justify-center items-center" aria-label={dict.copy}>
               <Copy size={12}/>
             </button>
          </div>
        </div>
        <pre class="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg text-xs overflow-auto max-h-60 border-l-4 border-purple-500">
          {@html highlight(JSON.stringify(parsed.payload, null, 2))}
        </pre>
      </div>

      <!-- Signature Verification -->
      <div class="md:col-span-2 space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
         <div class="flex items-end gap-4">
             <div class="flex-1 space-y-2">
                 <label for="jwt-secret" class="block text-sm font-medium text-cyan-600 dark:text-cyan-400 uppercase text-xs tracking-wider">
                     {dict.jwt.signature}
                 </label>
                 <input
                   id="jwt-secret"
                   type="text"
                   bind:value={secret}
                   class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
                   placeholder="Enter your secret key to verify..."
                 />
             </div>
             <button
               on:click={verify}
               class="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm mb-[1px] min-h-[44px] min-w-[44px]"
             >
               {dict.verify}
             </button>
         </div>

         {#if verificationStatus !== 'idle'}
            <div class="flex items-center space-x-2 p-3 rounded-lg {verificationStatus === 'valid' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'}" transition:slide>
               {#if verificationStatus === 'valid'}
                  <CheckCircle size={20} />
                  <span class="font-medium">{dict.validSignature}</span>
               {:else}
                  <XCircle size={20} />
                  <span class="font-medium">{dict.invalidSignature}</span>
               {/if}
            </div>
         {/if}
      </div>
    </div>
  {:else if token}
      <div class="p-4 rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 text-sm text-center">
         {dict.jwt.invalid}
      </div>
  {/if}
</div>

<style>
  /* Prism overrides */
  :global(pre) { margin: 0; }
  :global(.token.string) { color: #22863a; }
  :global(.token.number) { color: #005cc5; }
  :global(.token.boolean) { color: #005cc5; }
  :global(.token.property) { color: #005cc5; }
  :global(html.dark .token.string) { color: #a5d6ff; }
  :global(html.dark .token.number) { color: #79c0ff; }
  :global(html.dark .token.boolean) { color: #79c0ff; }
  :global(html.dark .token.property) { color: #79c0ff; }
</style>
