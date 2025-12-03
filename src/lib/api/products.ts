import { Product, ProductFilters, CreateProductData, UpdateProductData } from '@/types/product';
import { ENV, API_ENDPOINTS } from '@/lib/config/env';

// Helper to get auth token
const getAuthToken = () => localStorage.getItem('AUTH_TOKEN');

// Helper to transform backend product data to frontend format
const transformProduct = (data: any): Product => ({
  id: data.id,
  orgId: data.organizationId || data.organization_id,
  name: data.name,
  description: data.description,
  sku: data.sku,
  price: typeof data.price === 'string' ? parseFloat(data.price) : data.price,
  taxRate: data.taxRate || data.tax_rate || 0,
  active: data.status === 'active',
  createdAt: data.createdAt || data.created_at,
  updatedAt: data.updatedAt || data.updated_at,
  createdBy: data.createdBy || data.created_by,
});

export async function getProducts(filters?: ProductFilters): Promise<{ data: Product[]; total: number }> {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const queryParams = new URLSearchParams();
  if (filters?.search) queryParams.append('search', filters.search);
  if (filters?.active !== undefined) queryParams.append('status', filters.active ? 'active' : 'inactive');
  if (filters?.sortBy) queryParams.append('sortBy', filters.sortBy);
  if (filters?.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

  // Default pagination (can be exposed in filters if needed)
  queryParams.append('page', '1');
  queryParams.append('limit', '100');

  const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.PRODUCTS.BASE}?${queryParams.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Get products error:', errorText);
    throw new Error('Failed to fetch products');
  }

  const result = await response.json();
  const products = (result.data || []).map(transformProduct);

  return {
    data: products,
    total: result.meta?.pagination?.total || products.length
  };
}

export async function createProduct(data: CreateProductData): Promise<Product> {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const payload = {
    name: data.name,
    description: data.description,
    sku: data.sku,
    price: data.price,
    taxRate: data.taxRate,
    status: data.active ? 'active' : 'inactive',
    category: 'General' // Default category as it's required by backend but not in frontend form
  };

  const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.PRODUCTS.BASE}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Create product error:', errorText);
    throw new Error('Failed to create product');
  }

  const result = await response.json();
  return transformProduct(result.data || result);
}

export async function updateProduct(data: UpdateProductData): Promise<Product> {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const { id, ...updateData } = data;

  const payload: any = {};
  if (updateData.name !== undefined) payload.name = updateData.name;
  if (updateData.description !== undefined) payload.description = updateData.description;
  if (updateData.sku !== undefined) payload.sku = updateData.sku;
  if (updateData.price !== undefined) payload.price = updateData.price;
  if (updateData.taxRate !== undefined) payload.taxRate = updateData.taxRate;
  if (updateData.active !== undefined) payload.status = updateData.active ? 'active' : 'inactive';

  const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.PRODUCTS.BASE}/${id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Update product error:', errorText);
    throw new Error('Failed to update product');
  }

  const result = await response.json();
  return transformProduct(result.data || result);
}

export async function deleteProduct(id: string): Promise<void> {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.PRODUCTS.BASE}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Delete product error:', errorText);
    throw new Error('Failed to delete product');
  }
}

export async function bulkUpdateProducts(action: 'activate' | 'deactivate' | 'delete', productIds: string[]): Promise<void> {
  // Sequential execution since backend doesn't support bulk operations
  for (const id of productIds) {
    try {
      if (action === 'delete') {
        await deleteProduct(id);
      } else {
        await updateProduct({
          id,
          active: action === 'activate'
        });
      }
    } catch (error) {
      console.error(`Failed to ${action} product ${id}:`, error);
      // Continue with other products even if one fails
    }
  }
}

export async function getNextSKU(prefix: string = 'PROD'): Promise<string> {
  try {
    // Fetch latest products to determine next SKU
    // Since we can't filter by SKU prefix easily on backend without specific support,
    // we fetch recent products and calculate client-side.
    // This is not race-condition safe but sufficient for now.
    const { data: products } = await getProducts({ sortBy: 'createdAt', sortOrder: 'desc' });

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
  } catch (error) {
    console.error('Error generating SKU:', error);
    return `${prefix}-${Date.now().toString().slice(-4)}`; // Fallback
  }
}

export async function checkSKUExists(sku: string, excludeId?: string): Promise<boolean> {
  try {
    // We use the search parameter to find products with this SKU
    const { data: products } = await getProducts({ search: sku });

    // Check for exact match, excluding the current product if editing
    return products.some(p => p.sku.toLowerCase() === sku.toLowerCase() && p.id !== excludeId);
  } catch (error) {
    console.error('Error checking SKU:', error);
    return false;
  }
}