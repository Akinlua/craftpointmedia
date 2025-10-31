export interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  price: number;
  taxRate: number; // percentage
  active: boolean;
  createdAt: string;
  updatedAt: string;
  orgId: string;
  createdBy: string;
}

export interface ProductFilters {
  search?: string;
  active?: boolean;
  sortBy?: 'name' | 'price' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductBulkAction {
  type: 'activate' | 'deactivate' | 'delete';
  productIds: string[];
}

export interface CreateProductData {
  name: string;
  description?: string;
  sku: string;
  price: number;
  taxRate: number;
  active: boolean;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}