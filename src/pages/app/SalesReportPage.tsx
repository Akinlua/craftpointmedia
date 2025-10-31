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
import { TrendingUp, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SalesReportPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [filters, setFilters] = useState<FilterType>({
    dateRange: {
      from: new Date(new Date().setMonth(new Date().getMonth() - 6)),
      to: new Date()
    }
  });

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['sales-report', filters],
    queryFn: () => reportsApi.getSalesReport(),
  });

  const handleExport = async (format: 'csv' | 'png' | 'pdf') => {
    try {
      await reportsApi.exportReport('sales', { format, includeFilters: true });
      toast({
        title: "Export started",
        description: `Your sales report ${format.toUpperCase()} will download shortly.`,
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
            <TrendingUp className="w-8 h-8" />
            Sales Performance Report
          </h1>
          <p className="text-muted-foreground mt-1">
            Detailed insights into your sales pipeline and performance
          </p>
        </div>
      </div>

      {/* Filters */}
      <ReportFilters
        filters={filters}
        onFiltersChange={setFilters}
        onExport={handleExport}
        showOwnerFilter
        showPipelineFilter
      />

      {/* KPI Summary */}
      <KpiSummary kpis={reportData?.kpis || []} isLoading={isLoading} />

      {/* Deal Metrics Summary */}
      {reportData?.dealMetrics && (
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Deal Flow Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {reportData.dealMetrics.created}
                </div>
                <div className="text-sm text-muted-foreground">Deals Created</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {reportData.dealMetrics.won}
                </div>
                <div className="text-sm text-muted-foreground">Deals Won</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {reportData.dealMetrics.lost}
                </div>
                <div className="text-sm text-muted-foreground">Deals Lost</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {reportData.dealMetrics.avgCycleLength}d
                </div>
                <div className="text-sm text-muted-foreground">Avg Cycle</div>
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

export default SalesReportPage;