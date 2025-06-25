import type { TicketStatus } from '@/types';

export interface TicketValidationRequest {
  ticketId: string;
  eventId: string;
  qrCode: string;
}

// Frontend-specific type for validated tickets
export interface ValidatedTicket {
  ticketId: string;
  eventId: string;
  userId: string;
  batchId: string;
  status: TicketStatus;
  usedAt?: string;
  userFullName: string;
  eventName: string;
  batchName: string;
}

export interface TicketValidationResult {
  valid: boolean;
  message: string;
  ticket?: ValidatedTicket;
}
