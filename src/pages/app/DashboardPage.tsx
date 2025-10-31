import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import KpiCard from "@/components/dashboard/KpiCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import QuickActions from "@/components/dashboard/QuickActions";
import { PageBackground } from "@/components/layout/PageBackground";
import { Button } from "@/components/ui/button";
import { mockKpiData } from "@/lib/mocks/kpi";
import { mockActivities } from "@/lib/mocks/activity";
import { useCRMStore } from "@/lib/stores/crmStore";
import { useSession } from "@/lib/hooks/useSession";
import { useNavigate } from "react-router-dom";
import { KpiData } from "@/types/kpi";
import { Activity } from "@/types/activity";
import { Sparkles, Plus } from "lucide-react";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { organization } = useSession();
  const { contacts, deals, tasks } = useCRMStore();
  
  // Check if this is a new organization with no data
  const isNewOrg = contacts.length === 0 && deals.length === 0 && tasks.length === 0;
  
  // Simulated API calls with TanStack Query
  const { data: kpiData, isLoading: kpiLoading } = useQuery<KpiData[]>({
    queryKey: ['dashboard-kpi'],
    queryFn: () => new Promise<KpiData[]>(resolve => setTimeout(() => resolve(mockKpiData), 1000)),
  });

  const { data: activitiesData, isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ['dashboard-activities'],
    queryFn: () => new Promise<Activity[]>(resolve => setTimeout(() => resolve(mockActivities), 1200)),
  });

  const dealsPipeline = [
    { stage: "Prospecting", count: 45, value: "$125,500" },
    { stage: "Qualification", count: 32, value: "$89,200" },
    { stage: "Proposal", count: 18, value: "$156,800" },
    { stage: "Negotiation", count: 12, value: "$98,400" },
    { stage: "Closed Won", count: 8, value: "$67,300" }
  ];

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
        {kpiLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <KpiCard data={{} as KpiData} isLoading={true} />
            </div>
          ))
        ) : (
          kpiData?.map((kpi, index) => (
            <div key={kpi.id} className="animate-slide-in-left" style={{animationDelay: `${index * 100}ms`}}>
              <KpiCard data={kpi} />
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 animate-slide-up" style={{animationDelay: '300ms'}}>
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
                <div key={stage.stage} className="space-y-2 group animate-slide-in-right" style={{animationDelay: `${index * 150}ms`}}>
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
        <div className="hidden lg:block animate-slide-in-right" style={{animationDelay: '400ms'}}>
          <ActivityFeed 
            activities={activitiesData ?? []} 
            isLoading={activitiesLoading}
            hasMore={true}
            onLoadMore={() => console.log('Load more activities')}
          />
        </div>

        {/* Quick Actions */}
        <div className="animate-slide-in-right" style={{animationDelay: '500ms'}}>
          <QuickActions />
        </div>
      </div>
      </div>
    </PageBackground>
  );
};

export default DashboardPage;