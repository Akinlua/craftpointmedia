import { Invoice, InvoiceFilters, CreateInvoiceData, UpdateInvoiceData, SendInvoiceData } from '@/types/invoice';
import { ENV, API_ENDPOINTS } from '@/lib/config/env';

// Helper to get auth token
const getAuthToken = () => localStorage.getItem('AUTH_TOKEN');

// Helper to transform backend invoice data to frontend format
const transformInvoice = (data: any): Invoice => ({
  id: data.id,
  orgId: data.organizationId || data.organization_id,
  number: data.invoiceNumber || data.invoice_number || data.number,
  status: data.status,
  contactId: data.contactId || data.contact_id,
  contactName: data.contact ? `${data.contact.firstName || data.contact.first_name || ''} ${data.contact.lastName || data.contact.last_name || ''}`.trim() : 'Unknown',
  contactEmail: data.contact?.email,
  lineItems: (data.items || []).map((item: any) => ({
    id: item.id,
    productId: item.productId || item.product_id,
    productName: item.productName || item.product_name || item.description,
    description: item.description,
    quantity: item.quantity,
    unitPrice: parseFloat(item.unitPrice || item.unit_price || 0),
    taxRate: parseFloat(item.taxRate || item.tax_rate || 0),
    lineTotal: parseFloat(item.lineTotal || item.line_total || 0)
  })),
  subtotal: parseFloat(data.subtotal || 0),
  taxTotal: parseFloat(data.tax || data.tax_total || 0),
  total: parseFloat(data.total || 0),
  currency: data.currency || 'USD',
  notes: data.notes,
  terms: data.terms,
  dueDate: data.dueDate || data.due_date,
  paymentTerms: data.paymentTerms || data.payment_terms,
  sentAt: data.sentAt || data.sent_at,
  paidAt: data.paidAt || data.paid_at,
  createdAt: data.createdAt || data.created_at,
  updatedAt: data.updatedAt || data.updated_at,
  ownerId: data.createdBy || data.created_by || data.owner_id,
  ownerName: data.creator ? `${data.creator.firstName || data.creator.first_name || ''} ${data.creator.lastName || data.creator.last_name || ''}`.trim() : 'Unknown'
});

/**
 * Get invoice statistics
 * GET /invoices/stats
 */
export async function getInvoiceStats(): Promise<{
  statusBreakdown: any[];
  totals: {
    totalInvoices: number;
    totalValue: number;
    totalPaid: number;
    averageValue: number;
    overdueCount: number;
  };
}> {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  console.log('Fetching invoice stats from:', `${ENV.API_BASE_URL}${API_ENDPOINTS.INVOICES.STATS}`);

  const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.INVOICES.STATS}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Get invoice stats error:', errorText);
    throw new Error(`Failed to fetch invoice stats: ${response.status}`);
  }

  const result = await response.json();
  console.log('Invoice stats response:', result);

  const data = result.data || result;
  return {
    statusBreakdown: data.statusBreakdown || [],
    totals: {
      totalInvoices: parseInt(data.totals?.totalInvoices || 0),
      totalValue: parseFloat(data.totals?.totalValue || 0),
      totalPaid: parseFloat(data.totals?.totalPaid || 0),
      averageValue: parseFloat(data.totals?.averageValue || 0),
      overdueCount: parseInt(data.totals?.overdueCount || 0)
    }
  };
}

/**
 * Get invoices with optional filters
 * GET /invoices
 */
export async function getInvoices(filters?: InvoiceFilters): Promise<{ data: Invoice[]; total: number }> {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const queryParams = new URLSearchParams({
    page: '1',
    limit: '100', // Get all invoices for now
  });

  if (filters?.status && filters.status.length > 0) {
    queryParams.append('status', filters.status.join(','));
  }
  if (filters?.contactId) {
    queryParams.append('contactId', filters.contactId);
  }
  if (filters?.search) {
    queryParams.append('search', filters.search);
  }

  const url = `${ENV.API_BASE_URL}${API_ENDPOINTS.INVOICES.BASE}?${queryParams.toString()}`;
  console.log('Fetching invoices from:', url);

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Get invoices error:', errorText);
    throw new Error(`Failed to fetch invoices: ${response.status}`);
  }

  const result = await response.json();
  console.log('Invoices response:', result);

  const invoicesData = result.data?.invoices || result.data || [];
  const invoices = (Array.isArray(invoicesData) ? invoicesData : []).map(transformInvoice);

  const pagination = result.data?.meta?.pagination || {};
  const total = pagination.total || invoices.length;

  return { data: invoices, total };
}

/**
 * Get single invoice by ID
 * GET /invoices/:id
 */
