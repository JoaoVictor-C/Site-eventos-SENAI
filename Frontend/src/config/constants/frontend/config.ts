// Application Configuration Constants
export const APP_NAME = "Eventos SENAI";

// Route Paths
export const ROUTES = {
  HOME: '/',
  EVENT_DETAIL: '/evento/:eventId',
  PAYMENT: '/pagamento',
  MY_TICKETS: '/meus-ingressos',
  SUPPORT: '/suporte',
  LOGIN: '/login',
  GATEKEEPER: '/portaria',
  NOT_FOUND: '/404',
  ADMIN: {
    BASE: '/admin',
    ANALYTICS: '/admin/analytics',
    EVENTS: {
      BASE: '/admin/events',
      CREATE: '/admin/events/new',
      EDIT: '/admin/events/edit/:eventId',
    },
    ORDERS: '/admin/orders',
    USERS: '/admin/users',
  },
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  EVENTS: {
    BASE: '/events',
    ACTIVE: '/events/active',
    DETAIL: (id: string) => `/events/${id}`,
    ADMIN: {
      BASE: '/admin/events',
      DETAIL: (id: string) => `/admin/events/${id}`,
    },
  },
  TICKETS: {
    USER: (userId: string) => `/users/${userId}/tickets`,
    DETAIL: (id: string) => `/tickets/${id}`,
    RESERVE: '/tickets/reserve',
    VALIDATE: '/gatekeeper/validate-ticket',
  },
  ORDERS: {
    ADMIN: {
      BASE: '/admin/orders',
      CONFIRM_PAYMENT: (id: string) => `/admin/orders/${id}/confirm-payment`,
    },
  },
  USERS: {
    ADMIN: {
      BASE: '/admin/users',
      UPDATE_PASSWORD: (id: string) => `/admin/users/${id}/password`,
    },
  },
  ANALYTICS: {
    BASE: '/admin/analytics',
  },
};

// Feature Configuration
export const FEATURE_CONFIG = {
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 50,
  },
  AUTH: {
    TOKEN_KEY: 'auth_token',
    USER_KEY: 'current_user',
  },
  API: {
    TIMEOUT: 10000, // 10 seconds
    RETRY_COUNT: 3,
  },
};
