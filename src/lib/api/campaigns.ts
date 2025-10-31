import { Campaign, CampaignFilters, CampaignMetrics } from '@/types/campaign';

// Mock data
const mockCampaigns: Campaign[] = [
  {
    id: 'camp-1',
    name: 'Welcome Email Series',
    type: 'email',
    status: 'completed',
    templateId: 'tpl-1',
    content: {
      subject: 'Welcome to our platform!',
      body: 'Thanks for joining us...',
      htmlBody: '<h1>Welcome!</h1><p>Thanks for joining us...</p>'
    },
    audience: {
      segmentId: 'seg-1',
      size: 1250
    },
    schedule: {
      sendAt: '2024-01-15T10:00:00Z',
      timezone: 'America/New_York'
    },
    stats: {
      sent: 1245,
      delivered: 1210,
      opened: 850,
      clicked: 120,
      bounced: 35,
      unsubscribed: 5
    },
    ownerId: 'user-1',
    orgId: 'org-1',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-15T15:30:00Z'
  },
  {
    id: 'camp-2',
    name: 'Product Launch SMS',
    type: 'sms',
    status: 'scheduled',
    content: {
      body: 'New product launch! Check it out: {{product.url}}'
    },
    audience: {
      filters: { tags: ['vip-customers'] },
      size: 342
    },
    schedule: {
      sendAt: '2024-02-01T14:00:00Z',
      timezone: 'America/New_York'
    },
    stats: {
      sent: 0,
      delivered: 0,
      bounced: 0,
      unsubscribed: 0
    },
    ownerId: 'user-1',
    orgId: 'org-1',
    createdAt: '2024-01-25T11:00:00Z',
    updatedAt: '2024-01-25T11:00:00Z'
  }
];

export const campaignsApi = {
  getCampaigns: async (filters?: CampaignFilters): Promise<{ campaigns: Campaign[]; total: number }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filtered = [...mockCampaigns];
    
    if (filters?.status) {
      filtered = filtered.filter(c => c.status === filters.status);
    }
    if (filters?.type) {
      filtered = filtered.filter(c => c.type === filters.type);
    }
    if (filters?.search) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }
    
    return { campaigns: filtered, total: filtered.length };
  },

  getCampaign: async (id: string): Promise<Campaign> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const campaign = mockCampaigns.find(c => c.id === id);
    if (!campaign) throw new Error('Campaign not found');
    return campaign;
  },

  createCampaign: async (campaign: Omit<Campaign, 'id' | 'stats' | 'createdAt' | 'updatedAt'>): Promise<Campaign> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newCampaign: Campaign = {
      ...campaign,
      id: `camp-${Date.now()}`,
      stats: {
        sent: 0,
        delivered: 0,
        bounced: 0,
        unsubscribed: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockCampaigns.push(newCampaign);
    return newCampaign;
  },

  updateCampaign: async (id: string, updates: Partial<Campaign>): Promise<Campaign> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockCampaigns.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Campaign not found');
    
    mockCampaigns[index] = {
      ...mockCampaigns[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return mockCampaigns[index];
  },

  deleteCampaign: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockCampaigns.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Campaign not found');
    mockCampaigns.splice(index, 1);
  },

  duplicateCampaign: async (id: string): Promise<Campaign> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const original = mockCampaigns.find(c => c.id === id);
    if (!original) throw new Error('Campaign not found');
    
    const duplicate: Campaign = {
      ...original,
      id: `camp-${Date.now()}`,
      name: `${original.name} (Copy)`,
      status: 'draft',
      stats: {
        sent: 0,
        delivered: 0,
        bounced: 0,
        unsubscribed: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockCampaigns.push(duplicate);
    return duplicate;
  },

  sendCampaign: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const index = mockCampaigns.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Campaign not found');
    
    mockCampaigns[index].status = 'sending';
    mockCampaigns[index].updatedAt = new Date().toISOString();
  },

  getCampaignMetrics: async (id: string): Promise<CampaignMetrics> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const campaign = mockCampaigns.find(c => c.id === id);
    if (!campaign) throw new Error('Campaign not found');
    
    const { stats } = campaign;
    return {
      deliveryRate: stats.sent > 0 ? (stats.delivered / stats.sent) * 100 : 0,
      openRate: campaign.type === 'email' && stats.delivered > 0 ? ((stats.opened || 0) / stats.delivered) * 100 : undefined,
      clickRate: campaign.type === 'email' && stats.delivered > 0 ? ((stats.clicked || 0) / stats.delivered) * 100 : undefined,
      bounceRate: stats.sent > 0 ? (stats.bounced / stats.sent) * 100 : 0,
      unsubscribeRate: stats.sent > 0 ? (stats.unsubscribed / stats.sent) * 100 : 0
    };
  }
};