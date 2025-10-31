import { Invoice, InvoiceFilters, CreateInvoiceData, UpdateInvoiceData, SendInvoiceData, ManualPaymentData, InvoiceActivity } from '@/types/invoice';

// Mock data
const mockInvoices: Invoice[] = [
  {
    id: '1',
    number: 'INV-000001',
    status: 'paid',
    contactId: '1',
    contactName: 'John Smith',
    contactEmail: 'john@example.com',
    lineItems: [
      {
        id: '1',
        productId: '1',
        productName: 'Professional Consultation',
        description: 'Initial consultation session',
        quantity: 2,
        unitPrice: 15000,
        taxRate: 10,
        lineTotal: 33000
      }
    ],
    subtotal: 30000,
    taxTotal: 3000,
    total: 33000,
    currency: 'USD',
    notes: 'Thank you for your business',
    terms: 'Payment due within 30 days',
    dueDate: '2024-02-15',
    paymentTerms: 30,
    sentAt: '2024-01-15T10:00:00Z',
    paidAt: '2024-01-28T14:30:00Z',
    createdAt: '2024-01-15T09:30:00Z',
    updatedAt: '2024-01-28T14:30:00Z',
    ownerId: 'user-1',
    ownerName: 'Alice Johnson',
    orgId: 'org-1',
    lastActivityAt: '2024-01-28T14:30:00Z'
  },
  {
    id: '2',
    number: 'INV-000002',
    status: 'overdue',
    contactId: '2',
    contactName: 'Sarah Davis',
    contactEmail: 'sarah@company.com',
    lineItems: [
      {
        id: '2',
        productId: '2',
        productName: 'Software License',
        quantity: 1,
        unitPrice: 99900,
        taxRate: 0,
        lineTotal: 99900
      }
    ],
    subtotal: 99900,
    taxTotal: 0,
    total: 99900,
    currency: 'USD',
    dueDate: '2024-01-30',
    paymentTerms: 14,
    sentAt: '2024-01-16T11:00:00Z',
    createdAt: '2024-01-16T10:45:00Z',
    updatedAt: '2024-01-16T11:00:00Z',
    ownerId: 'user-1',
    ownerName: 'Alice Johnson',
    orgId: 'org-1',
    lastActivityAt: '2024-01-16T11:00:00Z'
  },
  {
    id: '3',
    number: 'INV-000003',
    status: 'draft',
    contactId: '3',
    contactName: 'Mike Wilson',
    contactEmail: 'mike@startup.com',
    lineItems: [
      {
        id: '3',
        productName: 'Custom Development',
        description: 'Custom software development work',
        quantity: 40,
        unitPrice: 12500,
        taxRate: 8.5,
        lineTotal: 542500
      }
    ],
    subtotal: 500000,
    taxTotal: 42500,
    total: 542500,
    currency: 'USD',
    dueDate: '2024-03-01',
    paymentTerms: 7,
    createdAt: '2024-01-20T15:20:00Z',
    updatedAt: '2024-01-25T09:10:00Z',
    ownerId: 'user-2',
    ownerName: 'Bob Smith',
    orgId: 'org-1'
  }
];

const mockActivities: InvoiceActivity[] = [
  {
    id: '1',
    invoiceId: '1',
    type: 'created',
    title: 'Invoice created',
    createdBy: 'user-1',
    createdByName: 'Alice Johnson',
    createdAt: '2024-01-15T09:30:00Z'
  },
  {
    id: '2',
    invoiceId: '1',
    type: 'sent',
    title: 'Invoice sent via email',
    channel: 'email',
    createdBy: 'user-1',
    createdByName: 'Alice Johnson',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '3',
    invoiceId: '1',
    type: 'paid',
    title: 'Payment received',
    description: '$330.00 via Stripe',
    createdBy: 'system',
    createdByName: 'System',
    createdAt: '2024-01-28T14:30:00Z'
  }
];

let invoiceCounter = 4;

export async function getInvoices(filters?: InvoiceFilters): Promise<{ data: Invoice[]; total: number }> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  let filteredInvoices = [...mockInvoices];
  
  if (filters?.status && filters.status.length > 0) {
    filteredInvoices = filteredInvoices.filter(invoice => filters.status!.includes(invoice.status));
  }
  
  if (filters?.contactId) {
    filteredInvoices = filteredInvoices.filter(invoice => invoice.contactId === filters.contactId);
  }
  
  if (filters?.ownerId) {
    filteredInvoices = filteredInvoices.filter(invoice => invoice.ownerId === filters.ownerId);
  }
  
  if (filters?.search) {
    const search = filters.search.toLowerCase();
    filteredInvoices = filteredInvoices.filter(invoice => 
      invoice.number.toLowerCase().includes(search) ||
      invoice.contactName.toLowerCase().includes(search)
    );
  }
  
  return { data: filteredInvoices, total: filteredInvoices.length };
}

