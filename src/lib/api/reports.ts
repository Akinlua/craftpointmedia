import { ReportData, SalesReportData, MarketingReportData, CustomerReportData, ExportOptions, ReportKpi, ReportChart } from '@/types/report';
import { ENV, API_ENDPOINTS } from '@/lib/config/env';

// Helper to get auth token
const getAuthToken = () => localStorage.getItem('AUTH_TOKEN');

// Helper to transform backend report data to frontend format
const transformReportData = (data: any): ReportData => {
  const kpis: ReportKpi[] = [
    {
      id: 'revenue',
      title: 'Total Revenue',
      value: data.kpis.revenue.total,
      format: 'currency',
      icon: 'DollarSign',
      change: 0, // Not provided by backend
      changeType: 'neutral'
    },
    {
      id: 'contacts',
      title: 'Total Contacts',
      value: data.kpis.contacts.total,
      format: 'number',
      icon: 'Users',
      change: parseInt(data.kpis.contacts.change) || 0,
      changeType: parseInt(data.kpis.contacts.change) > 0 ? 'increase' : 'neutral'
    },
    {
      id: 'deals',
      title: 'Active Deals',
      value: data.kpis.deals.total,
      format: 'number',
      icon: 'Briefcase',
      change: 0,
      changeType: 'neutral'
    },
    {
      id: 'invoices',
      title: 'Invoices',
      value: data.kpis.invoices.total,
      format: 'number',
      icon: 'FileText',
      change: 0,
      changeType: 'neutral'
    }
  ];

  const charts: ReportChart[] = [
    {
      id: 'activity',
      title: 'Activity Overview',
      type: 'area',
      data: (data.charts.activity || []).map((item: any) => ({
        date: item.date,
        value: parseInt(item.contacts) + parseInt(item.deals) + parseInt(item.invoices), // Aggregate for overview
        label: 'Total Activity'
      }))
    }
  ];

  return {
    kpis,
    charts,
    filters: {
      dateRange: {
        from: new Date(), // Should be calculated based on period
        to: new Date()
      }
    },
    lastUpdated: new Date().toISOString()
  };
};

export const reportsApi = {
  async getOverviewReport(period: string = '30d'): Promise<ReportData> {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.REPORTS.OVERVIEW}?period=${period}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch overview report');
    }

    const result = await response.json();
    return transformReportData(result.data);
  },

  async getSalesReport(period: string = '30d'): Promise<SalesReportData> {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.REPORTS.OVERVIEW}?period=${period}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch sales report');
    }

    const result = await response.json();
    const baseData = transformReportData(result.data);

    // Customize charts for sales
    baseData.charts = [
      {
        id: 'revenue-trend',
        title: 'Revenue Trend',
        type: 'line',
        data: (result.data.charts.activity || []).map((item: any) => ({
          date: item.date,
          value: parseInt(item.invoices) * 100, // Mocking revenue based on invoices count for now as daily revenue isn't in chart data
          label: 'Revenue'
        }))
      }
    ];

    return {
      ...baseData,
      dealMetrics: {
        created: result.data.kpis.deals.total,
        won: result.data.kpis.deals.won,
        lost: 0, // Not provided
        avgCycleLength: 0 // Not provided
      }
    };
  },

  async getMarketingReport(period: string = '30d'): Promise<MarketingReportData> {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.REPORTS.OVERVIEW}?period=${period}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch marketing report');
    }

    const result = await response.json();
    const baseData = transformReportData(result.data);

    return {
      ...baseData,
      campaignMetrics: {
        sent: result.data.kpis.marketing.campaignsSent,
        delivered: 0, // Not provided
        opened: 0, // Not provided
        clicked: 0 // Not provided
      }
    };
  },

  async getCustomerReport(period: string = '30d'): Promise<CustomerReportData> {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.REPORTS.OVERVIEW}?period=${period}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch customer report');
    }

    const result = await response.json();
    const baseData = transformReportData(result.data);

    // Customize charts for customers
    baseData.charts = [
      {
        id: 'customer-growth',
        title: 'Customer Growth',
        type: 'bar',
        data: (result.data.charts.activity || []).map((item: any) => ({
          date: item.date,
          value: parseInt(item.contacts),
          label: 'New Contacts'
        }))
      }
    ];

    return {
      ...baseData,
      customerMetrics: {
        total: result.data.kpis.contacts.total,
        newThisMonth: result.data.kpis.contacts.new,
        retentionRate: 0, // Not provided
        avgLifetimeValue: 0 // Not provided
      }
    };
  },

  async exportReport(reportType: string, options: ExportOptions): Promise<{ url: string }> {
    // Stub for export
    return {
      url: '#'
    };
  }
};