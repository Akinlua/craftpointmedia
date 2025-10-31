import { Deal, DealStageConfig, DealFilters, DealBulkAction, DealActivity, DealNote } from '@/types/deal';
import { supabase } from '@/integrations/supabase/client';

// Deal stages configuration
export const dealStages: DealStageConfig[] = [
  { id: 'new', name: 'New', type: 'new', color: 'bg-blue-500', order: 1 },
  { id: 'contacted', name: 'Contacted', type: 'contacted', color: 'bg-yellow-500', order: 2 },
  { id: 'proposal', name: 'Proposal', type: 'proposal', color: 'bg-purple-500', order: 3 },
  { id: 'closed_won', name: 'Closed Won', type: 'closed_won', color: 'bg-green-500', order: 4 },
  { id: 'closed_lost', name: 'Closed Lost', type: 'closed_lost', color: 'bg-red-500', order: 5 }
];

// Helper to transform DB deal to frontend Deal type
const transformDeal = (dbDeal: any, ownerProfile?: any, contacts?: any[]): Deal => ({
  id: dbDeal.id,
  title: dbDeal.title,
  value: parseFloat(dbDeal.value) || 0,
  currency: dbDeal.currency,
  stage: dbDeal.stage,
  stageId: dbDeal.stage,
  probability: dbDeal.probability,
  ownerId: dbDeal.owner_id,
  ownerName: ownerProfile ? `${ownerProfile.first_name} ${ownerProfile.last_name}` : 'Unassigned',
  ownerAvatar: ownerProfile?.avatar_url,
  contactIds: contacts?.map(c => c.id) || [],
  contacts: contacts?.map(c => ({
    id: c.id,
    name: `${c.first_name} ${c.last_name}`,
    avatar: c.avatar_url
  })) || [],
  closeDate: dbDeal.close_date,
  createdAt: dbDeal.created_at,
  updatedAt: dbDeal.updated_at,
  lastActivityAt: dbDeal.last_activity_at,
  description: dbDeal.description,
  customFields: dbDeal.custom_fields
});

// Helper to transform Deal to DB format
const transformToDb = (deal: Partial<Deal>) => ({
  title: deal.title,
  value: deal.value,
  currency: deal.currency,
  stage: deal.stage,
  probability: deal.probability,
  owner_id: deal.ownerId,
  close_date: deal.closeDate,
  description: deal.description,
  custom_fields: deal.customFields,
  last_activity_at: deal.lastActivityAt
});

