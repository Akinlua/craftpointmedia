import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import KpiCard from "@/components/dashboard/KpiCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import QuickActions from "@/components/dashboard/QuickActions";
import { PageBackground } from "@/components/layout/PageBackground";
import { Button } from "@/components/ui/button";
import { contactsApi } from "@/lib/api/contacts";
import { dealsApi } from "@/lib/api/deals";
import { tasksApi } from "@/lib/api/tasks";
import { useSession } from "@/lib/hooks/useSession";
import { useNavigate } from "react-router-dom";
import { KpiData } from "@/types/kpi";
import { Activity } from "@/types/activity";
import { Sparkles, Plus } from "lucide-react";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { organization } = useSession();

  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState<KpiData[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [dealsPipeline, setDealsPipeline] = useState<any[]>([]);
  const [isNewOrg, setIsNewOrg] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load contacts, deals, and tasks
      const [contactsResult, dealsResult, tasksResult] = await Promise.all([
        contactsApi.getContacts({}, 1, 100),
        dealsApi.getDeals({}, 1, 100),
        tasksApi.getTasks({})
      ]);

      const contacts = contactsResult.data;
      const deals = dealsResult.data;
      const tasks = tasksResult.data;

      // Check if new org
      setIsNewOrg(contacts.length === 0 && deals.length === 0 && tasks.length === 0);

      // Calculate KPIs
      const totalLeads = contacts.filter(c => c.status === 'lead').length;
      const totalCustomers = contacts.filter(c => c.status === 'customer').length;
      const totalRevenue = deals
        .filter(d => d.stage === 'closed_won')
        .reduce((sum, d) => sum + d.value, 0);
      const openDeals = deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage)).length;
      const pendingTasks = tasks.filter(t => t.status === 'pending').length;

      const kpis: KpiData[] = [
        {
          id: '1',
          title: 'Total Leads',
          value: totalLeads,
          change: 12,
          changeType: 'increase',
          icon: 'Users',
          color: 'blue',
          route: '/app/contacts'
        },
        {
          id: '2',
          title: 'Active Deals',
          value: openDeals,
          change: 8,
          changeType: 'increase',
          icon: 'Target',
          color: 'purple',
          route: '/app/deals'
        },
        {
          id: '3',
          title: 'Revenue',
          value: `$${totalRevenue.toLocaleString()}`,
          change: 15,
          changeType: 'increase',
          icon: 'DollarSign',
          color: 'green',
          route: '/app/deals'
        },
        {
          id: '4',
          title: 'Customers',
          value: totalCustomers,
          change: 5,
          changeType: 'increase',
          icon: 'Users',
          color: 'cyan',
          route: '/app/contacts'
        },
        {
          id: '5',
          title: 'Pending Tasks',
          value: pendingTasks,
          change: -3,
          changeType: 'decrease',
          icon: 'Calendar',
          color: 'orange',
          route: '/app/tasks'
        }
      ];
      setKpiData(kpis);

      // Build pipeline data
      const stageMap: Record<string, { stage: string; count: number; value: number }> = {
        new: { stage: 'New', count: 0, value: 0 },
        contacted: { stage: 'Contacted', count: 0, value: 0 },
        proposal: { stage: 'Proposal', count: 0, value: 0 },
        closed_won: { stage: 'Closed Won', count: 0, value: 0 },
        closed_lost: { stage: 'Closed Lost', count: 0, value: 0 }
      };

      deals.forEach(deal => {
        if (stageMap[deal.stage]) {
          stageMap[deal.stage].count++;
          stageMap[deal.stage].value += deal.value;
        }
      });

      const pipeline = Object.values(stageMap).map(stage => ({
        stage: stage.stage,
        count: stage.count,
        value: `$${stage.value.toLocaleString()}`
      }));
      setDealsPipeline(pipeline);

      // Build recent activities (simplified)
      const recentActivities: Activity[] = [
        ...contacts.slice(0, 3).map(c => ({
          id: `contact-${c.id}`,
          type: 'contact_added' as const,
          title: 'New contact added',
          description: `${c.firstName} ${c.lastName} was added`,
          timestamp: c.createdAt,
          user: { id: c.ownerId, name: c.ownerName },
          route: `/app/contacts/${c.id}`
        })),
        ...deals.slice(0, 2).map(d => ({
          id: `deal-${d.id}`,
          type: 'deal_updated' as const,
          title: 'Deal updated',
          description: `${d.title} - $${d.value.toLocaleString()}`,
          timestamp: d.updatedAt,
          user: { id: d.ownerId, name: d.ownerName },
          route: `/app/deals/${d.id}`
        })),
        ...tasks.slice(0, 2).map(t => ({
          id: `task-${t.id}`,
          type: t.status === 'completed' ? 'task_completed' as const : 'message_received' as const,
          title: t.status === 'completed' ? 'Task completed' : 'Task created',
          description: t.title,
          timestamp: t.updatedAt,
          user: { id: t.assigneeId, name: t.assigneeName },
          route: '/app/tasks'
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

      setActivities(recentActivities);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageBackground variant="dashboard">
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        {/* Header */}
        <div className="animate-slide-in-left">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            {organization?.name ? `Welcome to ${organization.name}!` : 'Welcome back!'} Here's what's happening with your business today.
          </p>
        </div>

        {/* Welcome State for New Organizations */}
        {isNewOrg && (
          <Card className="card-elevated border-primary/20 animate-slide-in-left">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">Welcome to CraftPoint CRM!</h2>
                  <p className="text-muted-foreground max-w-md">
                    Get started by adding your first contact or deal. Build your customer relationships and grow your business.
                  </p>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => navigate('/app/contacts')}
                    className="btn-primary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Contact
                  </Button>
                  <Button
                    onClick={() => navigate('/app/deals')}
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Deal
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 animate-slide-up">
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <KpiCard data={{} as KpiData} isLoading={true} />
              </div>
            ))
          ) : (
            kpiData.map((kpi, index) => (
              <div key={kpi.id} className="animate-slide-in-left" style={{ animationDelay: `${index * 100}ms` }}>
                <KpiCard data={kpi} />
              </div>
            ))
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
          {/* Pipeline Overview */}
          <Card className="lg:col-span-2 card-elevated hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                Sales Pipeline
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse-glow"></div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 sm:space-y-4">
                {dealsPipeline.map((stage, index) => (
                  <div key={stage.stage} className="space-y-2 group animate-slide-in-right" style={{ animationDelay: `${index * 150}ms` }}>
                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base font-medium group-hover:text-primary transition-colors duration-200">{stage.stage}</span>
                      <div className="text-right">
                        <div className="text-sm sm:text-base font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">{stage.value}</div>
                        <div className="text-xs text-muted-foreground">{stage.count} deals</div>
                      </div>
                    </div>
                    <Progress value={(stage.count / 45) * 100} className="h-2 sm:h-3 shadow-sm group-hover:shadow-md transition-shadow duration-200" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <div className="hidden lg:block animate-slide-in-right" style={{ animationDelay: '400ms' }}>
            <ActivityFeed
              activities={activities}
              isLoading={loading}
              hasMore={false}
              onLoadMore={() => { }}
            />
          </div>

          {/* Quick Actions */}
          <div className="animate-slide-in-right" style={{ animationDelay: '500ms' }}>
            <QuickActions />
          </div>
        </div>
      </div>
    </PageBackground>
  );
};

export default DashboardPage;