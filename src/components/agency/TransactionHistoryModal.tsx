import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { EmptyState } from "@/components/ui/empty-states";

interface TransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockTransactions = [
  {
    id: "txn_001",
    service: "Logo Design",
    amount: 299,
    status: "completed" as const,
    date: new Date(2024, 0, 15),
  },
  {
    id: "txn_002",
    service: "Website Development",
    amount: 1299,
    status: "in-progress" as const,
    date: new Date(2024, 0, 20),
  },
  {
    id: "txn_003",
    service: "Resume Writing",
    amount: 199,
    status: "completed" as const,
    date: new Date(2024, 0, 8),
  },
];

export function TransactionHistoryModal({
  isOpen,
  onClose,
}: TransactionHistoryModalProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "in-progress":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Transaction History</DialogTitle>
          <DialogDescription>
            View all your past orders and their status
          </DialogDescription>
        </DialogHeader>

        {mockTransactions.length === 0 ? (
          <EmptyState
            title="No transactions yet"
            description="Your transaction history will appear here once you place your first order."
          />
        ) : (
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-mono text-xs">
                      {transaction.id}
                    </TableCell>
                    <TableCell className="font-medium">
                      {transaction.service}
                    </TableCell>
                    <TableCell>{format(transaction.date, "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(transaction.status)}>
                        {transaction.status.replace("-", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${transaction.amount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
