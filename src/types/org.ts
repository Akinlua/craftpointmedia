export interface Organization {
  id: string;
  name: string;
  domain?: string;
  logo?: string;
  favicon?: string;
  primaryColor: string;
  secondaryColor: string;
  timezone: string;
  currency: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  website?: string;
  industry?: string;
  employeeCount?: string;
  whiteLabel: {
    enabled: boolean;
    customDomain?: string;
    hideBranding: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationBranding {
  logo?: string;
  favicon?: string;
  primaryColor: string;
  secondaryColor: string;
  darkMode: boolean;
  whiteLabel: {
    enabled: boolean;
    customDomain?: string;
    hideBranding: boolean;
  };
}

export interface TeamMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'owner' | 'manager' | 'staff';
  avatar?: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: string;
  invitedAt?: string;
  invitedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamInvite {
  email: string;
  role: 'manager' | 'staff';
  message?: string;
}