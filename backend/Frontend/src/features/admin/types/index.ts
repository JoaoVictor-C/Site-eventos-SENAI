// Types for admin feature
import type { ReactNode } from 'react';
import type { Event } from '@/types';
import { Batch } from '@/types';

// Admin navigation types
export enum AdminSection {
  ANALYTICS = 'analytics',
  EVENTS = 'events',
  ORDERS = 'orders',
  USERS = 'users',
}

export interface AdminNavItem {
  name: string;
  path: string;
  section: AdminSection;
  icon: ReactNode;
}

// Chart and analytics types
export interface ChartData {
  label: string;
  value: number;
}

export interface AdminStats {
  totalEvents: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  recentActivity: {
    type: 'event' | 'order' | 'user';
    id: string;
    description: string;
    date: string;
  }[];
}

export interface EventSpecificAnalytics {
  totalSales: number;
  ticketsSold: number;
  salesOverTime: ChartData[];
  ticketsByBatchChartData: ChartData[];
  revenueByBatchChartData: ChartData[];
  keyStats: {
    totalBatches: number;
    totalCapacity: number;
    percentageSold: number;
  };
}

export interface AnalyticsData {
  totalSales: number;
  ticketsSold: number;
  activeEventsCount: number;
  registeredUsersCount: number;
  salesByEvent: ChartData[];
  ticketsSoldByEvent: ChartData[];
  selectedEventDetails?: Event | null;
  eventSpecific?: EventSpecificAnalytics | null;
}

export interface AnalyticsState {
  selectedEventId: string;
  dateRange?: [Date, Date];
  isLoading: boolean;
  error: string | null;
}

export interface EventSummary {
  eventId: string;
  name: string;
  shortDescription: string;
  imageUrl: string;
  eventDate: string;
  location: string;
}

export interface EventDetail extends EventSummary {
  description: string;
  totalTickets?: number;
  batches: Batch[];
  isActive?: boolean;
}

export interface TicketDetail {
  ticket_id: string;
  batch_name: string;
  price: number;
  status: string;
}
