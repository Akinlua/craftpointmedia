import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AuthForm } from "@/components/auth/AuthForm";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/lib/hooks/useSession";
import { useInviteStore } from "@/lib/stores/inviteStore";
import { authApi } from "@/lib/api/auth";
import { Lock, User, UserCheck, AlertCircle } from "lucide-react";

const acceptSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AcceptForm = z.infer<typeof acceptSchema>;

const AcceptInvitationPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useSession();
  const { getInviteByToken, acceptInvite } = useInviteStore();
  
  const token = searchParams.get('token');
  const invite = token ? getInviteByToken(token) : null;

  const form = useForm<AcceptForm>({
    resolver: zodResolver(acceptSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Pre-fill email from invite if available
  useEffect(() => {
    if (invite) {
      // Email is read-only, comes from invite
    }
  }, [invite]);

  const onSubmit = async (data: AcceptForm) => {
    if (!invite || !token) {
      toast({
        title: "Invalid invitation",
        description: "This invitation link is invalid or has expired.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Call Supabase edge function to accept invitation
      // For now, simulate acceptance
      toast({
        title: "Account created!",
        description: "Your account has been created. Please log in.",
      });
      
      acceptInvite(token);
      navigate("/auth/login");
    } catch (error) {
      toast({
        title: "Invitation failed",
        description: error instanceof Error ? error.message : "Failed to accept invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthForm
        title="Invalid Invitation"
        description="No invitation token provided"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <p className="text-body text-muted-foreground mb-6">
            This invitation link is invalid. Please check the URL or ask for a new invitation.
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link to="/auth/login">
              Back to Login
            </Link>
          </Button>
        </div>
      </AuthForm>
    );
  }

  if (!invite) {
    return (
      <AuthForm
        title="Invitation Not Found"
        description="This invitation has expired or been used"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-warning" />
          </div>
          <p className="text-body text-muted-foreground mb-6">
            This invitation link has expired or has already been used. Please request a new invitation.
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link to="/auth/login">
              Back to Login
            </Link>
          </Button>
        </div>
      </AuthForm>
    );
  }

  return (
    <AuthForm
      title="Accept Invitation"
      description="Complete your account setup to join the team"
    >
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserCheck className="w-8 h-8 text-primary" />
        </div>
        
        <div className="bg-muted/50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Email:</span>
            <span className="font-medium">{invite.email}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Role:</span>
            <Badge variant="secondary" className="capitalize">
              {invite.role}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Organization:</span>
            <span className="font-medium">{invite.orgName}</span>
          </div>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="firstName"
                placeholder="John"
                className="pl-10"
                {...form.register("firstName")}
              />
            </div>
            {form.formState.errors.firstName && (
              <p className="text-sm text-destructive">{form.formState.errors.firstName.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              placeholder="Doe"
              {...form.register("lastName")}
            />
            {form.formState.errors.lastName && (
              <p className="text-sm text-destructive">{form.formState.errors.lastName.message}</p>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Create Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              id="password"
              type="password"
              placeholder="Create a secure password"
              className="pl-10"
              {...form.register("password")}
            />
          </div>
          {form.formState.errors.password && (
            <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              className="pl-10"
              {...form.register("confirmPassword")}
            />
          </div>
          {form.formState.errors.confirmPassword && (
            <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full btn-primary" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Complete Setup"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          By accepting this invitation, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </AuthForm>
  );
};

export default AcceptInvitationPage;