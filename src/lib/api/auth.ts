import { User, Organization } from '@/types/user';
import { ENV, API_ENDPOINTS } from '@/lib/config/env';


// Mock data
const mockOrganizations: Organization[] = [
  {
    id: 'org-1',
    name: 'Acme Corporation',
    domain: 'acme.com',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'org-2',
    name: 'TechStart Inc',
    domain: 'techstart.io',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
];

const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'john@acme.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'owner',
    orgId: 'org-1',
    emailVerified: true,
    twoFactorEnabled: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  company: string;
}

export interface ResetPasswordData {
  email: string;
}

export interface Verify2FAData {
  code: string;
}

export interface InviteAcceptData {
  token: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface InviteData {
  email: string;
  role: 'manager' | 'staff';
  message?: string;
}

// Helper function to call real backend API with fallback to mock
const callApiWithFallback = async <T,>(
  apiCall: () => Promise<T>,
  mockData: T
): Promise<T> => {
  try {
    return await apiCall();
  } catch (error) {
    console.warn('API call failed, using mock data:', error);
    await delay(500); // Simulate delay for consistency
    return mockData;
  }
};

// Mock API functions with real backend integration
export const authApi = {
  async login(credentials: LoginCredentials): Promise<{ user: User; org: Organization; token?: string }> {
    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Invalid email or password');
    }
    
    const raw = await response.json();
    const message = raw?.message ?? raw;
    const user = message?.user ?? raw?.data?.user ?? raw?.user;
    const org = message?.org ?? raw?.data?.org ?? raw?.organization ?? raw?.org;
    const token = message?.token ?? raw?.data?.token ?? raw?.token;
    
    if (!user) {
      throw new Error('Login succeeded but missing user');
    }
    
    return { user, org, token };
  },

  async signup(data: SignupData): Promise<{ user: User; org: Organization }> {
    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.AUTH.SIGNUP}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        company: data.company,
        password: data.password,
      }),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Signup failed');
    }
    const result = await response.json();
    return { user: result.user, org: result.organization };
  },

  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.AUTH.FORGOT_PASSWORD}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email }),
    });
    
    if (!response.ok) {
      throw new Error('User not found');
    }
    
    return { message: 'Password reset email sent' };
  },

  async verify2FA(data: Verify2FAData): Promise<{ success: boolean }> {
    await delay(500);
    
    // Mock 2FA verification (accept code "123456")
    if (data.code === '123456') {
      return { success: true };
    }
    
    throw new Error('Invalid 2FA code');
  },

  async acceptInvite(data: InviteAcceptData): Promise<{ user: User; org: Organization; token?: string }> {
    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.AUTH.ACCEPT_INVITATION}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to accept invitation');
    }
    
    return await response.json();
  },

  async sendInvite(data: InviteData): Promise<{ success: boolean; message: string }> {
    const token = localStorage.getItem('AUTH_TOKEN');
    if (!token) {
      throw new Error('Not authenticated');
    }
    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.AUTH.INVITE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to send invitation');
    }
    const result = await response.json();
    return {
      success: true,
      message: result?.message || 'Invitation sent successfully',
    };
  },

  async logout(): Promise<void> {
    await delay(300);
    // Mock logout
  },

  async loginWithOAuth(provider: 'google' | 'microsoft'): Promise<{ user: User; org: Organization; token?: string }> {
    // For real OAuth, this would redirect to the OAuth provider
    // and handle the callback with backend integration
    const response = await fetch(`${ENV.API_BASE_URL}/auth/oauth/${provider}`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('OAuth login failed');
    }
    
    return await response.json();
  },

  async getUserOrganizations(userId: string): Promise<Organization[]> {
    await delay(500);
    
    // Mock: return all orgs for demo (in real app, filter by user access)
    return mockOrganizations;
  },
};