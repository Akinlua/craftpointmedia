export type ConversationChannel = 'email' | 'sms';
export type ConversationStatus = 'open' | 'closed' | 'pending';
export type MessageType = 'inbound' | 'outbound';

export interface Conversation {
  id: string;
  contactId: string;
  contactName: string;
  contactAvatar?: string;
  contactCompany?: string;
  channel: ConversationChannel;
  status: ConversationStatus;
  subject?: string; // for email threads
  lastMessage: {
    id: string;
    content: string;
    timestamp: string;
    type: MessageType;
    fromName: string;
  };
  unreadCount: number;
  assignedTo?: {
    id: string;
    name: string;
    avatar?: string;
  };
  tags: string[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  slaDeadline?: string;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
  orgId: string;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  type: MessageType;
  channel: ConversationChannel;
  fromEmail?: string;
  fromPhone?: string;
  fromName: string;
  toEmail?: string;
  toPhone?: string;
  toName?: string;
  timestamp: string;
  isRead: boolean;
  attachments: MessageAttachment[];
  metadata: {
    emailHeaders?: Record<string, string>;
    smsProvider?: string;
    deliveryStatus?: 'sent' | 'delivered' | 'failed' | 'pending';
  };
  scheduledFor?: string;
  createdAt: string;
}

export interface MessageAttachment {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  url: string;
}

export interface ConversationFilters {
  status?: ConversationStatus[];
  channels?: ConversationChannel[];
  assignedTo?: string[];
  tags?: string[];
  unreadOnly?: boolean;
  search?: string;
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface MessageTemplate {
  id: string;
  name: string;
  subject?: string;
  content: string;
  channel: ConversationChannel;
  variables: string[];
  category: string;
  orgId: string;
}

export interface ConversationMerge {
  primaryConversationId: string;
  secondaryConversationId: string;
  reason?: string;
}