import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InvoiceTable } from '@/components/sales/InvoiceTable';
import { getInvoices, bulkUpdateInvoices, getInvoiceStats } from '@/lib/api/invoices';
import { InvoiceFilters } from '@/types/invoice';
import { useToast } from '@/hooks/use-toast';
import { can } from '@/lib/rbac/can';
import { formatCurrency } from '@/lib/utils/currency';

export default function InvoicesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<InvoiceFilters>({
    search: '',
    status: [],
  });
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);

  const { data: invoicesData, isLoading } = useQuery({
    queryKey: ['invoices', filters],
    queryFn: () => getInvoices(filters)
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['invoice-stats'],
    queryFn: () => getInvoiceStats()
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: ({ action, invoiceIds }: { action: 'send' | 'mark_paid' | 'delete', invoiceIds: string[] }) =>
      bulkUpdateInvoices(action, invoiceIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice-stats'] });
      setSelectedInvoices([]);
      toast({
        title: 'Invoices updated',
        description: 'The selected invoices have been updated successfully.'
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

  const handleFiltersChange = (newFilters: Partial<InvoiceFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleBulkAction = (action: 'send' | 'mark_paid' | 'delete') => {
    if (selectedInvoices.length === 0) return;
    bulkUpdateMutation.mutate({ action, invoiceIds: selectedInvoices });
  };

  const invoices = invoicesData?.data || [];
  const totalInvoices = invoicesData?.total || 0;

  // Use stats from backend API
  const stats = statsData?.totals || {
    totalValue: 0,
    totalPaid: 0,
    overdueCount: 0
  };

  // Calculate outstanding from total - paid
  const outstanding = stats.totalValue - stats.totalPaid;

  // Mock user role for RBAC
  const userRole = 'manager';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground">
            Manage invoices and track payments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={selectedInvoices.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>

          {can(userRole, 'create', 'invoices') && (
            <Button asChild>
              <Link to="/app/sales/invoices/new">
                <Plus className="h-4 w-4 mr-2" />
                New Invoice
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="text-2xl font-bold">Loading...</div>
            ) : (
              <>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
                <p className="text-xs text-muted-foreground">{totalInvoices} invoices</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="text-2xl font-bold">Loading...</div>
            ) : (
              <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalPaid)}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Outstanding
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="text-2xl font-bold">Loading...</div>
            ) : (
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(outstanding)}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="text-2xl font-bold">Loading...</div>
            ) : (
              <div className="text-2xl font-bold text-red-600">{stats.overdueCount} invoices</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      {selectedInvoices.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {selectedInvoices.length} invoice{selectedInvoices.length > 1 ? 's' : ''} selected
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('send')}
                  disabled={bulkUpdateMutation.isPending}
                >
                  Send
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('mark_paid')}
                  disabled={bulkUpdateMutation.isPending}
                >
                  Mark Paid
                </Button>
                {can(userRole, 'delete', 'invoices') && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleBulkAction('delete')}
                    disabled={bulkUpdateMutation.isPending}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Invoice List</CardTitle>
          <CardDescription>
            View and manage all invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search invoices..."
                value={filters.search}
                onChange={(e) => handleFiltersChange({ search: e.target.value })}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {['draft', 'sent', 'paid', 'overdue'].map((status) => (
                <Button
                  key={status}
                  variant={filters.status?.includes(status as any) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    const currentStatus = filters.status || [];
                    const newStatus = currentStatus.includes(status as any)
                      ? currentStatus.filter(s => s !== status)
                      : [...currentStatus, status as any];
                    handleFiltersChange({ status: newStatus });
                  }}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <InvoiceTable
            invoices={invoices}
            isLoading={isLoading}
            selectedInvoices={selectedInvoices}
            onSelectionChange={setSelectedInvoices}
            userRole={userRole}
          />
        </CardContent>
      </Card>
    </div>
  );
}