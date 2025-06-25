export const QUERY_KEYS = {
  AUTH: {
    CURRENT_USER: 'currentUser',
  },
  EVENTS: {
    ALL: 'events',
    ACTIVE: 'activeEvents',
    DETAIL: (id: string) => ['event', id],
    ADMIN: {
      ALL: 'adminEvents',
      DETAIL: (id: string) => ['adminEvent', id],
    },
    MANAGEABLE: (userId: string) => ['manageableEvents', userId],
  },
  TICKETS: {
    USER: (userId: string) => ['userTickets', userId],
    DETAIL: (id: string) => ['ticket', id],
  },
  ORDERS: {
    ADMIN: {
      EVENT: (eventId: string) => ['adminOrders', eventId],
      ALL: 'adminOrders',
    },
  },
  USERS: {
    ADMIN: {
      ALL: 'adminUsers',
      ROLES_EVENTS: (eventId: string) => ['userRolesEvents', eventId],
    },
  },
  ANALYTICS: {
    OVERVIEW: 'analytics',
    EVENT: (id: string) => ['analytics', 'event', id],
  },
} as const;
