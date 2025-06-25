import { AnalyticsData, EventDetail } from '../types';
import { api } from '@/lib/api';
import { EventRoleType, Order, User } from '@/types';
import { Event } from '@/types';

const formatDateForBackend = (date: string | null | undefined): string | null => {
  if (!date) return null;
  try {
    // Ensure date is in UTC format
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return null;
    }
    return dateObj.toISOString();
  } catch {
    return null;
  }
};



const sanitizeEventData = (eventData: Partial<Event>) => {
  const eventDate = formatDateForBackend(eventData.eventDate);
  const endDate = formatDateForBackend(eventData.endDate);

  if (!eventDate || !endDate) {
    throw new Error('As datas do evento são obrigatórias');
  }

  return {
    name: eventData.name,
    description: eventData.description,
    location: eventData.location,
    category: eventData.category,
    eventDate,
    endDate,
    maxParticipants: eventData.maxParticipants,
    isActive: eventData.isActive ?? true,
    imageUrl: eventData.imageUrl || null,
    batches: eventData.batches?.map(batch => ({
      name: batch.name,
      type: batch.type,
      unitPrice: Number(batch.unitPrice.toFixed(2)),
      totalQuantity: batch.totalQuantity,
      startDate: formatDateForBackend(batch.startDate),
      endDate: formatDateForBackend(batch.endDate),
      isActive: batch.isActive ?? true
    })) || []
  };
};

export const adminCreateEvent = async (eventData: Partial<Event>): Promise<Event> => {
  try {
    const sanitizedData = sanitizeEventData(eventData);
    return await api.post('/events', sanitizedData);
  } catch (error: any) {
    if (error.response?.data?.errors) {
      const errorMessages = Object.values(error.response.data.errors)
        .flat()
        .join('\n');
      throw new Error(errorMessages);
    }
    console.error('Error creating event:', error);
    throw error;
  }
};

export const adminUpdateEvent = async (eventId: string, eventData: Partial<Event>): Promise<Event> => {
  try {
    // Create UpdateEventDto structure with nullable fields
    const updateEventDto = {
      name: eventData.name ?? null,
      description: eventData.description ?? null,
      location: eventData.location ?? null,
      category: eventData.category ?? null,
      eventDate: eventData.eventDate ? formatDateForBackend(eventData.eventDate) : null,
      endDate: eventData.endDate ? formatDateForBackend(eventData.endDate) : null,
      maxParticipants: eventData.maxParticipants ?? null,
      isActive: eventData.isActive ?? null,
      imageUrl: eventData.imageUrl ?? null,
      batches: eventData.batches?.map(batch => ({
        id: batch.id ?? '00000000-0000-0000-0000-000000000000',
        name: batch.name,
        type: batch.type,
        unitPrice: Number(batch.unitPrice.toFixed(2)),
        totalQuantity: batch.totalQuantity,
        startDate: batch.startDate ? formatDateForBackend(batch.startDate) : null,
        endDate: batch.endDate ? formatDateForBackend(batch.endDate) : null,
        isActive: batch.isActive ?? true
      })) ?? null
    };

    // Send the request directly without wrapping
    return await api.put(`/events/${eventId}`, updateEventDto);
  } catch (error: any) {
    if (error.response?.data?.errors) {
      const errorMessages = Object.values(error.response.data.errors).flat();
      throw new Error(errorMessages.join('. '));
    }
    console.error('Error updating event:', error);
    throw error;
  }
};

export const adminDeleteEvent = async (eventId: string): Promise<void> => {
  try {
    await api.delete(`/events/${eventId}`);
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

export const adminConfirmOrderPayment = async (orderId: string): Promise<Order> => {
  try {
    // Backend expects TicketValidationDto with orderId, paymentMethod, validationNotes
    const payload = {
      orderId,
      paymentMethod: 'Cash', // Or make this configurable
      validationNotes: 'Validated by admin'
    };
    return await api.post(`/tickets/${orderId}/validate`, payload);
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
};

export const adminUpdateUserPassword = async (userId: string): Promise<boolean> => {
  try {
    // Note: Backend needs to implement password reset endpoint
    // Currently the endpoint doesn't exist, so we'll need to add it
    await api.post(`/users/${userId}/reset-password`);
    return true;
  } catch (error) {
    console.error('Error resetting user password:', error);
    throw error;
  }
};

export const adminCheckRole = async (eventId: string, roleType: EventRoleType): Promise<boolean> => {
  try {
    const response = await api.get<boolean>(`/events/${eventId}/roles/check/${roleType}`);
    console.log(response);
    return response;
  } catch (error) {
    console.error('Error checking user role:', error);
    throw error;
  }
};