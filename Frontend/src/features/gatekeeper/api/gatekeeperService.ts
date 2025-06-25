import { api } from '@/lib/api';
import type { TicketValidationResult, TicketValidationRequest } from '../types/validation';

/**
 * Validates a ticket using its QR code and event ID
 */
export async function validateTicket(data: TicketValidationRequest): Promise<TicketValidationResult> {
  try {
    return await api.post<TicketValidationResult>('/tickets/validate', data);
  } catch (error) {
    console.error('Error validating ticket:', error);
    throw error;
  }
}

// For backward compatibility
export const validateTicketQRCode = async (qrCode: string): Promise<TicketValidationResult> => {
  return validateTicket({ qrCode: qrCode, ticketId: '', eventId: '' });
};
