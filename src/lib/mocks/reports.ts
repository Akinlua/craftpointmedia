import { ReportData, SalesReportData, MarketingReportData, CustomerReportData } from '@/types/report';

// Mock data for overview dashboard
export const mockOverviewReport: ReportData = {
  kpis: [
    {
      id: 'total-revenue',
      title: 'Total Revenue',
      value: '$342,500',
      change: 18,
      changeType: 'increase',
      format: 'currency',
      icon: 'DollarSign'
    },
    {
      id: 'conversion-rate',
      title: 'Conversion Rate',
      value: '24.5%',
      change: 3.2,
      changeType: 'increase',
      format: 'percentage',
      icon: 'Target'
    },
    {
      id: 'avg-deal-value',
      title: 'Avg Deal Value',
      value: '$12,850',
      change: -2.1,
      changeType: 'decrease',
      format: 'currency',
      icon: 'TrendingUp'
    },
    {
      id: 'active-campaigns',
      title: 'Active Campaigns',
      value: '8',
      change: 2,
      changeType: 'increase',
      format: 'number',
      icon: 'Megaphone'
    }
  ],
  charts: [
    {
      id: 'sales-trend',
      title: 'Sales Over Time',
      type: 'line',
      data: [
        { date: '2024-01', value: 45000 },
        { date: '2024-02', value: 52000 },
        { date: '2024-03', value: 48000 },
        { date: '2024-04', value: 61000 },
        { date: '2024-05', value: 55000 },
        { date: '2024-06', value: 68000 }
      ]
    },
    {
      id: 'pipeline-funnel',
      title: 'Pipeline Conversion',
      type: 'funnel',
      data: [
        { name: 'Leads', value: 1200, fill: '#3b82f6' },
        { name: 'Qualified', value: 480, fill: '#10b981' },
        { name: 'Proposal', value: 240, fill: '#f59e0b' },
        { name: 'Negotiation', value: 120, fill: '#ef4444' },
        { name: 'Closed Won', value: 60, fill: '#8b5cf6' }
      ]
    },
    {
      id: 'top-campaigns',
      title: 'Top Performing Campaigns',
      type: 'bar',
      data: [
        { name: 'Summer Sale', value: 85, fill: '#3b82f6' },
        { name: 'Product Launch', value: 72, fill: '#10b981' },
        { name: 'Holiday Special', value: 68, fill: '#f59e0b' },
        { name: 'Newsletter', value: 45, fill: '#ef4444' }
      ]
    },
    {
      id: 'customer-growth',
      title: 'Customer Growth',
      type: 'area',
      data: [
        { date: '2024-01', value: 120 },
        { date: '2024-02', value: 145 },
        { date: '2024-03', value: 160 },
        { date: '2024-04', value: 180 },
        { date: '2024-05', value: 195 },
        { date: '2024-06', value: 220 }
      ]
    }
  ],
  filters: {
    dateRange: {
      from: new Date('2024-01-01'),
      to: new Date('2024-06-30')
    }
  },
  lastUpdated: new Date().toISOString()
};

// Mock data for sales report
export const mockSalesReport: SalesReportData = {
  dealMetrics: {
    created: 156,
    won: 42,
    lost: 18,
    avgCycleLength: 28
  },
  kpis: [
    {
      id: 'deals-created',
      title: 'Deals Created',
      value: '156',
      change: 12,
      changeType: 'increase',
      format: 'number',
      icon: 'Plus'
    },
    {
      id: 'deals-won',
      title: 'Deals Won',
      value: '42',
      change: 8,
      changeType: 'increase',
      format: 'number',
      icon: 'CheckCircle'
    },
    {
      id: 'win-rate',
      title: 'Win Rate',
      value: '26.9%',
      change: -1.2,
      changeType: 'decrease',
      format: 'percentage',
      icon: 'Target'
    },
    {
      id: 'avg-cycle',
      title: 'Avg Sales Cycle',
      value: '28 days',
      change: -3,
      changeType: 'decrease',
      format: 'number',
      icon: 'Clock'
    }
  ],
  charts: [
    {
      id: 'revenue-by-owner',
      title: 'Revenue by Sales Rep',
      type: 'bar',
      data: [
        { name: 'Sarah Johnson', value: 125000, fill: '#3b82f6' },
        { name: 'Mike Chen', value: 98000, fill: '#10b981' },
        { name: 'Emily Rodriguez', value: 87000, fill: '#f59e0b' },
        { name: 'David Kim', value: 76000, fill: '#ef4444' }
      ]
    },
    {
      id: 'deals-by-stage',
      title: 'Deals by Pipeline Stage',
      type: 'bar',
      data: [
        { name: 'Prospecting', value: 45, fill: '#3b82f6' },
        { name: 'Qualification', value: 32, fill: '#10b981' },
        { name: 'Proposal', value: 18, fill: '#f59e0b' },
        { name: 'Negotiation', value: 12, fill: '#ef4444' },
        { name: 'Closed Won', value: 8, fill: '#8b5cf6' }
      ]
    }
  ],
  filters: {
    dateRange: {
      from: new Date('2024-01-01'),
      to: new Date('2024-06-30')
    }
  },
  lastUpdated: new Date().toISOString()
};

