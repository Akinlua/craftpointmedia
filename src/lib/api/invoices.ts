import { Invoice, InvoiceFilters, CreateInvoiceData, UpdateInvoiceData, SendInvoiceData, ManualPaymentData, InvoiceActivity, InvoiceLineItem, InvoiceStatus } from '@/types/invoice';
import { supabase } from '@/integrations/supabase/client';

type DbInvoice = {
  id: string;
  org_id: string;
  number: string;
  status: string;
  contact_id: string;
  subtotal: number;
  tax_total: number;
  total: number;
  currency: string;
  notes: string | null;
  terms: string | null;
  due_date: string | null;
  payment_terms: number | null;
  sent_at: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  owner_id: string;
};

type DbLineItem = {
  id: string;
  invoice_id: string;
  product_id: string | null;
  product_name: string;
  description: string | null;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  line_total: number;
  created_at: string;
};

type DbActivity = {
  id: string;
  invoice_id: string;
  type: string;
  title: string;
  description: string | null;
  channel: string | null;
  created_by: string;
  created_at: string;
  metadata: any;
};

function mapDbLineItem(item: DbLineItem): InvoiceLineItem {
  return {
    id: item.id,
    productId: item.product_id || undefined,
    productName: item.product_name,
    description: item.description || undefined,
    quantity: item.quantity,
    unitPrice: item.unit_price,
    taxRate: item.tax_rate,
    lineTotal: item.line_total
  };
}

function mapDbActivity(activity: DbActivity, createdByName: string): InvoiceActivity {
  return {
    id: activity.id,
    invoiceId: activity.invoice_id,
    type: activity.type as any,
    title: activity.title,
    description: activity.description || undefined,
    channel: activity.channel as any,
    createdBy: activity.created_by,
    createdByName,
    createdAt: activity.created_at,
    metadata: activity.metadata
  };
}

async function getOrgId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .single();

  if (!profile) throw new Error('Profile not found');
  return profile.org_id;
}

export async function getInvoices(filters?: InvoiceFilters): Promise<{ data: Invoice[]; total: number }> {
  const orgId = await getOrgId();

  let query = supabase
    .from('invoices')
    .select(`
      *,
      contacts:contact_id (first_name, last_name, email)
    `, { count: 'exact' })
    .eq('org_id', orgId);

  if (filters?.status && filters.status.length > 0) {
    query = query.in('status', filters.status);
  }

  if (filters?.contactId) {
    query = query.eq('contact_id', filters.contactId);
  }

  if (filters?.ownerId) {
    query = query.eq('owner_id', filters.ownerId);
  }

  if (filters?.search) {
    query = query.or(`number.ilike.%${filters.search}%`);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error, count } = await query;

  if (error) throw error;

  // Fetch owner profiles
  const ownerIds = [...new Set((data || []).map(inv => inv.owner_id))];
  let ownersMap: Record<string, { first_name: string; last_name: string }> = {};
  
  if (ownerIds.length > 0) {
    const { data: owners } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .in('id', ownerIds);

    ownersMap = (owners || []).reduce((acc, owner) => {
      acc[owner.id] = owner;
      return acc;
    }, {} as Record<string, { first_name: string; last_name: string }>);
  }

  // Fetch line items for all invoices
  const invoiceIds = (data || []).map(inv => inv.id);
  let lineItemsMap: Record<string, InvoiceLineItem[]> = {};
  
  if (invoiceIds.length > 0) {
    const { data: lineItems } = await supabase
      .from('invoice_line_items')
      .select('*')
      .in('invoice_id', invoiceIds);

    lineItemsMap = (lineItems || []).reduce((acc, item) => {
      if (!acc[item.invoice_id]) acc[item.invoice_id] = [];
      acc[item.invoice_id].push(mapDbLineItem(item));
      return acc;
    }, {} as Record<string, InvoiceLineItem[]>);
  }

  const invoices: Invoice[] = (data || []).map((inv: any) => {
    const owner = ownersMap[inv.owner_id];
    return {
      id: inv.id,
      orgId: inv.org_id,
      number: inv.number,
      status: inv.status as InvoiceStatus,
      contactId: inv.contact_id,
      contactName: inv.contacts ? `${inv.contacts.first_name} ${inv.contacts.last_name}` : 'Unknown',
      contactEmail: inv.contacts?.email,
      lineItems: lineItemsMap[inv.id] || [],
      subtotal: inv.subtotal,
      taxTotal: inv.tax_total,
      total: inv.total,
      currency: inv.currency,
      notes: inv.notes || undefined,
      terms: inv.terms || undefined,
      dueDate: inv.due_date || undefined,
      paymentTerms: inv.payment_terms || undefined,
      sentAt: inv.sent_at || undefined,
      paidAt: inv.paid_at || undefined,
      createdAt: inv.created_at,
      updatedAt: inv.updated_at,
      ownerId: inv.owner_id,
      ownerName: owner ? `${owner.first_name} ${owner.last_name}` : 'Unknown'
    };
  });

  return { data: invoices, total: count || 0 };
}

export async function getInvoice(id: string): Promise<Invoice> {
  const orgId = await getOrgId();

  const { data: inv, error } = await supabase
    .from('invoices')
    .select(`
      *,
      contacts:contact_id (first_name, last_name, email)
    `)
    .eq('id', id)
    .eq('org_id', orgId)
    .single();

  if (error) throw error;
  if (!inv) throw new Error('Invoice not found');

  // Fetch owner profile
  const { data: owner } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', inv.owner_id)
    .single();

  // Fetch line items
  const { data: lineItems } = await supabase
    .from('invoice_line_items')
    .select('*')
    .eq('invoice_id', id);

  return {
    id: inv.id,
    orgId: inv.org_id,
    number: inv.number,
    status: inv.status as InvoiceStatus,
    contactId: inv.contact_id,
    contactName: inv.contacts ? `${inv.contacts.first_name} ${inv.contacts.last_name}` : 'Unknown',
    contactEmail: inv.contacts?.email,
    lineItems: (lineItems || []).map(mapDbLineItem),
    subtotal: inv.subtotal,
    taxTotal: inv.tax_total,
    total: inv.total,
    currency: inv.currency,
    notes: inv.notes || undefined,
    terms: inv.terms || undefined,
    dueDate: inv.due_date || undefined,
    paymentTerms: inv.payment_terms || undefined,
    sentAt: inv.sent_at || undefined,
    paidAt: inv.paid_at || undefined,
    createdAt: inv.created_at,
    updatedAt: inv.updated_at,
    ownerId: inv.owner_id,
    ownerName: owner ? `${owner.first_name} ${owner.last_name}` : 'Unknown'
  };
}

export async function createInvoice(data: CreateInvoiceData): Promise<Invoice> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const orgId = await getOrgId();

  // Calculate totals
  const lineItems = data.lineItems.map(item => ({
    ...item,
    lineTotal: Math.round(item.quantity * item.unitPrice * (1 + item.taxRate / 100))
  }));

  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const taxTotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.taxRate / 100), 0);
  const total = subtotal + taxTotal;

  // Get the next invoice number
  const { data: lastInvoice } = await supabase
    .from('invoices')
    .select('number')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  let nextNumber = 1;
  if (lastInvoice?.number) {
    const match = lastInvoice.number.match(/\d+$/);
    if (match) {
      nextNumber = parseInt(match[0]) + 1;
    }
  }
  const invoiceNumber = `INV-${String(nextNumber).padStart(6, '0')}`;

  // Create invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      org_id: orgId,
      number: invoiceNumber,
      status: 'draft',
      contact_id: data.contactId,
      subtotal: Math.round(subtotal),
      tax_total: Math.round(taxTotal),
      total: Math.round(total),
      currency: 'USD',
      notes: data.notes,
      terms: data.terms,
      due_date: data.dueDate,
      payment_terms: data.paymentTerms,
      owner_id: user.id
    })
    .select()
    .single();

  if (invoiceError) throw invoiceError;

  // Create line items
  const lineItemsToInsert = lineItems.map(item => ({
    invoice_id: invoice.id,
    product_id: item.productId,
    product_name: item.productName,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    tax_rate: item.taxRate,
    line_total: item.lineTotal
  }));

  const { error: lineItemsError } = await supabase
    .from('invoice_line_items')
    .insert(lineItemsToInsert);

  if (lineItemsError) throw lineItemsError;

  // Create activity
  await supabase
    .from('invoice_activities')
    .insert({
      invoice_id: invoice.id,
      type: 'created',
      title: 'Invoice created',
      created_by: user.id
    });

  return getInvoice(invoice.id);
}

