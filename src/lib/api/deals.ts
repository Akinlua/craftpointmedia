import { Deal, DealStageConfig, DealFilters, DealBulkAction, DealActivity, DealNote } from '@/types/deal';
import { ENV, API_ENDPOINTS } from '@/lib/config/env';

// Deal stages configuration
export const dealStages: DealStageConfig[] = [
  { id: 'new', name: 'New', type: 'new', color: 'bg-blue-500', order: 1 },
  { id: 'contacted', name: 'Contacted', type: 'contacted', color: 'bg-yellow-500', order: 2 },
  { id: 'proposal', name: 'Proposal', type: 'proposal', color: 'bg-purple-500', order: 3 },
  { id: 'closed_won', name: 'Closed Won', type: 'closed_won', color: 'bg-green-500', order: 4 },
  { id: 'closed_lost', name: 'Closed Lost', type: 'closed_lost', color: 'bg-red-500', order: 5 }
];

// Helper to get auth token
const getAuthToken = () => localStorage.getItem('AUTH_TOKEN');

// Helper to transform DB deal to frontend Deal type
const transformDeal = (data: any): Deal => {
  // Handle nested contact object from backend
  const contacts = data.contact ? [{
    id: data.contact.id,
    name: `${data.contact.firstName} ${data.contact.lastName}`,
    avatar: data.contact.avatar
  }] : [];

  // Handle stage - it can be either an object or a string
  const stageId = typeof data.stage === 'object' ? data.stage.id : data.stage;
  const stageName = typeof data.stage === 'object' ? data.stage.name : data.stage;

  return {
    id: data.id,
    title: data.title,
    value: parseFloat(data.value) || 0,
    currency: data.currency || 'USD',
    stage: stageName || 'new',
    stageId: stageId || 'new',
    probability: data.probability,
    ownerId: data.owner?.id,
    ownerName: data.owner ? `${data.owner.firstName} ${data.owner.lastName}` : 'Unassigned',
    ownerAvatar: data.owner?.avatar,
    contactIds: contacts.map(c => c.id),
    contacts: contacts,
    closeDate: data.expectedCloseDate, // Mapping expectedCloseDate to closeDate
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    lastActivityAt: data.lastActivityAt,
    description: data.description,
    customFields: data.customFields
  };
};

export const dealsApi = {
  // Get deals with filters
  getDeals: async (filters?: DealFilters, page = 1, limit = 100): Promise<{ data: Deal[], total: number }> => {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters?.stage?.length) queryParams.append('stage', filters.stage.join(','));
    if (filters?.search) queryParams.append('search', filters.search);
    if (filters?.owner?.length) queryParams.append('ownerId', filters.owner.join(',')); // Assuming backend supports ownerId filter

    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.DEALS.BASE}?${queryParams.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Failed to fetch deals');

    const result = await response.json();

    // Handle the new API response structure: { success: true, data: { deals: [...], pagination: {...} } }
    const dealsList = result.data?.deals || [];
    const total = result.data?.pagination?.total || dealsList.length;

    console.log(dealsList);
    return {
      data: dealsList.map(transformDeal),
      total: total
    };
  },

  // Get deals grouped by stage for board view
  getDealsByStage: async (filters?: DealFilters): Promise<Record<string, Deal[]>> => {
    // Fetch all deals (handling pagination)
    let allDeals: Deal[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const { data, total } = await dealsApi.getDeals(filters, page, 100);
      allDeals = [...allDeals, ...data];

      if (allDeals.length >= total || data.length === 0) {
        hasMore = false;
      } else {
        page++;
      }
    }

    const dealsByStage: Record<string, Deal[]> = {};
    dealStages.forEach(stage => {
      dealsByStage[stage.id] = allDeals.filter(deal => deal.stageId === stage.id);
    });

    return dealsByStage;
  },

  // Get single deal by ID
  getDeal: async (id: string): Promise<Deal | null> => {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.DEALS.BASE}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Failed to fetch deal');

    const result = await response.json();
    return transformDeal(result.data || result);
  },

  // Create deal
  createDeal: async (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    // Backend expects specific fields
    const payload = {
      title: deal.title,
      description: deal.description,
      value: deal.value,
      currency: deal.currency,
      priority: 'medium', // Default or add to form
      expectedCloseDate: deal.closeDate,
      contactId: deal.contactIds[0], // Backend only supports one contact currently
      customFields: deal.customFields || {}
    };

    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.DEALS.BASE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Failed to create deal');

    const result = await response.json();
    return transformDeal(result.data || result);
  },

  // Update deal
  updateDeal: async (id: string, updates: Partial<Deal>): Promise<Deal> => {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    // Map frontend fields to backend fields
    const payload: any = {};
    if (updates.title) payload.title = updates.title;
    if (updates.description) payload.description = updates.description;
    if (updates.value) payload.value = updates.value;
    if (updates.contactIds?.length) payload.contactId = updates.contactIds[0];
    if (updates.closeDate) payload.expectedCloseDate = updates.closeDate;
    if (updates.stage) payload.stage = updates.stage; // Assuming backend accepts stage slug update here

    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.DEALS.BASE}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Failed to update deal');

    const result = await response.json();
    return transformDeal(result.data || result);
  },

  // Update deal stage (for drag-and-drop)
  updateDealStage: async (id: string, stageId: string): Promise<Deal> => {
    // Re-use updateDeal since it handles PATCH
    return dealsApi.updateDeal(id, { stage: stageId as any });
  },

  // Get deal activities - Mocked for now as backend support is pending
  getDealActivities: async (dealId: string): Promise<DealActivity[]> => {
    return [];
  },

  // Get deal notes - Mocked for now
  getDealNotes: async (dealId: string): Promise<DealNote[]> => {
    return [];
  },

  // Create deal note - Mocked for now
  createDealNote: async (dealId: string, content: string): Promise<DealNote> => {
    throw new Error('Notes not supported yet');
  },

  // Bulk actions - Mocked or partial implementation
  bulkAction: async (dealIds: string[], action: DealBulkAction) => {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    // Iterate for now as per other bulk actions
    const promises = [];

    switch (action.type) {
      case 'delete':
        for (const id of dealIds) {
          promises.push(fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.DEALS.BASE}/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          }));
        }
        break;

      // Add other cases if needed
    }

    await Promise.all(promises);
    return { success: true };
  }
};
