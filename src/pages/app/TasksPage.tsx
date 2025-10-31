import { useState, useEffect } from "react";
import { TaskList } from "@/components/tasks/TaskList";
import { tasksApi } from "@/lib/api/tasks";
import { useSession } from "@/lib/hooks/useSession";
import { useToast } from "@/hooks/use-toast";
import type { Task, TaskFilters, CreateTaskData, UpdateTaskData } from "@/types/task";

const TasksPage = () => {
  const { toast } = useToast();
  const { role } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TaskFilters>({});

  useEffect(() => {
    loadTasks();
    loadUsers();
  }, [filters]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await tasksApi.getTasks(filters);
      setTasks(data);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await tasksApi.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };


  // Create task handler
  const handleCreateTask = async (data: CreateTaskData) => {
    try {
      await tasksApi.createTask(data);

      toast({
        title: "Task created",
        description: "The task has been created successfully.",
      });
      
      loadTasks();
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
      await tasksApi.updateTask(id, data);
      
      toast({
        title: "Task updated",
        description: "The task has been updated successfully.",
      });
      
      loadTasks();
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
      await tasksApi.deleteTask(id);
      
      toast({
        title: "Task deleted",
        description: "The task has been deleted successfully.",
      });
      
      loadTasks();
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
      tasks={tasks}
      users={users}
      filters={filters}
      onFiltersChange={setFilters}
      onCreateTask={handleCreateTask}
      onUpdateTask={handleUpdateTask}
      onDeleteTask={handleDeleteTask}
      onToggleComplete={handleToggleComplete}
      isLoading={loading}
      currentUserRole={role?.role || 'staff'}
    />
  );
};

export default TasksPage;