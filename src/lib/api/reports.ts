import { ReportData, SalesReportData, MarketingReportData, CustomerReportData, ExportOptions } from '@/types/report';
import { supabase } from '@/integrations/supabase/client';

export const reportsApi = {
  async getOverviewReport(): Promise<ReportData> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-reports?type=overview`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch overview report');
    }

    return response.json();
  },

  async getSalesReport(): Promise<SalesReportData> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-reports?type=sales`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch sales report');
    }

    return response.json();
  },

  async getMarketingReport(): Promise<MarketingReportData> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-reports?type=marketing`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch marketing report');
    }

    return response.json();
  },

  async getCustomerReport(): Promise<CustomerReportData> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-reports?type=customer`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch customer report');
    }

    return response.json();
  },

  async exportReport(reportType: string, options: ExportOptions): Promise<{ url: string }> {
    // In real implementation, this would generate and return a download URL
    return { 
      url: `/exports/report-${reportType}-${Date.now()}.${options.format}` 
    };
  }
};