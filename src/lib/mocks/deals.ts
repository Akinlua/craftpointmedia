import { Deal } from '@/types/deal';

export const mockDeals: Deal[] = [
  {
    id: '1',
    title: 'Enterprise Software License',
    value: 45000,
    currency: 'USD',
    stage: 'contacted',
    stageId: 'contacted',
    probability: 75,
    ownerId: 'user1',
    ownerName: 'Alice Johnson',
    ownerAvatar: 'AJ',
    contactIds: ['1'],
    contacts: [
      { id: '1', name: 'John Smith', avatar: 'JS' }
    ],
    closeDate: '2024-02-15',
    description: 'Enterprise software license deal for Acme Corp',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-17T14:30:00Z',
    lastActivityAt: '2024-01-17T14:30:00Z'
  },
  {
    id: '2',
    title: 'Marketing Automation Setup',
    value: 12000,
    currency: 'USD',
    stage: 'proposal',
    stageId: 'proposal',
    probability: 60,
    ownerId: 'user2',
    ownerName: 'Bob Wilson',
    ownerAvatar: 'BW',
    contactIds: ['2'],
    contacts: [
      { id: '2', name: 'Sarah Johnson', avatar: 'SJ' }
    ],
    closeDate: '2024-01-30',
    description: 'Marketing automation setup for TechStart Inc',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-16T11:20:00Z',
    lastActivityAt: '2024-01-16T11:20:00Z'
  },
  {
    id: '3',
    title: 'Cloud Infrastructure Migration',
    value: 78000,
    currency: 'USD',
    stage: 'proposal',
    stageId: 'proposal',
    probability: 80,
    ownerId: 'user1',
    ownerName: 'Alice Johnson',
    ownerAvatar: 'AJ',
    contactIds: ['3'],
    contacts: [
      { id: '3', name: 'Mike Davis', avatar: 'MD' }
    ],
    closeDate: '2024-03-10',
    description: 'Complete cloud infrastructure migration for Global Tech',
    createdAt: '2024-01-12T15:30:00Z',
    updatedAt: '2024-01-18T09:45:00Z',
    lastActivityAt: '2024-01-18T09:45:00Z'
  },
  {
    id: '4',
    title: 'CRM Implementation',
    value: 25000,
    currency: 'USD',
    stage: 'closed_won',
    stageId: 'closed_won',
    probability: 100,
    ownerId: 'user2',
    ownerName: 'Bob Wilson',
    ownerAvatar: 'BW',
    contactIds: ['4'],
    contacts: [
      { id: '4', name: 'Emily Wilson', avatar: 'EW' }
    ],
    closeDate: '2024-02-28',
    description: 'CRM implementation for Innovate Co',
    createdAt: '2024-01-14T12:00:00Z',
    updatedAt: '2024-01-14T12:00:00Z',
    lastActivityAt: '2024-01-14T12:00:00Z'
  },
  {
    id: '5',
    title: 'Data Analytics Platform',
    value: 35000,
    currency: 'USD',
    stage: 'closed_won',
    stageId: 'closed_won',
    probability: 100,
    ownerId: 'user1',
    ownerName: 'Alice Johnson',
    ownerAvatar: 'AJ',
    contactIds: ['5'],
    contacts: [
      { id: '5', name: 'Alex Brown', avatar: 'AB' }
    ],
    closeDate: '2024-01-15',
    description: 'Data analytics platform for Data Corp',
    createdAt: '2024-01-08T11:00:00Z',
    updatedAt: '2024-01-19T16:00:00Z',
    lastActivityAt: '2024-01-19T16:00:00Z'
  }
];