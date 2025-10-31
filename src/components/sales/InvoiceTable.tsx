import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MoreHorizontal, Eye, Send, Check } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Invoice } from '@/types/invoice';
import { formatCurrency } from '@/lib/utils/currency';
import { getInvoiceStatusColor } from '@/lib/utils/invoice';
import { can } from '@/lib/rbac/can';
import { UserRole } from '@/types/user';

interface InvoiceTableProps {
  invoices: Invoice[];
  isLoading: boolean;
  selectedInvoices: string[];
  onSelectionChange: (invoiceIds: string[]) => void;
  userRole: UserRole;
}

export function InvoiceTable({ invoices, isLoading, selectedInvoices, onSelectionChange, userRole }: InvoiceTableProps) {
  if (isLoading) {
    return <div className="text-center py-8">Loading invoices...</div>;
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(invoices.map(inv => inv.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectInvoice = (invoiceId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedInvoices, invoiceId]);
    } else {
      onSelectionChange(selectedInvoices.filter(id => id !== invoiceId));
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedInvoices.length === invoices.length && invoices.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>Number</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell>
                <Checkbox
                  checked={selectedInvoices.includes(invoice.id)}
                  onCheckedChange={(checked) => handleSelectInvoice(invoice.id, checked as boolean)}
                />
              </TableCell>
              <TableCell>
                <Link to={`/app/sales/invoices/${invoice.id}`} className="font-medium hover:underline">
                  {invoice.number}
                </Link>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{invoice.contactName}</p>
                  {invoice.contactEmail && (
                    <p className="text-sm text-muted-foreground">{invoice.contactEmail}</p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{formatCurrency(invoice.total)}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(invoice.subtotal)} + {formatCurrency(invoice.taxTotal)} tax
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getInvoiceStatusColor(invoice.status)}>
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}
              </TableCell>
              <TableCell>{invoice.ownerName}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={`/app/sales/invoices/${invoice.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Link>
                    </DropdownMenuItem>
                    {invoice.status === 'draft' && (
                      <DropdownMenuItem>
                        <Send className="h-4 w-4 mr-2" />
                        Send
                      </DropdownMenuItem>
                    )}
                    {['sent', 'overdue'].includes(invoice.status) && can(userRole, 'update', 'invoices') && (
                      <DropdownMenuItem>
                        <Check className="h-4 w-4 mr-2" />
                        Mark Paid
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}