import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { CreateProductData } from '@/types/product';
import { getNextSKU, checkSKUExists } from '@/lib/api/products';
import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  skuPrefix: z.string().min(1, 'Prefix is required').regex(/^[A-Z0-9]+$/, 'Only uppercase letters and numbers'),
  sku: z.string().min(1, 'SKU is required'),
  price: z.number().min(0, 'Price must be positive'),
  taxRate: z.number().min(0).max(100, 'Tax rate must be between 0-100%'),
  active: z.boolean()
});

interface ProductFormProps {
  onSubmit: (data: CreateProductData) => void;
  isLoading?: boolean;
  defaultValues?: Partial<CreateProductData>;
}

export function ProductForm({ onSubmit, isLoading, defaultValues }: ProductFormProps) {
  const [skuExists, setSkuExists] = useState(false);
  const [checkingUniqueness, setCheckingUniqueness] = useState(false);
  
  const form = useForm<CreateProductData & { skuPrefix: string }>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      skuPrefix: 'PROD',
      sku: '',
      price: 0,
      taxRate: 0,
      active: true,
      ...defaultValues
    }
  });

  const generateSKU = async (prefix?: string) => {
    const skuPrefix = prefix || form.getValues('skuPrefix');
    try {
      const nextSKU = await getNextSKU(skuPrefix);
      form.setValue('sku', nextSKU);
      setSkuExists(false);
    } catch (error) {
      console.error('Failed to generate SKU:', error);
    }
  };

  const checkUniqueness = async (sku: string) => {
    if (!sku) {
      setSkuExists(false);
      return;
    }
    setCheckingUniqueness(true);
    try {
      const exists = await checkSKUExists(sku);
      setSkuExists(exists);
    } catch (error) {
      console.error('Failed to check SKU uniqueness:', error);
    } finally {
      setCheckingUniqueness(false);
    }
  };

  useEffect(() => {
    if (!defaultValues?.sku) {
      generateSKU();
    }
  }, []);

  const handleSubmit = (data: CreateProductData & { skuPrefix: string }) => {
    const { skuPrefix, ...productData } = data;
    onSubmit(productData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter product name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="skuPrefix"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU Prefix</FormLabel>
              <FormControl>
                <Input 
                  placeholder="PROD" 
                  {...field} 
                  onChange={(e) => {
                    field.onChange(e.target.value.toUpperCase());
                    generateSKU(e.target.value.toUpperCase());
                  }}
                />
              </FormControl>
              <FormDescription>
                Uppercase letters and numbers only (e.g., PROD, INV, ITEM)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU (Stock Keeping Unit)</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input 
                    placeholder="PROD-001" 
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      checkUniqueness(e.target.value);
                    }}
                    className={skuExists ? 'border-destructive' : ''}
                  />
                </FormControl>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  onClick={() => generateSKU()}
                  title="Generate new SKU"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              {skuExists && (
                <p className="text-sm text-destructive">This SKU already exists</p>
              )}
              {checkingUniqueness && (
                <p className="text-sm text-muted-foreground">Checking uniqueness...</p>
              )}
              <FormDescription>
                Auto-generated unique product identifier
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price ($)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) * 100)}
                  value={field.value ? (field.value / 100).toFixed(2) : ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="taxRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tax Rate (%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="0"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter product description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between">
              <FormLabel>Active</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading || skuExists} className="w-full">
          {isLoading ? 'Creating...' : 'Create Product'}
        </Button>
      </form>
    </Form>
  );
}