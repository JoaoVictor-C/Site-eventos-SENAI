import { TicketType } from '@/features/payment/types';

// Shared types across features
export interface PaymentReservationItem {
  batchId: string;
  quantity: number;
  type: TicketType; // Required for backend
  acceptTerms: boolean; // Required for backend
  price?: number;
  unitPrice?: number;
  batchName?: string;
}

export interface AggregatedPaymentReservation {
  batchId: string;
  total: number;
  items: PaymentReservationItem[];
}

export enum TicketStatus {
  Reserved = 'Reserved',
  Paid = 'Paid',
  Used = 'Used',
  Cancelled = 'Cancelled',
  Expired = 'Expired'
}
