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