import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthForm } from "@/components/auth/AuthForm";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/lib/hooks/useSession";
import { authApi } from "@/lib/api/auth";
import { Mail, Lock, Chrome, HelpCircle } from "lucide-react";
import { RequestAccessModal } from "@/components/auth/RequestAccessModal";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [requestAccessOpen, setRequestAccessOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useSession();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const { user, org, token } = await authApi.login(data as { email: string; password: string });
      login(user, org, token);
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      navigate("/app/dashboard");
    } catch (error) {
      toast({
        title: "Sign in failed", 
        description: error instanceof Error ? error.message : "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'microsoft') => {
    setIsLoading(true);
    try {
      const { user, org, token } = await authApi.loginWithOAuth(provider);
      login(user, org, token);
      navigate("/app/dashboard");
    } catch (error) {
      toast({
        title: "Sign in failed",
        description: "OAuth sign in failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <AuthForm
      title="Sign in to CraftPoint CRM"
      description="Only registered business owners and invited team members can log in."
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="pl-10"
              {...form.register("email")}
            />
          </div>
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/auth/reset-password" className="text-sm text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="pl-10"
              {...form.register("password")}
            />
          </div>
          {form.formState.errors.password && (
            <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="mt-4 space-y-2">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => handleOAuthLogin('google')}
            disabled={isLoading}
          >
            <Chrome className="mr-2 h-4 w-4" />
            Google
          </Button>
          <Button
            variant="outline"
            onClick={() => handleOAuthLogin('microsoft')}
            disabled={isLoading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
            </svg>
            Microsoft
          </Button>
        </div>
      </div>

      <div className="mt-6 text-center space-y-3">
        <p className="text-sm text-muted-foreground">
          Don't have access yet?
        </p>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => setRequestAccessOpen(true)}
        >
          <HelpCircle className="w-4 h-4 mr-2" />
          Request CRM Access
        </Button>
        
        <p className="text-xs text-muted-foreground pt-2">
          Need help?{" "}
          <a href="mailto:support@craftpointcrm.com" className="text-primary hover:underline">
            Contact us
          </a>
        </p>
      </div>
    </AuthForm>
    
    <RequestAccessModal 
      open={requestAccessOpen} 
      onOpenChange={setRequestAccessOpen} 
    />
    </>
  );
};

export default LoginPage;