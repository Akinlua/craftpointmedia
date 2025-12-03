import { TeamMember } from '@/types/org';
import { ENV, API_ENDPOINTS } from '@/lib/config/env';

export const teamApi = {
  // Get all team members in the current organization
  getTeamMembers: async (): Promise<TeamMember[]> => {
    const token = localStorage.getItem('AUTH_TOKEN');
    if (!token) return [];

    try {
      const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.USERS.BASE}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        console.error('Failed to fetch team members:', response.statusText);
        return [];
      }

      const result = await response.json();

      // Transform API response to TeamMember type
      // Assuming API returns { data: User[] } or just User[]
      const users = Array.isArray(result) ? result : (result.data?.users || []);

      return users.map((user: any) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName || user.first_name || '',
        lastName: user.lastName || user.last_name || '',
        role: user.role || 'staff',
        avatar: user.avatar || user.avatar_url,
        status: user.status || 'active',
        lastLogin: user.updatedAt || user.updated_at,
        createdAt: user.createdAt || user.created_at,
        updatedAt: user.updatedAt || user.updated_at
      }));
    } catch (error) {
      console.error('Error fetching team members:', error);
      return [];
    }
  },

  // Get pending invitations
  getPendingInvitations: async (): Promise<any[]> => {
    const token = localStorage.getItem('AUTH_TOKEN');
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.AUTH.INVITATIONS}?status=pending&page=1&pageSize=10`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to load invitations');
    const result = await response.json();
    const list = result.data || [];
    return Array.isArray(list) ? list.filter((i: any) => i.status === 'pending') : [];
  },

  cancelInvitation: async (id: string): Promise<void> => {
    const token = localStorage.getItem('AUTH_TOKEN');
    if (!token) throw new Error('Not authenticated');
    const url = `${ENV.API_BASE_URL}${API_ENDPOINTS.AUTH.CANCEL_INVITATION.replace('{id}', id)}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to cancel invitation');
  },

  // Update team member role
  updateTeamMemberRole: async (userId: string, newRole: 'owner' | 'manager' | 'staff'): Promise<TeamMember> => {
    const token = localStorage.getItem('AUTH_TOKEN');
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.USERS.BASE}/${userId}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ role: newRole })
    });

    if (!response.ok) throw new Error('Failed to update team member role');

    const user = await response.json();
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName || user.first_name || '',
      lastName: user.lastName || user.last_name || '',
      role: user.role || 'staff',
      avatar: user.avatar || user.avatar_url,
      status: user.status || 'active',
      lastLogin: user.updatedAt || user.updated_at,
      createdAt: user.createdAt || user.created_at,
      updatedAt: user.updatedAt || user.updated_at
    };
  },

  // Deactivate team member
  deactivateTeamMember: async (userId: string): Promise<TeamMember> => {
    const token = localStorage.getItem('AUTH_TOKEN');
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.USERS.BASE}/${userId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'inactive' })
    });

    if (!response.ok) throw new Error('Failed to deactivate team member');

    const user = await response.json();
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName || user.first_name || '',
      lastName: user.lastName || user.last_name || '',
      role: user.role || 'staff',
      avatar: user.avatar || user.avatar_url,
      status: user.status || 'active',
      lastLogin: user.updatedAt || user.updated_at,
      createdAt: user.createdAt || user.created_at,
      updatedAt: user.updatedAt || user.updated_at
    };
  },

  // Reactivate team member
  reactivateTeamMember: async (userId: string): Promise<TeamMember> => {
    const token = localStorage.getItem('AUTH_TOKEN');
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.USERS.BASE}/${userId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'active' })
    });

    if (!response.ok) throw new Error('Failed to reactivate team member');

    const user = await response.json();
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName || user.first_name || '',
      lastName: user.lastName || user.last_name || '',
      role: user.role || 'staff',
      avatar: user.avatar || user.avatar_url,
      status: user.status || 'active',
      lastLogin: user.updatedAt || user.updated_at,
      createdAt: user.createdAt || user.created_at,
      updatedAt: user.updatedAt || user.updated_at
    };
  }
};
