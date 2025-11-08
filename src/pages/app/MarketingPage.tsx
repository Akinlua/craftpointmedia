import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, MessageSquare, Zap, TrendingUp, Users, MousePointerClick } from 'lucide-react';
import { campaignsApi } from '@/lib/api/campaigns';
import { workflowsApi } from '@/lib/api/workflows';
import { Link } from 'react-router-dom';

export default function MarketingPage() {
  const { data: emailCampaigns } = useQuery({
    queryKey: ['email-campaigns'],
    queryFn: () => campaignsApi.getEmailCampaigns(),
  });

  const { data: workflows } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => workflowsApi.getWorkflows(),
  });

  const totalCampaigns = emailCampaigns?.length || 0;
  const activeCampaigns = emailCampaigns?.filter(c => c.status === 'sent' || c.status === 'sending').length || 0;
  const activeWorkflows = workflows?.filter(w => w.isActive).length || 0;

  // Calculate total stats
  const totalSent = emailCampaigns?.reduce((sum, c) => sum + (c.statistics.sent || 0), 0) || 0;
  const totalOpened = emailCampaigns?.reduce((sum, c) => sum + (c.statistics.opened || 0), 0) || 0;
  const totalClicked = emailCampaigns?.reduce((sum, c) => sum + (c.statistics.clicked || 0), 0) || 0;

  const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0';
  const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : '0';

  const kpiCards = [
    {
      title: 'Total Campaigns',
      value: totalCampaigns,
      icon: Mail,
      description: `${activeCampaigns} active`,
    },
    {
      title: 'Active Workflows',
      value: activeWorkflows,
      icon: Zap,
      description: `${workflows?.length || 0} total`,
    },
    {
      title: 'Open Rate',
      value: `${openRate}%`,
      icon: TrendingUp,
      description: `${totalOpened} of ${totalSent} opened`,
    },
    {
      title: 'Click Rate',
      value: `${clickRate}%`,
      icon: MousePointerClick,
      description: `${totalClicked} clicks`,
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Marketing & Automation"
        description="Manage your email campaigns, workflows, and lead scoring"
      >
        <div className="flex gap-2">
            <Link to="/app/marketing/campaigns/new">
              <Button>
                <Mail className="w-4 h-4 mr-2" />
                New Campaign
              </Button>
            </Link>
            <Link to="/app/marketing/workflows/new">
              <Button variant="outline">
                <Zap className="w-4 h-4 mr-2" />
                New Workflow
              </Button>
            </Link>
          </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((kpi) => (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <kpi.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground">{kpi.description}</p>
              </CardContent>
            </Card>
          ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {emailCampaigns?.slice(0, 5).map((campaign) => (
                  <Link
                    key={campaign.id}
                    to={`/app/marketing/campaigns/${campaign.id}`}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div>
                      <p className="font-medium">{campaign.name}</p>
                      <p className="text-sm text-muted-foreground">{campaign.subject}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium capitalize">{campaign.status}</p>
                      <p className="text-xs text-muted-foreground">
                        {campaign.statistics.sent} sent
                      </p>
                    </div>
                  </Link>
                ))}
                {(!emailCampaigns || emailCampaigns.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No campaigns yet. Create your first campaign to get started.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Workflows</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflows?.filter(w => w.isActive).slice(0, 5).map((workflow) => (
                  <Link
                    key={workflow.id}
                    to={`/app/marketing/workflows/${workflow.id}`}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div>
                      <p className="font-medium">{workflow.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {workflow.triggerType.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {workflow.statistics.totalExecutions} runs
                      </p>
                    </div>
                  </Link>
                ))}
                {(!workflows || workflows.filter(w => w.isActive).length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No active workflows. Create a workflow to automate your marketing.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
          <Link to="/app/marketing/campaigns">
            <Card className="hover:bg-accent transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Email Campaigns</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Send targeted emails
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/app/marketing/workflows">
            <Card className="hover:bg-accent transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Workflows</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Automate your tasks
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/app/marketing/lead-scoring">
            <Card className="hover:bg-accent transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Lead Scoring</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Prioritize your leads
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
      </div>
    </div>
  </div>
  );
}
