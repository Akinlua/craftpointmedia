import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Send, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InvoiceEditor } from '@/components/sales/InvoiceEditor';
import { createInvoice } from '@/lib/api/invoices';
import { CreateInvoiceData } from '@/types/invoice';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils/currency';
import { calculateInvoiceTotals } from '@/lib/utils/invoice';

export default function NewInvoicePage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [invoiceData, setInvoiceData] = useState<CreateInvoiceData>({
    contactId: '',
    lineItems: [],
    notes: '',
    terms: 'Payment due within 30 days',
    paymentTerms: 30
  });

  const createMutation = useMutation({
    mutationFn: createInvoice,
    onSuccess: (newInvoice) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: 'Invoice created',
        description: `Invoice ${newInvoice.number} has been created successfully.`
      });
      navigate(`/app/sales/invoices/${newInvoice.id}`);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleSave = () => {
    if (!invoiceData.contactId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a contact for this invoice.',
        variant: 'destructive'
      });
      return;
    }

    if (invoiceData.lineItems.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please add at least one line item.',
        variant: 'destructive'
      });
      return;
    }

    createMutation.mutate(invoiceData);
  };

  const totals = calculateInvoiceTotals(invoiceData.lineItems);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/app/sales/invoices')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invoices
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold text-foreground">New Invoice</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">Draft</Badge>
              <span className="text-sm text-muted-foreground">
                Total: {formatCurrency(totals.total)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={invoiceData.lineItems.length === 0}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={createMutation.isPending || !invoiceData.contactId || invoiceData.lineItems.length === 0}
          >
            <Save className="h-4 w-4 mr-2" />
            {createMutation.isPending ? 'Creating...' : 'Create Invoice'}
          </Button>
        </div>
      </div>

      {/* Invoice Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <InvoiceEditor
            data={invoiceData}
            onChange={setInvoiceData}
            isNew={true}
          />
        </div>
        
        <div className="space-y-4">
          {/* Invoice Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax:</span>
                <span>{formatCurrency(totals.taxTotal)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-semibold">
                <span>Total:</span>
                <span>{formatCurrency(totals.total)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground mb-3">
                After creating the invoice, you'll be able to:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Send className="h-3 w-3" />
                  Send via email or SMS
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Eye className="h-3 w-3" />
                  Download PDF
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Save className="h-3 w-3" />
                  Enable online payments
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}