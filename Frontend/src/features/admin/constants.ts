// Constants specific to the admin feature
import { AdminSection } from "./types";

export const constants = {
  ui: {
    TEXT_ADMIN_PANEL: 'Painel Administrativo',
    TEXT_ADMIN_NAV: {
      [AdminSection.ANALYTICS]: 'Analytics',
      [AdminSection.EVENTS]: 'Gerenciar Eventos',
      [AdminSection.ORDERS]: 'Gerenciar Pedidos',
      [AdminSection.USERS]: 'Gerenciar Usuários',
    },
    TEXT_ADMIN_WELCOME: 'Bem-vindo ao Painel Administrativo',
    TEXT_ADMIN_ANALYTICS_TITLE: 'Analytics e Relatórios',
    TEXT_ADMIN_EVENT_MANAGEMENT_TITLE: 'Gerenciamento de Eventos',
    TEXT_ADMIN_ORDER_MANAGEMENT_TITLE: 'Gerenciamento de Pedidos',
    TEXT_ADMIN_USER_MANAGEMENT_TITLE: 'Gerenciamento de Usuários',
    TEXT_ADMIN_CREATE_EVENT: 'Criar Evento',
  },
  query: {
    ANALYTICS: {
      OVERVIEW: 'adminAnalytics',
      EVENT_DETAIL: (eventId: string) => ['adminAnalytics', 'event', eventId],
    },
    EVENTS: {
      LIST: 'adminEvents',
      DETAIL: (eventId: string) => ['adminEvents', eventId],
    },
    ORDERS: {
      LIST: 'adminOrders',
      DETAIL: (orderId: string) => ['adminOrders', orderId],
    },
    USERS: {
      LIST: 'adminUsers',
      DETAIL: (userId: string) => ['adminUsers', userId],
    },
  },
} as const;
