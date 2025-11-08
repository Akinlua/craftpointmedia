import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ProductTable } from '@/components/sales/ProductTable';
import { ProductForm } from '@/components/sales/ProductForm';
import { getProducts, createProduct } from '@/lib/api/products';
import { ProductFilters, CreateProductData } from '@/types/product';
import { useToast } from '@/hooks/use-toast';
import { can } from '@/lib/rbac/can';
import { useCompatSession } from '@/lib/hooks/useCompatSession';

export default function ProductsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useCompatSession();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    active: undefined,
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => getProducts(filters)
  });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsCreateDialogOpen(false);
      toast({
        title: 'Product created',
        description: 'The product has been created successfully.'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleCreateProduct = (data: CreateProductData) => {
    createMutation.mutate(data);
  };

  const handleFiltersChange = (newFilters: Partial<ProductFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const products = productsData?.data || [];
  const totalProducts = productsData?.total || 0;
  const activeProducts = products.filter(p => p.active).length;

  const userRole = user?.role || 'staff';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">
            Manage your product catalog and pricing
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          {can(userRole, 'create', 'products') && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Product</DialogTitle>
                </DialogHeader>
                <ProductForm 
                  onSubmit={handleCreateProduct}
                  isLoading={createMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeProducts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inactive Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-500">{totalProducts - activeProducts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Product Catalog</CardTitle>
          <CardDescription>
            Search and filter your products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => handleFiltersChange({ search: e.target.value })}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={filters.active === true ? "default" : "outline"}
                size="sm"
                onClick={() => handleFiltersChange({ active: filters.active === true ? undefined : true })}
              >
                Active
              </Button>
              <Button
                variant={filters.active === false ? "default" : "outline"}
                size="sm"
                onClick={() => handleFiltersChange({ active: filters.active === false ? undefined : false })}
              >
                Inactive
              </Button>
            </div>
          </div>

          <ProductTable
            products={products}
            isLoading={isLoading}
            onFiltersChange={handleFiltersChange}
            filters={filters}
            userRole={userRole}
          />
        </CardContent>
      </Card>
    </div>
  );
}