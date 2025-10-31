import { useState } from "react";
import { useAgencyStore } from "@/lib/stores/agencyStore";
import { useSession } from "@/lib/hooks/useSession";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AgencyKpiCard } from "@/components/agency/AgencyKpiCard";
import { OrderModal } from "@/components/agency/OrderModal";
import { Package, CheckCircle, DollarSign, Award, ShoppingCart, FileText, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export default function AgencyPage() {
  const { user } = useSession();
  const { services, freelancers, getClientOrders, getClientKPIs, activityEvents, addOrder } = useAgencyStore();
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Mock client ID - in real app this would come from auth
  const clientId = user?.id || "c_001";
  const clientOrders = getClientOrders(clientId);
  const kpis = getClientKPIs(clientId);

  // Get active orders (latest 3)
  const activeOrders = clientOrders
    .filter((o) => o.status === "in-progress" || o.status === "new")
    .slice(0, 3);

  // Get featured services for quick access
  const featuredServices = services.filter((s) => s.featured).slice(0, 3);

  const handlePlaceOrder = (orderData: any) => {
    addOrder({
      clientId,
      serviceId: orderData.serviceId,
      freelancerId: orderData.freelancerId,
      status: "new",
      total: services.find((s) => s.id === orderData.serviceId)?.price as number || 0,
      brief: orderData.brief,
      deliveryDate: orderData.deliveryDate?.toISOString(),
      attachments: orderData.attachments,
    });
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-primary flex items-center justify-center shadow-lg">
            <img 
              src="/lovable-uploads/a2be0e90-2f01-4a6d-8c56-d1cc72041092.png" 
              alt="CraftWorks"
              className="w-full h-full object-contain p-2"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold">CraftWorks Agency</h1>
            <p className="text-muted-foreground">Smart Services, Done Right.</p>
          </div>
        </div>

        <Button asChild variant="outline">
          <Link to="/app/agency/orders">
            View Order History
          </Link>
        </Button>
      </div>

      {/* Welcome Card */}
      <Card className="bg-gradient-primary text-primary-foreground border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to Your Agency Portal</CardTitle>
          <CardDescription className="text-primary-foreground/80">
            Get professional services delivered by expert freelancers. Browse our catalog, 
            place orders, and track your projects all in one place.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={() => setIsOrderModalOpen(true)}
              variant="secondary"
              size="lg"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Place Order
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-white/10 border-white/20 text-primary-foreground hover:bg-white/20">
              <Link to="/app/agency/services">
                <FileText className="h-4 w-4 mr-2" />
                Browse Services
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AgencyKpiCard
          title="Active Orders"
          value={kpis.activeOrders}
          icon={Package}
          description="Orders in progress"
        />
        <AgencyKpiCard
          title="Completed Projects"
          value={kpis.completedProjects}
          icon={CheckCircle}
          description="Successfully delivered"
        />
        <AgencyKpiCard
          title="Total Spent"
          value={`$${kpis.totalSpent.toLocaleString()}`}
          icon={DollarSign}
          description="All-time investment"
        />
        <AgencyKpiCard
          title="Top Freelancer"
          value={kpis.topFreelancer?.name || "N/A"}
          icon={Award}
          description={kpis.topFreelancer?.rating ? `${kpis.topFreelancer.rating}★ rated` : "No data yet"}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Orders */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Package className="h-5 w-5" />
              Active Orders
            </h2>
            {activeOrders.length > 0 && (
              <Button variant="ghost" size="sm" asChild>
                <Link to="/app/agency/orders">View All</Link>
              </Button>
            )}
          </div>

          {activeOrders.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No active orders</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You don't have any orders in progress. Browse our services to get started!
                </p>
                <Button asChild>
                  <Link to="/app/agency/services">Browse Services</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {activeOrders.map((order) => {
                const service = services.find((s) => s.id === order.serviceId);
                const freelancer = order.freelancerId
                  ? freelancers.find((f) => f.id === order.freelancerId)
                  : null;

                return (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base">{service?.name}</CardTitle>
                          <CardDescription>Order #{order.id}</CardDescription>
                        </div>
                        <Badge variant={order.status === "new" ? "secondary" : "default"}>
                          {order.status === "new" ? "New" : "In Progress"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {freelancer && (
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-muted-foreground" />
                            <span>Assigned to: {freelancer.name}</span>
                          </div>
                        )}
                        {order.deliveryDate && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>Due: {formatDistanceToNow(new Date(order.deliveryDate), { addSuffix: true })}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <div className="space-y-3">
            {activityEvents.slice(0, 5).map((event) => (
              <Card key={event.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-medium">
                      {event.title}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {event.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{event.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Services */}
      {featuredServices.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Featured Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredServices.map((service) => {
              const priceDisplay = typeof service.price === "number"
                ? `$${service.price}`
                : `$${service.price.min}+`;

              return (
                <Card key={service.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{service.name}</CardTitle>
                        <CardDescription className="mt-1">{service.category}</CardDescription>
                      </div>
                      <Badge variant="default" className="bg-gradient-primary">
                        Featured
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-semibold">{priceDisplay}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Delivery:</span>
                        <span>{service.deliveryTime}</span>
                      </div>
                    </div>
                    <Button asChild className="w-full" size="sm">
                      <Link to="/app/agency/services">View Details</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Order Modal */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        service={null}
        freelancers={freelancers}
        onSubmit={handlePlaceOrder}
      />
    </div>
  );
}
