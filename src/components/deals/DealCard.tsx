import { Deal } from "@/types/deal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { 
  MoreHorizontal, 
  DollarSign, 
  Calendar, 
  User,
  Clock
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DealCardProps {
  deal: Deal;
  onDealClick: (deal: Deal) => void;
  onEditDeal?: (deal: Deal) => void;
  onDeleteDeal?: (deal: Deal) => void;
  isDragging?: boolean;
}

export const DealCard = ({ 
  deal, 
  onDealClick, 
  onEditDeal, 
  onDeleteDeal,
  isDragging 
}: DealCardProps) => {
  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(value);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  };

  const getDaysOld = (date: string) => {
    const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on dropdown or other interactive elements
    if ((e.target as HTMLElement).closest('[data-no-click]')) {
      return;
    }
    onDealClick(deal);
  };

  return (
    <Card 
      className={`cursor-pointer hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50 rotate-2 shadow-lg' : ''
      }`}
      onClick={handleCardClick}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <h3 className="font-medium text-sm line-clamp-2 flex-1">
            {deal.title}
          </h3>
          <div data-no-click="true">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onDealClick(deal)}>
                  View Details
                </DropdownMenuItem>
                {onEditDeal && (
                  <DropdownMenuItem onClick={() => onEditDeal(deal)}>
                    Edit Deal
                  </DropdownMenuItem>
                )}
                {onDeleteDeal && (
                  <DropdownMenuItem 
                    onClick={() => onDeleteDeal(deal)}
                    className="text-destructive"
                  >
                    Delete Deal
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Value */}
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-600" />
          <span className="font-semibold text-green-600">
            {formatCurrency(deal.value, deal.currency)}
          </span>
          {deal.probability && (
            <Badge variant="secondary" className="text-xs">
              {deal.probability}%
            </Badge>
          )}
        </div>

        {/* Contacts */}
        {deal.contacts.length > 0 && (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <div className="flex -space-x-2">
              {deal.contacts.slice(0, 3).map((contact) => (
                <Avatar key={contact.id} className="h-6 w-6 border-2 border-background">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {getInitials(contact.name)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {deal.contacts.length > 3 && (
                <div className="h-6 w-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs">
                  +{deal.contacts.length - 3}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Owner */}
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs bg-secondary text-secondary-foreground">
              {getInitials(deal.ownerName)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">{deal.ownerName}</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{getDaysOld(deal.createdAt)} days old</span>
          </div>
          {deal.closeDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>
                Close: {new Date(deal.closeDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Last Activity */}
        {deal.lastActivityAt && (
          <div className="text-xs text-muted-foreground">
            Last activity: {formatDistanceToNow(new Date(deal.lastActivityAt), { addSuffix: true })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};