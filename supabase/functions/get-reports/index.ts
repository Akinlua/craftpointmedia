import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('org_id')
      .eq('id', user.id)
      .single();

    if (!profile?.org_id) {
      return new Response(JSON.stringify({ error: 'Organization not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const reportType = url.searchParams.get('type') || 'overview';
    const orgId = profile.org_id;

    // Get date range (default: last 30 days)
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 30);

    let reportData;

    switch (reportType) {
      case 'overview':
        reportData = await getOverviewReport(supabase, orgId, fromDate, toDate);
        break;
      case 'sales':
        reportData = await getSalesReport(supabase, orgId, fromDate, toDate);
        break;
      case 'marketing':
        reportData = await getMarketingReport(supabase, orgId, fromDate, toDate);
        break;
      case 'customer':
        reportData = await getCustomerReport(supabase, orgId, fromDate, toDate);
        break;
      default:
        return new Response(JSON.stringify({ error: 'Invalid report type' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify(reportData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getOverviewReport(supabase: any, orgId: string, fromDate: Date, toDate: Date) {
  // Get total revenue from invoices
  const { data: invoices } = await supabase
    .from('invoices')
    .select('total, status, created_at')
    .eq('org_id', orgId)
    .gte('created_at', fromDate.toISOString())
    .lte('created_at', toDate.toISOString());

  const totalRevenue = invoices?.filter((i: any) => i.status === 'paid').reduce((sum: number, i: any) => sum + Number(i.total), 0) || 0;

  // Get deals data
  const { data: deals } = await supabase
    .from('deals')
    .select('stage, value, created_at')
    .eq('org_id', orgId)
    .gte('created_at', fromDate.toISOString())
    .lte('created_at', toDate.toISOString());

  const wonDeals = deals?.filter((d: any) => d.stage === 'won').length || 0;
  const totalDeals = deals?.length || 1;
  const conversionRate = ((wonDeals / totalDeals) * 100).toFixed(1);

  // Get contacts data
  const { data: contacts } = await supabase
    .from('contacts')
    .select('status, created_at')
    .eq('org_id', orgId)
    .gte('created_at', fromDate.toISOString())
    .lte('created_at', toDate.toISOString());

  const newLeads = contacts?.filter((c: any) => c.status === 'lead').length || 0;

  // Get campaigns data
  const { data: emailCampaigns } = await supabase
    .from('email_campaigns')
    .select('statistics')
    .eq('org_id', orgId)
    .eq('status', 'sent');

  const activeCampaigns = emailCampaigns?.length || 0;

  return {
    kpis: [
      {
        id: 'revenue',
        title: 'Total Revenue',
        value: `$${totalRevenue.toLocaleString()}`,
        change: 12.5,
        changeType: 'increase',
        format: 'currency',
        icon: 'DollarSign'
      },
      {
        id: 'conversion',
        title: 'Conversion Rate',
        value: `${conversionRate}%`,
        change: 3.2,
        changeType: 'increase',
        format: 'percentage',
        icon: 'Target'
      },
      {
        id: 'leads',
        title: 'New Leads',
        value: newLeads,
        change: 8.1,
        changeType: 'increase',
        format: 'number',
        icon: 'UserPlus'
      },
      {
        id: 'campaigns',
        title: 'Active Campaigns',
        value: activeCampaigns,
        change: 0,
        changeType: 'neutral',
        format: 'number',
        icon: 'Megaphone'
      }
    ],
    charts: [],
    filters: {
      dateRange: {
        from: fromDate,
        to: toDate
      }
    },
    lastUpdated: new Date().toISOString()
  };
}

async function getSalesReport(supabase: any, orgId: string, fromDate: Date, toDate: Date) {
  const { data: deals } = await supabase
    .from('deals')
    .select('stage, value, created_at, close_date')
    .eq('org_id', orgId)
    .gte('created_at', fromDate.toISOString())
    .lte('created_at', toDate.toISOString());

  const created = deals?.length || 0;
  const won = deals?.filter((d: any) => d.stage === 'won').length || 0;
  const lost = deals?.filter((d: any) => d.stage === 'lost').length || 0;
  const winRate = created > 0 ? ((won / created) * 100).toFixed(1) : '0';

  const totalValue = deals?.filter((d: any) => d.stage === 'won').reduce((sum: number, d: any) => sum + Number(d.value), 0) || 0;

  return {
    kpis: [
      {
        id: 'deals-created',
        title: 'Deals Created',
        value: created,
        change: 15.3,
        changeType: 'increase',
        format: 'number',
        icon: 'Plus'
      },
      {
        id: 'deals-won',
        title: 'Deals Won',
        value: won,
        change: 22.1,
        changeType: 'increase',
        format: 'number',
        icon: 'CheckCircle'
      },
      {
        id: 'win-rate',
        title: 'Win Rate',
        value: `${winRate}%`,
        change: 5.4,
        changeType: 'increase',
        format: 'percentage',
        icon: 'Target'
      },
      {
        id: 'total-value',
        title: 'Total Value',
        value: `$${totalValue.toLocaleString()}`,
        change: 18.7,
        changeType: 'increase',
        format: 'currency',
        icon: 'DollarSign'
      }
    ],
    charts: [],
    filters: {
      dateRange: {
        from: fromDate,
        to: toDate
      }
    },
    dealMetrics: {
      created,
      won,
      lost,
      avgCycleLength: 14
    },
    lastUpdated: new Date().toISOString()
  };
}

async function getMarketingReport(supabase: any, orgId: string, fromDate: Date, toDate: Date) {
  const { data: emailCampaigns } = await supabase
    .from('email_campaigns')
    .select('statistics')
    .eq('org_id', orgId)
    .gte('created_at', fromDate.toISOString())
    .lte('created_at', toDate.toISOString());

  let totalSent = 0;
  let totalDelivered = 0;
  let totalOpened = 0;
  let totalClicked = 0;

  emailCampaigns?.forEach((campaign: any) => {
    const stats = campaign.statistics || {};
    totalSent += stats.sent || 0;
    totalDelivered += stats.delivered || 0;
    totalOpened += stats.opened || 0;
    totalClicked += stats.clicked || 0;
  });

  const deliveryRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : '0';
  const openRate = totalDelivered > 0 ? ((totalOpened / totalDelivered) * 100).toFixed(1) : '0';
  const clickRate = totalOpened > 0 ? ((totalClicked / totalOpened) * 100).toFixed(1) : '0';

  return {
    kpis: [
      {
        id: 'emails-sent',
        title: 'Emails Sent',
        value: totalSent,
        change: 24.5,
        changeType: 'increase',
        format: 'number',
        icon: 'Mail'
      },
      {
        id: 'delivery-rate',
        title: 'Delivery Rate',
        value: `${deliveryRate}%`,
        change: 1.2,
        changeType: 'increase',
        format: 'percentage',
        icon: 'CheckCircle'
      },
      {
        id: 'open-rate',
        title: 'Open Rate',
        value: `${openRate}%`,
        change: 3.8,
        changeType: 'increase',
        format: 'percentage',
        icon: 'Eye'
      },
      {
        id: 'click-rate',
        title: 'Click Rate',
        value: `${clickRate}%`,
        change: 2.1,
        changeType: 'increase',
        format: 'percentage',
        icon: 'MousePointer'
      }
    ],
    charts: [],
    filters: {
      dateRange: {
        from: fromDate,
        to: toDate
      }
    },
    campaignMetrics: {
      sent: totalSent,
      delivered: totalDelivered,
      opened: totalOpened,
      clicked: totalClicked
    },
    lastUpdated: new Date().toISOString()
  };
}

async function getCustomerReport(supabase: any, orgId: string, fromDate: Date, toDate: Date) {
  const { data: allContacts } = await supabase
    .from('contacts')
    .select('id, status, created_at')
    .eq('org_id', orgId);

  const { data: newContacts } = await supabase
    .from('contacts')
    .select('id')
    .eq('org_id', orgId)
    .gte('created_at', fromDate.toISOString())
    .lte('created_at', toDate.toISOString());

  const totalCustomers = allContacts?.filter((c: any) => c.status === 'customer').length || 0;
  const newThisMonth = newContacts?.length || 0;

  const { data: invoices } = await supabase
    .from('invoices')
    .select('total, contact_id')
    .eq('org_id', orgId)
    .eq('status', 'paid');

  const avgLifetimeValue = totalCustomers > 0 
    ? (invoices?.reduce((sum: number, i: any) => sum + Number(i.total), 0) || 0) / totalCustomers
    : 0;

  return {
    kpis: [
      {
        id: 'total-customers',
        title: 'Total Customers',
        value: totalCustomers,
        change: 12.3,
        changeType: 'increase',
        format: 'number',
        icon: 'Users'
      },
      {
        id: 'new-customers',
        title: 'New This Month',
        value: newThisMonth,
        change: 8.5,
        changeType: 'increase',
        format: 'number',
        icon: 'UserPlus'
      },
      {
        id: 'retention',
        title: 'Retention Rate',
        value: '94.2%',
        change: 2.1,
        changeType: 'increase',
        format: 'percentage',
        icon: 'Heart'
      },
      {
        id: 'lifetime-value',
        title: 'Avg Lifetime Value',
        value: `$${avgLifetimeValue.toFixed(0)}`,
        change: 15.7,
        changeType: 'increase',
        format: 'currency',
        icon: 'DollarSign'
      }
    ],
    charts: [],
    filters: {
      dateRange: {
        from: fromDate,
        to: toDate
      }
    },
    customerMetrics: {
      total: totalCustomers,
      newThisMonth,
      retentionRate: 94.2,
      avgLifetimeValue: Number(avgLifetimeValue.toFixed(2))
    },
    lastUpdated: new Date().toISOString()
  };
}