export async function getInvoice(id: string): Promise<Invoice> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const invoice = mockInvoices.find(inv => inv.id === id);
  if (!invoice) throw new Error('Invoice not found');
  
  return invoice;
}

export async function createInvoice(data: CreateInvoiceData): Promise<Invoice> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Calculate totals
  const lineItems = data.lineItems.map((item, index) => ({
    ...item,
    id: `line-${Date.now()}-${index}`,
    lineTotal: Math.round(item.quantity * item.unitPrice * (1 + item.taxRate / 100))
  }));
  
  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const taxTotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.taxRate / 100), 0);
  const total = subtotal + taxTotal;
  
  const newInvoice: Invoice = {
    id: `invoice-${Date.now()}`,
    number: `INV-${String(invoiceCounter++).padStart(6, '0')}`,
    status: 'draft',
    ...data,
    lineItems,
    subtotal: Math.round(subtotal),
    taxTotal: Math.round(taxTotal),
    total: Math.round(total),
    currency: 'USD',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ownerId: 'user-1',
    ownerName: 'Current User',
    orgId: 'org-1',
    contactName: 'Selected Contact', // This would come from contact lookup
    contactEmail: 'contact@example.com'
  };
  
  mockInvoices.push(newInvoice);
  return newInvoice;
}

export async function updateInvoice(data: UpdateInvoiceData): Promise<Invoice> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = mockInvoices.findIndex(inv => inv.id === data.id);
  if (index === -1) throw new Error('Invoice not found');
  
  const currentInvoice = mockInvoices[index];
  
  // Recalculate totals if line items changed
  let updatedData: any = { ...data };
  if (data.lineItems) {
    const lineItems = data.lineItems.map((item, idx) => ({
      ...item,
      id: `line-${Date.now()}-${idx}`,
      lineTotal: Math.round(item.quantity * item.unitPrice * (1 + item.taxRate / 100))
    }));
    
    const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxTotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.taxRate / 100), 0);
    const total = subtotal + taxTotal;
    
    updatedData = {
      ...updatedData,
      lineItems,
      subtotal: Math.round(subtotal),
      taxTotal: Math.round(taxTotal),
      total: Math.round(total)
    };
  }
  
  const updatedInvoice = {
    ...currentInvoice,
    ...updatedData,
    updatedAt: new Date().toISOString()
  };
  
  mockInvoices[index] = updatedInvoice;
  return updatedInvoice;
}

export async function sendInvoice(data: SendInvoiceData): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const invoice = mockInvoices.find(inv => inv.id === data.invoiceId);
  if (!invoice) throw new Error('Invoice not found');
  
  // Update invoice status
  invoice.status = 'sent';
  invoice.sentAt = new Date().toISOString();
  invoice.updatedAt = new Date().toISOString();
  invoice.lastActivityAt = new Date().toISOString();
  
  console.log('Sending invoice via:', data.channels.join(', '));
  console.log('Template:', data.template);
}

export async function markInvoiceAsPaid(invoiceId: string, paymentData?: ManualPaymentData): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const invoice = mockInvoices.find(inv => inv.id === invoiceId);
  if (!invoice) throw new Error('Invoice not found');
  
  invoice.status = 'paid';
  invoice.paidAt = paymentData?.paymentDate || new Date().toISOString();
  invoice.updatedAt = new Date().toISOString();
  invoice.lastActivityAt = new Date().toISOString();
}

export async function deleteInvoice(id: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = mockInvoices.findIndex(inv => inv.id === id);
  if (index === -1) throw new Error('Invoice not found');
  
  mockInvoices.splice(index, 1);
}

export async function getInvoiceActivities(invoiceId: string): Promise<InvoiceActivity[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return mockActivities.filter(activity => activity.invoiceId === invoiceId);
}

export async function generateInvoicePdfUrl(invoiceId: string): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return a stub PDF URL
  return `${window.location.origin}/api/invoices/${invoiceId}/pdf`;
}

export async function bulkUpdateInvoices(action: 'send' | 'mark_paid' | 'delete', invoiceIds: string[]): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  invoiceIds.forEach(id => {
    const invoice = mockInvoices.find(inv => inv.id === id);
    if (!invoice) return;
    
    switch (action) {
      case 'send':
        if (invoice.status === 'draft') {
          invoice.status = 'sent';
          invoice.sentAt = new Date().toISOString();
        }
        break;
      case 'mark_paid':
        if (['sent', 'overdue'].includes(invoice.status)) {
          invoice.status = 'paid';
          invoice.paidAt = new Date().toISOString();
        }
        break;
      case 'delete':
        const index = mockInvoices.findIndex(inv => inv.id === id);
        if (index !== -1) mockInvoices.splice(index, 1);
        break;
    }
    
    if (action !== 'delete') {
      invoice.updatedAt = new Date().toISOString();
      invoice.lastActivityAt = new Date().toISOString();
    }
  });
}