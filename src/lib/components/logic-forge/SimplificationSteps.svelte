<script lang="ts">
  export let sop: string = '';
  export let pos: string = '';
  export let simplified: string = '';
</script>

<div class="space-y-6 p-4">
  <!-- Canonical Forms -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Sum of Products (SOP)</h3>
      <div class="font-mono text-sm bg-gray-50 p-3 rounded-lg overflow-x-auto whitespace-nowrap text-indigo-700">
        {sop}
      </div>
    </div>

    <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Product of Sums (POS)</h3>
      <div class="font-mono text-sm bg-gray-50 p-3 rounded-lg overflow-x-auto whitespace-nowrap text-indigo-700">
        {pos}
      </div>
    </div>
  </div>

  <!-- Final Result -->
  <div class="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 flex flex-col items-center text-center space-y-3">
    <h3 class="text-lg font-bold text-gray-800">Simplified Expression</h3>
    <div class="text-2xl md:text-3xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 break-all">
      {simplified || '0'}
    </div>
    <p class="text-sm text-gray-500 max-w-md">
      This result is obtained using the Quine-McCluskey algorithm to find the essential prime implicants.
    </p>
  </div>
</div>
