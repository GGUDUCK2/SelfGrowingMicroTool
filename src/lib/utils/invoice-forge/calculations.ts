import type { InvoiceItem, InvoiceSettings } from './types';

export function calculateSubtotal(items: InvoiceItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
}

export function calculateTax(subtotal: number, taxRate: number): number {
  return subtotal * (taxRate / 100);
}

export function calculateDiscount(subtotal: number, discount: number): number {
  return subtotal * (discount / 100);
}

export function calculateTotal(items: InvoiceItem[], settings: InvoiceSettings): {
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
} {
  const subtotal = calculateSubtotal(items);
  const discountAmount = calculateDiscount(subtotal, settings.discount);
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = calculateTax(taxableAmount, settings.taxRate);
  const total = taxableAmount + taxAmount;

  return { subtotal, taxAmount, discountAmount, total };
}

export function formatCurrency(amount: number): string {
  return amount.toFixed(2);
}
