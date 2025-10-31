import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Campaign, CampaignFilters, CampaignStatus, CampaignType } from '@/types/campaign';
import { UserRole } from '@/types/user';
import { campaignsApi } from '@/lib/api/campaigns';
import { can } from '@/lib/rbac/can';
import { MoreHorizontal, Send, Trash2, Copy, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CampaignListProps {
  campaigns: Campaign[];
  isLoading: boolean;
  filters: CampaignFilters;
  onFiltersChange: (filters: Partial<CampaignFilters>) => void;
  userRole: UserRole;
}

export function CampaignList({ campaigns, isLoading, filters, onFiltersChange, userRole }: CampaignListProps) {
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: campaignsApi.deleteCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({ title: 'Campaign deleted successfully' });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: campaignsApi.duplicateCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({ title: 'Campaign duplicated successfully' });
    },
  });

  const sendMutation = useMutation({
    mutationFn: campaignsApi.sendCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({ title: 'Campaign sent successfully' });
    },
  });

  const getStatusColor = (status: CampaignStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-500';
      case 'scheduled':
        return 'bg-blue-500';
      case 'sending':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: CampaignType) => {
    return type === 'email' ? '📧' : '📱';
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedCampaigns(checked ? campaigns.map(c => c.id) : []);
  };

  const handleSelectCampaign = (campaignId: string, checked: boolean) => {
    setSelectedCampaigns(prev => 
      checked 
        ? [...prev, campaignId]
        : prev.filter(id => id !== campaignId)
    );
  };

  if (isLoading) {
    return <div>Loading campaigns...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            value={filters.search || ''}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className="pl-9"
          />
        </div>
        <Select
          value={filters.status || 'all'}
          onValueChange={(value) => onFiltersChange({ status: value === 'all' ? undefined : value as CampaignStatus })}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="sending">Sending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.type || 'all'}
          onValueChange={(value) => onFiltersChange({ type: value === 'all' ? undefined : value as CampaignType })}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      {selectedCampaigns.length > 0 && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
          <span className="text-sm text-muted-foreground">
            {selectedCampaigns.length} selected
          </span>
          {can(userRole, 'delete', 'campaigns') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                selectedCampaigns.forEach(id => deleteMutation.mutate(id));
                setSelectedCampaigns([]);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              selectedCampaigns.forEach(id => duplicateMutation.mutate(id));
              setSelectedCampaigns([]);
            }}
          >
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </Button>
        </div>
      )}

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedCampaigns.length === campaigns.length && campaigns.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Audience</TableHead>
            <TableHead>Sent</TableHead>
            <TableHead>Open Rate</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow key={campaign.id}>
              <TableCell>
                <Checkbox
                  checked={selectedCampaigns.includes(campaign.id)}
                  onCheckedChange={(checked) => handleSelectCampaign(campaign.id, checked as boolean)}
                />
              </TableCell>
              <TableCell className="font-medium">{campaign.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span>{getTypeIcon(campaign.type)}</span>
                  {campaign.type}
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(campaign.status)}>
                  {campaign.status}
                </Badge>
              </TableCell>
              <TableCell>{campaign.audience.size.toLocaleString()}</TableCell>
              <TableCell>{campaign.stats.sent.toLocaleString()}</TableCell>
              <TableCell>
                {campaign.type === 'email' && campaign.stats.delivered > 0
                  ? `${Math.round(((campaign.stats.opened || 0) / campaign.stats.delivered) * 100)}%`
                  : '-'
                }
              </TableCell>
              <TableCell>
                {new Date(campaign.updatedAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {campaign.status === 'draft' && (
                      <DropdownMenuItem onClick={() => sendMutation.mutate(campaign.id)}>
                        <Send className="mr-2 h-4 w-4" />
                        Send Now
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => duplicateMutation.mutate(campaign.id)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    {can(userRole, 'delete', 'campaigns') && (
                      <DropdownMenuItem
                        onClick={() => deleteMutation.mutate(campaign.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
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

      {campaigns.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No campaigns found.
        </div>
      )}
    </div>
  );
}