import { Contact, ContactFilters, ContactBulkAction, ContactTimeline, LeadStage } from '@/types/contact';
import { ENV, API_ENDPOINTS } from '@/lib/config/env';

// Helper to transform DB contact to frontend Contact type
const transformContact = (dbContact: any): Contact => ({
  id: dbContact.id,
  firstName: dbContact.firstName || dbContact.first_name,
  lastName: dbContact.lastName || dbContact.last_name,
  email: dbContact.email,
  phone: dbContact.phone,
  company: dbContact.company,
  location: dbContact.location,
  status: dbContact.status,
  leadStage: dbContact.leadStage || dbContact.lead_stage,
  leadScore: dbContact.leadScore || dbContact.lead_score,
  tags: dbContact.tags || [],
  ownerId: dbContact.ownerId || dbContact.owner_id,
  ownerName: dbContact.ownerName || (dbContact.owner ? `${dbContact.owner.firstName} ${dbContact.owner.lastName}` : 'Unassigned'),
  avatar: dbContact.avatar || dbContact.avatar_url,
  customFields: dbContact.customFields || dbContact.custom_fields,
  createdAt: dbContact.createdAt || dbContact.created_at,
  updatedAt: dbContact.updatedAt || dbContact.updated_at,
  lastContactAt: dbContact.lastContactAt || dbContact.last_contact_at
});

// Helper to get auth token
const getAuthToken = () => localStorage.getItem('AUTH_TOKEN');

export const contactsApi = {
  // Get contacts with filters and pagination
  getContacts: async (filters?: ContactFilters, page = 1, limit = 25) => {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters?.status?.length) queryParams.append('status', filters.status.join(','));
    if (filters?.tags?.length) queryParams.append('tags', filters.tags.join(','));
    if (filters?.location) queryParams.append('location', filters.location);
    if (filters?.search) queryParams.append('search', filters.search);

    const url = `${ENV.API_BASE_URL}${API_ENDPOINTS.CONTACTS.BASE}?${queryParams.toString()}`;
    console.log('Fetching contacts from:', url);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    console.log('Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`Failed to fetch contacts: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('API Response:', result);

    // Backend returns { success: true, data: { contacts: [...], pagination: {...} } }
    const contactsData = result.data?.contacts || result.data || [];
    const contacts = (Array.isArray(contactsData) ? contactsData : []).map(transformContact);

    const pagination = result.data?.pagination || {};

    return {
      data: contacts,
      total: pagination.total || contacts.length,
      page: pagination.page || page,
      totalPages: pagination.totalPages || Math.ceil((pagination.total || contacts.length) / limit)
    };
  },

  // Get single contact by ID
  getContact: async (id: string): Promise<Contact | null> => {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.CONTACTS.BASE}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Failed to fetch contact');

    const data = await response.json();
    return transformContact(data);
  },

  // Update contact
  updateContact: async (id: string, updates: Partial<Contact>): Promise<Contact> => {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.CONTACTS.BASE}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) throw new Error('Failed to update contact');

    const data = await response.json();
    return transformContact(data);
  },

  // Get contact timeline
  getContactTimeline: async (contactId: string): Promise<ContactTimeline[]> => {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const url = `${ENV.API_BASE_URL}${API_ENDPOINTS.CONTACTS.TIMELINE.replace('{id}', contactId)}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Failed to fetch timeline');

    const data = await response.json();
    return (data || []).map((item: any) => ({
      id: item.id,
      contactId: item.contactId || item.contact_id,
      type: item.type,
      title: item.title,
      description: item.description,
      createdBy: item.createdBy || item.created_by,
      createdByName: item.creator ? `${item.creator.firstName} ${item.creator.lastName}` : 'Unknown',
      createdAt: item.createdAt || item.created_at,
      metadata: item.metadata || {}
    }));
  },

  // Bulk actions
  bulkAction: async (contactIds: string[], action: ContactBulkAction) => {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    // Since backend might not have a single bulk endpoint for all actions, we iterate or use specific endpoints
    // Ideally, the backend should support bulk operations. For now, we'll simulate it or use what's available.
    // The documentation doesn't explicitly show a generic bulk endpoint.

    // We will iterate for now as a safe fallback, or use a bulk endpoint if we assume one exists.
    // Given the "Phase 1" nature, iteration is safer unless we see a bulk endpoint.
    // However, for 'delete', we can try to see if the backend supports multiple IDs or just loop.

    // Implementation note: This is inefficient but safe without explicit bulk API docs.

    const promises = [];

    switch (action.type) {
      case 'add_tag':
        for (const id of contactIds) {
          // Fetch current tags first? Or just append? 
          // Backend PATCH usually replaces. We might need to fetch-then-update or backend handles merge.
          // Assuming backend PATCH merges or we need to be careful.
          // Let's assume we need to fetch first to be safe, matching previous logic.
          promises.push((async () => {
            const contact = await contactsApi.getContact(id);
            if (contact) {
              const tags = contact.tags || [];
              if (!tags.includes(action.data.tag)) {
                await contactsApi.updateContact(id, { tags: [...tags, action.data.tag] });
              }
            }
          })());
        }
        break;

      case 'remove_tag':
        for (const id of contactIds) {
          promises.push((async () => {
            const contact = await contactsApi.getContact(id);
            if (contact) {
              const tags = (contact.tags || []).filter(t => t !== action.data.tag);
              await contactsApi.updateContact(id, { tags });
            }
          })());
        }
        break;

      case 'assign_owner':
        for (const id of contactIds) {
          promises.push(contactsApi.updateContact(id, { ownerId: action.data.ownerId }));
        }
        break;

      case 'delete':
        for (const id of contactIds) {
          promises.push(fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.CONTACTS.BASE}/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          }));
        }
        break;
    }

    await Promise.all(promises);
    return { success: true };
  },

  // Update lead stage
  updateLeadStage: async (id: string, stage: LeadStage) => {
    return contactsApi.updateContact(id, { leadStage: stage });
  },

  // Create contact
  createContact: async (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    console.log('Creating contact with data:', contact);

    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.CONTACTS.BASE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(contact)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Create contact error:', errorText);
      let errorMessage = 'Failed to create contact';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('Contact created:', result);

    // Backend returns { success: true, data: {...} }
    const contactData = result.data || result;
    return transformContact(contactData);
  }
};