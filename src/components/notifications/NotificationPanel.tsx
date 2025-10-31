import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Check, Trash2, User, DollarSign, CheckSquare, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: 'lead' | 'deal' | 'task' | 'message';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'lead',
    title: 'New Lead Added',
    message: 'Sarah Johnson from Tech Corp submitted a contact form',
    timestamp: '2 minutes ago',
    read: false,
    priority: 'high'
  },
  {
    id: '2',
    type: 'deal',
    title: 'Deal Stage Updated',
    message: 'Enterprise Software Deal moved to Proposal stage',
    timestamp: '15 minutes ago',
    read: false,
    priority: 'medium'
  },
  {
    id: '3',
    type: 'task',
    title: 'Task Due Soon',
    message: 'Follow up with John Smith is due in 30 minutes',
    timestamp: '1 hour ago',
    read: true,
    priority: 'high'
  },
  {
    id: '4',
    type: 'message',
    title: 'New Message',
    message: 'You have a new email from marketing team',
    timestamp: '2 hours ago',
    read: true,
    priority: 'low'
  },
  {
    id: '5',
    type: 'deal',
    title: 'Deal Won',
    message: 'Mobile App Development deal closed successfully',
    timestamp: '1 day ago',
    read: true,
    priority: 'high'
  }
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'lead':
      return User;
    case 'deal':
      return DollarSign;
    case 'task':
      return CheckSquare;
    case 'message':
      return MessageSquare;
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
  const [notifications, setNotifications] = useState(mockNotifications);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read when clicked
    markAsRead(notification.id);
    
    // Navigate to relevant section
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
      case 'message':
        navigate('/app/inbox');
        break;
      default:
        break;
    }
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
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
                onClick={markAllAsRead}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="mt-6 h-[calc(100vh-8rem)]">
          <div className="space-y-2">
            {notifications.length === 0 ? (
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
                                onClick={() => markAsRead(notification.id)}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-destructive"
                              onClick={() => deleteNotification(notification.id)}
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
                          {notification.timestamp}
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