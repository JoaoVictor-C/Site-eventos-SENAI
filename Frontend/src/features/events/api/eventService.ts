import type { CreateEventDTO, UpdateEventDTO } from '../types/DTO';
import type { Event } from '@/types/entities';
import { api } from '@/lib/api';
import { addToIdMap, getFullUuid, getShortId } from '@/utils/idMapping';

export async function getActiveEvents(): Promise<Event[]> {
  try {
    const events = await api.get<Event[]>('/events/active');
    // Add all event IDs to the mapping
    console.log('Fetched active events:', events);
    events.forEach(event => addToIdMap(event.id));
    return events;
  } catch (error) {
    console.error('Error fetching active events:', error);
    throw error;
  }
}

export async function getEventById(idOrShortId: string): Promise<Event> {
  try {
    // Convert short ID to full UUID if necessary
    const uuid = getFullUuid(idOrShortId) || idOrShortId;
    
    const event = await api.get<Event>(`/events/${uuid}`);
    // Add to mapping in case it's not there
    addToIdMap(event.id);
    return event;
  } catch (error) {
    console.error(`Error fetching event ${idOrShortId}:`, error);
    throw error;
  }
}

export async function createEvent(eventData: CreateEventDTO): Promise<Event> {
  try {
    const event = await api.post<Event>('/events', eventData);
    addToIdMap(event.id);
    return event;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
}

export async function updateEvent(idOrShortId: string, eventData: UpdateEventDTO): Promise<Event> {
  try {
    // Convert short ID to full UUID if necessary
    const uuid = getFullUuid(idOrShortId) || idOrShortId;
    
    const event = await api.put<Event>(`/events/${uuid}`, eventData);
    return event;
  } catch (error) {
    console.error(`Error updating event ${idOrShortId}:`, error);
    throw error;
  }
}

export async function deleteEvent(idOrShortId: string): Promise<void> {
  try {
    // Convert short ID to full UUID if necessary
    const uuid = getFullUuid(idOrShortId) || idOrShortId;
    
    return await api.delete<void>(`/events/${uuid}`);
  } catch (error) {
    console.error(`Error deleting event ${idOrShortId}:`, error);
    throw error;
  }
}
