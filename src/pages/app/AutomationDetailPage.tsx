import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AutomationCanvas } from '@/components/automations/AutomationCanvas';
import { automationsApi } from '@/lib/api/automations';
import { ArrowLeft, Play, Pause, Copy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function AutomationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: automation, isLoading } = useQuery({
    queryKey: ['automation', id],
    queryFn: () => automationsApi.getAutomation(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!automation) {
    return <div>Automation not found</div>;
  }

  const statusColor = {
    active: 'bg-green-500',
    inactive: 'bg-gray-500',
    draft: 'bg-yellow-500'
  }[automation.status];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/app/automations')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Automations
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{automation.name}</h1>
              <Badge className={statusColor}>
                {automation.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {automation.description || 'No description'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </Button>
          <Button variant="outline" size="sm">
            {automation.status === 'active' ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Activate
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{automation.stats.totalRuns}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{automation.stats.successfulRuns}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {automation.stats.totalRuns > 0 
                ? Math.round((automation.stats.successfulRuns / automation.stats.totalRuns) * 100)
                : 0
              }%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Run</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {automation.stats.lastRun 
                ? new Date(automation.stats.lastRun).toLocaleDateString()
                : 'Never'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Automation Flow</CardTitle>
        </CardHeader>
        <CardContent className="h-[600px] p-0">
          <AutomationCanvas 
            automation={automation}
            isReadOnly={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default AutomationDetailPage;