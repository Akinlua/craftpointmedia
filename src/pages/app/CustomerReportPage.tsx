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
import { Users, ArrowLeft, TrendingUp, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CustomerReportPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [filters, setFilters] = useState<FilterType>({
    dateRange: {
      from: new Date(new Date().setMonth(new Date().getMonth() - 6)),
      to: new Date()
    }
  });

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['customer-report', filters],
    queryFn: () => reportsApi.getCustomerReport(),
  });

  const handleExport = async (format: 'csv' | 'png' | 'pdf') => {
    try {
      await reportsApi.exportReport('customers', { format, includeFilters: true });
      toast({
        title: "Export started",
        description: `Your customer report ${format.toUpperCase()} will download shortly.`,
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
            <Users className="w-8 h-8" />
            Customer Insights Report
          </h1>
          <p className="text-muted-foreground mt-1">
            Customer growth, retention, and lifetime value analysis
          </p>
        </div>
      </div>

      {/* Filters */}
      <ReportFilters
        filters={filters}
        onFiltersChange={setFilters}
        onExport={handleExport}
        showTagsFilter
        showLocationFilter
      />

      {/* KPI Summary */}
      <KpiSummary kpis={reportData?.kpis || []} isLoading={isLoading} />

      {/* Customer Health Overview */}
      {reportData?.customerMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Growth Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Active</span>
                <span className="text-xl font-bold">
                  {reportData.customerMetrics.total}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">New This Month</span>
                <span className="text-xl font-bold text-green-600">
                  +{reportData.customerMetrics.newThisMonth}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Retention & Value
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Retention Rate</span>
                <span className="text-xl font-bold text-green-600">
                  {reportData.customerMetrics.retentionRate}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Avg LTV</span>
                <span className="text-xl font-bold">
                  ${reportData.customerMetrics.avgLifetimeValue.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
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

      {/* Customer Segmentation Insights */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Customer Segmentation Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">145</div>
              <div className="text-sm text-muted-foreground">Enterprise</div>
              <div className="text-xs text-muted-foreground">High Value</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">185</div>
              <div className="text-sm text-muted-foreground">SMB</div>
              <div className="text-xs text-muted-foreground">Growth Segment</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">95</div>
              <div className="text-sm text-muted-foreground">Startup</div>
              <div className="text-xs text-muted-foreground">High Potential</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">60</div>
              <div className="text-sm text-muted-foreground">Non-profit</div>
              <div className="text-xs text-muted-foreground">Special Pricing</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Last Updated */}
      {reportData?.lastUpdated && (
        <div className="text-xs text-muted-foreground">
          Last updated: {new Date(reportData.lastUpdated).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default CustomerReportPage;