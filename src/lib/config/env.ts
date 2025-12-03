// Environment configuration
export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://crm-be-deployed.onrender.com/api',
  APP_NAME: 'CraftPoint CRM',
  APP_VERSION: '1.0.0',
} as const;



// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    ME: '/auth/me',
    INVITE: '/auth/invite',
    ACCEPT_INVITATION: '/auth/accept-invitation',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_RESET_TOKEN: '/auth/verify-reset-token',
    INVITATIONS: '/auth/invitations',
    CANCEL_INVITATION: '/auth/invitations/{id}/cancel',
    VALIDATE_INVITATION: '/auth/validate-invitation',
  },
  CONTACTS: {
    BASE: '/contacts',
    TIMELINE: '/contacts/{id}/timeline',
  },
  CAMPAIGNS: {
    BASE: '/campaigns',
    SEND: '/campaigns/{id}/send',
    PAUSE: '/campaigns/{id}/pause',
    RECIPIENTS: '/campaigns/{id}/recipients',
    STATS: '/campaigns/{id}/stats',
  },
  TEMPLATES: {
    BASE: '/templates',
    DUPLICATE: '/templates/{id}/duplicate',
    USE: '/templates/{id}/use',
  },
  MESSAGES: {
    BASE: '/messages',
  },
  INBOX: {
    CONVERSATIONS: '/inbox/conversations',
    CONVERSATION_DETAIL: '/inbox/conversations/{id}',
    CONVERSATION_MESSAGES: '/inbox/conversations/{id}/messages',
    ASSIGN: '/inbox/conversations/{id}/assign',
    TAGS: '/inbox/conversations/{id}/tags',
  },
  UPLOAD: {
    AVATAR_USER: '/upload/avatar/user/{id}',
    AVATAR_CONTACT: '/upload/avatar/contact/{id}',
    LOGO: '/upload/logo',
  },
  INVOICES: {
    BASE: '/invoices',
    STATS: '/invoices/stats',
    SEND: '/invoices/{id}/send',
  },
  PRODUCTS: {
    BASE: '/products',
  },
  DEALS: {
    BASE: '/deals',
  },
  REPORTS: {
    OVERVIEW: '/reports/overview',
  },
  SETTINGS: {
    ORGANIZATION: '/settings/organization',
    PROFILE: '/settings/profile',
    PASSWORD: '/settings/password',
    TEAM: '/settings/team',
    SYSTEM: '/settings/system',
  },
  TASKS: {
    BASE: '/tasks',
    STATISTICS: '/tasks/statistics',
    REMINDERS: '/tasks/reminders',
    BULK: '/tasks/bulk',
  },
  USERS: {
    BASE: '/users',
    STATS: '/users/stats',
  },
} as const;

