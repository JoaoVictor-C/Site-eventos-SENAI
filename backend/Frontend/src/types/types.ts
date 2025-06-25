import { Batch, EventRoleType } from '.';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  GATEKEEPER = 'gatekeeper',
}

export enum BatchType {
  Quantity = 'quantity',
  Time = 'time',
  Free = 'free',
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
  longDescription: string;
  totalTickets?: number;
  batches: Batch[];
  isActive?: boolean;
}

export enum TicketStatus {
  Pending = 'pending',
  Paid = 'paid',
  Used = 'used',
  Expired = 'expired',
  Canceled = 'canceled'
}

export interface Order {
  orderId: string;
  userId: string;
  userFullName: string;
  eventId: string;
  eventName: string;
  orderDate: string;
  totalPrice: number;
  status: TicketStatus;
  ticketsDetails: TicketDetail[];
}

export interface TicketDetail {
  ticketId: string;
  batchName: string;
  price: number;
  status: TicketStatus;
}

export interface OrderItem {
  ticketId: string;
  batchName: string;
  price: number;
  status: TicketStatus;
}

export interface FrontendTicket {
  ticketId: string;
  orderId?: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  eventImageUrl?: string;
  batchName: string;
  price: number;
  status: TicketStatus;
  qrCodeData: string;
  purchaseDate: string;
  userId?: string;
  userFullName?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface PaymentReservationItem {
  batchId: string;
  batchName: string;
  quantity: number;
  unitPrice: number;
}

export interface AggregatedPaymentReservation {
  eventId: string;
  eventName: string;
  items: PaymentReservationItem[];
}

export interface ApiResponse<T> {
  data: T[];
  message?: string;
  error?: string;
}

export type UserEventRole = {
  id: string;
  userId: string;
  userName: string;
  eventId: string;
  eventName: string;
  roleType: EventRoleType;
  createdAt: string;
};