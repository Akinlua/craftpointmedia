import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { organizationName, firstName, lastName, email, password } = await req.json()

    // Validate inputs
    if (!organizationName || !firstName || !lastName || !email || !password) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Create the organization
    const { data: orgData, error: orgError } = await supabaseAdmin
      .from('organizations')
      .insert({
        name: organizationName,
        plan: 'free',
      })
      .select()
      .single()

    if (orgError) {
      console.error('Organization creation error:', orgError)
      throw new Error('Failed to create organization')
    }

    // 2. Create the user with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for now
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        org_id: orgData.id,
      }
    })

    if (authError || !authData.user) {
      console.error('Auth creation error:', authError)
      // Clean up the organization
      await supabaseAdmin.from('organizations').delete().eq('id', orgData.id)
      throw new Error('Failed to create user account')
    }

    // 3. Create the profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        org_id: orgData.id,
        email: email,
        first_name: firstName,
        last_name: lastName,
        status: 'active',
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Clean up
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      await supabaseAdmin.from('organizations').delete().eq('id', orgData.id)
      throw new Error('Failed to create user profile')
    }

    // 4. Assign owner role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: 'owner',
      })

    if (roleError) {
      console.error('Role assignment error:', roleError)
      // Clean up
      await supabaseAdmin.from('profiles').delete().eq('id', authData.user.id)
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      await supabaseAdmin.from('organizations').delete().eq('id', orgData.id)
      throw new Error('Failed to assign user role')
    }

    // 5. Update organization with owner_id
    await supabaseAdmin
      .from('organizations')
      .update({ owner_id: authData.user.id })
      .eq('id', orgData.id)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Organization and account created successfully',
        organizationId: orgData.id,
        userId: authData.user.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in create-organization function:', error)
    const errorMessage = error instanceof Error ? error.message : 'An error occurred'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
