import { useState } from "react";
import { useAgencyStore } from "@/lib/stores/agencyStore";
import { useSession } from "@/lib/hooks/useSession";
import { PageHeader } from "@/components/ui/page-header";
import { OrderDetailsDrawer } from "@/components/agency/OrderDetailsDrawer";
import { Order } from "@/types/agency";
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

const statusConfig = {
  new: { label: "New", variant: "secondary" as const },
  "in-progress": { label: "In Progress", variant: "default" as const },
  delivered: { label: "Delivered", variant: "default" as const },
  completed: { label: "Completed", variant: "outline" as const },
};

export default function OrdersPage() {
  const { user } = useSession();
  const { services, freelancers, getClientOrders } = useAgencyStore();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const clientId = user?.id || "c_001";
  const clientOrders = getClientOrders(clientId);

  const handleRowClick = (order: Order) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  const selectedService = selectedOrder
    ? services.find((s) => s.id === selectedOrder.serviceId)
    : null;

  const selectedFreelancer = selectedOrder?.freelancerId
    ? freelancers.find((f) => f.id === selectedOrder.freelancerId)
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Order History"
        description="View and track all your orders with CraftWorks Agency"
      />

      {clientOrders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="You haven't placed any orders. Browse our services to get started!"
          action={{
            label: "Browse Services",
            onClick: () => (window.location.href = "/app/agency/services"),
          }}
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Freelancer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientOrders.map((order) => {
                const service = services.find((s) => s.id === order.serviceId);
                const freelancer = order.freelancerId
                  ? freelancers.find((f) => f.id === order.freelancerId)
                  : null;
                const config = statusConfig[order.status];

                return (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(order)}
                  >
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>{service?.name || "Unknown"}</TableCell>
                    <TableCell>{freelancer?.name || "Unassigned"}</TableCell>
                    <TableCell>
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(order.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {order.deliveryDate
                        ? format(new Date(order.deliveryDate), "MMM d, yyyy")
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${order.total}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <OrderDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        service={selectedService}
        freelancer={selectedFreelancer}
      />
    </div>
  );
}
