import { Automation, AutomationFilters, AutomationRun, NodeTypeDefinition } from '@/types/automation';

// Mock data
const mockAutomations: Automation[] = [
  {
    id: 'auto-1',
    name: 'Welcome Series',
    description: 'Send welcome emails to new contacts',
    status: 'active',
    version: 1,
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        nodeType: 'contact_created',
        position: { x: 100, y: 100 },
        data: {
          label: 'Contact Created',
          config: {}
        }
      },
      {
        id: 'action-1',
        type: 'action',
        nodeType: 'send_email',
        position: { x: 300, y: 100 },
        data: {
          label: 'Send Welcome Email',
          config: {
            templateId: 'tpl-1',
            delay: 0
          }
        }
      },
      {
        id: 'action-2',
        type: 'action',
        nodeType: 'wait',
        position: { x: 500, y: 100 },
        data: {
          label: 'Wait 3 days',
          config: {
            duration: 3,
            unit: 'days'
          }
        }
      },
      {
        id: 'action-3',
        type: 'action',
        nodeType: 'send_email',
        position: { x: 700, y: 100 },
        data: {
          label: 'Send Follow-up',
          config: {
            templateId: 'tpl-2'
          }
        }
      }
    ],
    edges: [
      { id: 'e1', source: 'trigger-1', target: 'action-1' },
      { id: 'e2', source: 'action-1', target: 'action-2' },
      { id: 'e3', source: 'action-2', target: 'action-3' }
    ],
    triggers: [
      {
        type: 'contact_created',
        config: {}
      }
    ],
    stats: {
      totalRuns: 245,
      successfulRuns: 240,
      lastRun: '2024-01-20T10:30:00Z'
    },
    ownerId: 'user-1',
    orgId: 'org-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z'
  },
  {
    id: 'auto-2',
    name: 'Lead Scoring',
    description: 'Automatically score and tag leads based on behavior',
    status: 'active',
    version: 2,
    nodes: [
      {
        id: 'trigger-2',
        type: 'trigger',
        nodeType: 'form_submitted',
        position: { x: 100, y: 200 },
        data: {
          label: 'Form Submitted',
          config: {
            formId: 'contact-form'
          }
        }
      },
      {
        id: 'condition-1',
        type: 'condition',
        nodeType: 'condition',
        position: { x: 300, y: 200 },
        data: {
          label: 'Is Hot Lead?',
          config: {
            field: 'leadScore',
            operator: 'gte',
            value: 80
          }
        }
      },
      {
        id: 'action-4',
        type: 'action',
        nodeType: 'add_tag',
        position: { x: 500, y: 150 },
        data: {
          label: 'Add Hot Lead Tag',
          config: {
            tag: 'hot-lead'
          }
        }
      },
      {
        id: 'action-5',
        type: 'action',
        nodeType: 'create_task',
        position: { x: 500, y: 250 },
        data: {
          label: 'Create Follow-up Task',
          config: {
            title: 'Follow up with {{contact.name}}',
            dueDate: '+1 day'
          }
        }
      }
    ],
    edges: [
      { id: 'e4', source: 'trigger-2', target: 'condition-1' },
      { id: 'e5', source: 'condition-1', target: 'action-4', sourceHandle: 'true' },
      { id: 'e6', source: 'condition-1', target: 'action-5', sourceHandle: 'false' }
    ],
    triggers: [
      {
        type: 'form_submitted',
        config: {
          formId: 'contact-form'
        }
      }
    ],
    stats: {
      totalRuns: 89,
      successfulRuns: 87,
      lastRun: '2024-01-21T14:15:00Z'
    },
    ownerId: 'user-1',
    orgId: 'org-1',
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-18T16:45:00Z'
  }
];

