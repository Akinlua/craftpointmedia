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
import { authApi } from "@/lib/api/auth";
import { Shield, ArrowLeft } from "lucide-react";

const verify2FASchema = z.object({
  code: z.string().length(6, "Code must be 6 digits").regex(/^\d+$/, "Code must contain only numbers"),
});

type Verify2FAForm = z.infer<typeof verify2FASchema>;

const Verify2FAPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<Verify2FAForm>({
    resolver: zodResolver(verify2FASchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = async (data: Verify2FAForm) => {
    setIsLoading(true);
    try {
      await authApi.verify2FA({ code: data.code });
      toast({
        title: "Verification successful",
        description: "You have been successfully authenticated.",
      });
      navigate("/app/dashboard");
    } catch (error) {
      toast({
        title: "Verification failed",
        description: error instanceof Error ? error.message : "Invalid code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthForm
      title="Two-Factor Authentication"
      description="Enter the 6-digit code from your authenticator app"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary-subtle rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <p className="text-body text-muted-foreground">
            Open your authenticator app and enter the 6-digit code
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="code">Authentication Code</Label>
          <Input
            id="code"
            type="text"
            placeholder="000000"
            className="text-center text-2xl tracking-widest"
            maxLength={6}
            {...form.register("code")}
          />
          {form.formState.errors.code && (
            <p className="text-sm text-destructive">{form.formState.errors.code.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full btn-primary" disabled={isLoading}>
          {isLoading ? "Verifying..." : "Verify Code"}
        </Button>
      </form>

      <div className="mt-6 text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Having trouble? Contact support for assistance.
        </p>
        <Link to="/auth/login" className="text-body text-muted-foreground hover:text-primary inline-flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    </AuthForm>
  );
};

export default Verify2FAPage;