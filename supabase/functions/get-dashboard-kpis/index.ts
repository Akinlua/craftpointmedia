import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user and their org
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('org_id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const orgId = profile.org_id;

    // Get contacts count (leads)
    const { count: contactsCount } = await supabaseClient
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('status', 'lead');

    // Get active deals count and total value
    const { data: deals } = await supabaseClient
      .from('deals')
      .select('value, stage')
      .eq('org_id', orgId)
      .not('stage', 'in', '(closed_won,closed_lost)');

    const openDealsCount = deals?.length || 0;
    const totalRevenue = deals?.reduce((sum, deal) => sum + (parseFloat(deal.value as any) || 0), 0) || 0;

    // Get tasks due today
    const today = new Date().toISOString().split('T')[0];
    const { count: tasksDueToday } = await supabaseClient
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .gte('due_date', today)
      .lt('due_date', `${today}T23:59:59`)
      .neq('status', 'completed');

    // Get customer count
    const { count: customersCount } = await supabaseClient
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('status', 'customer');

    return new Response(
      JSON.stringify({
        newLeads: contactsCount || 0,
        openDeals: openDealsCount,
        revenue: totalRevenue,
        tasksDueToday: tasksDueToday || 0,
        customers: customersCount || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in get-dashboard-kpis:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
