// RBAC matrix - defines what each role can do
type Role = 'owner' | 'manager' | 'staff';

const permissions: Record<Role, Record<string, string[]>> = {
  owner: {
    users: ['create', 'read', 'update', 'delete'],
    contacts: ['create', 'read', 'update', 'delete'],
    deals: ['create', 'read', 'update', 'delete'],
    tasks: ['create', 'read', 'update', 'delete'],
    settings: ['create', 'read', 'update', 'delete'],
    analytics: ['read'],
    invoices: ['create', 'read', 'update', 'delete'],
    products: ['create', 'read', 'update', 'delete'],
    campaigns: ['create', 'read', 'update', 'delete'],
    templates: ['create', 'read', 'update', 'delete'],
    automations: ['create', 'read', 'update', 'delete'],
    messages: ['create', 'read', 'update', 'delete'],
  },
  manager: {
    users: ['read'],
    contacts: ['create', 'read', 'update', 'delete'],
    deals: ['create', 'read', 'update', 'delete'],
    tasks: ['create', 'read', 'update', 'delete'],
    settings: ['read', 'update'],
    analytics: ['read'],
    invoices: ['create', 'read', 'update'],
    products: ['create', 'read', 'update', 'delete'],
    campaigns: ['create', 'read', 'update'],
    templates: ['create', 'read', 'update'],
    automations: ['create', 'read', 'update'],
    messages: ['create', 'read', 'update', 'delete'],
  },
  staff: {
    users: [],
    contacts: ['create', 'read', 'update'],
    deals: ['create', 'read', 'update'],
    tasks: ['create', 'read', 'update'],
    settings: ['read'],
    analytics: [],
    invoices: ['read'],
    products: ['read'],
    campaigns: ['read'],
    templates: ['read'],
    automations: ['read'],
    messages: ['create', 'read', 'update'],
  },
};

export function can(role: Role, action: string, resource: string): boolean {
  const rolePermissions = permissions[role];
  if (!rolePermissions) return false;

  const resourcePermissions = rolePermissions[resource];
  if (!resourcePermissions) return false;

  return resourcePermissions.includes(action);
}

// Helper function to check permissions with current user
export function canCurrentUser(action: string, resource: string, userRole?: Role): boolean {
  if (!userRole) return false;
  return can(userRole, action, resource);
}