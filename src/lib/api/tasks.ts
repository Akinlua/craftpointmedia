import type { Task, TaskFilters, CreateTaskData, UpdateTaskData, TaskStatistics, TaskReminders, PaginatedTaskResponse } from '@/types/task';
import { ENV, API_ENDPOINTS } from '@/lib/config/env';

export const tasksApi = {
  // Get tasks with filters
  getTasks: async (filters?: TaskFilters & { page?: number; pageSize?: number }): Promise<PaginatedTaskResponse> => {
    const token = localStorage.getItem('AUTH_TOKEN');
    if (!token) throw new Error('Not authenticated');

    const queryParams = new URLSearchParams();

    if (filters?.status?.length) {
      filters.status.forEach(s => queryParams.append('status', s));
    }
    if (filters?.assigneeId?.length) {
      filters.assigneeId.forEach(id => queryParams.append('assigneeId', id));
    }
    if (filters?.relatedType?.length) {
      filters.relatedType.forEach(type => {
        if (type) queryParams.append('relatedType', type);
      });
    }
    if (filters?.dueDateFrom) queryParams.append('dueDateFrom', filters.dueDateFrom);
    if (filters?.dueDateTo) queryParams.append('dueDateTo', filters.dueDateTo);
    if (filters?.search) queryParams.append('search', filters.search);
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.pageSize) queryParams.append('pageSize', filters.pageSize.toString());

    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.TASKS.BASE}?${queryParams.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Failed to fetch tasks');
    return await response.json();
  },

  // Get task statistics
  getTaskStatistics: async (scope: 'personal' | 'team' = 'personal', period: 'week' | 'month' | 'year' = 'month'): Promise<TaskStatistics> => {
    const token = localStorage.getItem('AUTH_TOKEN');
    if (!token) throw new Error('Not authenticated');

    const queryParams = new URLSearchParams({ scope, period });
    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.TASKS.STATISTICS}?${queryParams.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Failed to fetch task statistics');
    return await response.json();
  },

  // Get task reminders
  getTaskReminders: async (): Promise<TaskReminders> => {
    const token = localStorage.getItem('AUTH_TOKEN');
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.TASKS.REMINDERS}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Failed to fetch task reminders');
    return await response.json();
  },

  // Create task
  createTask: async (data: CreateTaskData): Promise<Task> => {
    const token = localStorage.getItem('AUTH_TOKEN');
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.TASKS.BASE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error('Failed to create task');
    return await response.json();
  },

  // Update task
  updateTask: async (id: string, data: UpdateTaskData): Promise<Task> => {
    const token = localStorage.getItem('AUTH_TOKEN');
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.TASKS.BASE}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error('Failed to update task');
    return await response.json();
  },

  // Delete task
  deleteTask: async (id: string): Promise<void> => {
    const token = localStorage.getItem('AUTH_TOKEN');
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.TASKS.BASE}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Failed to delete task');
  },

  // Get task by ID
  getTask: async (id: string): Promise<Task | null> => {
    const token = localStorage.getItem('AUTH_TOKEN');
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.TASKS.BASE}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Failed to fetch task');
    return await response.json();
  },

  // Get users for assignee selection
  getUsers: async () => {
    const token = localStorage.getItem('AUTH_TOKEN');
    if (!token) return [];

    try {
      const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.USERS.BASE}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        console.error('Failed to fetch users:', response.status, response.statusText);
        return [];
      }

      const result = await response.json();
      console.log('getUsers response:', result);

      // Handle various response formats
      let users = [];
      if (Array.isArray(result)) {
        users = result;
      } else if (result.data?.users && Array.isArray(result.data.users)) {
        // API returns { success: true, data: { users: [...] } }
        users = result.data.users;
      } else if (Array.isArray(result.data)) {
        users = result.data;
      } else if (Array.isArray(result.users)) {
        users = result.users;
      }

      return users.map((user: any) => ({
        id: user.id,
        name: `${user.firstName || user.first_name || ''} ${user.lastName || user.last_name || ''}`.trim(),
        avatar: user.avatar || user.avatar_url,
        role: user.role || 'staff'
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }
};
