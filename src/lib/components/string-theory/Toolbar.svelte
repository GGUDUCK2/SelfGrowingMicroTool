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
          <button on:click={() => emitGenerate('lorem')} class="btn-secondary text-indigo-600 dark:text-indigo-400" aria-label="{mainDict.generators.lorem}">{mainDict.generators.lorem}</button>
          <button on:click={() => emitGenerate('uuid')} class="btn-secondary text-indigo-600 dark:text-indigo-400" aria-label="{mainDict.generators.uuid}">{mainDict.generators.uuid}</button>
          <button on:click={() => emitGenerate('ulid')} class="btn-secondary text-indigo-600 dark:text-indigo-400" aria-label="{mainDict.generators.ulid}">{mainDict.generators.ulid}</button>
          <button on:click={() => emitGenerate('nanoid')} class="btn-secondary text-indigo-600 dark:text-indigo-400" aria-label="{mainDict.generators.nanoid}">{mainDict.generators.nanoid}</button>
          <button on:click={() => emitGenerate('random')} class="btn-secondary text-indigo-600 dark:text-indigo-400" aria-label="{mainDict.generators.random}">{mainDict.generators.random}</button>
      </div>
  </div>

  <!-- Transformation -->
  <div>
    <h3 class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">{mainDict.transform}</h3>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      <button on:click={() => emit('transform', 'uppercase')} class="btn-secondary" aria-label="{dict.uppercase}">{dict.uppercase}</button>
      <button on:click={() => emit('transform', 'lowercase')} class="btn-secondary" aria-label="{dict.lowercase}">{dict.lowercase}</button>
      <button on:click={() => emit('transform', 'capitalize')} class="btn-secondary" aria-label="{dict.capitalize}">{dict.capitalize}</button>
      <button on:click={() => emit('transform', 'camelCase')} class="btn-secondary" aria-label="{dict.camelCase}">{dict.camelCase}</button>
      <button on:click={() => emit('transform', 'snakeCase')} class="btn-secondary" aria-label="{dict.snakeCase}">{dict.snakeCase}</button>
      <button on:click={() => emit('transform', 'kebabCase')} class="btn-secondary" aria-label="{dict.kebabCase}">{dict.kebabCase}</button>
      <button on:click={() => emit('transform', 'pascalCase')} class="btn-secondary" aria-label="{dict.pascalCase}">{dict.pascalCase}</button>
      <button on:click={() => emit('transform', 'constantCase')} class="btn-secondary" aria-label="{dict.constantCase}">{dict.constantCase}</button>
      <button on:click={() => emit('transform', 'titleCase')} class="btn-secondary" aria-label="{dict.titleCase}">{dict.titleCase}</button>
      <button on:click={() => emit('transform', 'sentenceCase')} class="btn-secondary" aria-label="{dict.sentenceCase}">{dict.sentenceCase}</button>
      <button on:click={() => emit('transform', 'slugify')} class="btn-secondary" aria-label="{dict.slugify}">{dict.slugify}</button>
      <button on:click={() => emit('transform', 'reverse')} class="btn-secondary" aria-label="{dict.reverse}">{dict.reverse}</button>
      <button on:click={() => emit('transform', 'reverseWords')} class="btn-secondary" aria-label="{dict.reverseWords}">{dict.reverseWords}</button>
      <button on:click={() => emit('transform', 'shuffleLines')} class="btn-secondary" aria-label="{dict.shuffleLines}">{dict.shuffleLines}</button>
      <button on:click={() => emit('transform', 'shuffleWords')} class="btn-secondary" aria-label="Shuffle Words">Shuffle Words</button>
      <button on:click={() => emit('transform', 'sortAlpha')} class="btn-secondary" aria-label="{dict.sortAlpha}">{dict.sortAlpha}</button>
      <button on:click={() => emit('transform', 'sortLength')} class="btn-secondary" aria-label="{dict.sortLength}">{dict.sortLength}</button>
      <button on:click={() => emit('transform', 'uniqueLines')} class="btn-secondary" aria-label="{dict.unique}">{dict.unique}</button>
      <button on:click={() => emit('transform', 'removeNonAlphaNumeric')} class="btn-secondary" aria-label="AlphaNumeric Only">AlphaNumeric Only</button>
    </div>
  </div>

  <!-- Cleaning -->
  <div>
    <h3 class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">{mainDict.clean}</h3>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      <button on:click={() => emit('clean', 'trim')} class="btn-secondary" aria-label="{dict.trim}">{dict.trim}</button>
      <button on:click={() => emit('clean', 'trimLines')} class="btn-secondary" aria-label="{dict.trimLines}">{dict.trimLines}</button>
      <button on:click={() => emit('clean', 'removeEmptyLines')} class="btn-secondary" aria-label="{dict.removeEmpty}">{dict.removeEmpty}</button>
      <button on:click={() => emit('clean', 'removeDuplicateLines')} class="btn-secondary" aria-label="{dict.removeDupes}">{dict.removeDupes}</button>
      <button on:click={() => emit('clean', 'normalizeSpace')} class="btn-secondary" aria-label="{dict.normalize}">{dict.normalize}</button>
      <button on:click={() => emit('clean', 'stripHtml')} class="btn-secondary" aria-label="{dict.stripHtml}">{dict.stripHtml}</button>
    </div>
  </div>

  <!-- Security -->
  <div>
    <h3 class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">{mainDict.security}</h3>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      <button on:click={() => emit('security', 'redactEmail')} class="btn-secondary text-amber-600 dark:text-amber-400" aria-label="{dict.redactEmail}">{dict.redactEmail}</button>
      <button on:click={() => emit('security', 'redactPhone')} class="btn-secondary text-amber-600 dark:text-amber-400" aria-label="{dict.redactPhone}">{dict.redactPhone}</button>
      <button on:click={() => emit('security', 'redactIp')} class="btn-secondary text-amber-600 dark:text-amber-400" aria-label="{dict.redactIp}">{dict.redactIp}</button>
      <button on:click={() => emit('security', 'redactCreditCard')} class="btn-secondary text-amber-600 dark:text-amber-400" aria-label="{dict.redactCc}">{dict.redactCc}</button>
    </div>
  </div>

  <!-- Encoding -->
  <div>
    <h3 class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">{mainDict.encode}</h3>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      <button on:click={() => emit('encode', 'base64Encode')} class="btn-secondary" aria-label="{dict.base64Enc}">{dict.base64Enc}</button>
      <button on:click={() => emit('encode', 'base64Decode')} class="btn-secondary" aria-label="{dict.base64Dec}">{dict.base64Dec}</button>
      <button on:click={() => emit('encode', 'urlEncode')} class="btn-secondary" aria-label="{dict.urlEnc}">{dict.urlEnc}</button>
      <button on:click={() => emit('encode', 'urlDecode')} class="btn-secondary" aria-label="{dict.urlDec}">{dict.urlDec}</button>
      <button on:click={() => emit('encode', 'htmlEntityEncode')} class="btn-secondary" aria-label="{dict.htmlEnc}">{dict.htmlEnc}</button>
      <button on:click={() => emit('encode', 'htmlEntityDecode')} class="btn-secondary" aria-label="{dict.htmlDec}">{dict.htmlDec}</button>
      <button on:click={() => emit('encode', 'hexEncode')} class="btn-secondary" aria-label="{dict.hexEnc}">{dict.hexEnc}</button>
      <button on:click={() => emit('encode', 'hexDecode')} class="btn-secondary" aria-label="{dict.hexDec}">{dict.hexDec}</button>
      <button on:click={() => emit('encode', 'binaryEncode')} class="btn-secondary" aria-label="{dict.binaryEnc}">{dict.binaryEnc}</button>
      <button on:click={() => emit('encode', 'binaryDecode')} class="btn-secondary" aria-label="{dict.binaryDec}">{dict.binaryDec}</button>
    </div>
  </div>
</div>

<style>
  .btn-secondary {
    @apply px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 transition-colors truncate;
  }
</style>
