import { Contact, ContactFilters, ContactBulkAction, ContactTimeline } from '@/types/contact';

// Mock data for contacts
const mockContacts: Contact[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john@acmecorp.com',
    phone: '+1 (555) 123-4567',
    company: 'Acme Corp',
    location: 'New York, NY',
    status: 'lead',
    leadStage: 'contacted',
    leadScore: 85,
    tags: ['Hot Lead', 'Enterprise'],
    ownerId: 'user1',
    ownerName: 'Alice Johnson',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-17T14:30:00Z',
    lastContactAt: '2024-01-17T14:30:00Z'
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah@techstart.io',
    phone: '+1 (555) 987-6543',
    company: 'TechStart Inc',
    location: 'San Francisco, CA',
    status: 'customer',
    leadScore: 92,
    tags: ['Customer', 'Tech'],
    ownerId: 'user2',
    ownerName: 'Bob Wilson',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-16T11:20:00Z',
    lastContactAt: '2024-01-16T11:20:00Z'
  },
  {
    id: '3',
    firstName: 'Mike',
    lastName: 'Davis',
    email: 'mike@globaltech.com',
    phone: '+1 (555) 456-7890',
    company: 'Global Tech Solutions',
    location: 'Austin, TX',
    status: 'lead',
    leadStage: 'proposal',
    leadScore: 78,
    tags: ['Prospect', 'VIP'],
    ownerId: 'user1',
    ownerName: 'Alice Johnson',
    createdAt: '2024-01-12T15:30:00Z',
    updatedAt: '2024-01-18T09:45:00Z',
    lastContactAt: '2024-01-18T09:45:00Z'
  },
  {
    id: '4',
    firstName: 'Emily',
    lastName: 'Wilson',
    email: 'emily@innovate.co',
    phone: '+1 (555) 234-5678',
    company: 'Innovate Co',
    location: 'Seattle, WA',
    status: 'lead',
    leadStage: 'new',
    leadScore: 65,
    tags: ['Lead'],
    ownerId: 'user2',
    ownerName: 'Bob Wilson',
    createdAt: '2024-01-14T12:00:00Z',
    updatedAt: '2024-01-14T12:00:00Z',
    lastContactAt: '2024-01-14T12:00:00Z'
  }
];

const mockTimeline: ContactTimeline[] = [
  {
    id: '1',
    contactId: '1',
    type: 'note',
    title: 'Initial contact made',
    description: 'Reached out via email regarding enterprise solution.',
    createdBy: 'user1',
    createdByName: 'Alice Johnson',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    contactId: '1',
    type: 'call',
    title: 'Discovery call scheduled',
    description: '30-minute call to discuss requirements.',
    createdBy: 'user1',
    createdByName: 'Alice Johnson',
    createdAt: '2024-01-17T14:30:00Z'
  }
];

export const contactsApi = {
  // Get contacts with filters and pagination
  getContacts: async (filters?: ContactFilters, page = 1, limit = 25) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filteredContacts = [...mockContacts];
    
    if (filters?.status?.length) {
      filteredContacts = filteredContacts.filter(c => filters.status!.includes(c.status));
    }
    
    if (filters?.tags?.length) {
      filteredContacts = filteredContacts.filter(c => 
        filters.tags!.some(tag => c.tags.includes(tag))
      );
    }
    
    if (filters?.location) {
      filteredContacts = filteredContacts.filter(c => 
        c.location?.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }
    
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filteredContacts = filteredContacts.filter(c => 
        c.firstName.toLowerCase().includes(search) ||
        c.lastName.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        c.company?.toLowerCase().includes(search)
      );
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedContacts = filteredContacts.slice(startIndex, endIndex);
    
    return {
      data: paginatedContacts,
      total: filteredContacts.length,
      page,
      totalPages: Math.ceil(filteredContacts.length / limit)
    };
  },

  // Get single contact by ID
  getContact: async (id: string): Promise<Contact | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockContacts.find(c => c.id === id) || null;
  },

  // Update contact
  updateContact: async (id: string, updates: Partial<Contact>): Promise<Contact> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const contactIndex = mockContacts.findIndex(c => c.id === id);
    if (contactIndex === -1) throw new Error('Contact not found');
    
    mockContacts[contactIndex] = {
      ...mockContacts[contactIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    return mockContacts[contactIndex];
  },

  // Get contact timeline
  getContactTimeline: async (contactId: string): Promise<ContactTimeline[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockTimeline.filter(t => t.contactId === contactId);
  },

  // Bulk actions
  bulkAction: async (contactIds: string[], action: ContactBulkAction) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    switch (action.type) {
      case 'add_tag':
        contactIds.forEach(id => {
          const contact = mockContacts.find(c => c.id === id);
          if (contact && !contact.tags.includes(action.data.tag)) {
            contact.tags.push(action.data.tag);
          }
        });
        break;
      case 'remove_tag':
        contactIds.forEach(id => {
          const contact = mockContacts.find(c => c.id === id);
          if (contact) {
            contact.tags = contact.tags.filter(tag => tag !== action.data.tag);
          }
        });
        break;
      case 'assign_owner':
        contactIds.forEach(id => {
          const contact = mockContacts.find(c => c.id === id);
          if (contact) {
            contact.ownerId = action.data.ownerId;
            contact.ownerName = action.data.ownerName;
          }
        });
        break;
      case 'delete':
        contactIds.forEach(id => {
          const index = mockContacts.findIndex(c => c.id === id);
          if (index !== -1) {
            mockContacts.splice(index, 1);
          }
        });
        break;
    }
    
    return { success: true };
  },

  // Update lead stage
  updateLeadStage: async (id: string, stage: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const contact = mockContacts.find(c => c.id === id);
    if (contact) {
      contact.leadStage = stage as any;
      contact.updatedAt = new Date().toISOString();
    }
    return contact;
  }
};