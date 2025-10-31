import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageBackgroundProps {
  children: ReactNode;
  variant?: "dashboard" | "contacts" | "deals" | "inbox" | "marketing" | "sales" | "reports" | "settings" | "default";
  className?: string;
}

export const PageBackground = ({ 
  children, 
  variant = "default",
  className 
}: PageBackgroundProps) => {
  const getVariantElements = () => {
    switch (variant) {
      case "dashboard":
        return (
          <>
            {/* KPI-focused elements */}
            <div className="absolute top-20 right-20 w-6 h-6 border-2 border-success/20 rounded-full animate-pulse-glow" />
            <div className="absolute top-40 left-32 w-4 h-4 border border-warning/30 rounded-lg rotate-45 animate-float" />
            <div className="absolute bottom-32 right-40 w-8 h-8 border border-primary/15 rounded-xl animate-bounce-gentle" />
            <div className="absolute top-1/3 right-1/4 w-16 h-1 bg-gradient-to-r from-primary/10 to-transparent animate-shimmer" />
            <div className="absolute bottom-1/4 left-1/5 w-12 h-12 bg-success/5 rounded-full blur-xl animate-drift" />
          </>
        );
      
      case "contacts":
        return (
          <>
            {/* People/network-themed elements */}
            <div className="absolute top-24 left-24 w-3 h-3 bg-primary/20 rounded-full animate-pulse" />
            <div className="absolute top-32 left-32 w-2 h-2 bg-primary/15 rounded-full animate-pulse" style={{animationDelay: '0.5s'}} />
            <div className="absolute top-28 left-40 w-2 h-2 bg-primary/10 rounded-full animate-pulse" style={{animationDelay: '1s'}} />
            <div className="absolute top-1/2 right-16 w-16 h-16 border border-primary/8 rounded-full animate-drift" />
            <div className="absolute bottom-40 left-1/3 w-12 h-12 border border-primary/6 rounded-lg rotate-12 animate-float" />
            <div className="absolute top-2/3 right-1/3 w-20 h-1 bg-gradient-to-r from-primary/8 to-transparent animate-shimmer" style={{animationDelay: '1s'}} />
          </>
        );
      
      case "deals":
        return (
          <>
            {/* Sales/money-themed elements */}
            <div className="absolute top-20 right-24 w-6 h-6 border-2 border-success/25 rounded-sm rotate-45 animate-float" />
            <div className="absolute top-1/3 left-20 w-4 h-4 border border-warning/20 rounded-full animate-bounce-gentle" />
            <div className="absolute bottom-1/3 right-32 w-8 h-8 bg-success/8 rounded-lg animate-drift" />
            <div className="absolute top-2/3 left-1/4 w-24 h-1 bg-gradient-to-r from-success/12 to-transparent animate-shimmer" />
            <div className="absolute bottom-20 right-1/4 w-16 h-16 border border-primary/10 rounded-xl animate-morph" />
          </>
        );
      
      case "marketing":
        return (
          <>
            {/* Creative/campaign elements */}
            <div className="absolute top-16 left-16 w-8 h-8 border border-primary/15 rounded-full animate-glow-pulse" />
            <div className="absolute top-1/4 right-20 w-6 h-6 border border-warning/20 rounded-lg rotate-12 animate-float" />
            <div className="absolute bottom-1/3 left-1/4 w-10 h-10 bg-primary/6 rounded-full blur-sm animate-drift" />
            <div className="absolute top-2/3 right-1/3 w-12 h-12 border border-primary/8 rounded-xl animate-bounce-gentle" />
            <div className="absolute bottom-24 right-24 w-20 h-1 bg-gradient-to-r from-primary/10 to-warning/8 animate-shimmer" />
          </>
        );
      
      case "sales":
        return (
          <>
            {/* Sales/invoice elements */}
            <div className="absolute top-32 right-32 w-5 h-5 border-2 border-success/30 rounded-sm animate-pulse-glow" />
            <div className="absolute top-1/2 left-24 w-8 h-8 border border-primary/12 rounded-lg rotate-45 animate-float" />
            <div className="absolute bottom-40 right-20 w-6 h-6 bg-success/10 rounded-full animate-drift" />
            <div className="absolute top-1/4 right-1/4 w-16 h-1 bg-gradient-to-r from-success/15 to-transparent animate-shimmer" />
          </>
        );
      
      case "inbox":
        return (
          <>
            {/* Communication elements */}
            <div className="absolute top-20 left-20 w-4 h-4 border border-primary/20 rounded-full animate-pulse" />
            <div className="absolute top-1/3 right-24 w-6 h-6 border border-primary/15 rounded-lg animate-float" />
            <div className="absolute bottom-1/2 left-1/3 w-8 h-8 bg-primary/8 rounded-xl animate-drift" />
            <div className="absolute top-2/3 right-1/4 w-12 h-1 bg-gradient-to-r from-primary/12 to-transparent animate-shimmer" />
          </>
        );
      
      case "reports":
        return (
          <>
            {/* Analytics/chart elements */}
            <div className="absolute top-24 right-28 w-3 h-6 bg-primary/15 animate-pulse" />
            <div className="absolute top-32 right-32 w-3 h-4 bg-primary/12 animate-pulse" style={{animationDelay: '0.3s'}} />
            <div className="absolute top-28 right-36 w-3 h-8 bg-primary/18 animate-pulse" style={{animationDelay: '0.6s'}} />
            <div className="absolute bottom-1/3 left-24 w-8 h-8 border border-success/20 rounded-lg animate-float" />
            <div className="absolute top-1/2 right-1/3 w-16 h-1 bg-gradient-to-r from-success/12 to-primary/8 animate-shimmer" />
          </>
        );
      
      case "settings":
        return (
          <>
            {/* Settings/config elements */}
            <div className="absolute top-24 left-32 w-5 h-5 border border-muted-foreground/15 rounded-full animate-bounce-gentle" />
            <div className="absolute top-1/3 right-28 w-6 h-6 border border-muted-foreground/12 rounded-lg rotate-45 animate-float" />
            <div className="absolute bottom-1/4 left-1/4 w-8 h-8 bg-muted-foreground/8 rounded-xl animate-drift" />
          </>
        );
      
      default:
        return (
          <>
            {/* Default subtle elements */}
            <div className="absolute top-40 right-40 w-6 h-6 border border-primary/10 rounded-lg rotate-45 animate-float" />
            <div className="absolute bottom-1/3 left-1/4 w-8 h-8 bg-primary/5 rounded-full blur-sm animate-drift" />
          </>
        );
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Variant-specific animated elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {getVariantElements()}
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};