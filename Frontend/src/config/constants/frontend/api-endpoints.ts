// API Endpoints - Updated for backend alignment
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH_TOKEN: '/auth/refresh-token',
    REVOKE_TOKEN: '/auth/revoke-token',
    REGISTER: '/auth/register',
  },
  EVENTS: {
    BASE: '/events',
    ACTIVE: '/events/active',
    DETAIL: (id: string) => `/events/${id}`,
    MY_EVENTS: '/events/my-events',
    BATCHES: (id: string) => `/events/${id}/batches`,
    AVAILABLE_TICKETS: (id: string) => `/events/${id}/available-tickets`,
    MANAGEABLE: (userId: string) => `/events/roles/manageable-events/${userId}`,
  },
  TICKETS: {
    MY_TICKETS: '/tickets/my-tickets',
    EVENT: (eventId: string) => `/tickets/event/${eventId}`,
    RESERVE: '/tickets/reserve',
    ORDER: (orderId: string) => `/tickets/order/${orderId}`,
    CANCEL: (orderId: string) => `/tickets/${orderId}/cancel`,
    VALIDATE: (orderId: string) => `/tickets/orders/${orderId}/validate`,
    ORDERS: '/tickets/orders',
    ORDERS_BY_EVENT: (eventId: string) => `/tickets/orders/${eventId}`
  },
  USERS: {
    BASE: '/users',
    DETAIL: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    RESET_PASSWORD: (id: string) => `/users/${id}/reset-password`,
    ROLES_EVENTS: (eventId: string) => `/events/${eventId}/roles`,
  },
  ANALYTICS: {
    BASE: '/analytics',
  },
};
