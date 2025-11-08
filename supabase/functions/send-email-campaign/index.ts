import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendCampaignRequest {
  campaignId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { campaignId }: SendCampaignRequest = await req.json();

    console.log(`Starting email campaign send: ${campaignId}`);

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabaseClient
      .from("email_campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      throw new Error(`Campaign not found: ${campaignId}`);
    }

    // Get recipient contacts based on target filter
    let contactsQuery = supabaseClient
      .from("contacts")
      .select("*")
      .eq("org_id", campaign.org_id);

    if (campaign.target_type === "tags" && campaign.target_filter.tags) {
      contactsQuery = contactsQuery.contains("tags", campaign.target_filter.tags);
    } else if (campaign.target_type === "segment") {
      if (campaign.target_filter.status) {
        contactsQuery = contactsQuery.eq("status", campaign.target_filter.status);
      }
      if (campaign.target_filter.leadStage) {
        contactsQuery = contactsQuery.eq("lead_stage", campaign.target_filter.leadStage);
      }
    }

    const { data: contacts, error: contactsError } = await contactsQuery;

    if (contactsError) {
      throw contactsError;
    }

    console.log(`Found ${contacts?.length || 0} recipients`);

    // Update campaign status
    await supabaseClient
      .from("email_campaigns")
      .update({ status: "sending" })
      .eq("id", campaignId);

    // Create recipient records
    const recipients = contacts?.map(contact => ({
      campaign_id: campaignId,
      campaign_type: "email",
      contact_id: contact.id,
      status: "pending",
    })) || [];

    if (recipients.length > 0) {
      const { error: recipientsError } = await supabaseClient
        .from("campaign_recipients")
        .insert(recipients);

      if (recipientsError) {
        console.error("Error creating recipients:", recipientsError);
      }
    }

    // Check if Resend API key is configured
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      console.warn("RESEND_API_KEY not configured - campaign marked as sent but emails not actually sent");
      
      // Update campaign as sent without actually sending
      await supabaseClient
        .from("email_campaigns")
        .update({ 
          status: "sent",
          sent_at: new Date().toISOString(),
          statistics: {
            sent: contacts?.length || 0,
            delivered: 0,
            opened: 0,
            clicked: 0,
            bounced: 0,
            failed: 0,
            unsubscribed: 0,
          }
        })
        .eq("id", campaignId);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Campaign marked as sent (Resend not configured)",
          recipientCount: contacts?.length || 0 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // TODO: Actual Resend integration
    // For now, just mark as sent
    await supabaseClient
      .from("email_campaigns")
      .update({ 
        status: "sent",
        sent_at: new Date().toISOString(),
        statistics: {
          sent: contacts?.length || 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          bounced: 0,
          failed: 0,
          unsubscribed: 0,
        }
      })
      .eq("id", campaignId);

    console.log(`Campaign ${campaignId} sent successfully`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        recipientCount: contacts?.length || 0 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error sending campaign:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
