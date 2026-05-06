<script lang="ts">
  import type { Invoice } from '$lib/utils/invoice-forge/types';
  import { calculateTotal, formatCurrency } from '$lib/utils/invoice-forge/calculations';

  export let invoice: Invoice;
  export let dictionary: Record<string, any>;

  $: totals = calculateTotal(invoice.items, invoice.settings);
</script>

<div id="invoice-preview" class="bg-white text-black p-8 sm:p-12 shadow-lg mx-auto min-h-[297mm] w-full max-w-[210mm] relative print:shadow-none print:w-full print:max-w-none print:m-0 print:h-auto overflow-hidden">

  <!-- Header -->
  <div class="flex justify-between items-start mb-12">
    <div>
        {#if invoice.settings.logo}
            <img src={invoice.settings.logo} alt="Logo" class="h-16 w-auto object-contain mb-4" />
        {:else}
            <h1 class="text-3xl font-bold text-gray-800 tracking-tight uppercase">INVOICE</h1>
        {/if}
        <div class="text-sm text-gray-600 mt-2 whitespace-pre-line">
            <span class="font-bold text-gray-900 block text-lg mb-1">{invoice.sender.name}</span>
            {invoice.sender.address}
            {#if invoice.sender.email}
                <br>{invoice.sender.email}
            {/if}
        </div>
    </div>
    <div class="text-right">
        <h2 class="text-4xl font-light text-gray-300 mb-4">{dictionary.editor.title}</h2>
        <table class="text-sm ml-auto">
            <tbody>
                <tr>
                    <td class="font-bold text-gray-600 pr-4 py-1">{dictionary.editor.number}:</td>
                    <td class="font-mono text-gray-900">{invoice.meta.number}</td>
                </tr>
                <tr>
                    <td class="font-bold text-gray-600 pr-4 py-1">{dictionary.editor.date}:</td>
                    <td class="text-gray-900">{invoice.meta.date}</td>
                </tr>
                <tr>
                    <td class="font-bold text-gray-600 pr-4 py-1">{dictionary.editor.dueDate}:</td>
                    <td class="text-gray-900">{invoice.meta.dueDate}</td>
                </tr>
            </tbody>
        </table>
    </div>
  </div>

  <!-- Client -->
  <div class="mb-12">
    <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{dictionary.editor.to}</h3>
    <div class="text-gray-800 whitespace-pre-line">
        <span class="font-bold text-xl block mb-1">{invoice.client.name}</span>
        {invoice.client.address}
        {#if invoice.client.email}
            <br>{invoice.client.email}
        {/if}
    </div>
  </div>

  <!-- Items Table -->
  <table class="w-full mb-8">
    <thead>
        <tr class="border-b-2 border-gray-100">
            <th class="text-left py-3 text-xs font-bold text-gray-400 uppercase tracking-wider w-1/2">{dictionary.editor.itemDesc}</th>
            <th class="text-center py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">{dictionary.editor.quantity}</th>
            <th class="text-right py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">{dictionary.editor.price}</th>
            <th class="text-right py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">{dictionary.editor.amount}</th>
        </tr>
    </thead>
    <tbody>
        {#each invoice.items as item}
            <tr class="border-b border-gray-50">
                <td class="py-4 text-gray-800 font-medium">{item.description}</td>
                <td class="py-4 text-center text-gray-600">{item.quantity}</td>
                <td class="py-4 text-right text-gray-600">{invoice.settings.currency} {formatCurrency(item.price)}</td>
                <td class="py-4 text-right text-gray-800 font-bold">{invoice.settings.currency} {formatCurrency(item.quantity * item.price)}</td>
            </tr>
        {/each}
    </tbody>
  </table>

  <!-- Totals -->
  <div class="flex justify-end mb-12">
    <div class="w-1/2 sm:w-1/3">
        <div class="flex justify-between py-2 text-gray-600 text-sm">
            <span>{dictionary.editor.subtotal}</span>
            <span class="font-medium text-gray-900">{invoice.settings.currency} {formatCurrency(totals.subtotal)}</span>
        </div>
        {#if invoice.settings.discount > 0}
            <div class="flex justify-between py-2 text-red-500 text-sm">
                <span>{dictionary.editor.discount} ({invoice.settings.discount}%)</span>
                <span>- {invoice.settings.currency} {formatCurrency(totals.discountAmount)}</span>
            </div>
        {/if}
        {#if invoice.settings.taxRate > 0}
            <div class="flex justify-between py-2 text-gray-600 text-sm">
                <span>{dictionary.editor.tax} ({invoice.settings.taxRate}%)</span>
                <span>{invoice.settings.currency} {formatCurrency(totals.taxAmount)}</span>
            </div>
        {/if}
        <div class="flex justify-between py-3 border-t-2 border-gray-100 text-lg font-bold text-gray-900 mt-2">
            <span>{dictionary.editor.total}</span>
            <span>{invoice.settings.currency} {formatCurrency(totals.total)}</span>
        </div>
    </div>
  </div>

  <!-- Notes / Footer -->
  {#if invoice.meta.notes}
    <div class="pt-8 border-t border-gray-100">
        <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{dictionary.editor.notes}</h4>
        <p class="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{invoice.meta.notes}</p>
    </div>
  {/if}

  <!-- Footer Branding -->
  <div class="absolute bottom-8 left-0 w-full text-center print:hidden">
      <p class="text-xs text-gray-300">Generated with Invoice Forge</p>
  </div>
</div>

<style>
    @media print {
        @page {
            margin: 0;
            size: auto;
        }

        :global(body) {
            visibility: hidden;
            background: white;
        }

        #invoice-preview {
            visibility: visible;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 40px; /* Force padding for print */
            box-shadow: none;
            overflow: visible;
        }

        #invoice-preview * {
            visibility: visible;
        }
    }
</style>
