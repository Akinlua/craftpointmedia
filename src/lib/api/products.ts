import { Product, ProductFilters, CreateProductData, UpdateProductData } from '@/types/product';
import { supabase } from '@/integrations/supabase/client';

type DbProduct = {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  sku: string;
  price: number;
  tax_rate: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
};

function mapDbProduct(dbProduct: DbProduct): Product {
  return {
    id: dbProduct.id,
    orgId: dbProduct.org_id,
    name: dbProduct.name,
    description: dbProduct.description || undefined,
    sku: dbProduct.sku,
    price: dbProduct.price,
    taxRate: dbProduct.tax_rate,
    active: dbProduct.active,
    createdAt: dbProduct.created_at,
    updatedAt: dbProduct.updated_at,
    createdBy: dbProduct.created_by,
  };
}

export async function getProducts(filters?: ProductFilters): Promise<{ data: Product[]; total: number }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .single();

  if (!profile) throw new Error('Profile not found');

  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('org_id', profile.org_id);

  if (filters?.search) {
    const search = `%${filters.search}%`;
    query = query.or(`name.ilike.${search},sku.ilike.${search},description.ilike.${search}`);
  }

  if (filters?.active !== undefined) {
    query = query.eq('active', filters.active);
  }

  if (filters?.sortBy) {
    query = query.order(filters.sortBy, { ascending: filters.sortOrder !== 'desc' });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error, count } = await query;

  if (error) throw error;

  return { 
    data: (data || []).map(mapDbProduct), 
    total: count || 0 
  };
}

export async function createProduct(data: CreateProductData): Promise<Product> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .single();

  if (!profile) throw new Error('Profile not found');

  const { data: product, error } = await supabase
    .from('products')
    .insert({
      name: data.name,
      description: data.description,
      sku: data.sku,
      price: data.price,
      tax_rate: data.taxRate,
      active: data.active,
      org_id: profile.org_id,
      created_by: user.id
    })
    .select()
    .single();

  if (error) throw error;
  return mapDbProduct(product);
}

export async function updateProduct(data: UpdateProductData): Promise<Product> {
  const { id, ...updateData } = data;

  const dbUpdate: any = {};
  if (updateData.name !== undefined) dbUpdate.name = updateData.name;
  if (updateData.description !== undefined) dbUpdate.description = updateData.description;
  if (updateData.sku !== undefined) dbUpdate.sku = updateData.sku;
  if (updateData.price !== undefined) dbUpdate.price = updateData.price;
  if (updateData.taxRate !== undefined) dbUpdate.tax_rate = updateData.taxRate;
  if (updateData.active !== undefined) dbUpdate.active = updateData.active;

  const { data: product, error } = await supabase
    .from('products')
    .update(dbUpdate)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapDbProduct(product);
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function bulkUpdateProducts(action: 'activate' | 'deactivate' | 'delete', productIds: string[]): Promise<void> {
  if (action === 'delete') {
    const { error } = await supabase
      .from('products')
      .delete()
      .in('id', productIds);

    if (error) throw error;
  } else {
    const active = action === 'activate';
    const { error } = await supabase
      .from('products')
      .update({ active })
      .in('id', productIds);

    if (error) throw error;
  }
}

export async function getNextSKU(prefix: string = 'PROD'): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .single();

  if (!profile) throw new Error('Profile not found');

  // Get the latest product with this prefix
  const { data: products } = await supabase
    .from('products')
    .select('sku')
    .eq('org_id', profile.org_id)
    .ilike('sku', `${prefix}-%`)
    .order('created_at', { ascending: false })
    .limit(100);

  if (!products || products.length === 0) {
    return `${prefix}-001`;
  }

  // Extract numbers from SKUs and find the highest
  const numbers = products
    .map(p => {
      const match = p.sku.match(new RegExp(`${prefix}-(\\d+)`));
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(n => !isNaN(n));

  const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
  const nextNumber = maxNumber + 1;

  return `${prefix}-${nextNumber.toString().padStart(3, '0')}`;
}

export async function checkSKUExists(sku: string, excludeId?: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .single();

  if (!profile) throw new Error('Profile not found');

  let query = supabase
    .from('products')
    .select('id')
    .eq('org_id', profile.org_id)
    .eq('sku', sku);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data } = await query;

  return (data || []).length > 0;
}