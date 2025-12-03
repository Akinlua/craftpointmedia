export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'overdue';
export type TaskPriority = 'low' | 'medium' | 'high';
export type RelatedType = 'contact' | 'deal' | 'project' | null;

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  completedAt?: string;
  assigneeId: string;
  assigneeName: string;
  assigneeAvatar?: string;
  createdBy: string;
  createdByName: string;
  orgId: string;
  relatedType?: RelatedType;
  relatedId?: string;
  relatedTitle?: string;
  reminderTime?: number; // minutes before due date
  reminderSent?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFilters {
  status?: TaskStatus[];
  assigneeId?: string[];
  relatedType?: RelatedType[];
  dueDateFrom?: string;
  dueDateTo?: string;
  search?: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  dueDate: string;
  priority: TaskPriority;
  assigneeId: string;
  relatedType?: RelatedType;
  relatedId?: string;
  reminderTime?: number;
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  status?: TaskStatus;
  completedAt?: string;
}

export interface TaskBulkAction {
  type: 'complete' | 'delete' | 'assign' | 'change_priority';
  data?: any;
}

export interface TaskStatistics {
  scope: 'personal' | 'team';
  period: 'week' | 'month' | 'year';
  summary: {
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    completionRate: number;
    averageCompletionTime: number;
    onTimeCompletion: number;
  };
  byPriority: {
    priority: TaskPriority;
    total: number;
    completed: number;
    overdue: number;
  }[];
  byStatus: {
    status: TaskStatus;
    count: number;
    percentage: number;
  }[];
  completionTrend: {
    date: string;
    completed: number;
  }[];
  topPerformers?: any; // For team view
  generatedAt: string;
}

export interface TaskReminders {
  success: boolean;
  data: {
    reminders: {
      overdue: Task[];
      today: Task[];
      upcoming: Task[];
    };
    summary: {
      total: number;
      overdue: number;
      today: number;
      upcoming: number;
    };
  };
}

export interface PaginatedTaskResponse {
  data: Task[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}