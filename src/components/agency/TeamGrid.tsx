import { Freelancer } from "@/types/agency";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface TeamGridProps {
  freelancers: Freelancer[];
}

export function TeamGrid({ freelancers }: TeamGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {freelancers.map((freelancer) => (
        <Card key={freelancer.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <Avatar className="h-20 w-20">
                <AvatarImage src={freelancer.avatarUrl} alt={freelancer.name} />
                <AvatarFallback className="text-2xl">
                  {freelancer.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-1">
                <h3 className="font-semibold text-lg">{freelancer.name}</h3>
                {freelancer.rating && (
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="text-sm font-medium">{freelancer.rating}</span>
                  </div>
                )}
              </div>

              {freelancer.bio && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {freelancer.bio}
                </p>
              )}

              <div className="flex flex-wrap justify-center gap-1 pt-2">
                {freelancer.skills.slice(0, 4).map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