export async function getInvoice(id: string): Promise<Invoice> {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const url = `${ENV.API_BASE_URL}${API_ENDPOINTS.INVOICES.BASE}/${id}`;
  console.log('Fetching invoice from:', url);

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Get invoice error:', errorText);
    throw new Error(`Failed to fetch invoice: ${response.status}`);
  }

  const result = await response.json();
  console.log('Invoice response:', result);

  const invoiceData = result.data || result;
  return transformInvoice(invoiceData);
}

/**
 * Create new invoice
 * POST /invoices
 */
export async function createInvoice(data: CreateInvoiceData): Promise<Invoice> {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const payload = {
    contactId: data.contactId,
    items: data.lineItems.map(item => ({
      description: item.description || item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxRate: item.taxRate || 0
    })),
    dueDate: data.dueDate,
    notes: data.notes,
    terms: data.terms,
    paymentTerms: data.paymentTerms ? String(data.paymentTerms) : undefined
  };

  console.log('Creating invoice with payload:', payload);

  const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.INVOICES.BASE}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Create invoice error:', errorText);
    let errorMessage = 'Failed to create invoice';
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorJson.error || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  const result = await response.json();
  console.log('Invoice created:', result);

  const invoiceData = result.data || result;
  return transformInvoice(invoiceData);
}

/**
 * Update existing invoice
 * PATCH /invoices/:id
 */
export async function updateInvoice(data: UpdateInvoiceData): Promise<Invoice> {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const { id, lineItems, ...updateData } = data;

  const payload: any = {};
  if (updateData.contactId !== undefined) payload.contactId = updateData.contactId;
  if (updateData.notes !== undefined) payload.notes = updateData.notes;
  if (updateData.terms !== undefined) payload.terms = updateData.terms;
  if (updateData.dueDate !== undefined) payload.dueDate = updateData.dueDate;
  if (updateData.paymentTerms !== undefined) payload.paymentTerms = String(updateData.paymentTerms);
  if (updateData.status !== undefined) payload.status = updateData.status;

  if (lineItems) {
    payload.items = lineItems.map(item => ({
      description: item.description || item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxRate: item.taxRate || 0
    }));
  }

  console.log('Updating invoice with payload:', payload);

  const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.INVOICES.BASE}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Update invoice error:', errorText);
    throw new Error(`Failed to update invoice: ${response.status}`);
  }

  const result = await response.json();
  console.log('Invoice updated:', result);

  const invoiceData = result.data || result;
  return transformInvoice(invoiceData);
}

/**
 * Send invoice to contact
 * POST /invoices/:id/send
 */
export async function sendInvoice(data: SendInvoiceData): Promise<void> {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const payload = {
    channels: data.channels,
    customMessage: data.customMessage,
    template: data.template
  };

  const url = `${ENV.API_BASE_URL}${API_ENDPOINTS.INVOICES.SEND.replace('{id}', data.invoiceId)}`;
  console.log('Sending invoice:', url, payload);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Send invoice error:', errorText);
    throw new Error(`Failed to send invoice: ${response.status}`);
  }

  console.log('Invoice sent successfully');
}

/**
 * Mark invoice as paid (using update endpoint)
 */
export async function markInvoiceAsPaid(invoiceId: string): Promise<void> {
  await updateInvoice({
    id: invoiceId,
    status: 'paid'
  });
}

/**
 * Delete invoice
 * DELETE /invoices/:id
 */
export async function deleteInvoice(id: string): Promise<void> {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.INVOICES.BASE}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Delete invoice error:', errorText);
    throw new Error(`Failed to delete invoice: ${response.status}`);
  }

  console.log('Invoice deleted successfully');
}

/**
 * Bulk update invoices (implemented as sequential calls since no bulk endpoint exists)
 */
export async function bulkUpdateInvoices(action: 'send' | 'mark_paid' | 'delete', invoiceIds: string[]): Promise<void> {
  const promises = invoiceIds.map(async (id) => {
    try {
      if (action === 'delete') {
        await deleteInvoice(id);
      } else if (action === 'mark_paid') {
        await markInvoiceAsPaid(id);
      } else if (action === 'send') {
        await sendInvoice({ invoiceId: id, channels: ['email'] });
      }
    } catch (error) {
      console.error(`Failed to ${action} invoice ${id}:`, error);
      throw error;
    }
  });

  await Promise.all(promises);
}

/**
 * Generate PDF URL (stub - not available in backend)
 */
export async function generateInvoicePdfUrl(invoiceId: string): Promise<string> {
  return `${ENV.API_BASE_URL}${API_ENDPOINTS.INVOICES.BASE}/${invoiceId}/pdf`;
}
