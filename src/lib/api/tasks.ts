import type { Task, TaskFilters, CreateTaskData, UpdateTaskData } from '@/types/task';

// Mock data
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Follow up with Acme Corp on enterprise proposal',
    description: 'Send detailed timeline and pricing breakdown',
    status: 'pending',
    priority: 'high',
    dueDate: '2024-01-20',
    assigneeId: 'user1',
    assigneeName: 'John Doe',
    assigneeAvatar: 'JD',
    createdBy: 'user1',
    createdByName: 'John Doe',
    orgId: 'org1',
    relatedType: 'deal',
    relatedId: '1',
    relatedTitle: 'Enterprise Software License',
    reminderTime: 60,
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z'
  },
  {
    id: '2',
    title: 'Prepare demo for TechStart Inc',
    description: 'Customize demo to show marketing automation features',
    status: 'in-progress',
    priority: 'medium',
    dueDate: '2024-01-22',
    assigneeId: 'user2',
    assigneeName: 'Sarah Wilson',
    assigneeAvatar: 'SW',
    createdBy: 'user1',
    createdByName: 'John Doe',
    orgId: 'org1',
    relatedType: 'contact',
    relatedId: '2',
    relatedTitle: 'Sarah Johnson',
    reminderTime: 120,
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-18T14:30:00Z'
  },
  {
    id: '3',
    title: 'Review and sign contract with Global Tech',
    description: 'Legal team has approved, ready for signature',
    status: 'pending',
    priority: 'high',
    dueDate: '2024-01-18',
    assigneeId: 'user3',
    assigneeName: 'Mike Chen',
    assigneeAvatar: 'MC',
    createdBy: 'user2',
    createdByName: 'Sarah Wilson',
    orgId: 'org1',
    relatedType: 'deal',
    relatedId: '2',
    relatedTitle: 'Cloud Infrastructure Migration',
    reminderTime: 30,
    createdAt: '2024-01-10T11:00:00Z',
    updatedAt: '2024-01-15T16:00:00Z'
  },
  {
    id: '4',
    title: 'Send welcome email to new customer',
    description: 'Include onboarding checklist and support contacts',
    status: 'completed',
    priority: 'low',
    dueDate: '2024-01-17',
    completedAt: '2024-01-17T08:30:00Z',
    assigneeId: 'user4',
    assigneeName: 'Emily Davis',
    assigneeAvatar: 'ED',
    createdBy: 'user1',
    createdByName: 'John Doe',
    orgId: 'org1',
    relatedType: 'contact',
    relatedId: '3',
    relatedTitle: 'Alex Brown',
    reminderTime: 15,
    reminderSent: true,
    createdAt: '2024-01-16T09:00:00Z',
    updatedAt: '2024-01-17T08:30:00Z'
  },
  {
    id: '5',
    title: 'Update CRM with meeting notes',
    description: 'Document discussion points from yesterday\'s client call',
    status: 'pending',
    priority: 'medium',
    dueDate: '2024-01-19',
    assigneeId: 'user1',
    assigneeName: 'John Doe',
    assigneeAvatar: 'JD',
    createdBy: 'user2',
    createdByName: 'Sarah Wilson',
    orgId: 'org1',
    relatedType: 'contact',
    relatedId: '4',
    relatedTitle: 'Emily Wilson',
    reminderTime: 45,
    createdAt: '2024-01-17T13:00:00Z',
    updatedAt: '2024-01-17T13:00:00Z'
  }
];

// Mock users for assignee selection
export const mockUsers = [
  { id: 'user1', name: 'John Doe', avatar: 'JD', role: 'owner' },
  { id: 'user2', name: 'Sarah Wilson', avatar: 'SW', role: 'manager' },
  { id: 'user3', name: 'Mike Chen', avatar: 'MC', role: 'staff' },
  { id: 'user4', name: 'Emily Davis', avatar: 'ED', role: 'staff' }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const tasksApi = {
  // Get tasks with filters
  getTasks: async (filters?: TaskFilters, currentUserId?: string, userRole?: string): Promise<Task[]> => {
    await delay(500);
    
    let filteredTasks = [...mockTasks];
    
    // RBAC: Staff can only see tasks assigned to them or created by them
    if (userRole === 'staff' && currentUserId) {
      filteredTasks = filteredTasks.filter(
        task => task.assigneeId === currentUserId || task.createdBy === currentUserId
      );
    }
    
    if (filters?.status?.length) {
      filteredTasks = filteredTasks.filter(task => filters.status!.includes(task.status));
    }
    
    if (filters?.assigneeId?.length) {
      filteredTasks = filteredTasks.filter(task => filters.assigneeId!.includes(task.assigneeId));
    }
    
    if (filters?.relatedType?.length) {
      filteredTasks = filteredTasks.filter(task => 
        task.relatedType && filters.relatedType!.includes(task.relatedType)
      );
    }
    
    if (filters?.dueDateFrom) {
      filteredTasks = filteredTasks.filter(task => task.dueDate >= filters.dueDateFrom!);
    }
    
    if (filters?.dueDateTo) {
      filteredTasks = filteredTasks.filter(task => task.dueDate <= filters.dueDateTo!);
    }
    
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filteredTasks = filteredTasks.filter(task =>
        task.title.toLowerCase().includes(search) ||
        task.description?.toLowerCase().includes(search) ||
        task.relatedTitle?.toLowerCase().includes(search)
      );
    }
    
    // Add overdue status for display
    return filteredTasks.map(task => {
      const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';
      return {
        ...task,
        status: isOverdue ? 'overdue' as const : task.status
      };
    });
  },

  // Create task
  createTask: async (data: CreateTaskData): Promise<Task> => {
    await delay(300);
    
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      status: 'pending',
      assigneeName: mockUsers.find(u => u.id === data.assigneeId)?.name || 'Unknown',
      assigneeAvatar: mockUsers.find(u => u.id === data.assigneeId)?.avatar,
      createdBy: 'user1', // Would come from session
      createdByName: 'John Doe', // Would come from session
      orgId: 'org1', // Would come from session
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockTasks.push(newTask);
    return newTask;
  },

  // Update task
  updateTask: async (id: string, data: UpdateTaskData): Promise<Task> => {
    await delay(200);
    
    const taskIndex = mockTasks.findIndex(task => task.id === id);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    
    const updatedTask = {
      ...mockTasks[taskIndex],
      ...data,
      updatedAt: new Date().toISOString(),
      ...(data.status === 'completed' && !mockTasks[taskIndex].completedAt && {
        completedAt: new Date().toISOString()
      })
    };
    
    mockTasks[taskIndex] = updatedTask;
    return updatedTask;
  },

  // Delete task
  deleteTask: async (id: string): Promise<void> => {
    await delay(200);
    
    const taskIndex = mockTasks.findIndex(task => task.id === id);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    
    mockTasks.splice(taskIndex, 1);
  },

  // Get task by ID
  getTask: async (id: string): Promise<Task | null> => {
    await delay(200);
    
    const task = mockTasks.find(task => task.id === id);
    if (!task) return null;
    
    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';
    return {
      ...task,
      status: isOverdue ? 'overdue' as const : task.status
    };
  },

  // Get users for assignee selection
  getUsers: async (): Promise<typeof mockUsers> => {
    await delay(100);
    return mockUsers;
  }
};