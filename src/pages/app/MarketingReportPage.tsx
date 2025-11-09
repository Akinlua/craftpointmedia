import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
            Campaign performance, engagement metrics, and marketing ROI
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

      {/* Campaign Metrics Summary */}
      {reportData?.campaignMetrics && (
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Campaign Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {reportData.campaignMetrics.sent.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Emails Sent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {reportData.campaignMetrics.delivered.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Delivered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {reportData.campaignMetrics.opened.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Opened</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {reportData.campaignMetrics.clicked.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Clicked</div>
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
