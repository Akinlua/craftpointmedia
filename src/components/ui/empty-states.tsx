import { Button } from "@/components/ui/button";
import { Plus, Users, DollarSign, CheckSquare, Mail, BarChart } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState = ({ 
  icon: Icon = Users, 
  title, 
  description, 
  action,
  className 
}: EmptyStateProps) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center py-16 px-8",
      className
    )}>
      <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center mb-6">
        <Icon className="h-12 w-12 text-primary opacity-60" />
      </div>
      
      <h3 className="text-xl font-semibold text-foreground mb-2">
        {title}
      </h3>
      
      <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
        {description}
      </p>
      
      {action && (
        <Button 
          onClick={action.onClick}
          className="gap-2 shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
          {action.label}
        </Button>
      )}
    </div>
  );
};

// Preset empty states for common scenarios
export const NoContactsState = ({ onAddContact }: { onAddContact: () => void }) => (
  <EmptyState
    icon={Users}
    title="No contacts yet"
    description="Start building your network by adding your first contact. Import from CSV or add them manually to get started."
    action={{
      label: "Add Contact",
      onClick: onAddContact
    }}
  />
);

export const NoDealsState = ({ onAddDeal }: { onAddDeal: () => void }) => (
  <EmptyState
    icon={DollarSign}
    title="No deals in progress"
    description="Track your sales opportunities and close more deals. Create your first deal to start managing your sales pipeline."
    action={{
      label: "Create Deal",
      onClick: onAddDeal
    }}
  />
);

export const NoTasksState = ({ onAddTask }: { onAddTask: () => void }) => (
  <EmptyState
    icon={CheckSquare}
    title="All tasks complete!"
    description="You're all caught up! Create new tasks to stay organized and ensure nothing falls through the cracks."
    action={{
      label: "Add Task",
      onClick: onAddTask
    }}
  />
);

export const NoCampaignsState = ({ onCreateCampaign }: { onCreateCampaign: () => void }) => (
  <EmptyState
    icon={Mail}
    title="No campaigns created"
    description="Start engaging with your audience by creating email campaigns. Build customer relationships and drive sales."
    action={{
      label: "Create Campaign",
      onClick: onCreateCampaign
    }}
  />
);

export const NoReportsState = ({ onGenerateReport }: { onGenerateReport: () => void }) => (
  <EmptyState
    icon={BarChart}
    title="No reports available"
    description="Generate insights from your data to make better business decisions. Create your first report to get started."
    action={{
      label: "Generate Report",
      onClick: onGenerateReport
    }}
  />
);

// Generic loading state with animation
export const LoadingState = ({ message = "Loading..." }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
    <p className="text-muted-foreground">{message}</p>
  </div>
);