import { useState } from "react";
import { useAgencyStore } from "@/lib/stores/agencyStore";
import { useSession } from "@/lib/hooks/useSession";
import { PageHeader } from "@/components/ui/page-header";
import { ServiceCard } from "@/components/agency/ServiceCard";
import { OrderModal } from "@/components/agency/OrderModal";
import { TeamGrid } from "@/components/agency/TeamGrid";
import { Service } from "@/types/agency";
import { Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ServicesPage() {
  const { user } = useSession();
  const { services, freelancers, addOrder } = useAgencyStore();
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Mock client ID - in real app this would come from auth
  const clientId = user?.id || "c_001";

  const handleOrderNow = (service: Service) => {
    setSelectedService(service);
    setIsOrderModalOpen(true);
  };

  const handleSubmitOrder = (orderData: any) => {
    addOrder({
      clientId,
      serviceId: orderData.serviceId,
      freelancerId: orderData.freelancerId,
      status: "new",
      total: typeof selectedService?.price === "number"
        ? selectedService.price
        : (selectedService?.price?.min || 0),
      brief: orderData.brief,
      deliveryDate: orderData.deliveryDate?.toISOString(),
      attachments: orderData.attachments,
    });
  };

  // Get unique categories
  const categories = ["all", ...new Set(services.map((s) => s.category))];

  // Filter services by category
  const filteredServices =
    categoryFilter === "all"
      ? services
      : services.filter((s) => s.category === categoryFilter);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Service Catalog"
        description="Browse our professional services and find the perfect solution for your needs"
      />

      {/* Filter Section */}
      <div className="flex items-center gap-4 flex-wrap">
        <label className="text-sm font-medium">Filter by Category:</label>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category === "all" ? "All Services" : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="text-sm text-muted-foreground">
          {filteredServices.length} {filteredServices.length === 1 ? "service" : "services"} available
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            freelancers={freelancers}
            onOrderClick={handleOrderNow}
          />
        ))}
      </div>

      {/* Our Team Section */}
      <div className="pt-8 border-t space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Meet Our Team
          </h2>
          <p className="text-muted-foreground">
            Talented professionals ready to bring your projects to life
          </p>
        </div>

        <TeamGrid freelancers={freelancers} />
      </div>

      {/* Order Modal */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setSelectedService(null);
        }}
        service={selectedService}
        freelancers={freelancers}
        onSubmit={handleSubmitOrder}
      />
    </div>
  );
}