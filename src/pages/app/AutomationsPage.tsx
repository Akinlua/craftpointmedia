import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AutomationList } from '@/components/automations/AutomationList';
import { automationsApi } from '@/lib/api/automations';
import { AutomationFilters } from '@/types/automation';
import { useSession } from '@/lib/hooks/useSession';
import { Plus } from 'lucide-react';

export function AutomationsPage() {
  const navigate = useNavigate();
  const { role } = useSession();
  const [filters, setFilters] = useState<AutomationFilters>({});

  const { data, isLoading } = useQuery({
    queryKey: ['automations', filters],
    queryFn: () => automationsApi.getAutomations(filters),
  });

  const handleCreateAutomation = () => {
    navigate('/app/automations/new');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Automations</h1>
          <p className="text-muted-foreground">
            Create automated workflows for your contacts
          </p>
        </div>
        <Button onClick={handleCreateAutomation}>
          <Plus className="mr-2 h-4 w-4" />
          New Automation
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Automations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.automations.filter(a => a.status === 'active').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.automations.reduce((acc, a) => acc + a.stats.totalRuns, 0) || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.automations.length ? 
                Math.round(
                  data.automations.reduce((acc, a) => 
                    acc + (a.stats.totalRuns > 0 ? a.stats.successfulRuns / a.stats.totalRuns : 0), 0
                  ) * 100 / data.automations.length
                ) : 0
              }%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Automations</CardTitle>
        </CardHeader>
        <CardContent>
          <AutomationList
            automations={data?.automations || []}
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

export default AutomationsPage;