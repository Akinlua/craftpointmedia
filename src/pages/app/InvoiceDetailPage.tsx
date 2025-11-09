import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Edit, Send, Download, CreditCard, Check, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { InvoiceEditor } from '@/components/sales/InvoiceEditor';
import { SendInvoiceModal } from '@/components/sales/SendInvoiceModal';
import { getInvoice, updateInvoice, markInvoiceAsPaid, getInvoiceActivities, generateInvoicePdfUrl, deleteInvoice } from '@/lib/api/invoices';
import { getPaymentProviders, createCheckoutSession } from '@/lib/api/payments';
import { UpdateInvoiceData } from '@/types/invoice';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils/currency';
import { getInvoiceStatusColor } from '@/lib/utils/invoice';
import { can } from '@/lib/rbac/can';
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog';

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => getInvoice(id!),
    enabled: !!id
  });

  const { data: activities } = useQuery({
    queryKey: ['invoice-activities', id],
    queryFn: () => getInvoiceActivities(id!),
    enabled: !!id
  });

  const { data: paymentProviders } = useQuery({
    queryKey: ['payment-providers'],
    queryFn: getPaymentProviders
  });

  const updateMutation = useMutation({
    mutationFn: updateInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setIsEditing(false);
      toast({
        title: 'Invoice updated',
        description: 'The invoice has been updated successfully.'
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

  const markPaidMutation = useMutation({
    mutationFn: () => markInvoiceAsPaid(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: 'Invoice marked as paid',
        description: 'The invoice status has been updated to paid.'
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

  const checkoutMutation = useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: (session) => {
      window.open(session.checkoutUrl, '_blank');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteInvoice(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: 'Invoice deleted',
        description: 'The invoice has been deleted successfully.'
      });
      navigate('/app/sales/invoices');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleSave = (data: UpdateInvoiceData) => {
    updateMutation.mutate(data);
  };

  const handleDownloadPdf = async () => {
    try {
      const pdfUrl = await generateInvoicePdfUrl(id!);
      window.open(pdfUrl, '_blank');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate PDF',
        variant: 'destructive'
      });
    }
  };

  const handleOnlinePayment = (provider: string) => {
    checkoutMutation.mutate({
      invoiceId: id!,
      provider: provider as any,
      successUrl: `${window.location.origin}/app/sales/invoices/${id}/payment-success`,
      cancelUrl: `${window.location.origin}/app/sales/invoices/${id}`
    });
  };

  const handleDuplicate = async () => {
    try {
      const duplicateData = {
        contactId: invoice.contactId,
        lineItems: invoice.lineItems.map(({ id, ...item }) => item),
        notes: invoice.notes,
        terms: invoice.terms,
        paymentTerms: invoice.paymentTerms,
        dueDate: invoice.dueDate
      };
      
      navigate('/app/sales/invoices/new', { state: { duplicateData } });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to duplicate invoice',
        variant: 'destructive'
      });
    }
  };

  const handleEmailCustomer = () => {
    if (invoice.contactEmail) {
      window.location.href = `mailto:${invoice.contactEmail}?subject=Invoice ${invoice.number}`;
    } else {
      toast({
        title: 'No email',
        description: 'This contact does not have an email address.',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!invoice) {
    return <div className="p-6">Invoice not found</div>;
  }

  // Mock user role for RBAC
  const userRole = 'manager';
  const canEdit = can(userRole, 'update', 'invoices');
  const stripeConnected = paymentProviders?.find(p => p.provider === 'stripe')?.connected;
  const paypalConnected = paymentProviders?.find(p => p.provider === 'paypal')?.connected;

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
            <h1 className="text-3xl font-bold text-foreground">{invoice.number}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={getInvoiceStatusColor(invoice.status)}>
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {invoice.contactName} • {formatCurrency(invoice.total)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPdf}
          >
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          
          {invoice.status === 'draft' && (
            <Dialog open={isSendModalOpen} onOpenChange={setIsSendModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send Invoice</DialogTitle>
                </DialogHeader>
                <SendInvoiceModal
                  invoice={invoice}
                  onClose={() => setIsSendModalOpen(false)}
                />
              </DialogContent>
            </Dialog>
          )}
          
          {['sent', 'overdue'].includes(invoice.status) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Accept Payment
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {stripeConnected && (
                  <DropdownMenuItem onClick={() => handleOnlinePayment('stripe')}>
                    Pay with Stripe
                  </DropdownMenuItem>
                )}
                {paypalConnected && (
                  <DropdownMenuItem onClick={() => handleOnlinePayment('paypal')}>
                    Pay with PayPal
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => markPaidMutation.mutate()}>
                  <Check className="h-4 w-4 mr-2" />
                  Mark as Paid
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {canEdit && (
            <Button
              variant={isEditing ? "default" : "outline"}
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDuplicate}>Duplicate</DropdownMenuItem>
              <DropdownMenuItem onClick={handleEmailCustomer}>Email Customer</DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {isEditing ? (
            <InvoiceEditor
              data={invoice}
              onChange={(data) => {}}
              onSave={handleSave}
              isLoading={updateMutation.isPending}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contact Info */}
                <div>
                  <h3 className="font-semibold mb-2">Bill To:</h3>
                  <p className="text-sm">{invoice.contactName}</p>
                  {invoice.contactEmail && (
                    <p className="text-sm text-muted-foreground">{invoice.contactEmail}</p>
                  )}
                </div>

                <Separator />

                {/* Line Items */}
                <div>
                  <h3 className="font-semibold mb-3">Items</h3>
                  <div className="space-y-2">
                    {invoice.lineItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-start p-3 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{item.productName}</p>
                          {item.description && (
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} × {formatCurrency(item.unitPrice)}
                            {item.taxRate > 0 && ` (${item.taxRate}% tax)`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(item.lineTotal)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  {invoice.taxTotal > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax:</span>
                      <span>{formatCurrency(invoice.taxTotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                    <span>Total:</span>
                    <span>{formatCurrency(invoice.total)}</span>
                  </div>
                </div>

                {/* Terms & Notes */}
                {(invoice.terms || invoice.notes) && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      {invoice.terms && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Terms:</h4>
                          <p className="text-sm text-muted-foreground">{invoice.terms}</p>
                        </div>
                      )}
                      {invoice.notes && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Notes:</h4>
                          <p className="text-sm text-muted-foreground">{invoice.notes}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="space-y-4">
          {/* Invoice Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Invoice Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <span className="text-muted-foreground">Created:</span>
                <div>{new Date(invoice.createdAt).toLocaleDateString()}</div>
              </div>
              {invoice.dueDate && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Due Date:</span>
                  <div>{new Date(invoice.dueDate).toLocaleDateString()}</div>
                </div>
              )}
              {invoice.sentAt && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Sent:</span>
                  <div>{new Date(invoice.sentAt).toLocaleDateString()}</div>
                </div>
              )}
              {invoice.paidAt && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Paid:</span>
                  <div>{new Date(invoice.paidAt).toLocaleDateString()}</div>
                </div>
              )}
              <div className="text-sm">
                <span className="text-muted-foreground">Owner:</span>
                <div>{invoice.ownerName}</div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          {activities && activities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.title}</p>
                        {activity.description && (
                          <p className="text-xs text-muted-foreground">{activity.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.createdAt).toLocaleString()} by {activity.createdByName}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete Invoice"
        description={`Are you sure you want to delete invoice ${invoice.number}? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}