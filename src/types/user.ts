export type UserRole = 'owner' | 'manager' | 'staff';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  orgId: string;
  avatar?: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  user: User | null;
  currentOrg: Organization | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface Organization {
  id: string;
  name: string;
  domain?: string;
  logo?: string;
  createdAt: string;
  updatedAt: string;
}