<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { getDictionary } from '$lib/dictionaries';
  import { page } from '$app/stores';
  import type { TransformMode, CleanMode, SecurityMode, EncodeMode } from '$lib/utils/string-theory/types';

  const dispatch = createEventDispatcher();

  $: dict = getDictionary($page.params.lang || 'en').tools.stringTheory.actions;
  $: mainDict = getDictionary($page.params.lang || 'en').tools.stringTheory;

  function emit(type: 'transform' | 'clean' | 'security' | 'encode', mode: string) {
    dispatch('action', { type, mode });
  }

  function emitGenerate(type: string, param?: number) {
      dispatch('generate', { type, param });
  }
</script>

<div class="space-y-6">
  <!-- Generators -->
  <div>
      <h3 class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">{mainDict.generators.title}</h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          <button on:click={() => emitGenerate('lorem')} class="btn-secondary text-indigo-600 dark:text-indigo-400">{mainDict.generators.lorem}</button>
          <button on:click={() => emitGenerate('uuid')} class="btn-secondary text-indigo-600 dark:text-indigo-400">{mainDict.generators.uuid}</button>
          <button on:click={() => emitGenerate('random')} class="btn-secondary text-indigo-600 dark:text-indigo-400">{mainDict.generators.random}</button>
      </div>
  </div>

  <!-- Transformation -->
  <div>
    <h3 class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">{mainDict.transform}</h3>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      <button on:click={() => emit('transform', 'uppercase')} class="btn-secondary">{dict.uppercase}</button>
      <button on:click={() => emit('transform', 'lowercase')} class="btn-secondary">{dict.lowercase}</button>
      <button on:click={() => emit('transform', 'capitalize')} class="btn-secondary">{dict.capitalize}</button>
      <button on:click={() => emit('transform', 'camelCase')} class="btn-secondary">{dict.camelCase}</button>
      <button on:click={() => emit('transform', 'snakeCase')} class="btn-secondary">{dict.snakeCase}</button>
      <button on:click={() => emit('transform', 'kebabCase')} class="btn-secondary">{dict.kebabCase}</button>
      <button on:click={() => emit('transform', 'pascalCase')} class="btn-secondary">{dict.pascalCase}</button>
      <button on:click={() => emit('transform', 'constantCase')} class="btn-secondary">{dict.constantCase}</button>
      <button on:click={() => emit('transform', 'titleCase')} class="btn-secondary">{dict.titleCase}</button>
      <button on:click={() => emit('transform', 'sentenceCase')} class="btn-secondary">{dict.sentenceCase}</button>
      <button on:click={() => emit('transform', 'slugify')} class="btn-secondary">{dict.slugify}</button>
      <button on:click={() => emit('transform', 'reverse')} class="btn-secondary">{dict.reverse}</button>
      <button on:click={() => emit('transform', 'reverseWords')} class="btn-secondary">{dict.reverseWords}</button>
      <button on:click={() => emit('transform', 'shuffleLines')} class="btn-secondary">{dict.shuffleLines}</button>
      <button on:click={() => emit('transform', 'sortAlpha')} class="btn-secondary">{dict.sortAlpha}</button>
      <button on:click={() => emit('transform', 'sortLength')} class="btn-secondary">{dict.sortLength}</button>
      <button on:click={() => emit('transform', 'uniqueLines')} class="btn-secondary">{dict.unique}</button>
    </div>
  </div>

  <!-- Cleaning -->
  <div>
    <h3 class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">{mainDict.clean}</h3>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      <button on:click={() => emit('clean', 'trim')} class="btn-secondary">{dict.trim}</button>
      <button on:click={() => emit('clean', 'trimLines')} class="btn-secondary">{dict.trimLines}</button>
      <button on:click={() => emit('clean', 'removeEmptyLines')} class="btn-secondary">{dict.removeEmpty}</button>
      <button on:click={() => emit('clean', 'removeDuplicateLines')} class="btn-secondary">{dict.removeDupes}</button>
      <button on:click={() => emit('clean', 'normalizeSpace')} class="btn-secondary">{dict.normalize}</button>
      <button on:click={() => emit('clean', 'stripHtml')} class="btn-secondary">{dict.stripHtml}</button>
    </div>
  </div>

  <!-- Security -->
  <div>
    <h3 class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">{mainDict.security}</h3>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      <button on:click={() => emit('security', 'redactEmail')} class="btn-secondary text-amber-600 dark:text-amber-400">{dict.redactEmail}</button>
      <button on:click={() => emit('security', 'redactPhone')} class="btn-secondary text-amber-600 dark:text-amber-400">{dict.redactPhone}</button>
      <button on:click={() => emit('security', 'redactIp')} class="btn-secondary text-amber-600 dark:text-amber-400">{dict.redactIp}</button>
      <button on:click={() => emit('security', 'redactCreditCard')} class="btn-secondary text-amber-600 dark:text-amber-400">{dict.redactCc}</button>
    </div>
  </div>

  <!-- Encoding -->
  <div>
    <h3 class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">{mainDict.encode}</h3>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      <button on:click={() => emit('encode', 'base64Encode')} class="btn-secondary">{dict.base64Enc}</button>
      <button on:click={() => emit('encode', 'base64Decode')} class="btn-secondary">{dict.base64Dec}</button>
      <button on:click={() => emit('encode', 'urlEncode')} class="btn-secondary">{dict.urlEnc}</button>
      <button on:click={() => emit('encode', 'urlDecode')} class="btn-secondary">{dict.urlDec}</button>
      <button on:click={() => emit('encode', 'htmlEntityEncode')} class="btn-secondary">{dict.htmlEnc}</button>
      <button on:click={() => emit('encode', 'htmlEntityDecode')} class="btn-secondary">{dict.htmlDec}</button>
      <button on:click={() => emit('encode', 'hexEncode')} class="btn-secondary">{dict.hexEnc}</button>
      <button on:click={() => emit('encode', 'hexDecode')} class="btn-secondary">{dict.hexDec}</button>
      <button on:click={() => emit('encode', 'binaryEncode')} class="btn-secondary">{dict.binaryEnc}</button>
      <button on:click={() => emit('encode', 'binaryDecode')} class="btn-secondary">{dict.binaryDec}</button>
    </div>
  </div>
</div>

<style>
  .btn-secondary {
    @apply px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 transition-colors truncate;
  }
</style>
