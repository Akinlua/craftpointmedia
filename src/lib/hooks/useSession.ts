import { create } from 'zustand';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  org_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  avatar_url: string | null;
  phone: string | null;
  job_title: string | null;
  status: 'active' | 'inactive' | 'suspended';
}

export interface Organization {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  owner_id: string | null;
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
}

export interface UserRole {
  role: 'owner' | 'manager' | 'staff';
}

interface SessionStore {
  user: SupabaseUser | null;
  profile: Profile | null;
  organization: Organization | null;
  role: UserRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  hasRole: (role: 'owner' | 'manager' | 'staff') => boolean;
}

export const useSession = create<SessionStore>((set, get) => ({
  user: null,
  profile: null,
  organization: null,
  role: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
    try {
      set({ isLoading: true });
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        set({ 
          user: null, 
          profile: null, 
          organization: null, 
          role: null,
          isAuthenticated: false,
          isLoading: false 
        });
        return;
      }

      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile) {
        console.error('Profile fetch error:', profileError);
        set({ isLoading: false, isAuthenticated: false });
        return;
      }

      // Fetch organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.org_id)
        .single();

      if (orgError || !org) {
        console.error('Organization fetch error:', orgError);
      }

      // Fetch role
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (roleError) {
        console.error('Role fetch error:', roleError);
      }

      set({
        user: session.user,
        profile: profile as Profile,
        organization: org ? (org as Organization) : null,
        role: userRole || null,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Session initialization error:', error);
      set({ isLoading: false, isAuthenticated: false });
    }
  },

  login: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        await get().initialize();
      }

      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({
      user: null,
      profile: null,
      organization: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  updateProfile: async (updates: Partial<Profile>) => {
    const { user, profile } = get();
    if (!user || !profile) return;

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (!error) {
      set({ profile: { ...profile, ...updates } });
    }
  },

  hasRole: (role: 'owner' | 'manager' | 'staff') => {
    const currentRole = get().role;
    if (!currentRole) return false;
    
    // Owner has all permissions
    if (currentRole.role === 'owner') return true;
    
    // Manager has manager and staff permissions
    if (currentRole.role === 'manager' && (role === 'manager' || role === 'staff')) return true;
    
    // Staff only has staff permissions
    return currentRole.role === role;
  },
}));

// Initialize session on app load
if (typeof window !== 'undefined') {
  useSession.getState().initialize();
  
  // Listen to auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      useSession.getState().initialize();
    } else if (event === 'SIGNED_OUT') {
      useSession.setState({
        user: null,
        profile: null,
        organization: null,
        role: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  });
}