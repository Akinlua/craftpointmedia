import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AuthForm } from "@/components/auth/AuthForm";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, UserPlus, AlertCircle, UserCheck } from "lucide-react";

const acceptInviteSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AcceptInviteFormData = z.infer<typeof acceptInviteSchema>;

const AcceptInvitationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const token = searchParams.get('token');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptInviteFormData>({
    resolver: zodResolver(acceptInviteSchema),
  });

  useEffect(() => {
    const loadInvitation = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('invitations')
          .select('*')
          .eq('token', token)
          .eq('status', 'pending')
          .single();

        if (error || !data) {
          toast({
            title: "Invalid invitation",
            description: "This invitation link is invalid or has expired",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        // Check if invitation is expired
        if (new Date(data.expires_at) < new Date()) {
          toast({
            title: "Invitation expired",
            description: "This invitation has expired. Please request a new one.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        setInvitation(data);
      } catch (error) {
        console.error('Error loading invitation:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInvitation();
  }, [token, toast]);

  const onSubmit = async (data: AcceptInviteFormData) => {
    if (!token || !invitation) return;

    setIsSubmitting(true);

    try {
      // Call the edge function to accept the invitation
      const { data: result, error } = await supabase.functions.invoke('accept-invitation', {
        body: {
          token,
          password: data.password,
          first_name: data.firstName,
          last_name: data.lastName,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to accept invitation');
      }

      if (result?.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Welcome to the team!",
        description: "Your account has been created successfully. You can now sign in.",
      });
      
      navigate('/auth/login');
    } catch (error: any) {
      console.error('Accept invitation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to accept invitation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AuthForm title="Loading..." description="Please wait">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AuthForm>
    );
  }

  if (!token || !invitation) {
    return (
      <AuthForm 
        title="Invalid Invitation" 
        description="This invitation link is invalid or has expired"
      >
        <div className="text-center py-8">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            The invitation link you used is no longer valid. Please contact your organization administrator to request a new invitation.
          </p>
          <Button asChild variant="outline">
            <Link to="/auth/login">Go to Login</Link>
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
            <span className="font-medium">{invitation.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Role:</span>
            <Badge variant="secondary" className="capitalize">
              {invitation.role}
            </Badge>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              placeholder="John"
              disabled={isSubmitting}
              {...register("firstName")}
            />
            {errors.firstName && (
              <p className="text-sm text-destructive">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              placeholder="Doe"
              disabled={isSubmitting}
              {...register("lastName")}
            />
            {errors.lastName && (
              <p className="text-sm text-destructive">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Create Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Create a secure password"
            disabled={isSubmitting}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            disabled={isSubmitting}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Account...
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              Complete Setup
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          By accepting this invitation, you agree to our Terms of Service and Privacy Policy.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </AuthForm>
  );
};

export default AcceptInvitationPage;
