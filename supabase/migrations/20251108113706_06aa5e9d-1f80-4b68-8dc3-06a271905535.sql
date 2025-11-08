-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  tax_rate NUMERIC NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL,
  UNIQUE(org_id, sku)
);

-- Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products RLS policies
CREATE POLICY "Users can view products in their org"
  ON public.products FOR SELECT
  USING (org_id = get_user_org_id(auth.uid()));

CREATE POLICY "Users can create products in their org"
  ON public.products FOR INSERT
  WITH CHECK (org_id = get_user_org_id(auth.uid()));

CREATE POLICY "Users can update products in their org"
  ON public.products FOR UPDATE
  USING (org_id = get_user_org_id(auth.uid()));

CREATE POLICY "Owners and managers can delete products"
  ON public.products FOR DELETE
  USING (
    org_id = get_user_org_id(auth.uid()) 
    AND (has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'manager'))
  );

-- Create invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax_total NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  notes TEXT,
  terms TEXT,
  due_date DATE,
  payment_terms INTEGER,
  sent_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  owner_id UUID NOT NULL,
  UNIQUE(org_id, number)
);

-- Enable RLS on invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Invoices RLS policies
CREATE POLICY "Users can view invoices in their org"
  ON public.invoices FOR SELECT
  USING (org_id = get_user_org_id(auth.uid()));

CREATE POLICY "Users can create invoices in their org"
  ON public.invoices FOR INSERT
  WITH CHECK (org_id = get_user_org_id(auth.uid()));

CREATE POLICY "Users can update invoices in their org"
  ON public.invoices FOR UPDATE
  USING (org_id = get_user_org_id(auth.uid()));

CREATE POLICY "Owners and managers can delete invoices"
  ON public.invoices FOR DELETE
  USING (
    org_id = get_user_org_id(auth.uid()) 
    AND (has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'manager'))
  );

-- Create invoice line items table
CREATE TABLE public.invoice_line_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  description TEXT,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  tax_rate NUMERIC NOT NULL DEFAULT 0,
  line_total NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on invoice line items
ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;

-- Invoice line items RLS policies
CREATE POLICY "Users can view line items for invoices in their org"
  ON public.invoice_line_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_line_items.invoice_id
      AND invoices.org_id = get_user_org_id(auth.uid())
    )
  );

CREATE POLICY "Users can create line items for invoices in their org"
  ON public.invoice_line_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_line_items.invoice_id
      AND invoices.org_id = get_user_org_id(auth.uid())
    )
  );

CREATE POLICY "Users can update line items for invoices in their org"
  ON public.invoice_line_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_line_items.invoice_id
      AND invoices.org_id = get_user_org_id(auth.uid())
    )
  );

CREATE POLICY "Users can delete line items for invoices in their org"
  ON public.invoice_line_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_line_items.invoice_id
      AND invoices.org_id = get_user_org_id(auth.uid())
    )
  );

-- Create invoice activities table
CREATE TABLE public.invoice_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  channel TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS on invoice activities
ALTER TABLE public.invoice_activities ENABLE ROW LEVEL SECURITY;

-- Invoice activities RLS policies
CREATE POLICY "Users can view activities for invoices in their org"
  ON public.invoice_activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_activities.invoice_id
      AND invoices.org_id = get_user_org_id(auth.uid())
    )
  );

CREATE POLICY "Users can create activities for invoices in their org"
  ON public.invoice_activities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_activities.invoice_id
      AND invoices.org_id = get_user_org_id(auth.uid())
    )
  );

-- Add updated_at triggers
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_products_org_id ON public.products(org_id);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_products_active ON public.products(active);

CREATE INDEX idx_invoices_org_id ON public.invoices(org_id);
CREATE INDEX idx_invoices_contact_id ON public.invoices(contact_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_number ON public.invoices(number);

CREATE INDEX idx_invoice_line_items_invoice_id ON public.invoice_line_items(invoice_id);
CREATE INDEX idx_invoice_line_items_product_id ON public.invoice_line_items(product_id);

CREATE INDEX idx_invoice_activities_invoice_id ON public.invoice_activities(invoice_id);