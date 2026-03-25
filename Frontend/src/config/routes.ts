import { shortenUuid } from '@/utils/shortId';

export const ROUTES = {
  HOME: '/',  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
  },
  EVENTS: {
    DETAIL: (id?: string, slug?: string) => {
      if (!id) return '/e/';
      const shortId = shortenUuid(id);
      return `/e/${shortId}${slug ? '-' + slug : ''}`;
    },
  },
  TICKETS: {
    LIST: '/my-tickets',
    DETAIL: (id: string) => `/tickets/${id}`,
  },
  ORDERS: {
    PAYMENT: '/payment',
  },
  ADMIN: {
    ROOT: '/admin',
    DASHBOARD: '/admin',
    ANALYTICS: '/admin/analytics',
    EVENTS: {
      ROOT: '/admin/events',
      LIST: '/admin/events',
      CREATE: '/admin/events/new',
      EDIT: (id: string) => `/admin/events/edit/${id}`,
    },
    ORDERS: '/admin/orders',
    USERS: '/admin/users',
  },
  GATEKEEPER: '/gatekeeper',
  SUPPORT: '/support',
  NOT_FOUND: '/404',
} as const;
