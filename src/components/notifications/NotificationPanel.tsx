import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Check, Trash2, User, DollarSign, CheckSquare, MessageSquare, FileText, Users, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { notificationsApi, Notification } from "@/lib/api/notifications";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/hooks/use-toast";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'lead':
      return User;
    case 'deal':
      return DollarSign;
    case 'task':
      return CheckSquare;
    case 'meeting':
      return MessageSquare;
    case 'invoice':
      return FileText;
    case 'team':
      return Users;
    case 'system':
      return AlertCircle;
    default:
      return Bell;
  }
};

const getPriorityColor = (priority: string, read: boolean) => {
  if (read) return "text-muted-foreground";
  
  switch (priority) {
    case 'high':
      return "text-destructive";
    case 'medium':
      return "text-warning";
    case 'low':
      return "text-primary";
    default:
      return "text-muted-foreground";
  }
};

interface NotificationPanelProps {
  children: React.ReactNode;
}

export const NotificationPanel = ({ children }: NotificationPanelProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.getNotifications,
  });

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        () => {
          // Refetch notifications when any change occurs
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark all as read",
        variant: "destructive",
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: notificationsApi.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    }
  });

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read when clicked
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }
    
    // Navigate using action_url or fallback to type-based navigation
    if (notification.action_url) {
      navigate(notification.action_url);
    } else {
      // Fallback navigation based on type
      switch (notification.type) {
        case 'lead':
          navigate('/app/contacts?filter=leads');
          break;
        case 'deal':
          navigate('/app/deals');
          break;
        case 'task':
          navigate('/app/tasks');
          break;
        case 'meeting':
          navigate('/app/tasks');
          break;
        case 'invoice':
          navigate('/app/invoices');
          break;
        case 'team':
          navigate('/app/settings/team');
          break;
        default:
          break;
      }
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-96 glass-panel">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="mt-6 h-[calc(100vh-8rem)]">
          <div className="space-y-2">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="h-16 w-16 mx-auto mb-4 opacity-20 animate-pulse" />
                <p className="text-sm">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium mb-2">All caught up!</p>
                <p className="text-sm">No new notifications</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 rounded-lg border transition-all duration-200 hover:bg-accent/50 cursor-pointer",
                      notification.read 
                        ? "border-border/30 bg-muted/20" 
                        : "border-primary/20 bg-primary/5 shadow-sm"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        notification.read ? "bg-muted" : "bg-primary/10"
                      )}>
                        <Icon className={cn(
                          "h-4 w-4",
                          getPriorityColor(notification.priority, notification.read)
                        )} />
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className={cn(
                            "text-sm font-medium",
                            notification.read ? "text-muted-foreground" : "text-foreground"
                          )}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-1">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsReadMutation.mutate(notification.id);
                                }}
                                disabled={markAsReadMutation.isPending}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteMutation.mutate(notification.id);
                              }}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <p className={cn(
                          "text-xs",
                          notification.read ? "text-muted-foreground" : "text-foreground/80"
                        )}>
                          {notification.message}
                        </p>
                        
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};