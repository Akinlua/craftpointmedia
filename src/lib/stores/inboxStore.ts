import { create } from 'zustand';
import { Conversation, ConversationFilters } from '@/types/conversation';

interface InboxStore {
  // UI State
  selectedConversationId: string | null;
  sidebarCollapsed: boolean;
  contextPanelOpen: boolean;
  
  // Filters
  activeFilters: ConversationFilters;
  searchQuery: string;
  
  // Actions
  setSelectedConversation: (id: string | null) => void;
  toggleSidebar: () => void;
  toggleContextPanel: () => void;
  setFilters: (filters: Partial<ConversationFilters>) => void;
  clearFilters: () => void;
  setSearchQuery: (query: string) => void;
}

export const useInboxStore = create<InboxStore>((set, get) => ({
  // Initial state
  selectedConversationId: null,
  sidebarCollapsed: false,
  contextPanelOpen: true,
  
  activeFilters: {
    status: undefined,
    channels: undefined,
    assignedTo: undefined,
    tags: undefined,
    unreadOnly: false,
    search: undefined,
    dateRange: undefined,
  },
  searchQuery: '',
  
  // Actions
  setSelectedConversation: (id) => {
    set({ selectedConversationId: id });
  },
  
  toggleSidebar: () => {
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
  },
  
  toggleContextPanel: () => {
    set((state) => ({ contextPanelOpen: !state.contextPanelOpen }));
  },
  
  setFilters: (newFilters) => {
    set((state) => ({
      activeFilters: { ...state.activeFilters, ...newFilters }
    }));
  },
  
  clearFilters: () => {
    set({
      activeFilters: {
        status: undefined,
        channels: undefined,
        assignedTo: undefined,
        tags: undefined,
        unreadOnly: false,
        search: undefined,
        dateRange: undefined,
      },
      searchQuery: '',
    });
  },
  
  setSearchQuery: (query) => {
    set((state) => ({
      searchQuery: query,
      activeFilters: {
        ...state.activeFilters,
        search: query || undefined
      }
    }));
  },
}));