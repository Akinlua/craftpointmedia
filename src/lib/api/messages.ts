import { ENV, API_ENDPOINTS } from '@/lib/config/env';

// Helper to get auth token
const getAuthToken = () => localStorage.getItem('AUTH_TOKEN');

export interface CreateMessagePayload {
    type: 'email' | 'sms';
    content: string;
    recipientId: string;
    subject?: string;
}

export interface Message {
    id: string;
    conversationId: string;
    type: 'email' | 'sms';
    content: string;
    recipientId: string;
    subject?: string;
    status: 'sent' | 'delivered' | 'read' | 'failed';
    createdAt: string;
    updatedAt: string;
}

export const messagesApi = {
    /**
     * Send a new message (Email or SMS) to a contact
     * POST /messages
     */
    async createMessage(payload: CreateMessagePayload): Promise<Message> {
        const token = getAuthToken();
        if (!token) throw new Error('Not authenticated');

        console.log('Creating message:', payload);

        const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.MESSAGES.BASE}`, {
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
            throw new Error(`Failed to send message: ${response.status}`);
        }

        const result = await response.json();
        console.log('Message sent:', result);

        return result.data || result;
    },

    /**
     * Retrieve message details
     * GET /messages/{id}
     */
    async getMessage(id: string): Promise<Message> {
        const token = getAuthToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.MESSAGES.BASE}/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch message: ${response.status}`);
        }

        const result = await response.json();
        return result.data || result;
    },

    /**
     * Update message status (mark as read/unread)
     * PATCH /messages/{id}
     */
    async updateMessageStatus(id: string, status: 'read' | 'unread'): Promise<Message> {
        const token = getAuthToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.MESSAGES.BASE}/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });

        if (!response.ok) {
            throw new Error(`Failed to update message: ${response.status}`);
        }

        const result = await response.json();
        return result.data || result;
    },
};
