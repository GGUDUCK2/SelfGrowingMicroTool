import type { Invoice } from './types';
import { v4 as uuidv4 } from 'uuid';
import { format, addDays } from 'date-fns';

export function createEmptyInvoice(): Invoice {
  const today = new Date();
  return {
    sender: {
      name: '',
      email: '',
      address: ''
    },
    client: {
      name: '',
      email: '',
      address: ''
    },
    meta: {
      number: 'INV-001',
      date: format(today, 'yyyy-MM-dd'),
      dueDate: format(addDays(today, 14), 'yyyy-MM-dd'),
      notes: ''
    },
    items: [
      { id: uuidv4(), description: 'Service / Product', quantity: 1, price: 0 }
    ],
    settings: {
      currency: '$',
      taxRate: 0,
      discount: 0,
      discountType: 'percent'
    }
  };
}
