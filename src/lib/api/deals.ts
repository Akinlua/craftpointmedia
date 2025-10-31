import { Deal, DealStageConfig, DealFilters, DealBulkAction, DealActivity, DealNote } from '@/types/deal';

// Mock deal stages configuration
export const dealStages: DealStageConfig[] = [
  { id: 'new', name: 'New', type: 'new', color: 'bg-blue-500', order: 1 },
  { id: 'contacted', name: 'Contacted', type: 'contacted', color: 'bg-yellow-500', order: 2 },
  { id: 'proposal', name: 'Proposal', type: 'proposal', color: 'bg-purple-500', order: 3 },
  { id: 'closed_won', name: 'Closed Won', type: 'closed_won', color: 'bg-green-500', order: 4 },
  { id: 'closed_lost', name: 'Closed Lost', type: 'closed_lost', color: 'bg-red-500', order: 5 }
];

// Mock data for deals
const mockDeals: Deal[] = [
  {
    id: '1',
    title: 'Enterprise Software License',
    value: 50000,
    currency: 'USD',
    stage: 'proposal',
    stageId: 'proposal',
    probability: 75,
    ownerId: 'user1',
    ownerName: 'Alice Johnson',
    contactIds: ['1', '2'],
    contacts: [
      { id: '1', name: 'John Smith' },
      { id: '2', name: 'Sarah Johnson' }
    ],
    closeDate: '2024-02-15',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-18T14:30:00Z',
    lastActivityAt: '2024-01-18T14:30:00Z',
    description: 'Large enterprise software licensing deal for Acme Corp'
  },
  {
    id: '2',
    title: 'Website Redesign Project',
    value: 15000,
    currency: 'USD',
    stage: 'contacted',
    stageId: 'contacted',
    probability: 40,
    ownerId: 'user2',
    ownerName: 'Bob Wilson',
    contactIds: ['3'],
    contacts: [
      { id: '3', name: 'Mike Davis' }
    ],
    closeDate: '2024-02-28',
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2024-01-17T11:00:00Z',
    lastActivityAt: '2024-01-17T11:00:00Z',
    description: 'Complete website redesign and development'
  },
  {
    id: '3',
    title: 'Monthly SaaS Subscription',
    value: 2400,
    currency: 'USD',
    stage: 'closed_won',
    stageId: 'closed_won',
    probability: 100,
    ownerId: 'user1',
    ownerName: 'Alice Johnson',
    contactIds: ['4'],
    contacts: [
      { id: '4', name: 'Emily Wilson' }
    ],
    closeDate: '2024-01-20',
    createdAt: '2024-01-05T08:00:00Z',
    updatedAt: '2024-01-20T16:00:00Z',
    lastActivityAt: '2024-01-20T16:00:00Z',
    description: 'Annual SaaS subscription for Innovate Co'
  },
  {
    id: '4',
    title: 'Consulting Services',
    value: 8500,
    currency: 'USD',
    stage: 'new',
    stageId: 'new',
    probability: 25,
    ownerId: 'user2',
    ownerName: 'Bob Wilson',
    contactIds: ['1'],
    contacts: [
      { id: '1', name: 'John Smith' }
    ],
    closeDate: '2024-03-10',
    createdAt: '2024-01-15T12:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
    lastActivityAt: '2024-01-15T12:00:00Z',
    description: 'Strategic consulting engagement'
  }
];

const mockActivities: DealActivity[] = [
  {
    id: '1',
    dealId: '1',
    type: 'stage_change',
    title: 'Stage changed to Proposal',
    description: 'Moved from Contacted to Proposal stage',
    createdBy: 'user1',
    createdByName: 'Alice Johnson',
    createdAt: '2024-01-18T14:30:00Z'
  },
  {
    id: '2',
    dealId: '1',
    type: 'note',
    title: 'Meeting notes added',
    description: 'Had productive call with decision makers. They are interested in our enterprise package.',
    createdBy: 'user1',
    createdByName: 'Alice Johnson',
    createdAt: '2024-01-17T10:00:00Z'
  }
];

