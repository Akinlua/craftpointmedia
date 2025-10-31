import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface EnhancedCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "premium" | "glass" | "elevated";
  interactive?: boolean;
  withGlow?: boolean;
}

const EnhancedCard = forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, variant = "default", interactive = false, withGlow = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border bg-card text-card-foreground transition-all duration-300",
          {
            // Default variant
            "shadow-sm": variant === "default",
            
            // Premium variant with gradient and enhanced shadows
            "bg-gradient-to-br from-card via-card to-card/95 shadow-lg border-border/50 ring-1 ring-primary/5": 
              variant === "premium",
            
            // Glass variant with backdrop blur
            "bg-card/80 backdrop-blur-xl border-border/30 shadow-xl": 
              variant === "glass",
              
            // Elevated variant with strong shadow
            "shadow-2xl border-border/20 bg-card": 
              variant === "elevated",
              
            // Interactive states
            "hover:shadow-xl hover:-translate-y-1 cursor-pointer": interactive,
            
            // Glow effect
            "hover:shadow-glow": withGlow,
          },
          className
        )}
        {...props}
      />
    );
  }
);
EnhancedCard.displayName = "EnhancedCard";

const EnhancedCardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
EnhancedCardHeader.displayName = "EnhancedCardHeader";

const EnhancedCardTitle = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text",
      className
    )}
    {...props}
  />
));
EnhancedCardTitle.displayName = "EnhancedCardTitle";

const EnhancedCardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground/80", className)}
    {...props}
  />
));
EnhancedCardDescription.displayName = "EnhancedCardDescription";

const EnhancedCardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
EnhancedCardContent.displayName = "EnhancedCardContent";

const EnhancedCardFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
EnhancedCardFooter.displayName = "EnhancedCardFooter";

export {
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardFooter,
  EnhancedCardTitle,
  EnhancedCardDescription,
  EnhancedCardContent,
};