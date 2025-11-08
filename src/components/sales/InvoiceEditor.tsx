import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { contactsApi } from '@/lib/api/contacts';
import { getProducts } from '@/lib/api/products';
import { InvoiceLineItem } from '@/types/invoice';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface InvoiceEditorProps {
  data: any;
  onChange: (data: any) => void;
  onSave?: (data: any) => void;
  isNew?: boolean;
  isLoading?: boolean;
}

export function InvoiceEditor({ data, onChange, onSave, isNew, isLoading }: InvoiceEditorProps) {
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<InvoiceLineItem>>({
    productName: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    taxRate: 0
  });

  const { data: contactsData } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => contactsApi.getContacts()
  });

  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: () => getProducts({ active: true })
  });

  const contacts = contactsData?.data || [];
  const products = productsData?.data || [];

  const addLineItem = () => {
    if (!newItem.productName || !newItem.unitPrice) return;

    const lineItem: InvoiceLineItem = {
      id: crypto.randomUUID(),
      productId: newItem.productId,
      productName: newItem.productName,
      description: newItem.description,
      quantity: newItem.quantity || 1,
      unitPrice: newItem.unitPrice,
      taxRate: newItem.taxRate || 0,
      lineTotal: (newItem.quantity || 1) * (newItem.unitPrice || 0) * (1 + (newItem.taxRate || 0) / 100)
    };

    onChange({
      ...data,
      lineItems: [...(data.lineItems || []), lineItem]
    });

    setNewItem({
      productName: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 0
    });
    setIsAddItemDialogOpen(false);
  };

  const removeLineItem = (id: string) => {
    onChange({
      ...data,
      lineItems: data.lineItems.filter((item: InvoiceLineItem) => item.id !== id)
    });
  };

  const selectProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setNewItem({
        productId: product.id,
        productName: product.name,
        description: product.description,
        quantity: 1,
        unitPrice: product.price / 100, // Convert from cents
        taxRate: product.taxRate
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Contact Selection */}
        <div>
          <label className="text-sm font-medium">Contact</label>
          <Select value={data.contactId} onValueChange={(value) => onChange({ ...data, contactId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select a contact" />
            </SelectTrigger>
            <SelectContent>
              {contacts.map((contact) => (
                <SelectItem key={contact.id} value={contact.id}>
                  {contact.firstName} {contact.lastName} - {contact.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Line Items */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium">Line Items</label>
            <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Line Item</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Select Product (Optional)</label>
                    <Select onValueChange={selectProduct}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose from existing products" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - ${(product.price / 100).toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Product/Service Name *</label>
                    <Input
                      value={newItem.productName}
                      onChange={(e) => setNewItem({ ...newItem, productName: e.target.value })}
                      placeholder="Enter name"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={newItem.description || ''}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      placeholder="Enter description"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">Quantity *</label>
                      <Input
                        type="number"
                        min="1"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) })}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Unit Price ($) *</label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newItem.unitPrice}
                        onChange={(e) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) })}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Tax Rate (%)</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={newItem.taxRate}
                        onChange={(e) => setNewItem({ ...newItem, taxRate: parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>

                  <Button onClick={addLineItem} className="w-full">
                    Add to Invoice
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          {(!data.lineItems || data.lineItems.length === 0) ? (
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground text-center">
                No items added yet. Click "Add Item" to get started.
              </p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left text-xs font-medium p-2">Item</th>
                    <th className="text-right text-xs font-medium p-2">Qty</th>
                    <th className="text-right text-xs font-medium p-2">Unit Price</th>
                    <th className="text-right text-xs font-medium p-2">Tax</th>
                    <th className="text-right text-xs font-medium p-2">Total</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {data.lineItems.map((item: InvoiceLineItem) => (
                    <tr key={item.id} className="border-t">
                      <td className="p-2">
                        <div className="font-medium text-sm">{item.productName}</div>
                        {item.description && (
                          <div className="text-xs text-muted-foreground">{item.description}</div>
                        )}
                      </td>
                      <td className="text-right p-2 text-sm">{item.quantity}</td>
                      <td className="text-right p-2 text-sm">${item.unitPrice.toFixed(2)}</td>
                      <td className="text-right p-2 text-sm">{item.taxRate}%</td>
                      <td className="text-right p-2 text-sm font-medium">
                        ${item.lineTotal.toFixed(2)}
                      </td>
                      <td className="p-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeLineItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Terms and Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Payment Terms</label>
            <Select value={data.paymentTerms?.toString()} onValueChange={(value) => onChange({ ...data, paymentTerms: parseInt(value) })}>
              <SelectTrigger>
                <SelectValue placeholder="Select terms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">NET 7</SelectItem>
                <SelectItem value="14">NET 14</SelectItem>
                <SelectItem value="30">NET 30</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium">Due Date</label>
            <Input
              type="date"
              value={data.dueDate || ''}
              onChange={(e) => onChange({ ...data, dueDate: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Notes</label>
          <Textarea
            placeholder="Add any notes for this invoice..."
            value={data.notes || ''}
            onChange={(e) => onChange({ ...data, notes: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Terms & Conditions</label>
          <Textarea
            placeholder="Payment terms and conditions..."
            value={data.terms || ''}
            onChange={(e) => onChange({ ...data, terms: e.target.value })}
          />
        </div>

        {!isNew && onSave && (
          <Button onClick={() => onSave(data)} disabled={isLoading} className="w-full">
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}