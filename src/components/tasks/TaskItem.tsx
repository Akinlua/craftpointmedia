import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Calendar,
  User,
  Flag,
  MoreHorizontal,
  Edit,
  Trash2,
  Link as LinkIcon
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Task } from "@/types/task";

interface TaskItemProps {
  task: Task;
  onToggleComplete: (taskId: string, completed: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  className?: string;
}

export function TaskItem({ task, onToggleComplete, onEdit, onDelete, className }: TaskItemProps) {
  const [isCompleting, setIsCompleting] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600";
      case "medium": return "text-yellow-600";
      case "low": return "text-green-600";
      default: return "text-muted-foreground";
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
      "in-progress": "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
      completed: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
      overdue: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
    };
    return variants[status as keyof typeof variants] || "bg-muted text-muted-foreground";
  };

  const handleToggleComplete = async (checked: boolean) => {
    setIsCompleting(true);
    try {
      await onToggleComplete(task.id, checked);
    } finally {
      setIsCompleting(false);
    }
  };

  const getRelatedLink = () => {
    if (!task.relatedType || !task.relatedId) return null;
    
    switch (task.relatedType) {
      case 'contact':
        return `/app/contacts/${task.relatedId}`;
      case 'deal':
        return `/app/deals/${task.relatedId}`;
      default:
        return null;
    }
  };

  const isCompleted = task.status === 'completed';
  const isOverdue = task.status === 'overdue';

  return (
    <Card className={`card-elevated ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Checkbox 
            checked={isCompleted}
            disabled={isCompleting}
            onCheckedChange={handleToggleComplete}
            className="mt-1"
          />
          
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                  {task.title}
                </h4>
                {task.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {task.description}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <Flag className={`w-4 h-4 ${getPriorityColor(task.priority)}`} />
                <Badge className={`text-xs ${getStatusBadge(task.status)}`}>
                  {task.status}
                </Badge>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-background border shadow-md">
                    <DropdownMenuItem onClick={() => onEdit(task)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(task.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                  Due: {format(new Date(task.dueDate), "MMM d, yyyy")}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {task.assigneeAvatar}
                  </AvatarFallback>
                </Avatar>
                <span>{task.assigneeName}</span>
              </div>
              
              {task.relatedType && task.relatedTitle && (
                <div className="flex items-center gap-1">
                  <LinkIcon className="w-4 h-4" />
                  <span className="text-xs">
                    Related to:{" "}
                    {getRelatedLink() ? (
                      <Link 
                        to={getRelatedLink()!} 
                        className="text-primary hover:underline"
                      >
                        {task.relatedTitle}
                      </Link>
                    ) : (
                      task.relatedTitle
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}