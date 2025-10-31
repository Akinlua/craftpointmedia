import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  email: string;
  role: "owner" | "manager" | "staff";
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("Authentication error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get user's profile to verify org membership
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("Profile error:", profileError);
      return new Response(
        JSON.stringify({ error: "User profile not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if user has permission (owner or manager)
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["owner", "manager"])
      .single();

    if (!userRole) {
      return new Response(
        JSON.stringify({ error: "Insufficient permissions" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { email, role }: InvitationRequest = await req.json();

    // Validate email
    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if user already exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (existingProfile) {
      return new Response(
        JSON.stringify({ error: "User with this email already exists" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check for existing pending invitation
    const { data: existingInvitation } = await supabase
      .from("invitations")
      .select("id")
      .eq("email", email)
      .eq("org_id", profile.org_id)
      .eq("status", "pending")
      .single();

    if (existingInvitation) {
      return new Response(
        JSON.stringify({ error: "Invitation already sent to this email" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate secure token
    const token_bytes = new Uint8Array(32);
    crypto.getRandomValues(token_bytes);
    const invitation_token = Array.from(token_bytes)
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    // Create invitation
    const { data: invitation, error: inviteError } = await supabase
      .from("invitations")
      .insert({
        org_id: profile.org_id,
        email,
        role,
        token: invitation_token,
        invited_by: user.id,
      })
      .select()
      .single();

    if (inviteError) {
      console.error("Invitation creation error:", inviteError);
      return new Response(
        JSON.stringify({ error: "Failed to create invitation" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Invitation created successfully:", invitation.id);

    // TODO: Send email with invitation link
    // For now, return the token (in production, this should be sent via email)
    const invitationLink = `${req.headers.get("origin")}/auth/accept-invitation?token=${invitation_token}`;

    return new Response(
      JSON.stringify({ 
        success: true, 
        invitation_id: invitation.id,
        invitation_link: invitationLink,
        message: "Invitation created successfully"
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-invitation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
