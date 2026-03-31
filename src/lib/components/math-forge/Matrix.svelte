<script lang="ts">
  import { Matrix } from '$lib/utils/math-forge/engine';
  import { Plus, Minus, X, ArrowRight, Trash2 } from 'lucide-svelte';

  export let dict: any;

  let rowsA = 3;
  let colsA = 3;
  let rowsB = 3;
  let colsB = 3;

  let matrixA = Array(3).fill(0).map(() => Array(3).fill(0));
  let matrixB = Array(3).fill(0).map(() => Array(3).fill(0));
  let resultMatrix: number[][] | null = null;
  let error = '';

  function resize(m: 'A' | 'B', r: number, c: number) {
      if (r < 1 || c < 1) return;
      if (m === 'A') {
          rowsA = r; colsA = c;
          matrixA = resizeMatrix(matrixA, r, c);
      } else {
          rowsB = r; colsB = c;
          matrixB = resizeMatrix(matrixB, r, c);
      }
  }

  function resizeMatrix(mat: number[][], r: number, c: number) {
      const newMat = Array(r).fill(0).map((_, i) => Array(c).fill(0).map((_, j) => {
          return (mat[i] && mat[i][j] !== undefined) ? mat[i][j] : 0;
      }));
      return newMat;
  }

  function calc(op: string) {
      error = '';
      resultMatrix = null;
      try {
          if (op === 'add') resultMatrix = Matrix.add(matrixA, matrixB);
          else if (op === 'sub') resultMatrix = Matrix.sub(matrixA, matrixB);
          else if (op === 'mul') resultMatrix = Matrix.multiply(matrixA, matrixB);
          else if (op === 'detA') alert(`${dict.det} A: ${Matrix.determinant(matrixA)}`);
          else if (op === 'detB') alert(`${dict.det} B: ${Matrix.determinant(matrixB)}`);
          else if (op === 'invA') resultMatrix = Matrix.inverse(matrixA);
          else if (op === 'invB') resultMatrix = Matrix.inverse(matrixB);
          else if (op === 'transA') resultMatrix = Matrix.transpose(matrixA);
          else if (op === 'transB') resultMatrix = Matrix.transpose(matrixB);
      } catch (e: any) {
          error = e.message;
      }
  }
</script>

<div class="space-y-8">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Matrix A -->
      <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div class="flex justify-between items-center mb-4">
              <h3 class="font-bold text-indigo-600 dark:text-indigo-400">{dict.matrixA}</h3>
              <div class="flex items-center gap-2 text-sm">
                  <input type="number" aria-label="Rows Matrix A" bind:value={rowsA} min="1" max="10" on:change={() => resize('A', rowsA, colsA)} class="w-12 min-h-[44px] min-w-[44px] p-1 bg-slate-100 dark:bg-slate-800 rounded text-center" />
                  <span>x</span>
                  <input type="number" aria-label="Columns Matrix A" bind:value={colsA} min="1" max="10" on:change={() => resize('A', rowsA, colsA)} class="w-12 min-h-[44px] min-w-[44px] p-1 bg-slate-100 dark:bg-slate-800 rounded text-center" />
              </div>
          </div>
          <div class="overflow-x-auto">
              <div class="grid gap-1" style="grid-template-columns: repeat({colsA}, minmax(50px, 1fr));">
                  {#each matrixA as row, i}
                      {#each row as val, j}
                          <input type="number" aria-label="Matrix A {i},{j}" bind:value={matrixA[i][j]} class="w-full min-h-[44px] min-w-[44px] p-2 text-center bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 focus:border-indigo-500 outline-none" />
                      {/each}
                  {/each}
              </div>
          </div>
          <div class="flex gap-2 mt-4 text-xs flex-wrap">
              <button on:click={() => calc('detA')} class="px-3 py-1 min-h-[44px] min-w-[44px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded transition-colors">{dict.det}</button>
              <button on:click={() => calc('invA')} class="px-3 py-1 min-h-[44px] min-w-[44px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded transition-colors">{dict.inv}</button>
              <button on:click={() => calc('transA')} class="px-3 py-1 min-h-[44px] min-w-[44px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded transition-colors">{dict.transpose}</button>
          </div>
      </div>

      <!-- Matrix B -->
      <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div class="flex justify-between items-center mb-4">
              <h3 class="font-bold text-pink-600 dark:text-pink-400">{dict.matrixB}</h3>
              <div class="flex items-center gap-2 text-sm">
                  <input type="number" aria-label="Rows Matrix B" bind:value={rowsB} min="1" max="10" on:change={() => resize('B', rowsB, colsB)} class="w-12 min-h-[44px] min-w-[44px] p-1 bg-slate-100 dark:bg-slate-800 rounded text-center" />
                  <span>x</span>
                  <input type="number" aria-label="Columns Matrix B" bind:value={colsB} min="1" max="10" on:change={() => resize('B', rowsB, colsB)} class="w-12 min-h-[44px] min-w-[44px] p-1 bg-slate-100 dark:bg-slate-800 rounded text-center" />
              </div>
          </div>
          <div class="overflow-x-auto">
              <div class="grid gap-1" style="grid-template-columns: repeat({colsB}, minmax(50px, 1fr));">
                  {#each matrixB as row, i}
                      {#each row as val, j}
                          <input type="number" aria-label="Matrix B {i},{j}" bind:value={matrixB[i][j]} class="w-full min-h-[44px] min-w-[44px] p-2 text-center bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 focus:border-indigo-500 outline-none" />
                      {/each}
                  {/each}
              </div>
          </div>
          <div class="flex gap-2 mt-4 text-xs flex-wrap">
              <button on:click={() => calc('detB')} class="px-3 py-1 min-h-[44px] min-w-[44px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded transition-colors">{dict.det}</button>
              <button on:click={() => calc('invB')} class="px-3 py-1 min-h-[44px] min-w-[44px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded transition-colors">{dict.inv}</button>
              <button on:click={() => calc('transB')} class="px-3 py-1 min-h-[44px] min-w-[44px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded transition-colors">{dict.transpose}</button>
          </div>
      </div>
  </div>

  <!-- Operations -->
  <div class="flex justify-center gap-4 flex-wrap">
      <button on:click={() => calc('add')} class="px-6 py-2 min-h-[44px] min-w-[44px] bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md font-bold">{dict.add}</button>
      <button on:click={() => calc('sub')} class="px-6 py-2 min-h-[44px] min-w-[44px] bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md font-bold">{dict.sub}</button>
      <button on:click={() => calc('mul')} class="px-6 py-2 min-h-[44px] min-w-[44px] bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md font-bold">{dict.mul}</button>
  </div>

  {#if error}
      <div class="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-center font-medium">
          {error}
      </div>
  {/if}

  {#if resultMatrix}
      <div class="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 max-w-2xl mx-auto">
          <h3 class="text-center font-bold text-lg mb-4 text-slate-700 dark:text-slate-300">{dict.result}</h3>
          <div class="overflow-x-auto flex justify-center">
              <div class="grid gap-1" style="grid-template-columns: repeat({resultMatrix[0].length}, minmax(60px, 1fr));">
                  {#each resultMatrix as row}
                      {#each row as val}
                          <div class="p-3 text-center bg-white dark:bg-slate-900 rounded font-mono text-sm shadow-sm">
                              {Number(val.toFixed(4))}
                          </div>
                      {/each}
                  {/each}
              </div>
          </div>
      </div>
  {/if}
</div>
