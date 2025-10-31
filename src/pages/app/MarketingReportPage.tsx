import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import KpiSummary from "@/components/reports/KpiSummary";
import ReportFilters from "@/components/reports/ReportFilters";
import ReportChart from "@/components/reports/ReportChart";
import { reportsApi } from "@/lib/api/reports";
import { ReportFilters as FilterType } from "@/types/report";
import { Mail, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MarketingReportPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [filters, setFilters] = useState<FilterType>({
    dateRange: {
      from: new Date(new Date().setMonth(new Date().getMonth() - 6)),
      to: new Date()
    }
  });

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['marketing-report', filters],
    queryFn: () => reportsApi.getMarketingReport(),
  });

  const handleExport = async (format: 'csv' | 'png' | 'pdf') => {
    try {
      await reportsApi.exportReport('marketing', { format, includeFilters: true });
      toast({
        title: "Export started",
        description: `Your marketing report ${format.toUpperCase()} will download shortly.`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting your report.",
        variant: "destructive",
      });
    }
  };

  const getDeliveryRate = () => {
    if (!reportData?.campaignMetrics) return 0;
    return (reportData.campaignMetrics.delivered / reportData.campaignMetrics.sent) * 100;
  };

  const getOpenRate = () => {
    if (!reportData?.campaignMetrics) return 0;
    return (reportData.campaignMetrics.opened / reportData.campaignMetrics.delivered) * 100;
  };

  const getClickRate = () => {
    if (!reportData?.campaignMetrics) return 0;
    return (reportData.campaignMetrics.clicked / reportData.campaignMetrics.opened) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/app/reports')}
          className="px-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-display flex items-center gap-2">
            <Mail className="w-8 h-8" />
            Marketing Performance Report
          </h1>
          <p className="text-muted-foreground mt-1">
            Campaign performance and engagement analytics
          </p>
        </div>
      </div>

      {/* Filters */}
      <ReportFilters
        filters={filters}
        onFiltersChange={setFilters}
        onExport={handleExport}
        showCampaignFilter
      />

      {/* KPI Summary */}
      <KpiSummary kpis={reportData?.kpis || []} isLoading={isLoading} />

      {/* Campaign Funnel */}
      {reportData?.campaignMetrics && (
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Campaign Funnel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Emails Sent</span>
                <span className="text-lg font-semibold">
                  {reportData.campaignMetrics.sent.toLocaleString()}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Delivered</span>
                  <div className="text-right">
                    <span className="text-lg font-semibold">
                      {reportData.campaignMetrics.delivered.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({getDeliveryRate().toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <Progress value={getDeliveryRate()} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Opened</span>
                  <div className="text-right">
                    <span className="text-lg font-semibold">
                      {reportData.campaignMetrics.opened.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({getOpenRate().toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <Progress value={getOpenRate()} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Clicked</span>
                  <div className="text-right">
                    <span className="text-lg font-semibold">
                      {reportData.campaignMetrics.clicked.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({getClickRate().toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <Progress value={getClickRate()} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reportData?.charts.map((chart) => (
          <ReportChart 
            key={chart.id} 
            chart={chart} 
            isLoading={isLoading}
          />
        ))}
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

export default MarketingReportPage;