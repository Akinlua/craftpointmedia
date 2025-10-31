export interface ReportKpi {
  id: string;
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  format?: 'number' | 'currency' | 'percentage';
  icon: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  label?: string;
  fill?: string;
}

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ReportChart {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'funnel';
  data: ChartDataPoint[] | TimeSeriesDataPoint[];
  config?: Record<string, any>;
}

export interface ReportFilters {
  dateRange: {
    from: Date;
    to: Date;
  };
  owner?: string;
  pipeline?: string;
  campaign?: string;
  tags?: string[];
  location?: string;
}

export interface ReportData {
  kpis: ReportKpi[];
  charts: ReportChart[];
  filters: ReportFilters;
  lastUpdated: string;
}

export interface SalesReportData extends ReportData {
  dealMetrics: {
    created: number;
    won: number;
    lost: number;
    avgCycleLength: number;
  };
}

export interface MarketingReportData extends ReportData {
  campaignMetrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
  };
}

export interface CustomerReportData extends ReportData {
  customerMetrics: {
    total: number;
    newThisMonth: number;
    retentionRate: number;
    avgLifetimeValue: number;
  };
}

export interface ExportOptions {
  format: 'csv' | 'png' | 'pdf';
  includeFilters: boolean;
}