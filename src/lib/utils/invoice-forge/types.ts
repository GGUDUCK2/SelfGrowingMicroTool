export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface InvoiceSettings {
  currency: string;
  taxRate: number;
  discount: number; // Percentage
  discountType: 'percent' | 'fixed';
  logo?: string; // Base64
}

export interface InvoiceMeta {
  number: string;
  date: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  notes: string;
}

export interface InvoiceClient {
  name: string;
  email: string;
  address: string;
}

export interface InvoiceSender {
  name: string;
  email: string; // Optional
  address: string;
}

export interface Invoice {
  sender: InvoiceSender;
  client: InvoiceClient;
  meta: InvoiceMeta;
  items: InvoiceItem[];
  settings: InvoiceSettings;
}
