import { api } from '@/lib/api';
import { Ticket, Order } from '@/types';

// Get current user's tickets
export const getUserTickets = async (): Promise<Ticket[]> => {
  try {
    const response = await api.get('/tickets/my-tickets', false);
    return response as Ticket[];
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    throw error;
  }
};

// Get tickets for a specific event (admin/moderator only)
export const getEventTickets = async (eventId: string): Promise<Ticket[]> => {
  try {
    return await api.get(`/tickets/event/${eventId}`);
  } catch (error) {
    console.error('Error fetching event tickets:', error);
    throw error;
  }
};

// Reserve tickets (expects TicketReservationDto)
export const reserveTickets = async (reservationDto: any): Promise<any> => {
  try {
    return await api.post('/tickets/reserve', reservationDto);
  } catch (error) {
    console.error('Error reserving tickets:', error);
    throw error;
  }
};

// Get ticket details
export const getTicketDetails = async (ticketId: string): Promise<Ticket> => {
  try {
    return await api.get(`/tickets/${ticketId}`);
  } catch (error) {
    console.error('Error fetching ticket details:', error);
    throw error;
  }
};

// Get order details/status
export const getOrderDetails = async (orderId: string): Promise<Order> => {
  try {
    return await api.get(`/tickets/order/${orderId}`);
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw error;
  }
};

// Cancel reservation
export const cancelReservation = async (orderId: string): Promise<void> => {
  try {
    await api.post(`/tickets/${orderId}/cancel`);
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    throw error;
  }
};
