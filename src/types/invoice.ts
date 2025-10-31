export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceLineItem {
  id: string;
  productId?: string;
  productName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  lineTotal: number;
}

export interface Invoice {
  id: string;
  number: string;
  status: InvoiceStatus;
  contactId: string;
  contactName: string;
  contactEmail?: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxTotal: number;
  total: number;
  currency: string;
  notes?: string;
  terms?: string;
  dueDate?: string;
  paymentTerms?: number; // days
  sentAt?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  ownerName: string;
  orgId: string;
  lastActivityAt?: string;
}

export interface InvoiceFilters {
  status?: InvoiceStatus[];
  contactId?: string;
  ownerId?: string;
  dateRange?: {
    from: string;
    to: string;
  };
  search?: string;
}

export interface InvoiceBulkAction {
  type: 'send' | 'mark_paid' | 'delete';
  invoiceIds: string[];
  data?: any;
}

export interface CreateInvoiceData {
  contactId: string;
  lineItems: Omit<InvoiceLineItem, 'id' | 'lineTotal'>[];
  notes?: string;
  terms?: string;
  dueDate?: string;
  paymentTerms?: number;
}

export interface UpdateInvoiceData extends Partial<CreateInvoiceData> {
  id: string;
  status?: InvoiceStatus;
}

export interface SendInvoiceData {
  invoiceId: string;
  channels: ('email' | 'sms')[];
  template: {
    subject: string;
    body: string;
    attachPdf: boolean;
  };
}

export interface InvoiceActivity {
  id: string;
  invoiceId: string;
  type: 'created' | 'sent' | 'viewed' | 'paid' | 'reminder_sent' | 'status_changed';
  title: string;
  description?: string;
  channel?: 'email' | 'sms';
  createdBy: string;
  createdByName: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface ManualPaymentData {
  invoiceId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  reference?: string;
}