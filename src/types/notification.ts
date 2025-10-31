export interface NotificationPreferences {
  id: string;
  userId: string;
  email: {
    enabled: boolean;
    newLeads: boolean;
    dealUpdates: boolean;
    taskReminders: boolean;
    meetingReminders: boolean;
    invoiceUpdates: boolean;
    teamUpdates: boolean;
    weeklyDigest: boolean;
  };
  sms: {
    enabled: boolean;
    urgentOnly: boolean;
    taskReminders: boolean;
    meetingReminders: boolean;
  };
  inApp: {
    enabled: boolean;
    newLeads: boolean;
    dealUpdates: boolean;
    taskReminders: boolean;
    meetingReminders: boolean;
    invoiceUpdates: boolean;
    teamUpdates: boolean;
  };
  updatedAt: string;
}

export interface NotificationChannel {
  type: 'email' | 'sms' | 'in_app';
  enabled: boolean;
  settings?: Record<string, any>;
}