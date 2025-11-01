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

    const { dealId, toStage } = await req.json();

    if (!dealId || !toStage) {
      return new Response(
        JSON.stringify({ error: 'dealId and toStage are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user from JWT
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update deal stage within a transaction
    const { data: updatedDeal, error: updateError } = await supabaseClient
      .from('deals')
      .update({ 
        stage: toStage,
        last_activity_at: new Date().toISOString()
      })
      .eq('id', dealId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating deal:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update deal stage' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get pipeline stats (aggregate by stage)
    const { data: pipelineStats, error: statsError } = await supabaseClient
      .from('deals')
      .select('stage, value')
      .eq('org_id', updatedDeal.org_id);

    if (statsError) {
      console.error('Error fetching pipeline stats:', statsError);
    }

    // Calculate stats by stage
    const statsByStage = pipelineStats?.reduce((acc: any, deal: any) => {
      if (!acc[deal.stage]) {
        acc[deal.stage] = { count: 0, totalValue: 0 };
      }
      acc[deal.stage].count++;
      acc[deal.stage].totalValue += parseFloat(deal.value) || 0;
      return acc;
    }, {});

    return new Response(
      JSON.stringify({
        deal: updatedDeal,
        pipelineStats: statsByStage
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in move-deal-stage:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
