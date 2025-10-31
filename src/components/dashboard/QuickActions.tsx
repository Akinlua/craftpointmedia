import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { UserPlus, Target, FileText, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  action: () => void;
  variant: 'primary' | 'success' | 'warning';
}

const QuickActions = () => {
  const navigate = useNavigate();

  const quickActions: QuickAction[] = [
    {
      id: 'add-lead',
      title: 'Add Lead',
      description: 'Add a new potential customer',
      icon: UserPlus,
      action: () => navigate('/app/contacts?action=add'),
      variant: 'primary'
    },
    {
      id: 'create-deal',
      title: 'Create Deal',
      description: 'Start tracking a new opportunity',
      icon: Target,
      action: () => navigate('/app/deals?action=create'),
      variant: 'success'
    },
    {
      id: 'send-invoice',
      title: 'Send Invoice',
      description: 'Generate and send an invoice',
      icon: FileText,
      action: () => navigate('/app/invoices?action=create'),
      variant: 'warning'
    }
  ];

  const getVariantClasses = (variant: QuickAction['variant']) => {
    switch (variant) {
      case 'primary':
        return 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 hover:border-primary/30';
      case 'success': 
        return 'bg-success/10 text-success border-success/20 hover:bg-success/20 hover:border-success/30';
      case 'warning':
        return 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20 hover:border-warning/30';
      default:
        return 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 hover:border-primary/30';
    }
  };

  return (
    <Card className="card-elevated hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
      <CardHeader className="pb-3 sm:pb-4 lg:pb-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
          <div className="p-1 rounded-md bg-primary/10">
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-primary" />
          </div>
          <span className="font-semibold">Quick Actions</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-2 sm:space-y-3">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          
          return (
            <Button
              key={action.id}
              variant="ghost"
              onClick={action.action}
              className={cn(
                "w-full h-auto p-3 sm:p-4 justify-start border transition-all duration-300",
                "hover:scale-[1.02] hover:shadow-md group animate-slide-in-right",
                getVariantClasses(action.variant)
              )}
              style={{animationDelay: `${index * 100}ms`}}
            >
              <div className="flex items-center gap-3 sm:gap-4 w-full">
                <div className="p-2 sm:p-2.5 rounded-lg bg-background/50 backdrop-blur-sm flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="font-semibold text-sm sm:text-base group-hover:text-current transition-colors duration-200">
                    {action.title}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground/80 mt-0.5 line-clamp-1 sm:line-clamp-2 group-hover:text-muted-foreground transition-colors duration-200">
                    {action.description}
                  </p>
                </div>
              </div>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default QuickActions;