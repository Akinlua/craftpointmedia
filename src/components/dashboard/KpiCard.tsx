import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { KpiCardProps } from "@/types/kpi";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Users, 
  Target, 
  DollarSign, 
  Calendar, 
  MessageCircle,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";

const iconMap = {
  Users,
  Target,
  DollarSign,
  Calendar,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  Minus
};

const KpiCard = ({ data, isLoading = false }: KpiCardProps) => {
  const navigate = useNavigate();
  const Icon = iconMap[data.icon as keyof typeof iconMap] || Users;

  const getChangeIcon = () => {
    if (!data.change) return null;
    
    if (data.changeType === 'increase') return TrendingUp;
    if (data.changeType === 'decrease') return TrendingDown;
    return Minus;
  };

  const getChangeColor = () => {
    if (data.changeType === 'increase') return 'text-green-600';
    if (data.changeType === 'decrease') return 'text-red-600';
    return 'text-muted-foreground';
  };

  const ChangeIcon = getChangeIcon();

  if (isLoading) {
    return (
      <Card className="card-premium animate-pulse">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-3 flex-1">
              <div className="h-3 w-20 bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer rounded" />
              <div className="h-8 w-16 bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer rounded" />
              <div className="h-4 w-24 bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer rounded-full" />
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer rounded-xl" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Function to determine if value might be truncated
  const isLongValue = (value: string | number) => {
    const valueStr = value.toString();
    return valueStr.length > 8 || (valueStr.includes('$') && valueStr.length > 6);
  };

  // Function to get the full formatted value for tooltip
  const getFullValue = () => {
    if (typeof data.value === 'string' && data.value.includes('$')) {
      // For currency values, show the exact amount
      return data.value;
    }
    return data.value.toString();
  };

  const shouldShowTooltip = isLongValue(data.value);

  const ValueDisplay = () => (
    <p className="text-xl sm:text-2xl lg:text-4xl font-bold tracking-tight group-hover:text-primary transition-colors duration-300 truncate">
      {data.value}
    </p>
  );

  return (
    <TooltipProvider>
      <Card 
        className={cn(
          "card-premium cursor-pointer group overflow-hidden relative",
          "transition-all duration-300 hover:shadow-xl hover:scale-[1.02]",
          "before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/5 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300",
          "hover:before:opacity-100"
        )}
        onClick={() => navigate(data.route)}
      >
        <CardContent className="p-4 sm:p-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2 sm:space-y-3 flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground/80 font-medium">
                {data.title}
              </p>
              {shouldShowTooltip ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <ValueDisplay />
                      {/* Hover overlay with full value */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-start">
                        <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg shadow-lg text-lg sm:text-xl font-bold whitespace-nowrap transform scale-95 group-hover:scale-100 transition-transform duration-300">
                          {getFullValue()}
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top" 
                    className="bg-primary text-primary-foreground font-semibold px-3 py-2 text-base"
                  >
                    {getFullValue()}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <ValueDisplay />
              )}
              {data.change !== undefined && (
                <div className="flex items-center gap-1 sm:gap-2">
                  {ChangeIcon && (
                    <div className={cn(
                      "p-0.5 sm:p-1 rounded-full",
                      data.changeType === 'increase' ? 'bg-success/10' : 
                      data.changeType === 'decrease' ? 'bg-destructive/10' : 'bg-muted/20'
                    )}>
                      <ChangeIcon className={cn("w-2 h-2 sm:w-3 sm:h-3", getChangeColor())} />
                    </div>
                  )}
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full",
                      getChangeColor(),
                      "bg-background/50 backdrop-blur-sm"
                    )}
                  >
                    {data.change > 0 ? '+' : ''}{data.change}% from last month
                  </Badge>
                </div>
              )}
            </div>
            {/* Icon container - hidden on lg+ screens, visible on mobile/tablet */}
            <div className={cn(
              "lg:hidden p-2 sm:p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex-shrink-0",
              "group-hover:scale-110 group-hover:rotate-3 transition-all duration-300",
              "shadow-sm group-hover:shadow-md"
            )}>
              <Icon className={cn("w-4 h-4 sm:w-5 sm:h-5 text-primary group-hover:text-primary/80 transition-colors duration-300")} />
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default KpiCard;