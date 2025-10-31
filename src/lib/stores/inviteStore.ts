import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserRole } from '@/types/user';

export interface TeamInvite {
  id: string;
  email: string;
  role: UserRole;
  orgId: string;
  orgName: string;
  invitedBy: string;
  invitedByName: string;
  token: string;
  status: 'pending' | 'accepted' | 'expired';
  message?: string;
  createdAt: string;
  expiresAt: string;
}

interface InviteStore {
  invites: TeamInvite[];
  
  // Actions
  createInvite: (invite: Omit<TeamInvite, 'id' | 'token' | 'status' | 'createdAt' | 'expiresAt'>) => TeamInvite;
  getInviteByToken: (token: string) => TeamInvite | null;
  acceptInvite: (token: string) => void;
  expireInvite: (token: string) => void;
  getPendingInvites: (orgId: string) => TeamInvite[];
  deleteInvite: (id: string) => void;
}

const generateToken = () => Math.random().toString(36).substr(2, 16);
const generateId = () => Math.random().toString(36).substr(2, 9);

// Mock initial invites for demo
const mockInvites: TeamInvite[] = [
  {
    id: 'inv-1',
    email: 'newuser@example.com',
    role: 'staff',
    orgId: 'org1',
    orgName: 'Acme Corp',
    invitedBy: 'user1',
    invitedByName: 'Alice Johnson',
    token: 'mock-token-123',
    status: 'pending',
    message: 'Welcome to our team! We are excited to have you join us.',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
  },
];

export const useInviteStore = create<InviteStore>()(
  persist(
    (set, get) => ({
      invites: mockInvites,
      
      createInvite: (inviteData) => {
        const newInvite: TeamInvite = {
          ...inviteData,
          id: generateId(),
          token: generateToken(),
          status: 'pending',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        };
        
        set(state => ({
          invites: [...state.invites, newInvite]
        }));
        
        return newInvite;
      },
      
      getInviteByToken: (token: string) => {
        const invite = get().invites.find(inv => inv.token === token);
        
        // Check if invite is expired
        if (invite && new Date(invite.expiresAt) < new Date()) {
          // Mark as expired
          set(state => ({
            invites: state.invites.map(inv =>
              inv.token === token ? { ...inv, status: 'expired' } : inv
            )
          }));
          return null;
        }
        
        // Only return pending invites
        return invite && invite.status === 'pending' ? invite : null;
      },
      
      acceptInvite: (token: string) => {
        set(state => ({
          invites: state.invites.map(invite =>
            invite.token === token
              ? { ...invite, status: 'accepted' }
              : invite
          )
        }));
      },
      
      expireInvite: (token: string) => {
        set(state => ({
          invites: state.invites.map(invite =>
            invite.token === token
              ? { ...invite, status: 'expired' }
              : invite
          )
        }));
      },
      
      getPendingInvites: (orgId: string) => {
        return get().invites.filter(invite => 
          invite.orgId === orgId && invite.status === 'pending'
        );
      },
      
      deleteInvite: (id: string) => {
        set(state => ({
          invites: state.invites.filter(invite => invite.id !== id)
        }));
      },
    }),
    {
      name: 'invite-storage',
    }
  )
);