import type { Event as BaseEvent, EventCategory } from '@/types';

// DTOs for API operations
export type CreateEventDTO = {
  name: string;
  description: string;
  shortDescription?: string;
  longDescription?: string;
  eventDate: string;
  endDate: string;
  location: string;
  imageUrl?: string;
  maxParticipants: number;
  category: EventCategory;
  isActive?: boolean;
};

export type UpdateEventDTO = Partial<CreateEventDTO>;

// Frontend-specific event types (only include additional fields needed in UI)
export type EventSummary = Pick<BaseEvent, 
  'id' | 'name' | 'description' | 'eventDate' | 'location' | 'imageUrl' | 'isActive' | 'maxParticipants' | 'category'
> & {
  availableTickets: number;
};
