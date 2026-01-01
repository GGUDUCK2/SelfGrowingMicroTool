<script lang="ts">
  import { formatMoney } from "$lib/utils";

  export let history: { id?: number; data: any; createdAt: Date }[];
  export let lang: string;
  export let title: string;
  export let deleteLabel: string;
  export let restoreHistory: (item: any) => void;
  export let deleteHistory: (id: number) => void;
</script>

<div class="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
  <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-history"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12" />
      <path d="M3 3v9h9" />
      <path d="M12 7v5l4 2" />
    </svg>
    {title}
  </h3>
  <div class="space-y-3">
    {#each history as item (item.id)}
      <div
        class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
      >
        <button
          class="text-left cursor-pointer flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1"
          on:click={() => restoreHistory(item)}
        >
          <div class="font-medium text-gray-900">
            {formatMoney(item.data.finalBalance, lang)}
          </div>
          <div class="text-sm text-gray-500">
            {formatMoney(item.data.principal, lang)} + {formatMoney(
              item.data.contribution,
              lang
            )}/mo @ {item.data.rate}%
          </div>
          <div class="text-xs text-gray-400 mt-1">
            {item.createdAt.toLocaleString()}
          </div>
        </button>
        <button
          on:click={() => item.id && deleteHistory(item.id)}
          class="p-2 text-gray-400 hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full"
          aria-label={deleteLabel}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-trash-2"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            <line x1="10" x2="10" y1="11" y2="17" />
            <line x1="14" x2="14" y1="11" y2="17" />
          </svg>
        </button>
      </div>
    {/each}
  </div>
</div>