const mockNotes: DealNote[] = [
  {
    id: '1',
    dealId: '1',
    content: 'Client is very interested in our enterprise solution. Need to prepare custom proposal by end of week.',
    createdBy: 'user1',
    createdByName: 'Alice Johnson',
    createdAt: '2024-01-18T09:00:00Z',
    updatedAt: '2024-01-18T09:00:00Z'
  }
];

export const dealsApi = {
  // Get deals with filters
  getDeals: async (filters?: DealFilters): Promise<Deal[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filteredDeals = [...mockDeals];
    
    if (filters?.stage?.length) {
      filteredDeals = filteredDeals.filter(d => filters.stage!.includes(d.stage));
    }
    
    if (filters?.owner?.length) {
      filteredDeals = filteredDeals.filter(d => filters.owner!.includes(d.ownerId));
    }
    
    if (filters?.valueRange) {
      filteredDeals = filteredDeals.filter(d => 
        d.value >= filters.valueRange!.min && d.value <= filters.valueRange!.max
      );
    }
    
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filteredDeals = filteredDeals.filter(d => 
        d.title.toLowerCase().includes(search) ||
        d.description?.toLowerCase().includes(search) ||
        d.contacts.some(c => c.name.toLowerCase().includes(search))
      );
    }
    
    return filteredDeals;
  },

  // Get deals grouped by stage for board view
  getDealsByStage: async (filters?: DealFilters): Promise<Record<string, Deal[]>> => {
    const deals = await dealsApi.getDeals(filters);
    
    const dealsByStage: Record<string, Deal[]> = {};
    dealStages.forEach(stage => {
      dealsByStage[stage.id] = deals.filter(deal => deal.stageId === stage.id);
    });
    
    return dealsByStage;
  },

  // Get single deal by ID
  getDeal: async (id: string): Promise<Deal | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockDeals.find(d => d.id === id) || null;
  },

  // Update deal
  updateDeal: async (id: string, updates: Partial<Deal>): Promise<Deal> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const dealIndex = mockDeals.findIndex(d => d.id === id);
    if (dealIndex === -1) throw new Error('Deal not found');
    
    mockDeals[dealIndex] = {
      ...mockDeals[dealIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    return mockDeals[dealIndex];
  },

  // Update deal stage (for drag-and-drop)
  updateDealStage: async (id: string, stageId: string): Promise<Deal> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const deal = mockDeals.find(d => d.id === id);
    if (!deal) throw new Error('Deal not found');
    
    const stage = dealStages.find(s => s.id === stageId);
    if (!stage) throw new Error('Stage not found');
    
    deal.stageId = stageId;
    deal.stage = stage.type;
    deal.updatedAt = new Date().toISOString();
    deal.lastActivityAt = new Date().toISOString();
    
    return deal;
  },

  // Get deal activities
  getDealActivities: async (dealId: string): Promise<DealActivity[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockActivities.filter(a => a.dealId === dealId);
  },

  // Get deal notes
  getDealNotes: async (dealId: string): Promise<DealNote[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockNotes.filter(n => n.dealId === dealId);
  },

  // Create deal note
  createDealNote: async (dealId: string, content: string): Promise<DealNote> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const note: DealNote = {
      id: Date.now().toString(),
      dealId,
      content,
      createdBy: 'user1',
      createdByName: 'Current User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockNotes.push(note);
    return note;
  },

  // Bulk actions
  bulkAction: async (dealIds: string[], action: DealBulkAction) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    switch (action.type) {
      case 'assign_owner':
        dealIds.forEach(id => {
          const deal = mockDeals.find(d => d.id === id);
          if (deal) {
            deal.ownerId = action.data.ownerId;
            deal.ownerName = action.data.ownerName;
          }
        });
        break;
      case 'change_stage':
        dealIds.forEach(id => {
          const deal = mockDeals.find(d => d.id === id);
          if (deal) {
            deal.stageId = action.data.stageId;
            deal.stage = action.data.stage;
          }
        });
        break;
      case 'delete':
        dealIds.forEach(id => {
          const index = mockDeals.findIndex(d => d.id === id);
          if (index !== -1) {
            mockDeals.splice(index, 1);
          }
        });
        break;
    }
    
    return { success: true };
  }
};