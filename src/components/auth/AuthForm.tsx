import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthFormProps {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export const AuthForm = ({ title, description, children, footer, className }: AuthFormProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-8">
      {/* Multi-layered animated backgrounds */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background via-60% to-primary/5" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/3 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-bl from-primary/4 via-transparent to-primary/6" />
      
      {/* Large floating orbs with complex animations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/12 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/8 rounded-full blur-3xl animate-drift" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-primary/15 rounded-full blur-2xl animate-glow-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-primary/12 rounded-full blur-3xl animate-morph" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/4 right-1/3 w-24 h-24 bg-primary/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '4s' }} />
        <div className="absolute bottom-1/3 left-1/2 w-40 h-40 bg-primary/10 rounded-full blur-2xl animate-drift" style={{ animationDelay: '2.5s' }} />
        <div className="absolute top-3/4 left-1/3 w-28 h-28 bg-primary/14 rounded-full blur-3xl animate-glow-pulse" style={{ animationDelay: '5s' }} />
        <div className="absolute top-1/6 right-1/2 w-36 h-36 bg-primary/9 rounded-full blur-2xl animate-float" style={{ animationDelay: '1.8s' }} />
      </div>
      
      {/* Animated geometric shapes with complex movements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-3 h-3 bg-primary/30 rotate-45 animate-morph" style={{ animationDelay: '1s' }} />
        <div className="absolute top-40 right-32 w-2 h-2 bg-primary/40 rounded-full animate-drift" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-32 left-40 w-4 h-4 bg-primary/25 rotate-45 animate-glow-pulse" style={{ animationDelay: '3s' }} />
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-primary/35 rounded-full animate-bounce-gentle" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/3 left-16 w-3 h-3 bg-primary/30 rotate-45 animate-drift" style={{ animationDelay: '4s' }} />
        <div className="absolute bottom-1/2 right-16 w-2 h-2 bg-primary/40 rounded-full animate-morph" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-2/3 left-3/4 w-3 h-3 bg-primary/35 rotate-45 animate-glow-pulse" style={{ animationDelay: '3.2s' }} />
        <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-primary/45 rounded-full animate-float" style={{ animationDelay: '2.8s' }} />
      </div>
      
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Small floating particles */}
        <div className="absolute top-[10%] left-[15%] w-1 h-1 bg-primary/50 rounded-full animate-float" style={{ animationDelay: '0s', animationDuration: '4s' }} />
        <div className="absolute top-[20%] left-[80%] w-1 h-1 bg-primary/40 rounded-full animate-pulse" style={{ animationDelay: '1s', animationDuration: '3s' }} />
        <div className="absolute top-[40%] left-[10%] w-1 h-1 bg-primary/45 rounded-full animate-bounce-gentle" style={{ animationDelay: '2s', animationDuration: '5s' }} />
        <div className="absolute top-[60%] left-[85%] w-1 h-1 bg-primary/35 rounded-full animate-float" style={{ animationDelay: '1.5s', animationDuration: '4.5s' }} />
        <div className="absolute top-[80%] left-[20%] w-1 h-1 bg-primary/55 rounded-full animate-pulse" style={{ animationDelay: '3s', animationDuration: '3.5s' }} />
        <div className="absolute top-[30%] left-[70%] w-1 h-1 bg-primary/40 rounded-full animate-bounce-gentle" style={{ animationDelay: '0.8s', animationDuration: '4.2s' }} />
        <div className="absolute top-[70%] left-[60%] w-1 h-1 bg-primary/50 rounded-full animate-float" style={{ animationDelay: '2.3s', animationDuration: '3.8s' }} />
        <div className="absolute top-[15%] left-[50%] w-1 h-1 bg-primary/45 rounded-full animate-pulse" style={{ animationDelay: '4.1s', animationDuration: '4.8s' }} />
      </div>
      
      {/* Glowing lines and connections */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent animate-pulse" style={{ animationDelay: '3.5s' }} />
        <div className="absolute top-1/2 left-1/4 w-px h-32 bg-gradient-to-b from-transparent via-primary/25 to-transparent animate-pulse" style={{ animationDelay: '1.8s' }} />
        <div className="absolute top-1/3 right-1/4 w-px h-24 bg-gradient-to-b from-transparent via-primary/20 to-transparent animate-pulse" style={{ animationDelay: '4.2s' }} />
      </div>
      
      {/* Morphing background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-10 w-16 h-16 bg-primary/5 rounded-full animate-scale-in" style={{ animationDelay: '1s', animationDuration: '6s', animationIterationCount: 'infinite' }} />
        <div className="absolute bottom-10 left-10 w-20 h-20 bg-primary/8 rounded-full animate-scale-in" style={{ animationDelay: '3s', animationDuration: '8s', animationIterationCount: 'infinite' }} />
        <div className="absolute top-1/2 right-1/3 w-12 h-12 bg-primary/6 rounded-full animate-scale-in" style={{ animationDelay: '5s', animationDuration: '7s', animationIterationCount: 'infinite' }} />
      </div>
      
      {/* Enhanced grid pattern with animation */}
      <div className="absolute inset-0 opacity-[0.015]">
        <div className="absolute inset-0 animate-pulse" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
          animationDuration: '4s'
        }} />
      </div>
      
      {/* Radial gradient spotlights */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-radial from-primary/10 via-primary/5 to-transparent rounded-full animate-pulse" style={{ animationDelay: '2s', animationDuration: '8s' }} />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-radial from-primary/8 via-primary/3 to-transparent rounded-full animate-pulse" style={{ animationDelay: '4s', animationDuration: '10s' }} />
      </div>
      
      {/* Content container with enhanced backdrop */}
      <div className="w-full max-w-md relative z-20">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/90 backdrop-blur-sm p-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in">
              <img 
                src="/lovable-uploads/a2be0e90-2f01-4a6d-8c56-d1cc72041092.png" 
                alt="Craftpoint"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <h1 className="text-display animate-slide-up">{title}</h1>
          <p className="text-muted-foreground mt-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>{description}</p>
        </div>

        <Card className={cn("glass-panel border-white/10 shadow-2xl animate-scale-in", className)} style={{ animationDelay: '0.2s' }}>
          <CardContent className="pt-6">
            {children}
            {footer && <div className="mt-6">{footer}</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};