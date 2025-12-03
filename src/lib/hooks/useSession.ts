import { create } from 'zustand';
import { API_ENDPOINTS, ENV } from '../config/env';

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
  user: any | null;
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
      const token = localStorage.getItem('AUTH_TOKEN');
      if (!token) {
        set({
          user: null,
          profile: null,
          organization: null,
          role: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return;
      }
      const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.AUTH.ME}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        set({
          user: null,
          profile: null,
          organization: null,
          role: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return;
      }
      const raw = await response.json();
      const userData = raw.message?.user || raw.data?.user || raw.data || raw.user || raw;
      const mappedProfile: Profile = {
        id: userData.id,
        org_id: userData.organization?.id || '',
        first_name: userData.firstName || null,
        last_name: userData.lastName || null,
        email: userData.email,
        avatar_url: userData.avatar || null,
        phone: userData.phone || null,
        job_title: null,
        status: userData.status === 'active' ? 'active' : 'inactive',
      };
      const mappedRole: UserRole = { role: userData.role };
      set({
        user: null,
        profile: mappedProfile,
        organization: null,
        role: mappedRole,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false, isAuthenticated: false });
    }
  },

  login: async (email: string, password: string) => {
    try {
      const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const text = await response.text();
        return { error: text || 'Invalid email or password' };
      }
      const raw = await response.json();
      const token = raw.message?.token || raw.data?.token || raw.token || raw.accessToken;
      if (!token) {
        return { error: 'Login succeeded but no token returned' };
      }
      localStorage.setItem('AUTH_TOKEN', token);
      await get().initialize();
      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  },

  logout: async () => {
    localStorage.removeItem('AUTH_TOKEN');
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
    const { profile } = get();
    if (!profile) return;
    set({ profile: { ...profile, ...updates } });
  },

  hasRole: (role: 'owner' | 'manager' | 'staff') => {
    const currentRole = get().role;
    if (!currentRole) return false;
    if (currentRole.role === 'owner') return true;
    if (currentRole.role === 'manager' && (role === 'manager' || role === 'staff')) return true;
    return currentRole.role === role;
  },
}));

if (typeof window !== 'undefined') {
  useSession.getState().initialize();
}