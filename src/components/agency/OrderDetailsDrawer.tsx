import { Order, Freelancer, Service } from "@/types/agency";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, DollarSign, FileText, Package } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface OrderDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  service: Service | null;
  freelancer: Freelancer | null;
}

const statusConfig = {
  new: { label: "New", progress: 25, variant: "secondary" as const },
  "in-progress": { label: "In Progress", progress: 50, variant: "default" as const },
  delivered: { label: "Delivered", progress: 75, variant: "default" as const },
  completed: { label: "Completed", progress: 100, variant: "default" as const },
};

export function OrderDetailsDrawer({ isOpen, onClose, order, service, freelancer }: OrderDetailsDrawerProps) {
  if (!order || !service) return null;

  const config = statusConfig[order.status];

  const handleRequestRevision = () => {
    toast.success("Revision request sent to the team");
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Order Details</SheetTitle>
          <SheetDescription>
            Order #{order.id}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Status & Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge variant={config.variant}>{config.label}</Badge>
            </div>
            <div className="space-y-2">
              <Progress value={config.progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                {config.progress}% Complete
              </p>
            </div>
          </div>

          <Separator />

          {/* Service & Freelancer Info */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Service</p>
                <p className="text-sm text-muted-foreground">{service.name}</p>
              </div>
            </div>

            {freelancer && (
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={freelancer.avatarUrl} alt={freelancer.name} />
                  <AvatarFallback>{freelancer.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">Assigned Freelancer</p>
                  <p className="text-sm text-muted-foreground">{freelancer.name}</p>
                  <p className="text-xs text-muted-foreground">{freelancer.skills.slice(0, 3).join(", ")}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Total</p>
                <p className="text-sm text-muted-foreground">${order.total}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Created</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(order.createdAt), "PPP")}
                </p>
              </div>
            </div>

            {order.deliveryDate && (
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Expected Delivery</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(order.deliveryDate), "PPP")}
                  </p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Project Brief */}
          {order.brief && (
            <>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Project Brief</p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed pl-6">
                  {order.brief}
                </p>
              </div>
              <Separator />
            </>
          )}

          {/* Timeline */}
          {order.timeline && order.timeline.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium">Timeline</p>
              <div className="space-y-3">
                {order.timeline.map((event) => (
                  <div key={event.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <div className="w-px h-full bg-border" />
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm font-medium">{event.title}</p>
                      {event.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {event.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(event.date), "PPp")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          {order.attachments && order.attachments.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium">Attachments</p>
                <div className="space-y-1">
                  {order.attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-muted/50 rounded px-3 py-2"
                    >
                      <span className="text-sm truncate">{file}</span>
                      <Button variant="ghost" size="sm">
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          {order.status === "delivered" && (
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleRequestRevision}
              >
                Request Revision
              </Button>
              <Button className="w-full">
                Mark as Complete
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
