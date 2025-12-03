import { useState } from "react";
import { TaskItem } from "./TaskItem";
import { TaskForm } from "./TaskForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Calendar
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Task, TaskFilters, TaskReminders } from "@/types/task";

interface TaskListProps {
  tasks: Task[];
  users: Array<{ id: string; name: string; avatar?: string; role: string }>;
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  onCreateTask: (data: any) => Promise<any>;
  onUpdateTask: (id: string, data: any) => Promise<any>;
  onDeleteTask: (id: string) => Promise<any>;
  onToggleComplete: (taskId: string, completed: boolean) => Promise<any>;
  isLoading?: boolean;
  currentUserRole?: string;
  reminders?: TaskReminders | null;
}

type SortField = 'dueDate' | 'title' | 'assigneeName' | 'priority' | 'status';
type SortDirection = 'asc' | 'desc';

export function TaskList({
  tasks,
  users,
  filters,
  onFiltersChange,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onToggleComplete,
  isLoading,
  currentUserRole = 'staff',
  reminders
}: TaskListProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [searchQuery, setSearchQuery] = useState(filters.search || '');

  // Filter tasks by status for tabs
  const getTasksByStatus = (status?: string) => {
    let filteredTasks = [...tasks];

    if (status && status !== 'all') {
      if (status === 'today') {
        if (reminders?.data?.reminders?.today) {
          return sortTasks(reminders.data.reminders.today);
        }
        const today = new Date().toISOString().split('T')[0];
        filteredTasks = filteredTasks.filter(task => task.dueDate === today);
      } else if (status === 'upcoming') {
        if (reminders?.data?.reminders?.upcoming) {
          return sortTasks(reminders.data.reminders.upcoming);
        }
        filteredTasks = filteredTasks.filter(task =>
          new Date(task.dueDate) > new Date() && task.status !== 'completed'
        );
      } else if (status === 'overdue') {
        if (reminders?.data?.reminders?.overdue) {
          return sortTasks(reminders.data.reminders.overdue);
        }
        filteredTasks = filteredTasks.filter(task => task.status === 'overdue');
      } else {
        filteredTasks = filteredTasks.filter(task => task.status === status);
      }
    }

    return sortTasks(filteredTasks);
  };

  // Sort tasks
  const sortTasks = (tasksToSort: Task[]) => {
    return [...tasksToSort].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'dueDate') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (sortField === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        aValue = priorityOrder[aValue as keyof typeof priorityOrder];
        bValue = priorityOrder[bValue as keyof typeof priorityOrder];
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onFiltersChange({ ...filters, search: value || undefined });
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  const handleUpdateTask = async (data: any) => {
    if (editingTask) {
      await onUpdateTask(editingTask.id, data);
      setEditingTask(null);
    }
  };

  const getTaskCounts = () => {
    if (reminders?.data?.summary) {
      return {
        all: tasks.length, // Keep using tasks.length for 'all' as it respects filters
        today: reminders.data.summary.today,
        upcoming: reminders.data.summary.upcoming,
        overdue: reminders.data.summary.overdue,
        completed: tasks.filter(task => task.status === 'completed').length, // This might need a separate count if paginated
      };
    }

    const today = new Date().toISOString().split('T')[0];
    return {
      all: tasks.length,
      today: tasks.filter(task => task.dueDate === today).length,
      upcoming: tasks.filter(task =>
        new Date(task.dueDate) > new Date() && task.status !== 'completed'
      ).length,
      overdue: tasks.filter(task => task.status === 'overdue').length,
      completed: tasks.filter(task => task.status === 'completed').length,
    };
  };

  const counts = getTaskCounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-display">
            {currentUserRole === 'staff' ? 'My Tasks' : 'All Tasks'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your tasks and reminders
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="card-subtle">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {counts.all}
            </div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card className="card-subtle">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {counts.today}
            </div>
            <div className="text-sm text-muted-foreground">Due Today</div>
          </CardContent>
        </Card>
        <Card className="card-subtle">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {counts.upcoming}
            </div>
            <div className="text-sm text-muted-foreground">Upcoming</div>
          </CardContent>
        </Card>
        <Card className="card-subtle">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {counts.overdue}
            </div>
            <div className="text-sm text-muted-foreground">Overdue</div>
          </CardContent>
        </Card>
        <Card className="card-subtle">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {counts.completed}
            </div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="card-subtle">
        <CardContent className="p-4">
          <div className="flex gap-4 items-center flex-wrap">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={filters.assigneeId?.[0] || 'all'}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  assigneeId: value === 'all' ? undefined : [value]
                })
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Assigned to" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-md">
                <SelectItem value="all">All assignees</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  {sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                  Sort by {sortField}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background border shadow-md">
                <DropdownMenuItem onClick={() => handleSort('dueDate')}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Due Date
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('title')}>
                  Title
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('assigneeName')}>
                  Assignee
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('priority')}>
                  Priority
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" className="relative">
            All Tasks
            {counts.all > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 min-w-5 text-xs">
                {counts.all}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="today" className="relative">
            Today
            {counts.today > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 min-w-5 text-xs">
                {counts.today}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="relative">
            Upcoming
            {counts.upcoming > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 min-w-5 text-xs">
                {counts.upcoming}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="overdue" className="relative">
            Overdue
            {counts.overdue > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 min-w-5 text-xs">
                {counts.overdue}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="relative">
            Completed
            {counts.completed > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 min-w-5 text-xs">
                {counts.completed}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {['all', 'today', 'upcoming', 'overdue', 'completed'].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4 mt-6">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="card-elevated animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : getTasksByStatus(tab).length === 0 ? (
              <Card className="card-elevated">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">
                    No tasks found for this filter.
                  </p>
                </CardContent>
              </Card>
            ) : (
              getTasksByStatus(tab).map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggleComplete={onToggleComplete}
                  onEdit={handleEditTask}
                  onDelete={onDeleteTask}
                />
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Create/Edit Task Forms */}
      <TaskForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onSubmit={onCreateTask}
        users={users}
        isLoading={isLoading}
      />

      <TaskForm
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
        onSubmit={handleUpdateTask}
        task={editingTask || undefined}
        users={users}
        isLoading={isLoading}
      />
    </div>
  );
}