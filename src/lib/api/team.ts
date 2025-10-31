import { supabase } from '@/integrations/supabase/client';
import { TeamMember } from '@/types/org';

// Helper to transform DB data to TeamMember type
const transformTeamMember = (profile: any, userRole: any): TeamMember => ({
  id: profile.id,
  email: profile.email,
  firstName: profile.first_name || '',
  lastName: profile.last_name || '',
  role: userRole?.role || 'staff',
  avatar: profile.avatar_url,
  status: profile.status || 'active',
  lastLogin: profile.updated_at, // Use updated_at as proxy for last login
  createdAt: profile.created_at,
  updatedAt: profile.updated_at
});

export const teamApi = {
  // Get all team members in the current organization
  getTeamMembers: async (): Promise<TeamMember[]> => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) throw new Error('Not authenticated');

    // Get current user's org_id
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('org_id')
      .eq('id', session.session.user.id)
      .single();

    if (!currentProfile) throw new Error('Profile not found');

    // Get all profiles in the organization
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('org_id', currentProfile.org_id)
      .order('created_at', { ascending: false });

    if (profilesError) throw profilesError;

    // Get roles for all users
    const profileIds = profiles?.map(p => p.id) || [];
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .in('user_id', profileIds);

    if (rolesError) throw rolesError;

    // Combine profiles with their roles
    const teamMembers = (profiles || []).map(profile => {
      const userRole = userRoles?.find(r => r.user_id === profile.id);
      return transformTeamMember(profile, userRole);
    });

    return teamMembers;
  },

  // Get pending invitations
  getPendingInvitations: async (): Promise<any[]> => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) throw new Error('Not authenticated');

    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('org_id')
      .eq('id', session.session.user.id)
      .single();

    if (!currentProfile) throw new Error('Profile not found');

    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('org_id', currentProfile.org_id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  },

  // Update team member role
  updateTeamMemberRole: async (userId: string, newRole: 'owner' | 'manager' | 'staff'): Promise<TeamMember> => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) throw new Error('Not authenticated');

    // Check if user_role exists
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingRole) {
      // Update existing role
      const { error: updateError } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (updateError) throw updateError;
    } else {
      // Insert new role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole });

      if (insertError) throw insertError;
    }

    // Fetch updated profile and role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    const { data: userRole } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .single();

    return transformTeamMember(profile, userRole);
  },

  // Deactivate team member
  deactivateTeamMember: async (userId: string): Promise<TeamMember> => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ status: 'inactive' })
      .eq('id', userId)
      .select('*')
      .single();

    if (error) throw error;

    const { data: userRole } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    return transformTeamMember(data, userRole);
  },

  // Reactivate team member
  reactivateTeamMember: async (userId: string): Promise<TeamMember> => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ status: 'active' })
      .eq('id', userId)
      .select('*')
      .single();

    if (error) throw error;

    const { data: userRole } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    return transformTeamMember(data, userRole);
  }
};
