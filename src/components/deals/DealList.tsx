import { useState } from "react";
import { Deal } from "@/types/deal";
import { dealStages } from "@/lib/api/deals";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { canCurrentUser } from "@/lib/rbac/can";
import { useSession } from "@/lib/hooks/useSession";
import { 
  MoreHorizontal, 
  DollarSign,
  Calendar,
  Activity,
  Edit,
  Trash2
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface DealListProps {
  deals: Deal[];
  selectedDeals: string[];
  onSelectDeal: (dealId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onDealClick: (deal: Deal) => void;
  onEditDeal: (deal: Deal) => void;
  onDeleteDeal: (deal: Deal) => void;
  loading?: boolean;
}

export const DealList = ({
  deals,
  selectedDeals,
  onSelectDeal,
  onSelectAll,
  onDealClick,
  onEditDeal,
  onDeleteDeal,
  loading
}: DealListProps) => {
  const { user } = useSession();
  const allSelected = deals.length > 0 && selectedDeals.length === deals.length;
  const someSelected = selectedDeals.length > 0 && selectedDeals.length < deals.length;

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(value);
  };

  const getStageConfig = (stageId: string) => {
    return dealStages.find(s => s.id === stageId);
  };

  const getStageColor = (stageId: string) => {
    const stage = getStageConfig(stageId);
    if (!stage) return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    
    const colorMap: Record<string, string> = {
      'bg-blue-500': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      'bg-yellow-500': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      'bg-purple-500': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      'bg-green-500': 'bg-green-500/10 text-green-600 border-green-500/20',
      'bg-red-500': 'bg-red-500/10 text-red-600 border-red-500/20',
    };
    
    return colorMap[stage.color] || "bg-gray-500/10 text-gray-600 border-gray-500/20";
  };

  const canDelete = (deal: Deal) => {
    if (!user) return false;
    
    // Owner and Manager can delete any deal
    if (canCurrentUser('delete', 'deals', user.role)) {
      return true;
    }
    
    // Staff can only delete their own deals
    return user.id === deal.ownerId;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-muted/20 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox
              checked={allSelected}
              onCheckedChange={onSelectAll}
              ref={(el) => {
                if (el) {
                  const input = el.querySelector('input');
                  if (input) input.indeterminate = someSelected;
                }
              }}
            />
          </TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Value</TableHead>
          <TableHead>Stage</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Close Date</TableHead>
          <TableHead>Last Activity</TableHead>
          <TableHead className="w-12"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deals.map((deal) => (
          <TableRow 
            key={deal.id} 
            className="hover:bg-muted/50 cursor-pointer"
            onClick={() => onDealClick(deal)}
          >
            <TableCell onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={selectedDeals.includes(deal.id)}
                onCheckedChange={(checked) => 
                  onSelectDeal(deal.id, !!checked)
                }
              />
            </TableCell>
            
            <TableCell>
              <div>
                <div className="font-medium">{deal.title}</div>
                {deal.description && (
                  <div className="text-sm text-muted-foreground line-clamp-1">
                    {deal.description}
                  </div>
                )}
                {deal.contacts.length > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex -space-x-1">
                      {deal.contacts.slice(0, 2).map((contact) => (
                        <Avatar key={contact.id} className="h-5 w-5 border border-background">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {getInitials(contact.name)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {deal.contacts.length > 2 && (
                        <div className="h-5 w-5 rounded-full border border-background bg-muted flex items-center justify-center text-xs">
                          +{deal.contacts.length - 2}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {deal.contacts[0].name}
                      {deal.contacts.length > 1 && ` +${deal.contacts.length - 1}`}
                    </span>
                  </div>
                )}
              </div>
            </TableCell>
            
            <TableCell>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-600">
                  {formatCurrency(deal.value, deal.currency)}
                </span>
                {deal.probability && (
                  <Badge variant="secondary" className="text-xs">
                    {deal.probability}%
                  </Badge>
                )}
              </div>
            </TableCell>
            
            <TableCell>
              <Badge 
                variant="outline"
                className={`text-xs border ${getStageColor(deal.stageId)}`}
              >
                {getStageConfig(deal.stageId)?.name || deal.stage}
              </Badge>
            </TableCell>
            
            <TableCell>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs bg-secondary text-secondary-foreground">
                    {getInitials(deal.ownerName)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{deal.ownerName}</span>
              </div>
            </TableCell>
            
            <TableCell>
              {deal.closeDate ? (
                <div className="flex items-center gap-1 text-sm">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(deal.closeDate), 'MMM d, yyyy')}
                </div>
              ) : (
                <span className="text-muted-foreground text-sm">Not set</span>
              )}
            </TableCell>
            
            <TableCell>
              {deal.lastActivityAt ? (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Activity className="w-3 h-3" />
                  {formatDistanceToNow(new Date(deal.lastActivityAt), { addSuffix: true })}
                </div>
              ) : (
                <span className="text-muted-foreground text-sm">No activity</span>
              )}
            </TableCell>
            
            <TableCell onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEditDeal(deal)}>
                    <Edit className="w-4 h-4" />
                    Edit
                  </DropdownMenuItem>
                  {canDelete(deal) && (
                    <DropdownMenuItem 
                      onClick={() => onDeleteDeal(deal)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};