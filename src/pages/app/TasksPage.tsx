import { useState } from "react";
import { TaskList } from "@/components/tasks/TaskList";
import { useCRMStore } from "@/lib/stores/crmStore";
import { useToast } from "@/hooks/use-toast";
import type { TaskFilters, CreateTaskData, UpdateTaskData } from "@/types/task";

const TasksPage = () => {
  const { toast } = useToast();
  const { tasks, users, currentUser, addTask, updateTask, deleteTask } = useCRMStore();
  const [filters, setFilters] = useState<TaskFilters>({});

  // Filter tasks based on current filters and user role
  const filteredTasks = tasks.filter(task => {
    // RBAC: Staff can only see tasks assigned to them or created by them
    if (currentUser?.role === 'staff') {
      if (task.assigneeId !== currentUser.id && task.createdBy !== currentUser.id) {
        return false;
      }
    }
    
    if (filters.status?.length && !filters.status.includes(task.status)) return false;
    if (filters.assigneeId?.length && !filters.assigneeId.includes(task.assigneeId)) return false;
    if (filters.relatedType?.length && task.relatedType && !filters.relatedType.includes(task.relatedType)) return false;
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      if (!task.title.toLowerCase().includes(search) &&
          !task.description?.toLowerCase().includes(search) &&
          !task.relatedTitle?.toLowerCase().includes(search)) return false;
    }
    
    return true;
  });

  // Add overdue status for display
  const tasksWithOverdue = filteredTasks.map(task => {
    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';
    return {
      ...task,
      status: isOverdue ? 'overdue' as const : task.status
    };
  });

  // Create task handler
  const handleCreateTask = async (data: CreateTaskData) => {
    try {
      const assigneeInfo = users.find(u => u.id === data.assigneeId);
      
      const newTask = addTask({
        ...data,
        status: 'pending',
        assigneeName: assigneeInfo ? `${assigneeInfo.firstName} ${assigneeInfo.lastName}` : 'Unknown',
        assigneeAvatar: assigneeInfo?.avatar,
        createdBy: currentUser?.id || 'user1',
        createdByName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'User',
        orgId: 'org1',
      });

      toast({
        title: "Task created",
        description: "The task has been created successfully.",
      });
      
      return newTask;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Update task handler
  const handleUpdateTask = async (id: string, data: UpdateTaskData) => {
    try {
      updateTask(id, data);
      
      toast({
        title: "Task updated",
        description: "The task has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Delete task handler
  const handleDeleteTask = async (id: string) => {
    try {
      deleteTask(id);
      
      toast({
        title: "Task deleted",
        description: "The task has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Toggle task completion
  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    const status = completed ? 'completed' : 'pending';
    const completedAt = completed ? new Date().toISOString() : undefined;
    
    return handleUpdateTask(taskId, { status, completedAt });
  };

  return (
    <TaskList
      tasks={tasksWithOverdue}
      users={users.map(u => ({ 
        id: u.id, 
        name: `${u.firstName} ${u.lastName}`, 
        avatar: u.avatar, 
        role: u.role 
      }))}
      filters={filters}
      onFiltersChange={setFilters}
      onCreateTask={handleCreateTask}
      onUpdateTask={handleUpdateTask}
      onDeleteTask={handleDeleteTask}
      onToggleComplete={handleToggleComplete}
      isLoading={false}
      currentUserRole={currentUser?.role || 'staff'}
    />
  );
};

export default TasksPage;