export async function updateInvoice(data: UpdateInvoiceData): Promise<Invoice> {
  const { id, lineItems, ...updateData } = data;
  const orgId = await getOrgId();

  // Build update object
  const dbUpdate: any = {};
  if (updateData.contactId !== undefined) dbUpdate.contact_id = updateData.contactId;
  if (updateData.notes !== undefined) dbUpdate.notes = updateData.notes;
  if (updateData.terms !== undefined) dbUpdate.terms = updateData.terms;
  if (updateData.dueDate !== undefined) dbUpdate.due_date = updateData.dueDate;
  if (updateData.paymentTerms !== undefined) dbUpdate.payment_terms = updateData.paymentTerms;
  if (updateData.status !== undefined) dbUpdate.status = updateData.status;

  // If line items changed, recalculate totals
  if (lineItems) {
    const items = lineItems.map(item => ({
      ...item,
      lineTotal: Math.round(item.quantity * item.unitPrice * (1 + item.taxRate / 100))
    }));

    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxTotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.taxRate / 100), 0);
    const total = subtotal + taxTotal;

    dbUpdate.subtotal = Math.round(subtotal);
    dbUpdate.tax_total = Math.round(taxTotal);
    dbUpdate.total = Math.round(total);

    // Delete existing line items and insert new ones
    await supabase
      .from('invoice_line_items')
      .delete()
      .eq('invoice_id', id);

    const lineItemsToInsert = items.map(item => ({
      invoice_id: id,
      product_id: item.productId,
      product_name: item.productName,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      tax_rate: item.taxRate,
      line_total: item.lineTotal
    }));

    await supabase
      .from('invoice_line_items')
      .insert(lineItemsToInsert);
  }

  // Update invoice
  const { error } = await supabase
    .from('invoices')
    .update(dbUpdate)
    .eq('id', id)
    .eq('org_id', orgId);

  if (error) throw error;

  return getInvoice(id);
}

export async function sendInvoice(data: SendInvoiceData): Promise<void> {
  const orgId = await getOrgId();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('invoices')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString()
    })
    .eq('id', data.invoiceId)
    .eq('org_id', orgId);

  if (error) throw error;

  // Create activity
  await supabase
    .from('invoice_activities')
    .insert({
      invoice_id: data.invoiceId,
      type: 'sent',
      title: `Invoice sent via ${data.channels.join(', ')}`,
      channel: data.channels[0],
      created_by: user.id
    });
}

export async function markInvoiceAsPaid(invoiceId: string, paymentData?: ManualPaymentData): Promise<void> {
  const orgId = await getOrgId();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('invoices')
    .update({
      status: 'paid',
      paid_at: paymentData?.paymentDate || new Date().toISOString()
    })
    .eq('id', invoiceId)
    .eq('org_id', orgId);

  if (error) throw error;

  // Create activity
  await supabase
    .from('invoice_activities')
    .insert({
      invoice_id: invoiceId,
      type: 'paid',
      title: 'Payment received',
      description: paymentData?.paymentMethod || 'Manual payment',
      created_by: user.id,
      metadata: paymentData ? {
        amount: paymentData.amount,
        method: paymentData.paymentMethod,
        reference: paymentData.reference
      } : {}
    });
}

export async function deleteInvoice(id: string): Promise<void> {
  const orgId = await getOrgId();

  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id)
    .eq('org_id', orgId);

  if (error) throw error;
}

export async function getInvoiceActivities(invoiceId: string): Promise<InvoiceActivity[]> {
  const orgId = await getOrgId();

  // Verify invoice belongs to org
  const { data: invoice } = await supabase
    .from('invoices')
    .select('id')
    .eq('id', invoiceId)
    .eq('org_id', orgId)
    .single();

  if (!invoice) throw new Error('Invoice not found');

  const { data, error } = await supabase
    .from('invoice_activities')
    .select(`
      *,
      profiles:created_by (first_name, last_name)
    `)
    .eq('invoice_id', invoiceId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((activity: any) => {
    const createdByName = activity.profiles 
      ? `${activity.profiles.first_name} ${activity.profiles.last_name}` 
      : activity.created_by === 'system' ? 'System' : 'Unknown';
    return mapDbActivity(activity, createdByName);
  });
}

export async function generateInvoicePdfUrl(invoiceId: string): Promise<string> {
  // Return a stub PDF URL for now
  return `${window.location.origin}/api/invoices/${invoiceId}/pdf`;
}

export async function bulkUpdateInvoices(action: 'send' | 'mark_paid' | 'delete', invoiceIds: string[]): Promise<void> {
  const orgId = await getOrgId();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  if (action === 'delete') {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .in('id', invoiceIds)
      .eq('org_id', orgId);

    if (error) throw error;
  } else if (action === 'send') {
    const { error } = await supabase
      .from('invoices')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .in('id', invoiceIds)
      .eq('org_id', orgId)
      .eq('status', 'draft');

    if (error) throw error;

    // Create activities
    const activities = invoiceIds.map(id => ({
      invoice_id: id,
      type: 'sent',
      title: 'Invoice sent',
      created_by: user.id
    }));

    await supabase
      .from('invoice_activities')
      .insert(activities);
  } else if (action === 'mark_paid') {
    const { error } = await supabase
      .from('invoices')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString()
      })
      .in('id', invoiceIds)
      .eq('org_id', orgId)
      .in('status', ['sent', 'overdue']);

    if (error) throw error;

    // Create activities
    const activities = invoiceIds.map(id => ({
      invoice_id: id,
      type: 'paid',
      title: 'Payment received',
      created_by: user.id
    }));

    await supabase
      .from('invoice_activities')
      .insert(activities);
  }
}
