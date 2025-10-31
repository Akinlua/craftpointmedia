import { create } from 'zustand';

interface UiStore {
  // Global UI state
  sidebarCollapsed: boolean;
  searchModalOpen: boolean;
  notificationsPanelOpen: boolean;
  
  // Dashboard customization
  dashboardLayout: string[];
  
  // Bulk actions state
  selectedContacts: string[];
  selectedDeals: string[];
  selectedTasks: string[];
  
  // Offline queue for future use
  offlineQueue: Array<{
    id: string;
    action: string;
    data: any;
    timestamp: number;
  }>;
  
  // Actions
  toggleSidebar: () => void;
  setSearchModalOpen: (open: boolean) => void;
  setNotificationsPanelOpen: (open: boolean) => void;
  
  // Dashboard customization
  reorderDashboardCards: (newOrder: string[]) => void;
  
  // Bulk selection
  setSelectedContacts: (ids: string[]) => void;
  setSelectedDeals: (ids: string[]) => void;
  setSelectedTasks: (ids: string[]) => void;
  clearAllSelections: () => void;
  
  // Offline support
  addToOfflineQueue: (action: string, data: any) => void;
  clearOfflineQueue: () => void;
}

export const useUiStore = create<UiStore>((set, get) => ({
  // Initial state
  sidebarCollapsed: false,
  searchModalOpen: false,
  notificationsPanelOpen: false,
  
  dashboardLayout: ['kpi', 'activity', 'charts', 'quick-actions'],
  
  selectedContacts: [],
  selectedDeals: [],
  selectedTasks: [],
  
  offlineQueue: [],
  
  // Actions
  toggleSidebar: () => {
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
  },
  
  setSearchModalOpen: (open) => {
    set({ searchModalOpen: open });
  },
  
  setNotificationsPanelOpen: (open) => {
    set({ notificationsPanelOpen: open });
  },
  
  reorderDashboardCards: (newOrder) => {
    set({ dashboardLayout: newOrder });
  },
  
  setSelectedContacts: (ids) => {
    set({ selectedContacts: ids });
  },
  
  setSelectedDeals: (ids) => {
    set({ selectedDeals: ids });
  },
  
  setSelectedTasks: (ids) => {
    set({ selectedTasks: ids });
  },
  
  clearAllSelections: () => {
    set({ 
      selectedContacts: [], 
      selectedDeals: [], 
      selectedTasks: [] 
    });
  },
  
  addToOfflineQueue: (action, data) => {
    const queueItem = {
      id: `offline_${Date.now()}_${Math.random()}`,
      action,
      data,
      timestamp: Date.now()
    };
    
    set((state) => ({
      offlineQueue: [...state.offlineQueue, queueItem]
    }));
  },
  
  clearOfflineQueue: () => {
    set({ offlineQueue: [] });
  },
}));