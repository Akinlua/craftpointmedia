/**
 * Temporary compatibility layer for transitioning from mock auth to real Supabase auth
 * This provides backward-compatible session data while the UI is being migrated
 */

import { useSession } from './useSession';

export function useCompatSession() {
  const { user: supabaseUser, profile, organization, role, ...rest } = useSession();

  // Create a mock user object that matches the old User type for backward compatibility
  const compatUser = profile && supabaseUser ? {
    id: supabaseUser.id,
    email: profile.email,
    firstName: profile.first_name || '',
    lastName: profile.last_name || '',
    role: role?.role || 'staff',
    orgId: profile.org_id,
    avatar: profile.avatar_url || '',
    emailVerified: true,
    twoFactorEnabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } : null;

  const compatOrg = organization ? {
    id: organization.id,
    name: organization.name,
    domain: organization.domain || '',
    plan: organization.plan,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } : null;

  return {
    ...rest,
    user: compatUser,
    currentOrg: compatOrg,
    profile,
    organization,
    role: role?.role,
  };
}
