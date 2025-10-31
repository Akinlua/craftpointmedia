import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthForm } from "@/components/auth/AuthForm";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/api/auth";
import { Mail, ArrowLeft } from "lucide-react";

const resetSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ResetForm = z.infer<typeof resetSchema>;

const ResetPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const form = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ResetForm) => {
    setIsLoading(true);
    try {
      await authApi.resetPassword({ email: data.email });
      setEmailSent(true);
      toast({
        title: "Reset email sent",
        description: "Check your email for password reset instructions.",
      });
    } catch (error) {
      toast({
        title: "Reset failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <AuthForm
        title="Check your email"
        description="We've sent password reset instructions to your email"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary-subtle rounded-full flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <p className="text-body text-muted-foreground">
            If an account with that email exists, you'll receive reset instructions shortly.
          </p>
          <Button asChild className="w-full" variant="outline">
            <Link to="/auth/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to sign in
            </Link>
          </Button>
        </div>
      </AuthForm>
    );
  }

  return (
    <AuthForm
      title="Reset your password"
      description="Enter your email address and we'll send you reset instructions"
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

        <Button type="submit" className="w-full btn-primary" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send reset instructions"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link to="/auth/login" className="text-body text-muted-foreground hover:text-primary inline-flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    </AuthForm>
  );
};

export default ResetPasswordPage;