export const dealsApi = {
  // Get deals with filters
  getDeals: async (filters?: DealFilters, page = 1, limit = 100): Promise<{ data: Deal[], total: number }> => {
    let query = supabase
      .from('deals')
      .select(`
        *,
        owner:profiles!owner_id(first_name, last_name, avatar_url),
        deal_contacts(
          contact:contacts(id, first_name, last_name, avatar_url)
        )
      `, { count: 'exact' });

    // Apply filters
    if (filters?.stage?.length) {
      query = query.in('stage', filters.stage);
    }

    if (filters?.owner?.length) {
      query = query.in('owner_id', filters.owner);
    }

    if (filters?.valueRange) {
      query = query.gte('value', filters.valueRange.min).lte('value', filters.valueRange.max);
    }

    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    query = query.range(startIndex, startIndex + limit - 1).order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) throw error;

    const deals = (data || []).map(deal => {
      const contacts = deal.deal_contacts?.map((dc: any) => dc.contact).filter(Boolean) || [];
      return transformDeal(deal, deal.owner, contacts);
    });

    return {
      data: deals,
      total: count || 0
    };
  },

  // Get deals grouped by stage for board view
  getDealsByStage: async (filters?: DealFilters): Promise<Record<string, Deal[]>> => {
    const { data: deals } = await dealsApi.getDeals(filters, 1, 1000);
    
    const dealsByStage: Record<string, Deal[]> = {};
    dealStages.forEach(stage => {
      dealsByStage[stage.id] = deals.filter(deal => deal.stageId === stage.id);
    });
    
    return dealsByStage;
  },

  // Get single deal by ID
  getDeal: async (id: string): Promise<Deal | null> => {
    const { data, error } = await supabase
      .from('deals')
      .select(`
        *,
        owner:profiles!owner_id(first_name, last_name, avatar_url),
        deal_contacts(
          contact:contacts(id, first_name, last_name, avatar_url)
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const contacts = data.deal_contacts?.map((dc: any) => dc.contact).filter(Boolean) || [];
    return transformDeal(data, data.owner, contacts);
  },

  // Create deal
  createDeal: async (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) throw new Error('Not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('org_id')
      .eq('id', session.session.user.id)
      .single();

    if (!profile) throw new Error('Profile not found');

    const dbDeal = {
      ...transformToDb(deal),
      org_id: profile.org_id
    };

    const { data, error } = await supabase
      .from('deals')
      .insert(dbDeal)
      .select(`
        *,
        owner:profiles!owner_id(first_name, last_name, avatar_url)
      `)
      .single();

    if (error) throw error;

    // Add deal contacts if provided
    if (deal.contactIds?.length) {
      const dealContacts = deal.contactIds.map(contactId => ({
        deal_id: data.id,
        contact_id: contactId
      }));

      await supabase.from('deal_contacts').insert(dealContacts);
    }

    return transformDeal(data, data.owner, []);
  },

  // Update deal
  updateDeal: async (id: string, updates: Partial<Deal>): Promise<Deal> => {
    const dbUpdates = transformToDb(updates);

    const { data, error } = await supabase
      .from('deals')
      .update(dbUpdates)
      .eq('id', id)
      .select(`
        *,
        owner:profiles!owner_id(first_name, last_name, avatar_url),
        deal_contacts(
          contact:contacts(id, first_name, last_name, avatar_url)
        )
      `)
      .single();

    if (error) throw error;

    const contacts = data.deal_contacts?.map((dc: any) => dc.contact).filter(Boolean) || [];
    return transformDeal(data, data.owner, contacts);
  },

  // Update deal stage (for drag-and-drop)
  updateDealStage: async (id: string, stageId: string): Promise<Deal> => {
    const stage = dealStages.find(s => s.id === stageId);
    if (!stage) throw new Error('Stage not found');

    const { data, error } = await supabase
      .from('deals')
      .update({ 
        stage: stageId,
        last_activity_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        owner:profiles!owner_id(first_name, last_name, avatar_url),
        deal_contacts(
          contact:contacts(id, first_name, last_name, avatar_url)
        )
      `)
      .single();

    if (error) throw error;

    const contacts = data.deal_contacts?.map((dc: any) => dc.contact).filter(Boolean) || [];
    return transformDeal(data, data.owner, contacts);
  },

  // Get deal activities
  getDealActivities: async (dealId: string): Promise<DealActivity[]> => {
    const { data, error } = await supabase
      .from('deal_activities')
      .select('*, creator:profiles!created_by(first_name, last_name)')
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(item => ({
      id: item.id,
      dealId: item.deal_id,
      type: item.type as any,
      title: item.title,
      description: item.description,
      createdBy: item.created_by,
      createdByName: item.creator ? `${item.creator.first_name} ${item.creator.last_name}` : 'Unknown',
      createdAt: item.created_at,
      metadata: (item.metadata || {}) as Record<string, any>
    }));
  },

  // Get deal notes (notes are a subset of activities)
  getDealNotes: async (dealId: string): Promise<DealNote[]> => {
    const { data, error } = await supabase
      .from('deal_activities')
      .select('*, creator:profiles!created_by(first_name, last_name)')
      .eq('deal_id', dealId)
      .eq('type', 'note')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(item => ({
      id: item.id,
      dealId: item.deal_id,
      content: item.description || '',
      createdBy: item.created_by,
      createdByName: item.creator ? `${item.creator.first_name} ${item.creator.last_name}` : 'Unknown',
      createdAt: item.created_at,
      updatedAt: item.created_at
    }));
  },

  // Create deal note
  createDealNote: async (dealId: string, content: string): Promise<DealNote> => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('deal_activities')
      .insert({
        deal_id: dealId,
        type: 'note',
        title: 'Note added',
        description: content,
        created_by: session.session.user.id
      })
      .select('*, creator:profiles!created_by(first_name, last_name)')
      .single();

    if (error) throw error;

    return {
      id: data.id,
      dealId: data.deal_id,
      content: data.description || '',
      createdBy: data.created_by,
      createdByName: data.creator ? `${data.creator.first_name} ${data.creator.last_name}` : 'Unknown',
      createdAt: data.created_at,
      updatedAt: data.created_at
    };
  },

  // Bulk actions
  bulkAction: async (dealIds: string[], action: DealBulkAction) => {
    switch (action.type) {
      case 'assign_owner':
        const { error: assignError } = await supabase
          .from('deals')
          .update({ owner_id: action.data.ownerId })
          .in('id', dealIds);
        
        if (assignError) throw assignError;
        break;
        
      case 'change_stage':
        const { error: stageError } = await supabase
          .from('deals')
          .update({ stage: action.data.stageId })
          .in('id', dealIds);
        
        if (stageError) throw stageError;
        break;
        
      case 'delete':
        const { error: deleteError } = await supabase
          .from('deals')
          .delete()
          .in('id', dealIds);
        
        if (deleteError) throw deleteError;
        break;
    }
    
    return { success: true };
  }
};
