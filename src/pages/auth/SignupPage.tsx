import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthForm } from "@/components/auth/AuthForm";
import { Shield, UserPlus, ArrowRight } from "lucide-react";

const SignupPage = () => {

  return (
    <AuthForm
      title="Restricted Access"
      description="New users cannot self-signup. Accounts must be invited by an Owner or Manager."
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-secondary" />
        </div>
        <div className="space-y-4">
          <p className="text-body text-muted-foreground">
            This CRM system uses an invite-only approach to ensure security and controlled access.
          </p>
          
          <div className="bg-muted/50 rounded-lg p-4 text-left">
            <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              How to get access:
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Ask your team Owner or Manager to send you an invitation</li>
              <li>• Check your email for an invitation link</li>
              <li>• Click the link to set up your account</li>
            </ul>
          </div>
        </div>
      </div>

      <Button asChild className="w-full btn-primary">
        <Link to="/auth/accept-invitation">
          <UserPlus className="w-4 h-4 mr-2" />
          Accept Invitation
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </Button>

      <div className="mt-6 text-center">
        <p className="text-body text-muted-foreground">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </AuthForm>
  );
};

export default SignupPage;