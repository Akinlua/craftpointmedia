import { Conversation, Message, ConversationFilters, MessageTemplate, ConversationMerge } from '@/types/conversation';

// Mock data for development
const mockConversations: Conversation[] = [
  {
    id: '1',
    contactId: 'c1',
    contactName: 'John Smith',
    contactCompany: 'Acme Corp',
    channel: 'email',
    status: 'open',
    subject: 'Enterprise Software Proposal',
    lastMessage: {
      id: 'm1',
      content: 'Thanks for the detailed proposal. I have a few questions about the implementation timeline...',
      timestamp: '2024-01-15T14:30:00Z',
      type: 'inbound',
      fromName: 'John Smith',
    },
    unreadCount: 1,
    assignedTo: {
      id: 'u1',
      name: 'Sarah Johnson',
      avatar: '/avatars/sarah.jpg',
    },
    tags: ['enterprise', 'high-value'],
    priority: 'high',
    slaDeadline: '2024-01-15T16:30:00Z',
    isOverdue: false,
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
    orgId: 'org1',
  },
  {
    id: '2',
    contactId: 'c2',
    contactName: 'Emily Wilson',
    contactCompany: 'TechStart Inc',
    channel: 'sms',
    status: 'open',
    lastMessage: {
      id: 'm2',
      content: 'Hi! Just wanted to follow up on our conversation yesterday. Are you free for a quick call this afternoon?',
      timestamp: '2024-01-15T13:45:00Z',
      type: 'inbound',
      fromName: 'Emily Wilson',
    },
    unreadCount: 2,
    tags: ['follow-up'],
    priority: 'normal',
    slaDeadline: '2024-01-15T17:45:00Z',
    isOverdue: false,
    createdAt: '2024-01-14T11:00:00Z',
    updatedAt: '2024-01-15T13:45:00Z',
    orgId: 'org1',
  },
  {
    id: '3',
    contactId: 'c3',
    contactName: 'Mike Davis',
    contactCompany: 'Global Tech',
    channel: 'email',
    status: 'pending',
    subject: 'Contract Review Feedback',
    lastMessage: {
      id: 'm3',
      content: 'I\'ve reviewed the contract and everything looks good. Just need to check with legal on a few clauses...',
      timestamp: '2024-01-15T12:00:00Z',
      type: 'outbound',
      fromName: 'You',
    },
    unreadCount: 0,
    assignedTo: {
      id: 'u2',
      name: 'Alex Chen',
      avatar: '/avatars/alex.jpg',
    },
    tags: ['contract', 'legal'],
    priority: 'normal',
    isOverdue: false,
    createdAt: '2024-01-12T08:30:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
    orgId: 'org1',
  },
];

const mockMessages: Record<string, Message[]> = {
  '1': [
    {
      id: 'm1-1',
      conversationId: '1',
      content: 'Hi John, thank you for your interest in our enterprise solution. I\'ve prepared a detailed proposal that covers all your requirements.',
      type: 'outbound',
      channel: 'email',
      fromEmail: 'sarah@company.com',
      fromName: 'Sarah Johnson',
      toEmail: 'john@acmecorp.com',
      toName: 'John Smith',
      timestamp: '2024-01-10T10:00:00Z',
      isRead: true,
      attachments: [
        {
          id: 'att1',
          name: 'Enterprise_Proposal_v2.pdf',
          size: 2048576,
          mimeType: 'application/pdf',
          url: '/attachments/proposal.pdf',
        },
      ],
      metadata: {
        emailHeaders: {
          'message-id': '<msg123@company.com>',
          'in-reply-to': '<original@acmecorp.com>',
        },
        deliveryStatus: 'delivered',
      },
      createdAt: '2024-01-10T10:00:00Z',
    },
    {
      id: 'm1-2',
      conversationId: '1',
      content: 'Thanks for the detailed proposal. I have a few questions about the implementation timeline and the pricing structure. Can we schedule a call this week?',
      type: 'inbound',
      channel: 'email',
      fromEmail: 'john@acmecorp.com',
      fromName: 'John Smith',
      toEmail: 'sarah@company.com',
      toName: 'Sarah Johnson',
      timestamp: '2024-01-15T14:30:00Z',
      isRead: false,
      attachments: [],
      metadata: {
        emailHeaders: {
          'message-id': '<reply456@acmecorp.com>',
        },
        deliveryStatus: 'delivered',
      },
      createdAt: '2024-01-15T14:30:00Z',
    },
  ],
  '2': [
    {
      id: 'm2-1',
      conversationId: '2',
      content: 'Hi Emily! Great meeting you at the conference. Let\'s continue our discussion about your CRM needs.',
      type: 'outbound',
      channel: 'sms',
      fromPhone: '+1-555-123-4567',
      fromName: 'You',
      toPhone: '+1-555-987-6543',
      toName: 'Emily Wilson',
      timestamp: '2024-01-14T11:30:00Z',
      isRead: true,
      attachments: [],
      metadata: {
        smsProvider: 'twilio',
        deliveryStatus: 'delivered',
      },
      createdAt: '2024-01-14T11:30:00Z',
    },
    {
      id: 'm2-2',
      conversationId: '2',
      content: 'Hi! Just wanted to follow up on our conversation yesterday. Are you free for a quick call this afternoon?',
      type: 'inbound',
      channel: 'sms',
      fromPhone: '+1-555-987-6543',
      fromName: 'Emily Wilson',
      toPhone: '+1-555-123-4567',
      toName: 'You',
      timestamp: '2024-01-15T13:45:00Z',
      isRead: false,
      attachments: [],
      metadata: {
        smsProvider: 'twilio',
        deliveryStatus: 'delivered',
      },
      createdAt: '2024-01-15T13:45:00Z',
    },
  ],
};

