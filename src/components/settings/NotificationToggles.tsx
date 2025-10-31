import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Bell, Mail, Smartphone, Monitor } from "lucide-react";
import { NotificationPreferences } from "@/types/notification";
import { settingsApi } from "@/lib/api/settings";
import { useToast } from "@/hooks/use-toast";

interface NotificationTogglesProps {
  preferences: NotificationPreferences;
}

const NotificationToggles = ({ preferences }: NotificationTogglesProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updatePreferences = useMutation({
    mutationFn: (updates: Partial<NotificationPreferences>) =>
      settingsApi.updateNotificationPreferences(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been saved.",
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

  const handleEmailToggle = (field: keyof NotificationPreferences['email'], value: boolean) => {
    updatePreferences.mutate({
      email: {
        ...preferences.email,
        [field]: value,
      },
    });
  };

  const handleSmsToggle = (field: keyof NotificationPreferences['sms'], value: boolean) => {
    updatePreferences.mutate({
      sms: {
        ...preferences.sms,
        [field]: value,
      },
    });
  };

  const handleInAppToggle = (field: keyof NotificationPreferences['inApp'], value: boolean) => {
    updatePreferences.mutate({
      inApp: {
        ...preferences.inApp,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card className="card-subtle">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Receive notifications via email when important events occur
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-enabled" className="font-medium">
              Enable email notifications
            </Label>
            <Switch
              id="email-enabled"
              checked={preferences.email.enabled}
              onCheckedChange={(value) => handleEmailToggle('enabled', value)}
            />
          </div>
          
          {preferences.email.enabled && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">New leads</Label>
                    <p className="text-xs text-muted-foreground">When new leads are added to your CRM</p>
                  </div>
                  <Switch
                    checked={preferences.email.newLeads}
                    onCheckedChange={(value) => handleEmailToggle('newLeads', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Deal updates</Label>
                    <p className="text-xs text-muted-foreground">When deals change status or stage</p>
                  </div>
                  <Switch
                    checked={preferences.email.dealUpdates}
                    onCheckedChange={(value) => handleEmailToggle('dealUpdates', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Task reminders</Label>
                    <p className="text-xs text-muted-foreground">When tasks are due or overdue</p>
                  </div>
                  <Switch
                    checked={preferences.email.taskReminders}
                    onCheckedChange={(value) => handleEmailToggle('taskReminders', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Meeting reminders</Label>
                    <p className="text-xs text-muted-foreground">Before scheduled meetings start</p>
                  </div>
                  <Switch
                    checked={preferences.email.meetingReminders}
                    onCheckedChange={(value) => handleEmailToggle('meetingReminders', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Invoice updates</Label>
                    <p className="text-xs text-muted-foreground">When invoices are paid or overdue</p>
                  </div>
                  <Switch
                    checked={preferences.email.invoiceUpdates}
                    onCheckedChange={(value) => handleEmailToggle('invoiceUpdates', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Team updates</Label>
                    <p className="text-xs text-muted-foreground">When team members are added or removed</p>
                  </div>
                  <Switch
                    checked={preferences.email.teamUpdates}
                    onCheckedChange={(value) => handleEmailToggle('teamUpdates', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Weekly digest</Label>
                    <p className="text-xs text-muted-foreground">Summary of weekly activity and metrics</p>
                  </div>
                  <Switch
                    checked={preferences.email.weeklyDigest}
                    onCheckedChange={(value) => handleEmailToggle('weeklyDigest', value)}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* SMS Notifications */}
      <Card className="card-subtle">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            SMS Notifications
          </CardTitle>
          <CardDescription>
            Receive urgent notifications via SMS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="sms-enabled" className="font-medium">
              Enable SMS notifications
            </Label>
            <Switch
              id="sms-enabled"
              checked={preferences.sms.enabled}
              onCheckedChange={(value) => handleSmsToggle('enabled', value)}
            />
          </div>
          
          {preferences.sms.enabled && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Urgent only</Label>
                    <p className="text-xs text-muted-foreground">Only send SMS for urgent notifications</p>
                  </div>
                  <Switch
                    checked={preferences.sms.urgentOnly}
                    onCheckedChange={(value) => handleSmsToggle('urgentOnly', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Task reminders</Label>
                    <p className="text-xs text-muted-foreground">SMS reminders for overdue tasks</p>
                  </div>
                  <Switch
                    checked={preferences.sms.taskReminders}
                    onCheckedChange={(value) => handleSmsToggle('taskReminders', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Meeting reminders</Label>
                    <p className="text-xs text-muted-foreground">SMS reminders before meetings</p>
                  </div>
                  <Switch
                    checked={preferences.sms.meetingReminders}
                    onCheckedChange={(value) => handleSmsToggle('meetingReminders', value)}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* In-App Notifications */}
      <Card className="card-subtle">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            In-App Notifications
          </CardTitle>
          <CardDescription>
            Show notifications within the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="inapp-enabled" className="font-medium">
              Enable in-app notifications
            </Label>
            <Switch
              id="inapp-enabled"
              checked={preferences.inApp.enabled}
              onCheckedChange={(value) => handleInAppToggle('enabled', value)}
            />
          </div>
          
          {preferences.inApp.enabled && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">New leads</Label>
                  <Switch
                    checked={preferences.inApp.newLeads}
                    onCheckedChange={(value) => handleInAppToggle('newLeads', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Deal updates</Label>
                  <Switch
                    checked={preferences.inApp.dealUpdates}
                    onCheckedChange={(value) => handleInAppToggle('dealUpdates', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Task reminders</Label>
                  <Switch
                    checked={preferences.inApp.taskReminders}
                    onCheckedChange={(value) => handleInAppToggle('taskReminders', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Meeting reminders</Label>
                  <Switch
                    checked={preferences.inApp.meetingReminders}
                    onCheckedChange={(value) => handleInAppToggle('meetingReminders', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Invoice updates</Label>
                  <Switch
                    checked={preferences.inApp.invoiceUpdates}
                    onCheckedChange={(value) => handleInAppToggle('invoiceUpdates', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Team updates</Label>
                  <Switch
                    checked={preferences.inApp.teamUpdates}
                    onCheckedChange={(value) => handleInAppToggle('teamUpdates', value)}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationToggles;