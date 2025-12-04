import { Conversation, Message, ConversationFilters, MessageTemplate } from '@/types/conversation';
import { ENV, API_ENDPOINTS } from '@/lib/config/env';

// Helper to get auth token
const getAuthToken = () => localStorage.getItem('AUTH_TOKEN');

// Helper to transform backend conversation to frontend format
const transformConversation = (data: any): Conversation => {
  const contact = data.contact || {};
  const contactName = contact.firstName && contact.lastName
    ? `${contact.firstName} ${contact.lastName}`
    : (data.contactName || data.contact_name || 'Unknown');

  return {
    id: data.id,
    contactId: data.contactId || data.contact_id,
    contactName: contactName,
    contactAvatar: contact.avatar || data.contactAvatar,
    contactCompany: contact.company || data.contactCompany || data.contact_company,
    channel: data.channel,
    status: data.status,
    subject: data.subject,
    lastMessage: data.lastMessage || data.last_message ? {
      id: data.lastMessage?.id || data.last_message?.id,
      content: data.lastMessage?.content || data.last_message?.content,
      timestamp: data.lastMessage?.timestamp || data.last_message?.timestamp,
      type: data.lastMessage?.type || data.last_message?.type,
      fromName: data.lastMessage?.fromName || data.last_message?.from_name,
    } : undefined,
    unreadCount: data.unreadCount || data.unread_count || 0,
    assignedTo: data.assignedTo || data.assigned_to ? {
      id: data.assignedTo?.id || data.assigned_to?.id,
      name: data.assignedTo?.name || data.assigned_to?.name,
      avatar: data.assignedTo?.avatar || data.assigned_to?.avatar,
    } : undefined,
    tags: data.tags || [],
    priority: data.priority,
    slaDeadline: data.slaDeadline || data.sla_deadline,
    isOverdue: data.isOverdue || data.is_overdue || false,
    createdAt: data.createdAt || data.created_at,
    updatedAt: data.updatedAt || data.updated_at,
    orgId: data.orgId || data.org_id || data.organizationId || data.organization_id,
  };
};

// Helper to transform backend message to frontend format
const transformMessage = (data: any): Message => {
  const sender = data.sender || {};
  const recipient = data.recipient || {};

  const fromName = sender.firstName && sender.lastName
    ? `${sender.firstName} ${sender.lastName}`
    : (data.fromName || data.from_name || 'Unknown');

  const toName = recipient.firstName && recipient.lastName
    ? `${recipient.firstName} ${recipient.lastName}`
    : (data.toName || data.to_name || 'Unknown');

  return {
    id: data.id,
    conversationId: data.conversationId || data.conversation_id,
    content: data.content,
    type: data.type,
    channel: data.channel,
    fromEmail: sender.email || data.fromEmail || data.from_email,
    fromName: fromName,
    fromPhone: sender.phone || data.fromPhone || data.from_phone,
    toEmail: recipient.email || data.toEmail || data.to_email,
    toName: toName,
    toPhone: recipient.phone || data.toPhone || data.to_phone,
    timestamp: data.timestamp || data.created_at || data.createdAt,
    isRead: data.isRead || data.is_read || false,
    attachments: data.attachments || [],
    metadata: data.metadata || {},
    createdAt: data.createdAt || data.created_at,
  };
};

/**
 * Fetch conversations with optional filters
 * GET /inbox/conversations
 */
export async function fetchConversations(filters: ConversationFilters = {}): Promise<Conversation[]> {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const queryParams = new URLSearchParams();

  if (filters.channels && filters.channels.length > 0) {
    queryParams.append('channel', filters.channels.join(','));
  }
  if (filters.status && filters.status.length > 0) {
    queryParams.append('status', filters.status.join(','));
  }
  if (filters.unreadOnly) {
    queryParams.append('unreadOnly', 'true');
  }
  if (filters.assignedTo && filters.assignedTo.length > 0) {
    queryParams.append('assignedTo', filters.assignedTo.join(','));
  }
  if (filters.tags && filters.tags.length > 0) {
    queryParams.append('tags', filters.tags.join(','));
  }
  if (filters.search) {
    queryParams.append('search', filters.search);
  }

  const url = `${ENV.API_BASE_URL}${API_ENDPOINTS.INBOX.CONVERSATIONS}?${queryParams.toString()}`;
  console.log('Fetching conversations from:', url);

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Fetch conversations error:', errorText);
    throw new Error(`Failed to fetch conversations: ${response.status}`);
  }

  const result = await response.json();
  console.log('Conversations response:', result);

  const conversationsData = result.data?.conversations || result.data || result;
  return (Array.isArray(conversationsData) ? conversationsData : []).map(transformConversation);
}

/**
 * Fetch single conversation by ID
 * GET /inbox/conversations/{id}
 */
export async function fetchConversation(id: string): Promise<Conversation | null> {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const url = `${ENV.API_BASE_URL}${API_ENDPOINTS.INBOX.CONVERSATION_DETAIL.replace('{id}', id)}`;
  console.log('Fetching conversation from:', url);

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new Error(`Failed to fetch conversation: ${response.status}`);
  }

  const result = await response.json();
  const conversationData = result.data || result;

  return transformConversation(conversationData);
}

/**
 * Fetch messages for a conversation
 * GET /inbox/conversations/{id} - messages are included in conversation detail
 */
export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const url = `${ENV.API_BASE_URL}${API_ENDPOINTS.INBOX.CONVERSATION_DETAIL.replace('{id}', conversationId)}`;
  console.log('Fetching messages from:', url);

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch messages: ${response.status}`);
  }

  const result = await response.json();
  console.log('Messages response:', result);

  const conversationData = result.data || result;
  const messagesData = conversationData.messages || [];

  return (Array.isArray(messagesData) ? messagesData : []).map(transformMessage);
}

/**
 * Create a new message (starts a conversation)
 * POST /messages
 */
export async function createMessage(
  recipientId: string,
  content: string,
  channel: 'email' | 'sms' = 'email',
  subject?: string
): Promise<Message> {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const payload: any = {
    recipientId,
    content,
    type: channel,
    subject: subject || 'New Message', // Default subject if not provided
  };

  const url = `${ENV.API_BASE_URL}${API_ENDPOINTS.MESSAGES.BASE}`;
  console.log('Creating message at:', url, payload);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Create message error:', errorText);
    throw new Error(`Failed to create message: ${response.status}`);
  }

  const result = await response.json();
  console.log('Message created:', result);

  // The API returns { success: true, data: { message: {...}, conversation: {...} } }
  // or sometimes just the message array? Postman shows data: [ { ... } ] for GET /messages
  // But for POST /messages it shows data: { message: {...}, conversation: {...} } (line 8553 is for conversation messages, wait)

  // Let's look at line 7480 again.
  // Response for POST /messages is not explicitly shown in the grep output I saw, 
  // but usually it returns the created message.
  // I'll assume standard format and handle potential variations.

  const data = result.data || result;
  const messageData = data.message || data; // Handle nested message object if present

  return transformMessage(messageData);
}

/**
 * Send a message in a conversation
 * POST /inbox/conversations/{id}/messages
 */
export async function sendMessage(
  conversationId: string,
  content: string,
  channel: 'email' | 'sms',
  scheduledFor?: string
): Promise<Message> {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const payload: any = {
    content,
    channel,
  };

  if (scheduledFor) {
    payload.scheduledFor = scheduledFor;
  }

  const url = `${ENV.API_BASE_URL}${API_ENDPOINTS.INBOX.CONVERSATION_MESSAGES.replace('{id}', conversationId)}`;
  console.log('Sending message to:', url, payload);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Send message error:', errorText);
    throw new Error(`Failed to send message: ${response.status}`);
  }

  const result = await response.json();
  console.log('Message sent:', result);

  const messageData = result.data || result;
  return transformMessage(messageData);
}

/**
 * Mark conversation as read
 * This updates all unread messages in the conversation
 */
export async function markAsRead(conversationId: string): Promise<void> {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  // First, fetch the conversation to get message IDs
  const messages = await fetchMessages(conversationId);

  // Mark each unread message as read
  const unreadMessages = messages.filter(m => m.type === 'inbound' && !m.isRead);

  for (const message of unreadMessages) {
    try {
      await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.MESSAGES.BASE}/${message.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'read' })
      });
    } catch (error) {
      console.error(`Failed to mark message ${message.id} as read:`, error);
    }
  }
}

/**
 * Assign conversation to a team member
 * POST /inbox/conversations/{id}/assign
 */
export async function assignConversation(
  conversationId: string,
  userId: string,
  userName: string
): Promise<void> {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const url = `${ENV.API_BASE_URL}${API_ENDPOINTS.INBOX.ASSIGN.replace('{id}', conversationId)}`;
  console.log('Assigning conversation:', url);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ userId })
  });

  if (!response.ok) {
    throw new Error(`Failed to assign conversation: ${response.status}`);
  }

  console.log('Conversation assigned to:', userName);
}

/**
 * Add tags to a conversation
 * PATCH /inbox/conversations/{id}/tags
 */
export async function addConversationTags(conversationId: string, tags: string[]): Promise<void> {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const url = `${ENV.API_BASE_URL}${API_ENDPOINTS.INBOX.TAGS.replace('{id}', conversationId)}`;
  console.log('Adding tags to conversation:', url, tags);

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ tags, action: 'add' })
  });

  if (!response.ok) {
    throw new Error(`Failed to add tags: ${response.status}`);
  }

  console.log('Tags added successfully');
}

/**
 * Remove tags from a conversation
 * PATCH /inbox/conversations/{id}/tags
 */
export async function removeConversationTags(conversationId: string, tags: string[]): Promise<void> {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const url = `${ENV.API_BASE_URL}${API_ENDPOINTS.INBOX.TAGS.replace('{id}', conversationId)}`;
  console.log('Removing tags from conversation:', url, tags);

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ tags, action: 'remove' })
  });

  if (!response.ok) {
    throw new Error(`Failed to remove tags: ${response.status}`);
  }

  console.log('Tags removed successfully');
}

/**
 * Fetch message templates
 * Uses the existing templates API
 */
export async function fetchMessageTemplates(channel?: 'email' | 'sms'): Promise<MessageTemplate[]> {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const queryParams = new URLSearchParams();
  if (channel) {
    queryParams.append('channel', channel);
  }

  const url = `${ENV.API_BASE_URL}${API_ENDPOINTS.TEMPLATES.BASE}?${queryParams.toString()}`;
  console.log('Fetching message templates from:', url);

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch templates: ${response.status}`);
  }

  const result = await response.json();
  const templatesData = result.data || result;

  // Transform to MessageTemplate format
  return (Array.isArray(templatesData) ? templatesData : []).map((t: any) => ({
    id: t.id,
    name: t.name,
    subject: t.subject,
    content: t.content || t.body,
    channel: t.type || channel || 'email',
    variables: t.variables || [],
    category: t.category,
    orgId: t.orgId || t.org_id || t.organizationId,
  }));
}