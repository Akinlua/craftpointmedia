// Environment configuration
export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  APP_NAME: 'CraftPoint CRM',
  APP_VERSION: '1.0.0',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    INVITE: '/auth/invite',
    ACCEPT_INVITATION: '/auth/accept-invitation',
    REQUEST_ACCESS: '/auth/request-access',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_2FA: '/auth/verify-2fa',
  },
  SETTINGS: {
    ORGANIZATION: '/settings/organization',
  },
} as const;
