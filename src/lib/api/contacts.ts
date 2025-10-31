import { Contact, ContactFilters, ContactBulkAction, ContactTimeline } from '@/types/contact';
import { supabase } from '@/integrations/supabase/client';

// Helper to transform DB contact to frontend Contact type
const transformContact = (dbContact: any, ownerProfile?: any): Contact => ({
  id: dbContact.id,
  firstName: dbContact.first_name,
  lastName: dbContact.last_name,
  email: dbContact.email,
  phone: dbContact.phone,
  company: dbContact.company,
  location: dbContact.location,
  status: dbContact.status,
  leadStage: dbContact.lead_stage,
  leadScore: dbContact.lead_score,
  tags: dbContact.tags || [],
  ownerId: dbContact.owner_id,
  ownerName: ownerProfile ? `${ownerProfile.first_name} ${ownerProfile.last_name}` : 'Unassigned',
  avatar: dbContact.avatar_url,
  customFields: dbContact.custom_fields,
  createdAt: dbContact.created_at,
  updatedAt: dbContact.updated_at,
  lastContactAt: dbContact.last_contact_at
});

// Helper to transform Contact to DB format
const transformToDb = (contact: Partial<Contact>) => ({
  first_name: contact.firstName,
  last_name: contact.lastName,
  email: contact.email,
  phone: contact.phone,
  company: contact.company,
  location: contact.location,
  status: contact.status,
  lead_stage: contact.leadStage,
  lead_score: contact.leadScore,
  tags: contact.tags,
  owner_id: contact.ownerId,
  avatar_url: contact.avatar,
  custom_fields: contact.customFields,
  last_contact_at: contact.lastContactAt
});

export const contactsApi = {
  // Get contacts with filters and pagination
  getContacts: async (filters?: ContactFilters, page = 1, limit = 25) => {
    let query = supabase
      .from('contacts')
      .select('*, owner:profiles!owner_id(first_name, last_name)', { count: 'exact' });
    
    // Apply filters
    if (filters?.status?.length) {
      query = query.in('status', filters.status);
    }
    
    if (filters?.tags?.length) {
      query = query.overlaps('tags', filters.tags);
    }
    
    if (filters?.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }
    
    if (filters?.search) {
      const search = `%${filters.search}%`;
      query = query.or(`first_name.ilike.${search},last_name.ilike.${search},email.ilike.${search},company.ilike.${search}`);
    }
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    query = query.range(startIndex, startIndex + limit - 1).order('created_at', { ascending: false });
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    const contacts = (data || []).map(contact => transformContact(contact, contact.owner));
    
    return {
      data: contacts,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit)
    };
  },

  // Get single contact by ID
  getContact: async (id: string): Promise<Contact | null> => {
    const { data, error } = await supabase
      .from('contacts')
      .select('*, owner:profiles!owner_id(first_name, last_name)')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    if (!data) return null;
    
    return transformContact(data, data.owner);
  },

  // Update contact
  updateContact: async (id: string, updates: Partial<Contact>): Promise<Contact> => {
    const dbUpdates = transformToDb(updates);
    
    const { data, error } = await supabase
      .from('contacts')
      .update(dbUpdates)
      .eq('id', id)
      .select('*, owner:profiles!owner_id(first_name, last_name)')
      .single();
    
    if (error) throw error;
    
    return transformContact(data, data.owner);
  },

  // Get contact timeline
  getContactTimeline: async (contactId: string): Promise<ContactTimeline[]> => {
    const { data, error } = await supabase
      .from('contact_timeline')
      .select('*, creator:profiles!created_by(first_name, last_name)')
      .eq('contact_id', contactId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      contactId: item.contact_id,
      type: item.type as any,
      title: item.title,
      description: item.description,
      createdBy: item.created_by,
      createdByName: item.creator ? `${item.creator.first_name} ${item.creator.last_name}` : 'Unknown',
      createdAt: item.created_at,
      metadata: (item.metadata || {}) as Record<string, any>
    }));
  },

  // Bulk actions
  bulkAction: async (contactIds: string[], action: ContactBulkAction) => {
    switch (action.type) {
      case 'add_tag':
        for (const id of contactIds) {
          const { data: contact } = await supabase
            .from('contacts')
            .select('tags')
            .eq('id', id)
            .single();
          
          if (contact) {
            const tags = contact.tags || [];
            if (!tags.includes(action.data.tag)) {
              await supabase
                .from('contacts')
                .update({ tags: [...tags, action.data.tag] })
                .eq('id', id);
            }
          }
        }
        break;
        
      case 'remove_tag':
        for (const id of contactIds) {
          const { data: contact } = await supabase
            .from('contacts')
            .select('tags')
            .eq('id', id)
            .single();
          
          if (contact) {
            const tags = (contact.tags || []).filter(tag => tag !== action.data.tag);
            await supabase
              .from('contacts')
              .update({ tags })
              .eq('id', id);
          }
        }
        break;
        
      case 'assign_owner':
        await supabase
          .from('contacts')
          .update({ owner_id: action.data.ownerId })
          .in('id', contactIds);
        break;
        
      case 'delete':
        const { error } = await supabase
          .from('contacts')
          .delete()
          .in('id', contactIds);
        
        if (error) throw error;
        break;
    }
    
    return { success: true };
  },

  // Update lead stage
  updateLeadStage: async (id: string, stage: string) => {
    const { data, error } = await supabase
      .from('contacts')
      .update({ lead_stage: stage })
      .eq('id', id)
      .select('*, owner:profiles!owner_id(first_name, last_name)')
      .single();
    
    if (error) throw error;
    
    return transformContact(data, data.owner);
  },

  // Create contact
  createContact: async (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) throw new Error('Not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('org_id')
      .eq('id', session.session.user.id)
      .single();

    if (!profile) throw new Error('Profile not found');

    const dbContact = {
      ...transformToDb(contact),
      org_id: profile.org_id
    };

    const { data, error } = await supabase
      .from('contacts')
      .insert(dbContact)
      .select('*, owner:profiles!owner_id(first_name, last_name)')
      .single();

    if (error) throw error;

    return transformContact(data, data.owner);
  }
};