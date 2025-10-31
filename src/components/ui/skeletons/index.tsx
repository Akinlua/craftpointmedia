import { cn } from "@/lib/utils";

// Base shimmer animation
export const Shimmer = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "animate-pulse rounded bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]",
      className
    )}
    {...props}
  />
);

// Enhanced skeleton base
export const SkeletonBase = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "relative overflow-hidden rounded bg-muted",
      "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
      className
    )}
    {...props}
  />
);

// KPI Card Skeleton
export const KpiCardSkeleton = () => (
  <div className="card-subtle p-6">
    <div className="flex items-center justify-between">
      <div className="space-y-3 flex-1">
        <SkeletonBase className="h-3 w-20" />
        <SkeletonBase className="h-8 w-16" />
        <SkeletonBase className="h-4 w-24" />
      </div>
      <SkeletonBase className="w-8 h-8 rounded-lg" />
    </div>
  </div>
);

// Table Row Skeleton
export const TableRowSkeleton = ({ columns = 4 }: { columns?: number }) => (
  <tr className="border-b border-border/50">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="p-4">
        <SkeletonBase className={cn(
          "h-4",
          i === 0 ? "w-32" : i === columns - 1 ? "w-16" : "w-24"
        )} />
      </td>
    ))}
  </tr>
);

// Kanban Card Skeleton
export const KanbanCardSkeleton = () => (
  <div className="bg-card rounded-lg border border-border/50 p-4 space-y-3">
    <SkeletonBase className="h-4 w-3/4" />
    <SkeletonBase className="h-3 w-full" />
    <SkeletonBase className="h-3 w-2/3" />
    <div className="flex items-center justify-between pt-2">
      <SkeletonBase className="h-6 w-16 rounded-full" />
      <SkeletonBase className="h-6 w-6 rounded-full" />
    </div>
  </div>
);

// Chart Skeleton
export const ChartSkeleton = ({ height = "h-64" }: { height?: string }) => (
  <div className={cn("w-full rounded-lg bg-muted/20 border border-border/50", height)}>
    <div className="h-full flex items-end justify-around p-6 space-x-2">
      {Array.from({ length: 7 }).map((_, i) => (
        <SkeletonBase 
          key={i} 
          className={cn(
            "w-8 bg-muted/60",
            `h-${[16, 20, 12, 24, 8, 18, 14][i] || 16}`
          )} 
        />
      ))}
    </div>
  </div>
);

// Contact Detail Skeleton
export const ContactDetailSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center space-x-4">
      <SkeletonBase className="h-16 w-16 rounded-full" />
      <div className="space-y-2 flex-1">
        <SkeletonBase className="h-6 w-48" />
        <SkeletonBase className="h-4 w-32" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <SkeletonBase className="h-3 w-20" />
          <SkeletonBase className="h-4 w-full" />
        </div>
      ))}
    </div>
  </div>
);

// Form Field Skeleton
export const FormFieldSkeleton = () => (
  <div className="space-y-2">
    <SkeletonBase className="h-4 w-24" />
    <SkeletonBase className="h-10 w-full rounded-md" />
  </div>
);

// Activity Feed Skeleton
export const ActivityFeedSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-start space-x-3">
        <SkeletonBase className="h-8 w-8 rounded-full flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <SkeletonBase className="h-4 w-3/4" />
          <SkeletonBase className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);