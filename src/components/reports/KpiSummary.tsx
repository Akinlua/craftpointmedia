import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportKpi } from "@/types/report";
import { cn } from "@/lib/utils";
import { 
  DollarSign,
  Target, 
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  UserPlus,
  Heart,
  Plus,
  CheckCircle,
  Clock,
  Mail,
  Eye,
  MousePointer,
  Megaphone
} from "lucide-react";

const iconMap = {
  DollarSign,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  UserPlus,
  Heart,
  Plus,
  CheckCircle,
  Clock,
  Mail,
  Eye,
  MousePointer,
  Megaphone
};

interface KpiSummaryProps {
  kpis: ReportKpi[];
  isLoading?: boolean;
}

const KpiSummary = ({ kpis, isLoading = false }: KpiSummaryProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="card-subtle">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-3 flex-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="w-8 h-8 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getChangeIcon = (changeType?: 'increase' | 'decrease' | 'neutral') => {
    if (!changeType) return null;
    if (changeType === 'increase') return TrendingUp;
    if (changeType === 'decrease') return TrendingDown;
    return Minus;
  };

  const getChangeColor = (changeType?: 'increase' | 'decrease' | 'neutral') => {
    if (changeType === 'increase') return 'text-green-600';
    if (changeType === 'decrease') return 'text-red-600';
    return 'text-muted-foreground';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi) => {
        const Icon = iconMap[kpi.icon as keyof typeof iconMap] || Target;
        const ChangeIcon = getChangeIcon(kpi.changeType);

        return (
          <Card key={kpi.id} className="card-subtle">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-caption uppercase tracking-wide font-medium text-muted-foreground">
                    {kpi.title}
                  </p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  {kpi.change !== undefined && (
                    <div className="flex items-center gap-1">
                      {ChangeIcon && (
                        <ChangeIcon className={cn("w-3 h-3", getChangeColor(kpi.changeType))} />
                      )}
                      <Badge 
                        variant="secondary" 
                        className={cn("text-xs", getChangeColor(kpi.changeType))}
                      >
                        {kpi.change > 0 ? '+' : ''}{kpi.change}% from last period
                      </Badge>
                    </div>
                  )}
                </div>
                <div className={cn("p-2 rounded-lg bg-primary/10")}>
                  <Icon className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default KpiSummary;