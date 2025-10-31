import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PremiumPageWrapperProps {
  children: ReactNode;
  className?: string;
  withGradient?: boolean;
  withAnimation?: boolean;
}

export const PremiumPageWrapper = ({ 
  children, 
  className, 
  withGradient = true, 
  withAnimation = true 
}: PremiumPageWrapperProps) => {
  return (
    <div 
      className={cn(
        "min-h-screen",
        withGradient && "bg-gradient-page",
        withAnimation && "animate-fade-in",
        className
      )}
    >
      <div className="container mx-auto p-6 relative">
        {withGradient && (
          <>
            {/* Floating orbs for ambiance */}
            <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl animate-float" />
            <div className="absolute top-40 right-20 w-24 h-24 bg-primary/3 rounded-full blur-xl animate-bounce-gentle" />
            <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-primary/4 rounded-full blur-lg animate-float" style={{animationDelay: '1s'}} />
          </>
        )}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
};