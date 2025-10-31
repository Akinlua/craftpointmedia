import { Service, Freelancer } from "@/types/agency";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, DollarSign, Star } from "lucide-react";

interface ServiceCardProps {
  service: Service;
  freelancers: Freelancer[];
  onOrderClick: (service: Service) => void;
}

export function ServiceCard({ service, freelancers, onOrderClick }: ServiceCardProps) {
  const assignedFreelancer = service.freelancerIds?.[0] 
    ? freelancers.find((f) => f.id === service.freelancerIds![0])
    : undefined;

  const priceDisplay = typeof service.price === "number"
    ? `$${service.price}`
    : `$${service.price.min} - $${service.price.max}`;

  return (
    <Card className="flex flex-col hover:shadow-lg transition-all duration-200 hover-scale">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-xl">{service.name}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{service.category}</Badge>
              {service.featured && (
                <Badge variant="default" className="bg-gradient-primary">
                  Featured
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        <CardDescription className="text-sm leading-relaxed">
          {service.description}
        </CardDescription>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">{priceDisplay}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Delivery: {service.deliveryTime}</span>
          </div>
        </div>

        {service.tags && service.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {service.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {assignedFreelancer && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <Avatar className="h-8 w-8">
              <AvatarImage src={assignedFreelancer.avatarUrl} alt={assignedFreelancer.name} />
              <AvatarFallback>{assignedFreelancer.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{assignedFreelancer.name}</p>
              {assignedFreelancer.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-primary text-primary" />
                  <span className="text-xs text-muted-foreground">{assignedFreelancer.rating}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          onClick={() => onOrderClick(service)}
        >
          Order Now
        </Button>
      </CardFooter>
    </Card>
  );
}
