// Enums
export enum OrderStatus {
  Pending = 'Pending',
  Reserved = 'Reserved',
  Paid = 'Paid',
  Canceled = 'Canceled',
  Expired = 'Expired'
}

import type { PaymentReservationItem, TicketStatus } from '@/features/shared/types';
export type { PaymentReservationItem, TicketStatus };

export enum PaymentMethod {
  CreditCard = 'CreditCard',
  PIX = 'PIX',
  BankTransfer = 'BankTransfer',
  Cash = 'Cash'
}

export enum TicketType {
  Regular = 'Regular',
  VIP = 'VIP',
  Student = 'Student',
  Other = 'Other'
}

// API request/response types
export interface TicketReservationDto {
  batchId: string;
  quantity: number;
  type: TicketType;
  acceptTerms: boolean;
}

export interface TicketReservationResponseDto {
  orderId: string;
  totalAmount: number;
  reservationExpiration: string;
  paymentInstructions: string;
  tickets: TicketDto[];
}

export interface TicketDto {
  id: string;
  batchId: string;
  orderId: string;
  userId: string;
  price: number;
  qrCode: string;
  status: string; // TicketStatus
  type: TicketType;
  documentNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  usedAt?: string;
}

export interface BatchDto {
  id: string;
  name: string;
  price: number;
  quantity: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface TicketValidationDto {
  paymentProofUrl?: string;
  validatorNotes?: string;
  isValid: boolean;
}

export interface ValidateTicketDto {
  qrCode: string;
  validatedByUserId: string;
}

// Frontend display types
export interface FrontendTicket {
  id: string;
  eventName: string;
  batchName: string;
  price: number;
  qrCode: string;
  status: TicketStatus;
  type: TicketType;
  isActive: boolean;
  createdAt: string;
  usedAt?: string;
}


export interface AggregatedPaymentReservation {
  eventId: string;
  eventName: string;
  items: PaymentReservationItem[];
}

// Order DTOs matching backend
export interface OrderDto {
  id: string;
  userId: string;
  eventId: string;
  orderDate: string;
  total: number;
  quantity: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  validatedByUserId?: string;
  validatorName?: string;
  tickets: TicketDto[];
}

export interface OrderSummaryDto {
  id: string;
  eventName: string;
  eventDate: string;
  orderDate: string;
  total: number;
  quantity: number;
  status: OrderStatus;
  paymentStatus?: string;
  expiresAt?: string;
}

export interface CreateOrderDto {
  batchId: string;
  userId: string;
  paymentMethod: PaymentMethod;
  quantity: number;
  ticketRequests: TicketRequestDto[];
}

export interface UpdateOrderDto {
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  validationNotes?: string;
}

export interface TicketRequestDto {
  type: TicketType;
  documentNumber?: string;
}