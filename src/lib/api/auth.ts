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
    return callApiWithFallback(
      async () => {
        const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });
        
        if (!response.ok) {
          throw new Error('Invalid email or password');
        }
        
        return await response.json();
      },
      // Fallback to mock data
      (() => {
        const user = mockUsers.find(u => u.email === credentials.email);
        if (!user) throw new Error('Invalid email or password');
        const org = mockOrganizations.find(o => o.id === user.orgId);
        if (!org) throw new Error('Organization not found');
        return { user, org };
      })()
    );
  },

  async signup(data: SignupData): Promise<{ user: User; org: Organization }> {
    await delay(1500);
    
    // Check if user exists
    if (mockUsers.find(u => u.email === data.email)) {
      throw new Error('User already exists');
    }
    
    // Create new org
    const newOrg: Organization = {
      id: `org-${Date.now()}`,
      name: data.company,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Create new user
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'owner',
      orgId: newOrg.id,
      emailVerified: false,
      twoFactorEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockUsers.push(newUser);
    mockOrganizations.push(newOrg);
    
    return { user: newUser, org: newOrg };
  },

  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    await delay(800);
    
    const user = mockUsers.find(u => u.email === data.email);
    if (!user) {
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
    return callApiWithFallback(
      async () => {
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
      // Fallback to mock data
      (() => {
        const org = mockOrganizations[0];
        const newUser: User = {
          id: `user-${Date.now()}`,
          email: 'invited@example.com',
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'staff',
          orgId: org.id,
          emailVerified: true,
          twoFactorEnabled: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        mockUsers.push(newUser);
        return { user: newUser, org };
      })()
    );
  },

  async sendInvite(data: InviteData): Promise<{ success: boolean; message: string }> {
    return callApiWithFallback(
      async () => {
        const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.AUTH.INVITE}`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            // TODO: Add auth token when available
            // 'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          throw new Error('Failed to send invitation');
        }
        
        return await response.json();
      },
      // Fallback to mock data
      { success: true, message: 'Invitation sent successfully (mock)' }
    );
  },

  async logout(): Promise<void> {
    await delay(300);
    // Mock logout
  },

  async loginWithOAuth(provider: 'google' | 'microsoft'): Promise<{ user: User; org: Organization; token?: string }> {
    return callApiWithFallback(
      async () => {
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
      // Fallback to mock data
      (() => {
        const user = mockUsers[0];
        const org = mockOrganizations.find(o => o.id === user.orgId)!;
        return { user, org };
      })()
    );
  },

  async getUserOrganizations(userId: string): Promise<Organization[]> {
    await delay(500);
    
    // Mock: return all orgs for demo (in real app, filter by user access)
    return mockOrganizations;
  },
};