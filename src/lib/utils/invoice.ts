export function generateInvoiceNumber(prefix = 'INV', lastNumber?: number): string {
  const nextNumber = (lastNumber || 0) + 1;
  return `${prefix}-${String(nextNumber).padStart(6, '0')}`;
}

export function calculateInvoiceTotals(lineItems: Array<{
  quantity: number;
  unitPrice: number;
  taxRate: number;
}>) {
  const subtotal = lineItems.reduce((sum, item) => {
    return sum + (item.quantity * item.unitPrice);
  }, 0);
  
  const taxTotal = lineItems.reduce((sum, item) => {
    const lineSubtotal = item.quantity * item.unitPrice;
    return sum + (lineSubtotal * item.taxRate / 100);
  }, 0);
  
  const total = subtotal + taxTotal;
  
  return {
    subtotal: Math.round(subtotal),
    taxTotal: Math.round(taxTotal),
    total: Math.round(total)
  };
}

export function getInvoiceStatusColor(status: string): string {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
    case 'sent':
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
    case 'overdue':
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
    case 'draft':
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    case 'cancelled':
      return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
  }
}

export function getDueDateStatus(dueDate?: string): 'not_set' | 'upcoming' | 'due_today' | 'overdue' {
  if (!dueDate) return 'not_set';
  
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'overdue';
  if (diffDays === 0) return 'due_today';
  if (diffDays <= 7) return 'upcoming';
  return 'not_set';
}