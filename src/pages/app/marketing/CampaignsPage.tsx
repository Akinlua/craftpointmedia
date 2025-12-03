import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Mail, MoreHorizontal, Plus, Search, Send, Pause, Copy, Trash } from 'lucide-react';
import { campaignsApi } from '@/lib/api/campaigns';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import type { CampaignStatus } from '@/types/campaign';

const statusColors: Record<CampaignStatus, string> = {
  draft: 'bg-gray-500',
  scheduled: 'bg-blue-500',
  sending: 'bg-yellow-500',
  sent: 'bg-green-500',
  paused: 'bg-orange-500',
  cancelled: 'bg-red-500',
};

export default function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'email' | 'sms'>('email');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: emailCampaigns, isLoading } = useQuery({
    queryKey: ['email-campaigns'],
    queryFn: () => campaignsApi.getEmailCampaigns(),
  });

  const sendCampaignMutation = useMutation({
    mutationFn: ({ id, type }: { id: string; type: 'email' | 'sms' }) =>
      campaignsApi.sendCampaign(id, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
      toast({ title: 'Campaign sent successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to send campaign', variant: 'destructive' });
    },
  });

  const pauseCampaignMutation = useMutation({
    mutationFn: ({ id, type }: { id: string; type: 'email' | 'sms' }) =>
      campaignsApi.pauseCampaign(id, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
      toast({ title: 'Campaign paused' });
    },
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: ({ id, type }: { id: string; type: 'email' | 'sms' }) =>
      campaignsApi.deleteCampaign(id, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
      toast({ title: 'Campaign deleted' });
    },
  });

  const duplicateCampaignMutation = useMutation({
    mutationFn: ({ id, type }: { id: string; type: 'email' | 'sms' }) =>
      campaignsApi.duplicateCampaign(id, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
      toast({ title: 'Campaign duplicated' });
    },
  });

  const filteredCampaigns = emailCampaigns?.filter((campaign) =>
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Campaigns"
        description="Manage your email and SMS campaigns"
        actions={
          <Link to="/app/marketing/campaigns/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </Link>
        }
      />

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'email' | 'sms')}>
        <TabsList>
          <TabsTrigger value="email">Email Campaigns</TabsTrigger>
          <TabsTrigger value="sms">SMS Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="mt-4">
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Sent</TableHead>
                  <TableHead className="text-right">Opened</TableHead>
                  <TableHead className="text-right">Clicked</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredCampaigns?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No campaigns found. Create your first campaign to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCampaigns?.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <Link
                          to={`/app/marketing/campaigns/${campaign.id}`}
                          className="font-medium hover:underline"
                        >
                          {campaign.name}
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {campaign.subject}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[campaign.status]}>
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {campaign.statistics.sent}
                      </TableCell>
                      <TableCell className="text-right">
                        {campaign.statistics.opened}
                        {campaign.statistics.sent > 0 && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({((campaign.statistics.opened / campaign.statistics.sent) * 100).toFixed(1)}%)
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {campaign.statistics.clicked}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {campaign.status === 'draft' && (
                              <DropdownMenuItem
                                onClick={() =>
                                  sendCampaignMutation.mutate({ id: campaign.id, type: 'email' })
                                }
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Send Now
                              </DropdownMenuItem>
                            )}
                            {campaign.status === 'sending' && (
                              <DropdownMenuItem
                                onClick={() =>
                                  pauseCampaignMutation.mutate({ id: campaign.id, type: 'email' })
                                }
                              >
                                <Pause className="h-4 w-4 mr-2" />
                                Pause
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() =>
                                duplicateCampaignMutation.mutate({ id: campaign.id, type: 'email' })
                              }
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                deleteCampaignMutation.mutate({ id: campaign.id, type: 'email' })
                              }
                              className="text-destructive"
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="sms">
          <div className="border rounded-lg p-8 text-center">
            <p className="text-muted-foreground">SMS campaigns coming soon</p>
          </div>
        </TabsContent>
      </Tabs>
    </div >
  );
}
