<script lang="ts">
  import { slide } from 'svelte/transition';
  import { Plus, Trash2, Upload, X } from 'lucide-svelte';
  import type { Invoice, InvoiceClient } from '$lib/utils/invoice-forge/types';
  import { v4 as uuidv4 } from 'uuid';

  export let invoice: Invoice;
  export let dictionary: any;
  export let clients: InvoiceClient[] = [];

  let showClientSuggestions = false;
  // Use a reactive statement for filtering
  $: filteredClients = invoice.client.name
      ? clients.filter(c => c.name.toLowerCase().includes(invoice.client.name.toLowerCase()))
      : [];


  function addItem() {
    invoice.items = [...invoice.items, { id: uuidv4(), description: '', quantity: 1, price: 0 }];
  }

  function removeItem(id: string) {
    invoice.items = invoice.items.filter(i => i.id !== id);
  }

  function handleLogoUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          invoice.settings.logo = e.target.result as string;
        }
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  function removeLogo() {
    invoice.settings.logo = undefined;
  }

  function selectClient(client: InvoiceClient) {
    invoice.client = { ...client }; // Spread to avoid reference issues
    showClientSuggestions = false;
  }

  function handleClientFocus() {
      showClientSuggestions = true;
  }

  function handleClientBlur() {
      // Small delay to allow click on suggestion
      setTimeout(() => showClientSuggestions = false, 200);
  }

</script>

