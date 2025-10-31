import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  animate?: boolean;
}

export const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className, title, description, actions, breadcrumbs, animate = true, ...props }, ref) => {
    const content = (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-4 pb-6 border-b border-border/50",
          className
        )}
        {...props}
      >
        {breadcrumbs && (
          <div className="flex items-center text-sm text-muted-foreground">
            {breadcrumbs}
          </div>
        )}
        
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              {title}
            </h1>
            {description && (
              <p className="text-base text-muted-foreground max-w-2xl">
                {description}
              </p>
            )}
          </div>
          
          {actions && (
            <div className="flex items-center gap-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    );

    if (animate) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {content}
        </motion.div>
      );
    }

    return content;
  }
);

PageHeader.displayName = "PageHeader";