const mockTemplates: MessageTemplate[] = [
  {
    id: 't1',
    name: 'Welcome Email',
    subject: 'Welcome to {{company.name}}!',
    content: 'Hi {{contact.firstName}},\n\nWelcome to our platform! We\'re excited to help you grow your business.\n\nBest regards,\n{{user.name}}',
    channel: 'email',
    variables: ['contact.firstName', 'company.name', 'user.name'],
    category: 'onboarding',
    orgId: 'org1',
  },
  {
    id: 't2',
    name: 'Follow-up SMS',
    content: 'Hi {{contact.firstName}}, just following up on our conversation. Let me know if you have any questions!',
    channel: 'sms',
    variables: ['contact.firstName'],
    category: 'follow-up',
    orgId: 'org1',
  },
];

export async function fetchConversations(filters: ConversationFilters = {}): Promise<Conversation[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let filtered = [...mockConversations];
  
  if (filters.channels && filters.channels.length > 0) {
    filtered = filtered.filter(c => filters.channels!.includes(c.channel));
  }
  
  if (filters.status && filters.status.length > 0) {
    filtered = filtered.filter(c => filters.status!.includes(c.status));
  }
  
  if (filters.unreadOnly) {
    filtered = filtered.filter(c => c.unreadCount > 0);
  }
  
  if (filters.assignedTo && filters.assignedTo.length > 0) {
    filtered = filtered.filter(c => 
      c.assignedTo && filters.assignedTo!.includes(c.assignedTo.id)
    );
  }
  
  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter(c => 
      c.tags.some(tag => filters.tags!.includes(tag))
    );
  }
  
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filtered = filtered.filter(c => 
      c.contactName.toLowerCase().includes(searchTerm) ||
      c.lastMessage.content.toLowerCase().includes(searchTerm) ||
      (c.subject && c.subject.toLowerCase().includes(searchTerm))
    );
  }
  
  // Sort by most recent activity
  return filtered.sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export async function fetchConversation(id: string): Promise<Conversation | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockConversations.find(c => c.id === id) || null;
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  await new Promise(resolve => setTimeout(resolve, 400));
  return mockMessages[conversationId] || [];
}

export async function sendMessage(
  conversationId: string, 
  content: string, 
  channel: 'email' | 'sms',
  scheduledFor?: string
): Promise<Message> {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const newMessage: Message = {
    id: `m${Date.now()}`,
    conversationId,
    content,
    type: 'outbound',
    channel,
    fromName: 'You',
    timestamp: scheduledFor || new Date().toISOString(),
    isRead: true,
    attachments: [],
    metadata: {
      deliveryStatus: 'sent',
    },
    createdAt: new Date().toISOString(),
  };
  
  // Add to mock data
  if (!mockMessages[conversationId]) {
    mockMessages[conversationId] = [];
  }
  mockMessages[conversationId].push(newMessage);
  
  // Update conversation's last message
  const conversation = mockConversations.find(c => c.id === conversationId);
  if (conversation) {
    conversation.lastMessage = {
      id: newMessage.id,
      content: newMessage.content,
      timestamp: newMessage.timestamp,
      type: newMessage.type,
      fromName: newMessage.fromName,
    };
    conversation.updatedAt = new Date().toISOString();
  }
  
  return newMessage;
}

export async function markAsRead(conversationId: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const conversation = mockConversations.find(c => c.id === conversationId);
  if (conversation) {
    conversation.unreadCount = 0;
  }
  
  // Mark all messages as read
  const messages = mockMessages[conversationId] || [];
  messages.forEach(message => {
    if (message.type === 'inbound') {
      message.isRead = true;
    }
  });
}

export async function assignConversation(conversationId: string, userId: string, userName: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const conversation = mockConversations.find(c => c.id === conversationId);
  if (conversation) {
    conversation.assignedTo = {
      id: userId,
      name: userName,
    };
  }
}

export async function addConversationTags(conversationId: string, tags: string[]): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const conversation = mockConversations.find(c => c.id === conversationId);
  if (conversation) {
    conversation.tags = [...new Set([...conversation.tags, ...tags])];
  }
}

export async function removeConversationTags(conversationId: string, tags: string[]): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const conversation = mockConversations.find(c => c.id === conversationId);
  if (conversation) {
    conversation.tags = conversation.tags.filter(tag => !tags.includes(tag));
  }
}

export async function mergeConversations(merge: ConversationMerge): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real implementation, this would merge messages and update database
  const primaryIndex = mockConversations.findIndex(c => c.id === merge.primaryConversationId);
  const secondaryIndex = mockConversations.findIndex(c => c.id === merge.secondaryConversationId);
  
  if (primaryIndex !== -1 && secondaryIndex !== -1) {
    // Merge messages
    const primaryMessages = mockMessages[merge.primaryConversationId] || [];
    const secondaryMessages = mockMessages[merge.secondaryConversationId] || [];
    mockMessages[merge.primaryConversationId] = [...primaryMessages, ...secondaryMessages]
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    // Remove secondary conversation
    mockConversations.splice(secondaryIndex, 1);
    delete mockMessages[merge.secondaryConversationId];
  }
}

export async function fetchMessageTemplates(channel?: 'email' | 'sms'): Promise<MessageTemplate[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  if (channel) {
    return mockTemplates.filter(t => t.channel === channel);
  }
  
  return mockTemplates;
}