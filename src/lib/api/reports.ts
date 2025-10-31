import { ReportData, SalesReportData, MarketingReportData, CustomerReportData, ExportOptions } from '@/types/report';
import { 
  mockOverviewReport, 
  mockSalesReport, 
  mockMarketingReport, 
  mockCustomerReport 
} from '@/lib/mocks/reports';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const reportsApi = {
  async getOverviewReport(): Promise<ReportData> {
    await delay(800);
    return mockOverviewReport;
  },

  async getSalesReport(): Promise<SalesReportData> {
    await delay(900);
    return mockSalesReport;
  },

  async getMarketingReport(): Promise<MarketingReportData> {
    await delay(850);
    return mockMarketingReport;
  },

  async getCustomerReport(): Promise<CustomerReportData> {
    await delay(750);
    return mockCustomerReport;
  },

  async exportReport(reportType: string, options: ExportOptions): Promise<{ url: string }> {
    await delay(1500);
    // In real implementation, this would generate and return a download URL
    return { 
      url: `/exports/report-${reportType}-${Date.now()}.${options.format}` 
    };
  }
};