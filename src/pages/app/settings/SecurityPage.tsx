import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Shield, 
  Key, 
  Smartphone, 
  Monitor,
  Trash2,
  Plus,
  Copy,
  Check,
  Loader2,
  Eye,
  EyeOff,
  QrCode
} from "lucide-react";
import { settingsApi } from "@/lib/api/settings";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { PasswordChangeRequest } from "@/types/security";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const apiKeySchema = z.object({
  name: z.string().min(1, "API key name is required"),
  permissions: z.array(z.string()).min(1, "At least one permission is required"),
});

type PasswordFormValues = z.infer<typeof passwordSchema>;
type ApiKeyFormValues = z.infer<typeof apiKeySchema>;

const SecurityPage = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorDialogOpen, setTwoFactorDialogOpen] = useState(false);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [deleteOrgDialogOpen, setDeleteOrgDialogOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [copiedApiKey, setCopiedApiKey] = useState<string | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: securitySettings, isLoading } = useQuery({
    queryKey: ['security-settings'],
    queryFn: settingsApi.getSecuritySettings,
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const apiKeyForm = useForm<ApiKeyFormValues>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      name: "",
      permissions: [],
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: settingsApi.changePassword,
    onSuccess: () => {
      toast({
        title: "Password changed",
        description: "Your password has been updated successfully.",
      });
      passwordForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const setup2FAMutation = useMutation({
    mutationFn: settingsApi.setup2FA,
    onSuccess: (data) => {
      // Show QR code and backup codes
      toast({
        title: "2FA Setup",
        description: "Scan the QR code with your authenticator app.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const enable2FAMutation = useMutation({
    mutationFn: settingsApi.enable2FA,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-settings'] });
      toast({
        title: "2FA enabled",
        description: "Two-factor authentication has been enabled successfully.",
      });
      setTwoFactorDialogOpen(false);
      setVerificationCode("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const disable2FAMutation = useMutation({
    mutationFn: (password: string) => settingsApi.disable2FA(password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-settings'] });
      toast({
        title: "2FA disabled",
        description: "Two-factor authentication has been disabled.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createApiKeyMutation = useMutation({
    mutationFn: ({ name, permissions }: { name: string; permissions: string[] }) =>
      settingsApi.createApiKey(name, permissions),
    onSuccess: (apiKey) => {
      queryClient.invalidateQueries({ queryKey: ['security-settings'] });
      toast({
        title: "API key created",
        description: "Your new API key has been generated. Copy it now as it won't be shown again.",
      });
      setApiKeyDialogOpen(false);
      apiKeyForm.reset();
      // Auto-copy the new API key
      navigator.clipboard.writeText(apiKey.key);
      setCopiedApiKey(apiKey.key);
      setTimeout(() => setCopiedApiKey(null), 3000);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const revokeApiKeyMutation = useMutation({
    mutationFn: settingsApi.revokeApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-settings'] });
      toast({
        title: "API key revoked",
        description: "The API key has been revoked successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const revokeSessionMutation = useMutation({
    mutationFn: settingsApi.revokeLoginSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-settings'] });
      toast({
        title: "Session revoked",
        description: "The login session has been revoked successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onPasswordSubmit = (values: PasswordFormValues) => {
    changePasswordMutation.mutate(values as PasswordChangeRequest);
  };

  const onApiKeySubmit = (values: ApiKeyFormValues) => {
    createApiKeyMutation.mutate({ name: values.name!, permissions: values.permissions! });
  };

  const copyToClipboard = async (text: string, keyId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedApiKey(keyId);
      setTimeout(() => setCopiedApiKey(null), 2000);
      toast({
        title: "Copied",
        description: "API key has been copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-display">Security & Privacy</h1>
        <p className="text-muted-foreground mt-1">
          Manage your security settings and protect your account
        </p>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-subtle">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Password</p>
                <p className="text-lg font-semibold">
                  {securitySettings?.passwordLastChanged ? 'Updated' : 'Default'}
                </p>
              </div>
              <Key className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-subtle">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Two-Factor Auth</p>
                <p className="text-lg font-semibold">
                  {securitySettings?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <Smartphone className={`w-8 h-8 ${securitySettings?.twoFactorEnabled ? 'text-success' : 'text-muted-foreground'}`} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-subtle">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Sessions</p>
                <p className="text-lg font-semibold">
                  {securitySettings?.loginSessions?.length || 0}
                </p>
              </div>
              <Monitor className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Change Password */}
      <Card className="card-subtle">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder="Enter current password"
                          {...field} 
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Enter new password"
                            {...field} 
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm new password"
                            {...field} 
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button 
                type="submit" 
                disabled={changePasswordMutation.isPending}
              >
                {changePasswordMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Update Password
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="card-subtle">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  Two-factor authentication is {securitySettings?.twoFactorEnabled ? 'enabled' : 'disabled'}
                </span>
                <Badge variant={securitySettings?.twoFactorEnabled ? 'default' : 'secondary'}>
                  {securitySettings?.twoFactorEnabled ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {securitySettings?.twoFactorEnabled 
                  ? 'Your account is protected with two-factor authentication'
                  : 'Secure your account with an authenticator app'
                }
              </p>
            </div>
            
            <Dialog open={twoFactorDialogOpen} onOpenChange={setTwoFactorDialogOpen}>
              <DialogTrigger asChild>
                <Button variant={securitySettings?.twoFactorEnabled ? "destructive" : "default"}>
                  {securitySettings?.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {securitySettings?.twoFactorEnabled ? 'Disable Two-Factor Authentication' : 'Enable Two-Factor Authentication'}
                  </DialogTitle>
                  <DialogDescription>
                    {securitySettings?.twoFactorEnabled 
                      ? 'Enter your password to disable two-factor authentication'
                      : 'Scan the QR code with your authenticator app and enter the verification code'
                    }
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  {!securitySettings?.twoFactorEnabled && (
                    <>
                      <div className="flex justify-center p-6 bg-muted rounded-lg">
                        <QrCode className="w-32 h-32 text-muted-foreground" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">
                          Secret key (manual entry):
                        </p>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          JBSWY3DPEHPK3PXP
                        </code>
                      </div>
                    </>
                  )}
                  
                  <div>
                    <Label htmlFor="verification-code">
                      {securitySettings?.twoFactorEnabled ? 'Password' : 'Verification Code'}
                    </Label>
                    <Input
                      id="verification-code"
                      type={securitySettings?.twoFactorEnabled ? 'password' : 'text'}
                      placeholder={securitySettings?.twoFactorEnabled ? 'Enter your password' : 'Enter 6-digit code'}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setTwoFactorDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => {
                      if (securitySettings?.twoFactorEnabled) {
                        disable2FAMutation.mutate(verificationCode);
                      } else {
                        enable2FAMutation.mutate(verificationCode);
                      }
                    }}
                    disabled={!verificationCode || enable2FAMutation.isPending || disable2FAMutation.isPending}
                    variant={securitySettings?.twoFactorEnabled ? "destructive" : "default"}
                  >
                    {(enable2FAMutation.isPending || disable2FAMutation.isPending) && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {securitySettings?.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Login Sessions */}
      <Card className="card-subtle">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Active Sessions
          </CardTitle>
          <CardDescription>
            Manage your active login sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {securitySettings?.loginSessions?.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {session.deviceInfo}
                      {session.current && (
                        <Badge variant="default" className="text-xs">Current</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {session.location} • {session.ipAddress}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Last activity: {formatDistanceToNow(new Date(session.lastActivity), { addSuffix: true })}
                    </div>
                  </div>
                </div>
                {!session.current && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => revokeSessionMutation.mutate(session.id)}
                    disabled={revokeSessionMutation.isPending}
                  >
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card className="card-subtle">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                API Keys
              </CardTitle>
              <CardDescription>
                Manage API keys for integrations and automation
              </CardDescription>
            </div>
            <Dialog open={apiKeyDialogOpen} onOpenChange={setApiKeyDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create API Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create API Key</DialogTitle>
                  <DialogDescription>
                    Create a new API key for accessing your CRM data
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...apiKeyForm}>
                  <form onSubmit={apiKeyForm.handleSubmit(onApiKeySubmit)} className="space-y-4">
                    <FormField
                      control={apiKeyForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Key Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Production API, Mobile App" {...field} />
                          </FormControl>
                          <FormDescription>
                            A descriptive name for this API key
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={apiKeyForm.control}
                      name="permissions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Permissions</FormLabel>
                          <div className="space-y-2">
                            {['read', 'write', 'delete'].map((permission) => (
                              <label key={permission} className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={field.value.includes(permission)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      field.onChange([...field.value, permission]);
                                    } else {
                                      field.onChange(field.value.filter(p => p !== permission));
                                    }
                                  }}
                                />
                                <span className="text-sm capitalize">{permission}</span>
                              </label>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setApiKeyDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={createApiKeyMutation.isPending}
                      >
                        {createApiKeyMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Create Key
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {securitySettings?.apiKeys?.map((apiKey) => (
              <div key={apiKey.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{apiKey.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {apiKey.key}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Created: {formatDistanceToNow(new Date(apiKey.createdAt), { addSuffix: true })}
                    {apiKey.lastUsed && (
                      <> • Last used: {formatDistanceToNow(new Date(apiKey.lastUsed), { addSuffix: true })}</>
                    )}
                  </div>
                  <div className="flex gap-1 mt-1">
                    {apiKey.permissions.map((permission) => (
                      <Badge key={permission} variant="outline" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                  >
                    {copiedApiKey === apiKey.id ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => revokeApiKeyMutation.mutate(apiKey.id)}
                    disabled={revokeApiKeyMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {(!securitySettings?.apiKeys || securitySettings.apiKeys.length === 0) && (
              <div className="text-center py-6 text-sm text-muted-foreground">
                No API keys created yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="card-subtle border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border border-destructive rounded-lg">
            <div>
              <h4 className="font-medium text-destructive">Delete Organization</h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete your organization and all associated data. This cannot be undone.
              </p>
            </div>
            <AlertDialog open={deleteOrgDialogOpen} onOpenChange={setDeleteOrgDialogOpen}>
              <Button variant="destructive" onClick={() => setDeleteOrgDialogOpen(true)}>
                Delete Organization
              </Button>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your organization
                    and remove all data including contacts, deals, campaigns, and user accounts.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete Organization
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityPage;