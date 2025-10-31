import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Order, Service } from "@/types/agency";
import { Clock, Package } from "lucide-react";

interface ClientOrderCardProps {
  order: Order;
  service: Service | undefined;
}

export function ClientOrderCard({ order, service }: ClientOrderCardProps) {
  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "new":
        return "secondary";
      case "in-progress":
        return "default";
      case "delivered":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h4 className="font-semibold">{service?.name || "Unknown Service"}</h4>
            <p className="text-sm text-muted-foreground">
              Order #{order.id}
            </p>
          </div>
          <Badge variant={getStatusColor(order.status)}>
            {order.status.replace("-", " ")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>Ordered: {format(new Date(order.createdAt), "MMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Delivery: {format(new Date(order.deliveryDate), "MMM d, yyyy")}</span>
          </div>
          {order.notes && (
            <p className="text-muted-foreground pt-2 border-t">{order.notes}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
