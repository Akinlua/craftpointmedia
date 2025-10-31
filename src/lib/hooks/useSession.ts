import { create } from 'zustand';
import { User, Organization, AuthSession } from '@/types/user';

interface SessionStore extends AuthSession {
  token: string | null;
  login: (user: User, org: Organization, token?: string) => void;
  logout: () => void;
  switchOrg: (org: Organization) => void;
  updateUser: (user: Partial<User>) => void;
}

export const useSession = create<SessionStore>((set, get) => ({
  user: null,
  currentOrg: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,

  login: (user: User, org: Organization, token?: string) => {
    set({
      user,
      currentOrg: org,
      token: token || null,
      isAuthenticated: true,
      isLoading: false,
    });
    localStorage.setItem('session', JSON.stringify({ user, org }));
    if (token) {
      localStorage.setItem('auth_token', token);
    }
  },

  logout: () => {
    set({
      user: null,
      currentOrg: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
    localStorage.removeItem('session');
    localStorage.removeItem('auth_token');
  },

  switchOrg: (org: Organization) => {
    const { user } = get();
    if (user) {
      const updatedUser = { ...user, orgId: org.id };
      set({
        user: updatedUser,
        currentOrg: org,
      });
      localStorage.setItem('session', JSON.stringify({ user: updatedUser, org }));
    }
  },

  updateUser: (updates: Partial<User>) => {
    const { user, currentOrg } = get();
    if (user) {
      const updatedUser = { ...user, ...updates };
      set({ user: updatedUser });
      localStorage.setItem('session', JSON.stringify({ user: updatedUser, org: currentOrg }));
    }
  },
}));

// Initialize session from localStorage
if (typeof window !== 'undefined') {
  const savedSession = localStorage.getItem('session');
  if (savedSession) {
    try {
      const { user, org } = JSON.parse(savedSession);
      useSession.getState().login(user, org);
    } catch (error) {
      localStorage.removeItem('session');
    }
  }
}