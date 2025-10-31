import { Message } from '@/types/conversation';

export const mockMessages: Message[] = [
  {
    id: '1',
    conversationId: '1',
    content: 'Hi John, thank you for your interest in our enterprise software solution.',
    type: 'outbound',
    channel: 'email',
    fromEmail: 'alice@company.com',
    fromName: 'Alice Johnson',
    toEmail: 'john@acmecorp.com',
    toName: 'John Smith',
    timestamp: '2024-01-15T10:00:00Z',
    isRead: true,
    attachments: [],
    metadata: {
      deliveryStatus: 'delivered'
    },
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    conversationId: '1',
    content: 'I would like to schedule a demo to see the features in action.',
    type: 'inbound',
    channel: 'email',
    fromEmail: 'john@acmecorp.com',
    fromName: 'John Smith',
    toEmail: 'alice@company.com',
    toName: 'Alice Johnson',
    timestamp: '2024-01-17T14:30:00Z',
    isRead: false,
    attachments: [],
    metadata: {
      deliveryStatus: 'delivered'
    },
    createdAt: '2024-01-17T14:30:00Z'
  },
  {
    id: '3',
    conversationId: '2',
    content: 'Hello Sarah, I understand you need help with marketing automation.',
    type: 'outbound',
    channel: 'sms',
    fromPhone: '+1 (555) 999-0001',
    fromName: 'Bob Wilson',
    toPhone: '+1 (555) 987-6543',
    toName: 'Sarah Johnson',
    timestamp: '2024-01-10T09:00:00Z',
    isRead: true,
    attachments: [],
    metadata: {
      deliveryStatus: 'delivered',
      smsProvider: 'twilio'
    },
    createdAt: '2024-01-10T09:00:00Z'
  },
  {
    id: '4',
    conversationId: '2',
    content: 'Yes, we need to set up automated email campaigns.',
    type: 'inbound',
    channel: 'sms',
    fromPhone: '+1 (555) 987-6543',
    fromName: 'Sarah Johnson',
    toPhone: '+1 (555) 999-0001',
    toName: 'Bob Wilson',
    timestamp: '2024-01-16T11:20:00Z',
    isRead: false,
    attachments: [],
    metadata: {
      deliveryStatus: 'delivered',
      smsProvider: 'twilio'
    },
    createdAt: '2024-01-16T11:20:00Z'
  }
];