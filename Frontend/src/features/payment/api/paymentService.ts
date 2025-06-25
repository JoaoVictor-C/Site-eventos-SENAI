import { api } from '@/lib/api';
import type {
  PaymentReservationItem,
  TicketReservationDto,
  TicketReservationResponseDto,
  OrderDto,
  TicketDto,
  CreateOrderDto,
  UpdateOrderDto,
  OrderSummaryDto,
  TicketValidationDto,
  ValidateTicketDto
} from '../types';

export class PaymentService {
  /**
   * Reserve tickets for an event (one batch per request, matching backend DTO)
   * @param items Items to reserve (each with batchId, quantity, type, acceptTerms)
   * @returns Promise with all reservation responses
   */
  async reserveTickets(
    items: PaymentReservationItem[]
  ): Promise<{tickets: TicketDto[]}> {
    const results: {orderId: string, tickets: TicketDto[]}[] = [];
    for (const item of items) {
      const reservationDto: TicketReservationDto = {
        batchId: item.batchId,
        quantity: item.quantity,
        type: item.type,
        acceptTerms: item.acceptTerms
      };
      const response = await api.post<TicketReservationResponseDto>(
        '/tickets/reserve',
        reservationDto
      );
      results.push({ orderId: response.orderId, tickets: response.tickets });
    }
    return {
      tickets: results.flatMap(r => r.tickets)
    };
  }

  async createOrder(orderDto: CreateOrderDto): Promise<OrderDto> {
    return api.post<OrderDto>('/tickets/orders', orderDto);
  }

  async getOrderStatus(orderId: string): Promise<OrderDto> {
    return api.get<OrderDto>(`/tickets/orders/${orderId}`);
  }

  async getOrderSummary(orderId: string): Promise<OrderSummaryDto> {
    return api.get<OrderSummaryDto>(`/tickets/orders/${orderId}/summary`);
  }

  async updateOrder(orderId: string, updateDto: UpdateOrderDto): Promise<OrderDto> {
    return api.put<OrderDto>(`/tickets/orders/${orderId}`, updateDto);
  }

  async validateTicketPayment(orderId: string, validationDto: TicketValidationDto): Promise<OrderDto> {
    return api.post<OrderDto>(`/tickets/orders/${orderId}/validate`, validationDto);
  }

  async cancelReservation(orderId: string): Promise<void> {
    return api.post(`/tickets/orders/${orderId}/cancel`, {});
  }

  async getMyTickets(): Promise<TicketDto[]> {
    return api.get<TicketDto[]>('/tickets/my-tickets');
  }

  async getTicket(ticketId: string): Promise<TicketDto> {
    return api.get<TicketDto>(`/tickets/${ticketId}`);
  }

  async getEventTickets(eventId: string): Promise<TicketDto[]> {
    return api.get<TicketDto[]>(`/tickets/event/${eventId}`);
  }

  async validateTicket(validateDto: ValidateTicketDto): Promise<TicketDto> {
    return api.post<TicketDto>('/tickets/validate', validateDto);
  }
}

export const paymentService = new PaymentService();