<div class="space-y-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-full overflow-y-auto">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <h2 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
      {dictionary.editor.title}
    </h2>
    <div class="flex items-center gap-2">
       {#if invoice.settings.logo}
          <div class="relative group">
            <img src={invoice.settings.logo} alt="Logo" class="h-10 w-auto object-contain border rounded bg-white" />
            <button on:click={removeLogo} class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
               <X size={12} />
            </button>
          </div>
       {:else}
          <label class="cursor-pointer text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
            <Upload size={16} />
            {dictionary.editor.uploadLogo}
            <input type="file" accept="image/*" class="hidden" on:change={handleLogoUpload} />
          </label>
       {/if}
    </div>
  </div>

  <!-- From / To -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Sender -->
    <div class="space-y-3">
      <label for="invoiceSenderName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide text-xs">{dictionary.editor.from}</label>
      <input id="invoiceSenderName" type="text" bind:value={invoice.sender.name} placeholder="Your Name / Company" class="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent" />
      <input aria-label="Sender Email" type="email" bind:value={invoice.sender.email} placeholder="Email (Optional)" class="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent" />
      <textarea aria-label="Sender Address" bind:value={invoice.sender.address} placeholder="Address" rows="3" class="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent resize-none"></textarea>
    </div>

    <!-- Client -->
    <div class="space-y-3 relative">
      <label for="invoiceClientName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide text-xs">{dictionary.editor.to}</label>
      <div class="relative">
          <input
            id="invoiceClientName"
            type="text"
            bind:value={invoice.client.name}
            placeholder="Client Name"
            class="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent"
            on:focus={handleClientFocus}
            on:blur={handleClientBlur}
          />
          {#if showClientSuggestions && filteredClients.length > 0}
            <div class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg max-h-40 overflow-auto">
              {#each filteredClients as client}
                <button
                    class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm border-b border-gray-100 dark:border-gray-600 last:border-0"
                    on:click={() => selectClient(client)}
                >
                  <span class="font-medium block">{client.name}</span>
                  {#if client.email}<span class="text-gray-500 text-xs">{client.email}</span>{/if}
                </button>
              {/each}
            </div>
          {/if}
      </div>
      <input aria-label="Client Email" type="email" bind:value={invoice.client.email} placeholder="Client Email" class="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent" />
      <textarea aria-label="Client Address" bind:value={invoice.client.address} placeholder="Client Address" rows="3" class="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent resize-none"></textarea>
    </div>
  </div>

  <!-- Meta -->
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
     <div class="space-y-1">
        <label for="invoiceNumber" class="text-xs font-medium text-gray-500 dark:text-gray-400">{dictionary.editor.number}</label>
        <input id="invoiceNumber" type="text" bind:value={invoice.meta.number} class="w-full p-1 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 outline-none font-mono" />
     </div>
     <div class="space-y-1">
        <label for="invoiceDate" class="text-xs font-medium text-gray-500 dark:text-gray-400">{dictionary.editor.date}</label>
        <input id="invoiceDate" type="date" bind:value={invoice.meta.date} class="w-full p-1 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 outline-none" />
     </div>
     <div class="space-y-1">
        <label for="invoiceDueDate" class="text-xs font-medium text-gray-500 dark:text-gray-400">{dictionary.editor.dueDate}</label>
        <input id="invoiceDueDate" type="date" bind:value={invoice.meta.dueDate} class="w-full p-1 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 outline-none" />
     </div>
     <div class="space-y-1">
        <label for="invoiceCurrency" class="text-xs font-medium text-gray-500 dark:text-gray-400">{dictionary.editor.currency}</label>
        <input id="invoiceCurrency" type="text" bind:value={invoice.settings.currency} class="w-full p-1 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 outline-none text-center font-bold" />
     </div>
  </div>

  <!-- Items -->
  <div class="space-y-4">
    <div class="flex items-center justify-between">
        <h3 class="font-medium text-gray-900 dark:text-white">{dictionary.editor.items}</h3>
        <button on:click={addItem} class="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium">
            <Plus size={16} /> {dictionary.editor.addItem}
        </button>
    </div>

    <div class="space-y-2">
        {#each invoice.items as item (item.id)}
            <div transition:slide|local class="flex flex-wrap sm:flex-nowrap gap-2 items-start bg-gray-50 dark:bg-gray-700/30 p-2 rounded-md group">
                <div class="grow w-full sm:w-auto">
                    <input aria-label={dictionary.editor.itemDesc} type="text" bind:value={item.description} placeholder={dictionary.editor.itemDesc} class="w-full p-2 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700" />
                </div>
                <div class="w-20 shrink-0">
                    <input aria-label={dictionary.editor.quantity} type="number" bind:value={item.quantity} min="0" step="1" placeholder={dictionary.editor.quantity} class="w-full p-2 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-center" />
                </div>
                <div class="w-24 shrink-0">
                    <input aria-label={dictionary.editor.price} type="number" bind:value={item.price} min="0" step="0.01" placeholder={dictionary.editor.price} class="w-full p-2 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-right" />
                </div>
                <div class="w-8 shrink-0 flex justify-center pt-2">
                    <button aria-label="Remove item" on:click={() => removeItem(item.id)} class="text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        {/each}
    </div>
  </div>

  <!-- Totals & Notes -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
     <div class="space-y-2">
        <label for="invoiceNotes" class="block text-sm font-medium text-gray-700 dark:text-gray-300">{dictionary.editor.notes}</label>
        <textarea id="invoiceNotes" bind:value={invoice.meta.notes} rows="4" class="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent resize-none"></textarea>
     </div>
     <div class="space-y-3">
        <div class="flex items-center justify-between">
            <label for="invoiceTaxRate" class="text-sm text-gray-600 dark:text-gray-400">{dictionary.editor.taxRate}</label>
            <div class="w-24 relative">
                <input id="invoiceTaxRate" type="number" bind:value={invoice.settings.taxRate} min="0" step="0.1" class="w-full p-1 text-right rounded border border-gray-300 dark:border-gray-600 bg-transparent pr-6" />
                <span class="absolute right-2 top-1.5 text-xs text-gray-500">%</span>
            </div>
        </div>
        <div class="flex items-center justify-between">
            <label for="invoiceDiscount" class="text-sm text-gray-600 dark:text-gray-400">{dictionary.editor.discount}</label>
            <div class="w-24 relative">
                <input id="invoiceDiscount" type="number" bind:value={invoice.settings.discount} min="0" step="0.1" class="w-full p-1 text-right rounded border border-gray-300 dark:border-gray-600 bg-transparent pr-6" />
                <span class="absolute right-2 top-1.5 text-xs text-gray-500">%</span>
            </div>
        </div>
     </div>
  </div>
</div>