// Mock data for marketing report
export const mockMarketingReport: MarketingReportData = {
  campaignMetrics: {
    sent: 25000,
    delivered: 24500,
    opened: 7350,
    clicked: 1470
  },
  kpis: [
    {
      id: 'emails-sent',
      title: 'Emails Sent',
      value: '25,000',
      change: 15,
      changeType: 'increase',
      format: 'number',
      icon: 'Mail'
    },
    {
      id: 'delivery-rate',
      title: 'Delivery Rate',
      value: '98%',
      change: 0.5,
      changeType: 'increase',
      format: 'percentage',
      icon: 'CheckCircle'
    },
    {
      id: 'open-rate',
      title: 'Open Rate',
      value: '30%',
      change: 2.1,
      changeType: 'increase',
      format: 'percentage',
      icon: 'Eye'
    },
    {
      id: 'click-rate',
      title: 'Click Rate',
      value: '6%',
      change: -0.3,
      changeType: 'decrease',
      format: 'percentage',
      icon: 'MousePointer'
    }
  ],
  charts: [
    {
      id: 'campaign-performance',
      title: 'Campaign Performance Comparison',
      type: 'bar',
      data: [
        { name: 'Summer Sale', value: 42, fill: '#3b82f6' },
        { name: 'Product Launch', value: 38, fill: '#10b981' },
        { name: 'Newsletter', value: 25, fill: '#f59e0b' },
        { name: 'Holiday Special', value: 35, fill: '#ef4444' }
      ]
    },
    {
      id: 'engagement-trends',
      title: 'Email Engagement Trends',
      type: 'line',
      data: [
        { date: '2024-01', value: 28 },
        { date: '2024-02', value: 32 },
        { date: '2024-03', value: 29 },
        { date: '2024-04', value: 35 },
        { date: '2024-05', value: 31 },
        { date: '2024-06', value: 30 }
      ]
    }
  ],
  filters: {
    dateRange: {
      from: new Date('2024-01-01'),
      to: new Date('2024-06-30')
    }
  },
  lastUpdated: new Date().toISOString()
};

// Mock data for customer report
export const mockCustomerReport: CustomerReportData = {
  customerMetrics: {
    total: 485,
    newThisMonth: 32,
    retentionRate: 89,
    avgLifetimeValue: 15640
  },
  kpis: [
    {
      id: 'total-customers',
      title: 'Total Customers',
      value: '485',
      change: 7.2,
      changeType: 'increase',
      format: 'number',
      icon: 'Users'
    },
    {
      id: 'new-customers',
      title: 'New This Month',
      value: '32',
      change: 12,
      changeType: 'increase',
      format: 'number',
      icon: 'UserPlus'
    },
    {
      id: 'retention-rate',
      title: 'Retention Rate',
      value: '89%',
      change: 1.5,
      changeType: 'increase',
      format: 'percentage',
      icon: 'Heart'
    },
    {
      id: 'lifetime-value',
      title: 'Avg Lifetime Value',
      value: '$15,640',
      change: 5.8,
      changeType: 'increase',
      format: 'currency',
      icon: 'TrendingUp'
    }
  ],
  charts: [
    {
      id: 'top-customers',
      title: 'Top Customers by Revenue',
      type: 'bar',
      data: [
        { name: 'Acme Corp', value: 125000, fill: '#3b82f6' },
        { name: 'TechStart Inc', value: 98000, fill: '#10b981' },
        { name: 'Global Solutions', value: 87000, fill: '#f59e0b' },
        { name: 'Innovation Labs', value: 76000, fill: '#ef4444' }
      ]
    },
    {
      id: 'customers-by-tag',
      title: 'Customers by Category',
      type: 'pie',
      data: [
        { name: 'Enterprise', value: 145, fill: '#3b82f6' },
        { name: 'SMB', value: 185, fill: '#10b981' },
        { name: 'Startup', value: 95, fill: '#f59e0b' },
        { name: 'Non-profit', value: 60, fill: '#ef4444' }
      ]
    },
    {
      id: 'customer-growth',
      title: 'Customer Growth Over Time',
      type: 'line',
      data: [
        { date: '2024-01', value: 420 },
        { date: '2024-02', value: 435 },
        { date: '2024-03', value: 448 },
        { date: '2024-04', value: 462 },
        { date: '2024-05', value: 473 },
        { date: '2024-06', value: 485 }
      ]
    }
  ],
  filters: {
    dateRange: {
      from: new Date('2024-01-01'),
      to: new Date('2024-06-30')
    }
  },
  lastUpdated: new Date().toISOString()
};