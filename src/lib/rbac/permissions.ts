/**
 * RBAC Permissions System
 * Centralized permission checking based on user roles
 */

export type Role = 'owner' | 'manager' | 'staff';
export type Resource = 
  | 'contacts'
  | 'deals'
  | 'invoices'
  | 'products'
  | 'campaigns'
  | 'templates'
  | 'automations'
  | 'reports'
  | 'settings'
  | 'team'
  | 'billing'
  | 'integrations';

export type Action = 'create' | 'read' | 'update' | 'delete' | 'manage';

interface Permission {
  resource: Resource;
  actions: Action[];
}

const rolePermissions: Record<Role, Permission[]> = {
  owner: [
    // Owners can do everything
    { resource: 'contacts', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'deals', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'invoices', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'products', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'campaigns', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'templates', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'automations', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'reports', actions: ['read', 'manage'] },
    { resource: 'settings', actions: ['read', 'update', 'manage'] },
    { resource: 'team', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'billing', actions: ['read', 'update', 'manage'] },
    { resource: 'integrations', actions: ['create', 'read', 'update', 'delete', 'manage'] },
  ],
  manager: [
    // Managers can do most things except org-level settings
    { resource: 'contacts', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'deals', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'invoices', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'products', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'campaigns', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'templates', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'automations', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'reports', actions: ['read'] },
    { resource: 'settings', actions: ['read'] },
    { resource: 'team', actions: ['read'] },
  ],
  staff: [
    // Staff can read and create, limited updates
    { resource: 'contacts', actions: ['create', 'read', 'update'] },
    { resource: 'deals', actions: ['create', 'read', 'update'] },
    { resource: 'invoices', actions: ['create', 'read'] },
    { resource: 'products', actions: ['read'] },
    { resource: 'campaigns', actions: ['read'] },
    { resource: 'templates', actions: ['read'] },
    { resource: 'automations', actions: ['read'] },
    { resource: 'reports', actions: ['read'] },
    { resource: 'settings', actions: ['read'] },
  ],
};

/**
 * Check if a role has permission to perform an action on a resource
 */
export function can(role: Role | null, action: Action, resource: Resource): boolean {
  if (!role) return false;

  const permissions = rolePermissions[role];
  const resourcePermission = permissions.find(p => p.resource === resource);

  if (!resourcePermission) return false;

  return resourcePermission.actions.includes(action) || resourcePermission.actions.includes('manage');
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role): Permission[] {
  return rolePermissions[role];
}

/**
 * Check if role is at least a certain level
 * Hierarchy: owner > manager > staff
 */
export function isRoleAtLeast(currentRole: Role | null, requiredRole: Role): boolean {
  if (!currentRole) return false;

  const hierarchy: Record<Role, number> = {
    owner: 3,
    manager: 2,
    staff: 1,
  };

  return hierarchy[currentRole] >= hierarchy[requiredRole];
}
