import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Mail, Smartphone, Monitor, Settings } from "lucide-react";
import { settingsApi } from "@/lib/api/settings";
import NotificationToggles from "@/components/settings/NotificationToggles";

const NotificationsPage = () => {
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: settingsApi.getNotificationPreferences,
  });

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
            <Skeleton className="h-4 w-80" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-display">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            Manage your notification preferences
          </p>
        </div>
        <Card className="card-subtle">
          <CardContent className="p-6 text-center">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No notification preferences found</h3>
            <p className="text-sm text-muted-foreground">
              Unable to load your notification settings. Please try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getChannelStats = () => {
    let enabledChannels = 0;
    let totalNotifications = 0;

    if (preferences.email.enabled) {
      enabledChannels++;
      totalNotifications += Object.values(preferences.email).filter(Boolean).length - 1; // -1 for enabled flag
    }
    
    if (preferences.sms.enabled) {
      enabledChannels++;
      totalNotifications += Object.values(preferences.sms).filter(Boolean).length - 1;
    }
    
    if (preferences.inApp.enabled) {
      enabledChannels++;
      totalNotifications += Object.values(preferences.inApp).filter(Boolean).length - 1;
    }

    return { enabledChannels, totalNotifications };
  };

  const stats = getChannelStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-display">Notification Preferences</h1>
        <p className="text-muted-foreground mt-1">
          Choose how and when you want to be notified about important events
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-subtle">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Channels</p>
                <p className="text-2xl font-bold">{stats.enabledChannels}</p>
              </div>
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-subtle">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Email Notifications</p>
                <p className="text-2xl font-bold">
                  {preferences.email.enabled ? 'On' : 'Off'}
                </p>
              </div>
              <Mail className={`w-8 h-8 ${preferences.email.enabled ? 'text-success' : 'text-muted-foreground'}`} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-subtle">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">SMS Notifications</p>
                <p className="text-2xl font-bold">
                  {preferences.sms.enabled ? 'On' : 'Off'}
                </p>
              </div>
              <Smartphone className={`w-8 h-8 ${preferences.sms.enabled ? 'text-success' : 'text-muted-foreground'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification Settings */}
      <NotificationToggles preferences={preferences} />

      {/* Notification Schedule */}
      <Card className="card-subtle">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Notification Schedule
          </CardTitle>
          <CardDescription>
            Control when you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Quiet Hours</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Pause non-urgent notifications during these hours
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Start Time</label>
                  <select className="w-full mt-1 p-2 border rounded-md">
                    <option>10:00 PM</option>
                    <option>11:00 PM</option>
                    <option>12:00 AM</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">End Time</label>
                  <select className="w-full mt-1 p-2 border rounded-md">
                    <option>7:00 AM</option>
                    <option>8:00 AM</option>
                    <option>9:00 AM</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Weekend Notifications</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Choose whether to receive notifications on weekends
              </p>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm">Saturday</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Sunday</span>
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Examples */}
      <Card className="card-subtle">
        <CardHeader>
          <CardTitle>Notification Examples</CardTitle>
          <CardDescription>
            Preview how different notifications will appear
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Email Example */}
            <div className="border rounded-lg p-4 bg-background">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">New Lead Added</h4>
                    <span className="text-xs text-muted-foreground">2 minutes ago</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    John Smith from Acme Corp has been added to your leads pipeline
                  </p>
                </div>
              </div>
            </div>

            {/* SMS Example */}
            <div className="border rounded-lg p-4 bg-background">
              <div className="flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-success mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Task Due Reminder</h4>
                    <span className="text-xs text-muted-foreground">5 minutes ago</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    "Follow up with Sarah Johnson" is due in 15 minutes
                  </p>
                </div>
              </div>
            </div>

            {/* In-App Example */}
            <div className="border rounded-lg p-4 bg-background">
              <div className="flex items-start gap-3">
                <Monitor className="w-5 h-5 text-warning mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Deal Stage Changed</h4>
                    <span className="text-xs text-muted-foreground">1 hour ago</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    "Website Redesign Project" moved to "Proposal Sent" stage
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage;