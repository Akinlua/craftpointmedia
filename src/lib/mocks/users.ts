import { User } from '@/types/user';

export const mockUsers: User[] = [
  {
    id: 'user1',
    email: 'alice@company.com',
    firstName: 'Alice',
    lastName: 'Johnson',
    role: 'owner',
    orgId: 'org1',
    avatar: 'AJ',
    emailVerified: true,
    twoFactorEnabled: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user2',
    email: 'bob@company.com',
    firstName: 'Bob',
    lastName: 'Wilson',
    role: 'manager',
    orgId: 'org1',
    avatar: 'BW',
    emailVerified: true,
    twoFactorEnabled: true,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  },
  {
    id: 'user3',
    email: 'charlie@company.com',
    firstName: 'Charlie',
    lastName: 'Brown',
    role: 'staff',
    orgId: 'org1',
    avatar: 'CB',
    emailVerified: true,
    twoFactorEnabled: false,
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z'
  }
];