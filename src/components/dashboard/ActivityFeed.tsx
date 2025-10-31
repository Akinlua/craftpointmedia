import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ActivityFeedProps } from "@/types/activity";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { 
  Users, 
  Target, 
  FileText, 
  CheckCircle, 
  MessageCircle,
  MoreHorizontal 
} from "lucide-react";

const activityIconMap = {
  contact_added: Users,
  deal_updated: Target,
  invoice_sent: FileText,
  task_completed: CheckCircle,
  message_received: MessageCircle,
};

const activityColorMap = {
  contact_added: 'text-primary bg-primary/10',
  deal_updated: 'text-primary bg-primary/10',
  invoice_sent: 'text-primary bg-primary/10',
  task_completed: 'text-primary bg-primary/10',
  message_received: 'text-primary bg-primary/10',
};

const ActivityFeed = ({ 
  activities, 
  isLoading = false, 
  onLoadMore, 
  hasMore = false 
}: ActivityFeedProps) => {
  const navigate = useNavigate();

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'Unknown time';
    }
  };

  if (isLoading) {
    return (
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-start gap-3">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="text-lg sm:text-xl">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3 sm:space-y-4">
          {activities.map((activity) => {
            const Icon = activityIconMap[activity.type] || MessageCircle;
            const colorClasses = activityColorMap[activity.type] || 'text-gray-600 bg-gray-50';
            
            return (
              <div 
                key={activity.id}
                className={cn(
                  "flex items-start gap-2 sm:gap-3 p-2 rounded-lg transition-colors",
                  "hover:bg-muted/50 cursor-pointer",
                  activity.route && "group"
                )}
                onClick={() => activity.route && navigate(activity.route)}
              >
                <div className={cn("p-1.5 sm:p-2 rounded-lg flex-shrink-0", colorClasses.split(' ')[1])}>
                  <Icon className={cn("w-3 h-3 sm:w-4 sm:h-4", colorClasses.split(' ')[0])} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-foreground group-hover:text-primary truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-2">
                        <p className="text-xs text-muted-foreground truncate">
                          by {activity.user.name}
                        </p>
                        <span className="text-xs text-muted-foreground">•</span>
                        <p className="text-xs text-muted-foreground">
                          {formatTimestamp(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {hasMore && (
            <div className="pt-4 border-t">
              <Button 
                variant="ghost" 
                onClick={onLoadMore}
                className="w-full"
              >
                <MoreHorizontal className="w-4 h-4 mr-2" />
                Load more activity
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;