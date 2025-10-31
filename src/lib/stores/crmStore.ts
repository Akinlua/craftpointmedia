import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Contact, ContactFilters } from '@/types/contact';
import { Deal, DealStage } from '@/types/deal';
import { User, Organization } from '@/types/user';
import { Task } from '@/types/task';
import { Conversation } from '@/types/conversation';

// Mock data imports
import { mockContacts } from '@/lib/mocks/contacts';
import { mockDeals } from '@/lib/mocks/deals';
import { mockUsers } from '@/lib/mocks/users';
import { mockTasks } from '@/lib/mocks/tasks';
import { mockConversations } from '@/lib/mocks/conversations';

interface CRMStore {
  // Data
  contacts: Contact[];
  deals: Deal[];
  users: User[];
  tasks: Task[];
  conversations: Conversation[];
  currentUser: User | null;
  currentOrg: Organization | null;
  
  // UI State
  isLoading: boolean;
  
  // Auth Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setCurrentUser: (user: User) => void;
  
  // User Actions
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => User;
  
  // Contact Actions
  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => Contact;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  getContact: (id: string) => Contact | undefined;
  updateContactStage: (id: string, stage: string) => void;
  
  // Deal Actions
  addDeal: (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => Deal;
  updateDeal: (id: string, updates: Partial<Deal>) => void;
  deleteDeal: (id: string) => void;
  getDeal: (id: string) => Deal | undefined;
  updateDealStage: (id: string, stage: DealStage) => void;
  
  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getTask: (id: string) => Task | undefined;
  
  // Conversation Actions
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  
  // Utility Actions
  resetStore: () => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useCRMStore = create<CRMStore>()(
  persist(
    (set, get) => ({
      // Initial state
      contacts: mockContacts,
      deals: mockDeals,
      users: mockUsers,
      tasks: mockTasks,
      conversations: mockConversations,
      currentUser: mockUsers[0], // Default to first user
      currentOrg: {
        id: 'org1',
        name: 'Acme Corp',
        domain: 'acme.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      isLoading: false,
      
      // Auth actions
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        const user = mockUsers.find(u => u.email === email);
        if (user) {
          set({ currentUser: user, isLoading: false });
        } else {
          set({ isLoading: false });
          throw new Error('Invalid credentials');
        }
      },
      
      logout: () => {
        set({ currentUser: null });
      },
      
      setCurrentUser: (user: User) => {
        set({ currentUser: user });
      },
      
      // User actions
      addUser: (userData) => {
        const newUser: User = {
          ...userData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set(state => ({
          users: [...state.users, newUser]
        }));
        
        return newUser;
      },
      
      // Contact actions
      addContact: (contactData) => {
        const newContact: Contact = {
          ...contactData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set(state => ({
          contacts: [...state.contacts, newContact]
        }));
        
        return newContact;
      },
      
      updateContact: (id: string, updates: Partial<Contact>) => {
        set(state => ({
          contacts: state.contacts.map(contact =>
            contact.id === id
              ? { ...contact, ...updates, updatedAt: new Date().toISOString() }
              : contact
          )
        }));
      },
      
      deleteContact: (id: string) => {
        set(state => ({
          contacts: state.contacts.filter(contact => contact.id !== id)
        }));
      },
      
      getContact: (id: string) => {
        return get().contacts.find(contact => contact.id === id);
      },
      
      updateContactStage: (id: string, stage: string) => {
        get().updateContact(id, { leadStage: stage as any });
      },
      
      // Deal actions
      addDeal: (dealData) => {
        const newDeal: Deal = {
          ...dealData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set(state => ({
          deals: [...state.deals, newDeal]
        }));
        
        return newDeal;
      },
      
      updateDeal: (id: string, updates: Partial<Deal>) => {
        set(state => ({
          deals: state.deals.map(deal =>
            deal.id === id
              ? { ...deal, ...updates, updatedAt: new Date().toISOString() }
              : deal
          )
        }));
      },
      
      deleteDeal: (id: string) => {
        set(state => ({
          deals: state.deals.filter(deal => deal.id !== id)
        }));
      },
      
      getDeal: (id: string) => {
        return get().deals.find(deal => deal.id === id);
      },
      
      updateDealStage: (id: string, stage: DealStage) => {
        get().updateDeal(id, { stage, stageId: stage });
      },
      
      // Task actions
      addTask: (taskData) => {
        const newTask: Task = {
          ...taskData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set(state => ({
          tasks: [...state.tasks, newTask]
        }));
        
        return newTask;
      },
      
      updateTask: (id: string, updates: Partial<Task>) => {
        set(state => ({
          tasks: state.tasks.map(task =>
            task.id === id
              ? { ...task, ...updates, updatedAt: new Date().toISOString() }
              : task
          )
        }));
      },
      
      deleteTask: (id: string) => {
        set(state => ({
          tasks: state.tasks.filter(task => task.id !== id)
        }));
      },
      
      getTask: (id: string) => {
        return get().tasks.find(task => task.id === id);
      },
      
      // Conversation actions
      updateConversation: (id: string, updates: Partial<Conversation>) => {
        set(state => ({
          conversations: state.conversations.map(conv =>
            conv.id === id
              ? { ...conv, ...updates, updatedAt: new Date().toISOString() }
              : conv
          )
        }));
      },
      
      // Utility actions
      resetStore: () => {
        set({
          contacts: mockContacts,
          deals: mockDeals,
          users: mockUsers,
          tasks: mockTasks,
          conversations: mockConversations,
        });
      },
    }),
    {
      name: 'crm-storage',
      partialize: (state) => ({
        contacts: state.contacts,
        deals: state.deals,
        tasks: state.tasks,
        conversations: state.conversations,
        currentUser: state.currentUser,
        currentOrg: state.currentOrg,
      }),
    }
  )
);