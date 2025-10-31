import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AcceptInvitationRequest {
  token: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { token, password, first_name, last_name }: AcceptInvitationRequest = await req.json();

    // Validate input
    if (!token || !password) {
      return new Response(
        JSON.stringify({ error: "Token and password are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (password.length < 8) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 8 characters" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Find invitation
    const { data: invitation, error: inviteError } = await supabase
      .from("invitations")
      .select("*")
      .eq("token", token)
      .eq("status", "pending")
      .single();

    if (inviteError || !invitation) {
      console.error("Invitation lookup error:", inviteError);
      return new Response(
        JSON.stringify({ error: "Invalid or expired invitation" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if invitation is expired
    if (new Date(invitation.expires_at) < new Date()) {
      await supabase
        .from("invitations")
        .update({ status: "expired" })
        .eq("id", invitation.id);

      return new Response(
        JSON.stringify({ error: "Invitation has expired" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create auth user
    const { data: authData, error: signupError } = await supabase.auth.admin.createUser({
      email: invitation.email,
      password,
      email_confirm: true,
    });

    if (signupError || !authData.user) {
      console.error("User creation error:", signupError);
      return new Response(
        JSON.stringify({ error: "Failed to create user account" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create profile
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: authData.user.id,
        org_id: invitation.org_id,
        email: invitation.email,
        first_name: first_name || null,
        last_name: last_name || null,
        status: "active",
      });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // Rollback: delete the auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      return new Response(
        JSON.stringify({ error: "Failed to create user profile" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Assign role
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({
        user_id: authData.user.id,
        role: invitation.role,
      });

    if (roleError) {
      console.error("Role assignment error:", roleError);
      // Continue anyway - role can be assigned later
    }

    // Update invitation status
    await supabase
      .from("invitations")
      .update({ 
        status: "accepted",
        accepted_at: new Date().toISOString()
      })
      .eq("id", invitation.id);

    console.log("User successfully created and invitation accepted:", authData.user.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Account created successfully. You can now log in."
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in accept-invitation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
