import { Activity } from '@/types/activity';

export const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'contact_added',
    title: 'New contact added',
    description: 'John Smith was added to the CRM',
    timestamp: '2024-01-15T10:30:00Z',
    user: {
      name: 'Sarah Wilson'
    },
    metadata: {
      contactName: 'John Smith'
    },
    route: '/app/contacts/john-smith'
  },
  {
    id: '2',
    type: 'deal_updated',
    title: 'Deal moved to Proposal',
    description: 'Acme Corp deal moved from Qualification to Proposal stage',
    timestamp: '2024-01-15T09:45:00Z',
    user: {
      name: 'Mike Johnson'
    },
    metadata: {
      dealAmount: 45000
    },
    route: '/app/deals/acme-corp'
  },
  {
    id: '3',
    type: 'invoice_sent',
    title: 'Invoice sent',
    description: 'Invoice #INV-2024-001 sent to Tech Solutions Inc',
    timestamp: '2024-01-15T09:15:00Z',
    user: {
      name: 'Lisa Chen'
    },
    metadata: {
      invoiceNumber: 'INV-2024-001'
    },
    route: '/app/invoices/inv-2024-001'
  },
  {
    id: '4',
    type: 'task_completed',
    title: 'Task completed',
    description: 'Follow up call with potential client completed',
    timestamp: '2024-01-15T08:30:00Z',
    user: {
      name: 'David Kim'
    },
    metadata: {
      taskTitle: 'Follow up call with potential client'
    },
    route: '/app/tasks/follow-up-call'
  },
  {
    id: '5',
    type: 'message_received',
    title: 'New message received',
    description: 'Message from client about project timeline',
    timestamp: '2024-01-15T08:00:00Z',
    user: {
      name: 'Emily Rodriguez'
    },
    route: '/app/inbox/client-timeline'
  },
  {
    id: '6',
    type: 'deal_updated',
    title: 'Deal closed won',
    description: 'StartupXYZ deal successfully closed for $25,000',
    timestamp: '2024-01-14T16:45:00Z',
    user: {
      name: 'Alex Thompson'
    },
    metadata: {
      dealAmount: 25000
    },
    route: '/app/deals/startupxyz'
  },
  {
    id: '7',
    type: 'contact_added',
    title: 'New contact added',
    description: 'Maria Garcia added as new lead',
    timestamp: '2024-01-14T15:20:00Z',
    user: {
      name: 'Sarah Wilson'
    },
    metadata: {
      contactName: 'Maria Garcia'
    },
    route: '/app/contacts/maria-garcia'
  },
  {
    id: '8',
    type: 'task_completed',
    title: 'Demo completed',
    description: 'Product demo for Enterprise Corp completed',
    timestamp: '2024-01-14T14:00:00Z',
    user: {
      name: 'Mike Johnson'
    },
    metadata: {
      taskTitle: 'Product demo for Enterprise Corp'
    },
    route: '/app/tasks/demo-enterprise'
  }
];