const nodeTypes: NodeTypeDefinition[] = [
  // Triggers
  {
    type: 'contact_created',
    category: 'trigger',
    label: 'Contact Created',
    description: 'Triggers when a new contact is added',
    icon: 'UserPlus',
    color: '#22c55e',
    inputs: 0,
    outputs: 1,
    configSchema: {}
  },
  {
    type: 'tag_added',
    category: 'trigger',
    label: 'Tag Added',
    description: 'Triggers when a specific tag is added to a contact',
    icon: 'Tag',
    color: '#22c55e',
    inputs: 0,
    outputs: 1,
    configSchema: { tag: 'string' }
  },
  {
    type: 'form_submitted',
    category: 'trigger',
    label: 'Form Submitted',
    description: 'Triggers when a form is submitted',
    icon: 'FileText',
    color: '#22c55e',
    inputs: 0,
    outputs: 1,
    configSchema: { formId: 'string' }
  },
  // Actions
  {
    type: 'send_email',
    category: 'action',
    label: 'Send Email',
    description: 'Send an email using a template',
    icon: 'Mail',
    color: '#3b82f6',
    inputs: 1,
    outputs: 1,
    configSchema: { templateId: 'string', delay: 'number' }
  },
  {
    type: 'send_sms',
    category: 'action',
    label: 'Send SMS',
    description: 'Send an SMS using a template',
    icon: 'MessageSquare',
    color: '#3b82f6',
    inputs: 1,
    outputs: 1,
    configSchema: { templateId: 'string', delay: 'number' }
  },
  {
    type: 'add_tag',
    category: 'action',
    label: 'Add Tag',
    description: 'Add a tag to the contact',
    icon: 'Plus',
    color: '#3b82f6',
    inputs: 1,
    outputs: 1,
    configSchema: { tag: 'string' }
  },
  {
    type: 'wait',
    category: 'action',
    label: 'Wait',
    description: 'Wait for a specified duration',
    icon: 'Clock',
    color: '#f59e0b',
    inputs: 1,
    outputs: 1,
    configSchema: { duration: 'number', unit: 'string' }
  },
  {
    type: 'condition',
    category: 'condition',
    label: 'Condition',
    description: 'Branch the flow based on a condition',
    icon: 'GitBranch',
    color: '#8b5cf6',
    inputs: 1,
    outputs: 2,
    configSchema: { field: 'string', operator: 'string', value: 'any' }
  }
];

export const automationsApi = {
  getAutomations: async (filters?: AutomationFilters): Promise<{ automations: Automation[]; total: number }> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    let filtered = [...mockAutomations];
    
    if (filters?.status) {
      filtered = filtered.filter(a => a.status === filters.status);
    }
    if (filters?.search) {
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
        a.description?.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }
    
    return { automations: filtered, total: filtered.length };
  },

  getAutomation: async (id: string): Promise<Automation> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const automation = mockAutomations.find(a => a.id === id);
    if (!automation) throw new Error('Automation not found');
    return automation;
  },

  createAutomation: async (automation: Omit<Automation, 'id' | 'version' | 'stats' | 'createdAt' | 'updatedAt'>): Promise<Automation> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const newAutomation: Automation = {
      ...automation,
      id: `auto-${Date.now()}`,
      version: 1,
      stats: {
        totalRuns: 0,
        successfulRuns: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockAutomations.push(newAutomation);
    return newAutomation;
  },

  updateAutomation: async (id: string, updates: Partial<Automation>): Promise<Automation> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockAutomations.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Automation not found');
    
    mockAutomations[index] = {
      ...mockAutomations[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return mockAutomations[index];
  },

  deleteAutomation: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockAutomations.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Automation not found');
    mockAutomations.splice(index, 1);
  },

  duplicateAutomation: async (id: string): Promise<Automation> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const original = mockAutomations.find(a => a.id === id);
    if (!original) throw new Error('Automation not found');
    
    const duplicate: Automation = {
      ...original,
      id: `auto-${Date.now()}`,
      name: `${original.name} (Copy)`,
      status: 'draft',
      version: 1,
      stats: {
        totalRuns: 0,
        successfulRuns: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockAutomations.push(duplicate);
    return duplicate;
  },

  getNodeTypes: async (): Promise<NodeTypeDefinition[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return nodeTypes;
  },

  testAutomation: async (id: string, contactId: string): Promise<AutomationRun> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      id: `run-${Date.now()}`,
      automationId: id,
      contactId,
      status: 'completed',
      logs: [
        {
          nodeId: 'trigger-1',
          timestamp: new Date().toISOString(),
          status: 'success',
          message: 'Trigger activated',
          data: { contactId }
        },
        {
          nodeId: 'action-1',
          timestamp: new Date().toISOString(),
          status: 'success',
          message: 'Email sent successfully',
          data: { emailId: 'email-123' }
        }
      ],
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    };
  },

  getAutomationRuns: async (automationId: string): Promise<AutomationRun[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return [
      {
        id: 'run-1',
        automationId,
        contactId: 'contact-1',
        status: 'completed',
        logs: [
          {
            nodeId: 'trigger-1',
            timestamp: '2024-01-20T10:30:00Z',
            status: 'success',
            message: 'Contact created trigger activated'
          },
          {
            nodeId: 'action-1',
            timestamp: '2024-01-20T10:30:15Z',
            status: 'success',
            message: 'Welcome email sent'
          }
        ],
        startedAt: '2024-01-20T10:30:00Z',
        completedAt: '2024-01-20T10:30:15Z'
      }
    ];
  }
};