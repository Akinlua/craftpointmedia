export interface Activity {
  id: string;
  type: 'contact_added' | 'deal_updated' | 'invoice_sent' | 'task_completed' | 'message_received';
  title: string;
  description: string;
  timestamp: string;
  user: {
    name: string;
    avatar?: string;
  };
  metadata?: {
    contactName?: string;
    dealAmount?: number;
    invoiceNumber?: string;
    taskTitle?: string;
  };
  route?: string;
}

export interface ActivityFeedProps {
  activities: Activity[];
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}