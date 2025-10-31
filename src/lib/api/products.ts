import { Product, ProductFilters, CreateProductData, UpdateProductData } from '@/types/product';

// Mock data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Professional Consultation',
    description: 'One-hour professional consultation service',
    sku: 'CONSULT-001',
    price: 15000, // $150.00 in cents
    taxRate: 10,
    active: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    orgId: 'org-1',
    createdBy: 'user-1'
  },
  {
    id: '2',
    name: 'Software License',
    description: 'Annual software license',
    sku: 'LICENSE-001',
    price: 99900, // $999.00 in cents
    taxRate: 0,
    active: true,
    createdAt: '2024-01-10T14:30:00Z',
    updatedAt: '2024-01-20T09:15:00Z',
    orgId: 'org-1',
    createdBy: 'user-1'
  },
  {
    id: '3',
    name: 'Training Workshop',
    description: 'Full-day training workshop',
    sku: 'TRAIN-001',
    price: 50000, // $500.00 in cents
    taxRate: 8.5,
    active: false,
    createdAt: '2024-01-05T16:45:00Z',
    updatedAt: '2024-01-25T11:20:00Z',
    orgId: 'org-1',
    createdBy: 'user-2'
  }
];

export async function getProducts(filters?: ProductFilters): Promise<{ data: Product[]; total: number }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  let filteredProducts = [...mockProducts];
  
  if (filters?.search) {
    const search = filters.search.toLowerCase();
    filteredProducts = filteredProducts.filter(product => 
      product.name.toLowerCase().includes(search) ||
      product.sku.toLowerCase().includes(search) ||
      product.description?.toLowerCase().includes(search)
    );
  }
  
  if (filters?.active !== undefined) {
    filteredProducts = filteredProducts.filter(product => product.active === filters.active);
  }
  
  // Sort
  if (filters?.sortBy) {
    filteredProducts.sort((a, b) => {
      const aVal = a[filters.sortBy!];
      const bVal = b[filters.sortBy!];
      const order = filters.sortOrder === 'desc' ? -1 : 1;
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * order;
      }
      
      return ((aVal as number) - (bVal as number)) * order;
    });
  }
  
  return { data: filteredProducts, total: filteredProducts.length };
}

export async function createProduct(data: CreateProductData): Promise<Product> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newProduct: Product = {
    id: `product-${Date.now()}`,
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    orgId: 'org-1',
    createdBy: 'user-1'
  };
  
  mockProducts.push(newProduct);
  return newProduct;
}

export async function updateProduct(data: UpdateProductData): Promise<Product> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = mockProducts.findIndex(p => p.id === data.id);
  if (index === -1) throw new Error('Product not found');
  
  const updatedProduct = {
    ...mockProducts[index],
    ...data,
    updatedAt: new Date().toISOString()
  };
  
  mockProducts[index] = updatedProduct;
  return updatedProduct;
}

export async function deleteProduct(id: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = mockProducts.findIndex(p => p.id === id);
  if (index === -1) throw new Error('Product not found');
  
  mockProducts.splice(index, 1);
}

export async function bulkUpdateProducts(action: 'activate' | 'deactivate' | 'delete', productIds: string[]): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  if (action === 'delete') {
    productIds.forEach(id => {
      const index = mockProducts.findIndex(p => p.id === id);
      if (index !== -1) mockProducts.splice(index, 1);
    });
  } else {
    const active = action === 'activate';
    productIds.forEach(id => {
      const product = mockProducts.find(p => p.id === id);
      if (product) {
        product.active = active;
        product.updatedAt = new Date().toISOString();
      }
    });
  }
}