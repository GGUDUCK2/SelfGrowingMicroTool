<script lang="ts">
  import { db, type InvoiceClient } from '$lib/db';
  import { liveQuery } from 'dexie';
  import { Plus, Trash2, User } from 'lucide-svelte';

  export let dictionary: Record<string, any>;

  let newClientName = '';
  let newClientEmail = '';
  let newClientAddress = '';

  let clientsQuery = liveQuery(() => db.invoiceForgeClients.orderBy('createdAt').reverse().toArray());

  async function addClient() {
    if (!newClientName) return;
    await db.invoiceForgeClients.add({
        name: newClientName,
        email: newClientEmail,
        address: newClientAddress,
        createdAt: new Date()
    });
    newClientName = '';
    newClientEmail = '';
    newClientAddress = '';
  }

  async function deleteClient(id: number | undefined) {
    if (id) await db.invoiceForgeClients.delete(id);
  }
</script>

<div class="space-y-6">
    <h3 class="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
        <User size={20} />
        {dictionary.clients.title}
    </h3>

    <!-- Add Form -->
    <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg space-y-3">
        <input type="text" bind:value={newClientName} placeholder={dictionary.clients.name} class="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" />
        <input type="email" bind:value={newClientEmail} placeholder={dictionary.clients.email} class="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" />
        <textarea bind:value={newClientAddress} placeholder={dictionary.clients.address} rows="2" class="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 resize-none"></textarea>
        <button on:click={addClient} class="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium">
            <Plus size={16} />
            {dictionary.clients.add}
        </button>
    </div>

    <!-- List -->
    <div class="space-y-2 max-h-60 overflow-y-auto">
        {#if $clientsQuery}
            {#each $clientsQuery as client (client.id)}
                <div class="flex items-start justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg group">
                    <div class="text-sm">
                        <div class="font-bold text-gray-900 dark:text-white">{client.name}</div>
                        {#if client.email}<div class="text-gray-500 text-xs">{client.email}</div>{/if}
                    </div>
                    <button on:click={() => deleteClient(client.id)} class="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={16} />
                    </button>
                </div>
            {/each}
        {/if}
    </div>
</div>
