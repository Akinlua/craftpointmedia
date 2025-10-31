import { Conversation } from '@/types/conversation';

export const mockConversations: Conversation[] = [
  {
    id: '1',
    contactId: '1',
    contactName: 'John Smith',
    contactAvatar: 'JS',
    contactCompany: 'Acme Corp',
    channel: 'email',
    status: 'open',
    subject: 'Enterprise Software Discussion',
    lastMessage: {
      id: '2',
      content: 'I would like to schedule a demo to see the features in action.',
      timestamp: '2024-01-17T14:30:00Z',
      type: 'inbound',
      fromName: 'John Smith'
    },
    unreadCount: 2,
    assignedTo: {
      id: 'user1',
      name: 'Alice Johnson',
      avatar: 'AJ'
    },
    tags: ['enterprise', 'software'],
    priority: 'high',
    isOverdue: false,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-17T14:30:00Z',
    orgId: 'org1'
  },
  {
    id: '2',
    contactId: '2',
    contactName: 'Sarah Johnson',
    contactAvatar: 'SJ',
    contactCompany: 'TechStart Inc',
    channel: 'sms',
    status: 'open',
    subject: 'Marketing Automation Inquiry',
    lastMessage: {
      id: '4',
      content: 'Yes, we need to set up automated email campaigns.',
      timestamp: '2024-01-16T11:20:00Z',
      type: 'inbound',
      fromName: 'Sarah Johnson'
    },
    unreadCount: 1,
    assignedTo: {
      id: 'user2',
      name: 'Bob Wilson',
      avatar: 'BW'
    },
    tags: ['marketing', 'automation'],
    priority: 'normal',
    isOverdue: false,
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-16T11:20:00Z',
    orgId: 'org1'
  }
];