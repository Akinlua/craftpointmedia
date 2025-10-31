import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CampaignList } from '@/components/marketing/CampaignList';
import { campaignsApi } from '@/lib/api/campaigns';
import { CampaignFilters } from '@/types/campaign';
import { useSession } from '@/lib/hooks/useSession';
import { Plus } from 'lucide-react';

export function CampaignsPage() {
  const { role } = useSession();
  const [filters, setFilters] = useState<CampaignFilters>({});

  const { data, isLoading } = useQuery({
    queryKey: ['campaigns', filters],
    queryFn: () => campaignsApi.getCampaigns(filters),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketing Campaigns</h1>
          <p className="text-muted-foreground">
            Manage your email and SMS campaigns
          </p>
        </div>
        <Link to="/app/marketing/campaigns/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.campaigns.filter(c => c.status === 'sending' || c.status === 'scheduled').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.campaigns.reduce((acc, c) => acc + c.stats.sent, 0) || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Open Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.campaigns.length ? 
                Math.round(
                  data.campaigns
                    .filter(c => c.type === 'email' && c.stats.delivered > 0)
                    .reduce((acc, c) => acc + ((c.stats.opened || 0) / c.stats.delivered), 0) * 100 / 
                  data.campaigns.filter(c => c.type === 'email' && c.stats.delivered > 0).length
                ) : 0
              }%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <CampaignList
            campaigns={data?.campaigns || []}
            isLoading={isLoading}
            filters={filters}
            onFiltersChange={setFilters}
            userRole={role?.role || 'staff'}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default CampaignsPage;