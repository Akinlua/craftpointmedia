import { KpiData } from '@/types/kpi';

export const mockKpiData: KpiData[] = [
  {
    id: 'new-leads',
    title: 'New Leads',
    value: 47,
    change: 12,
    changeType: 'increase',
    icon: 'Users',
    color: 'text-blue-600',
    route: '/app/contacts'
  },
  {
    id: 'open-deals',
    title: 'Open Deals',
    value: 156,
    change: 8,
    changeType: 'increase',
    icon: 'Target',
    color: 'text-green-600',
    route: '/app/deals'
  },
  {
    id: 'revenue',
    title: 'Revenue (30d)',
    value: '$1,234,567',
    change: 23,
    changeType: 'increase',
    icon: 'DollarSign',
    color: 'text-yellow-600',
    route: '/app/deals'
  },
  {
    id: 'tasks-due',
    title: 'Tasks Due Today',
    value: 12,
    change: -2,
    changeType: 'decrease',
    icon: 'Calendar',
    color: 'text-purple-600',
    route: '/app/tasks'
  },
  {
    id: 'unread-messages',
    title: 'Unread Messages',
    value: 8,
    change: 3,
    changeType: 'increase',
    icon: 'MessageCircle',
    color: 'text-orange-600',
    route: '/app/inbox'
  }
];