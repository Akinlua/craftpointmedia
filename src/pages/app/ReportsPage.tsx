import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import KpiSummary from "@/components/reports/KpiSummary";
import ReportFilters from "@/components/reports/ReportFilters";
import ReportChart from "@/components/reports/ReportChart";
import { reportsApi } from "@/lib/api/reports";
import { ReportFilters as FilterType } from "@/types/report";
import { BarChart3, TrendingUp, Users, Mail } from "lucide-react";

const ReportsPage = () => {
  const { toast } = useToast();
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [filters, setFilters] = useState<FilterType>({
    dateRange: {
      from: new Date(new Date().setMonth(new Date().getMonth() - 6)),
      to: new Date()
    }
  });

  const { data: reportData, isLoading, refetch } = useQuery({
    queryKey: ['reports-overview', filters],
    queryFn: () => reportsApi.getOverviewReport(),
    refetchInterval: autoRefresh ? 5 * 60 * 1000 : false, // 5 minutes
  });

  const handleExport = async (format: 'csv' | 'png' | 'pdf') => {
    try {
      await reportsApi.exportReport('overview', { format, includeFilters: true });
      toast({
        title: "Export started",
        description: `Your ${format.toUpperCase()} export will download shortly.`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting your report.",
        variant: "destructive",
      });
    }
  };

  const quickInsights = [
    {
      title: "Sales Performance",
      description: "Revenue up 18% compared to last period",
      icon: TrendingUp,
      color: "text-green-600",
      route: "/app/reports/sales"
    },
    {
      title: "Marketing ROI",
      description: "Email campaigns showing strong engagement",
      icon: Mail,
      color: "text-blue-600",
      route: "/app/reports/marketing"
    },
    {
      title: "Customer Growth",
      description: "32 new customers acquired this month",
      icon: Users,
      color: "text-purple-600",
      route: "/app/reports/customers"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-display flex items-center gap-2">
            <BarChart3 className="w-8 h-8" />
            Analytics & Reports
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive insights into your business performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            Auto-refresh {autoRefresh && <Badge className="ml-1">ON</Badge>}
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <ReportFilters
        filters={filters}
        onFiltersChange={setFilters}
        onExport={handleExport}
        showOwnerFilter
        showPipelineFilter
        showCampaignFilter
      />

      {/* KPI Summary */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Key Performance Indicators</h2>
        <KpiSummary kpis={reportData?.kpis || []} isLoading={isLoading} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reportData?.charts.map((chart) => (
          <ReportChart 
            key={chart.id} 
            chart={chart} 
            isLoading={isLoading}
            className="col-span-1"
          />
        ))}
      </div>

      {/* Quick Insights */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickInsights.map((insight) => {
            const Icon = insight.icon;
            return (
              <Card 
                key={insight.title} 
                className="card-subtle cursor-pointer hover:shadow-md transition-all duration-200"
                onClick={() => window.location.href = insight.route}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className={`w-5 h-5 ${insight.color}`} />
                    </div>
                    <CardTitle className="text-base">{insight.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">
                    {insight.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Last Updated */}
      {reportData?.lastUpdated && (
        <div className="text-xs text-muted-foreground">
          Last updated: {new Date(reportData.lastUpdated).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;