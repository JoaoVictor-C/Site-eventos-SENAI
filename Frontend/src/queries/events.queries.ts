import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/config/constants/frontend/api-endpoints';
import { QUERY_KEYS } from '@/config/query-keys';
import { Event } from '@/types';
import { addToIdMap } from '@/utils/idMapping'; // <-- Import the mapping utility

export function useEvents(): {
    data: Event[] | undefined;
    isLoading: boolean;
    error: Error | null;
} {
    const { data, isLoading, error } = useQuery<Event[]>({
        queryKey: [QUERY_KEYS.EVENTS.ALL],
        queryFn: () => api.get(API_ENDPOINTS.EVENTS.BASE),
    });

    // Ensure all event IDs are mapped to short IDs
    if (data) {
        data.forEach(event => addToIdMap(event.id));
    }

    return { data, isLoading, error: error as Error | null };
}

export function useActiveEvents(): {
    data: Event[] | undefined;
    isLoading: boolean;
    error: Error | null;
} {
    const { data, isLoading, error } = useQuery<Event[]>({
        queryKey: [QUERY_KEYS.EVENTS.ACTIVE],
        queryFn: () => api.get(API_ENDPOINTS.EVENTS.ACTIVE),
    });

    return { data, isLoading, error: error as Error | null };
}

export function useEventDetail(eventId?: string, options?: any): {
    data: Event | undefined;
    isLoading: boolean;
    error: Error | null;
} {
    const { data, isLoading, error } = useQuery<Event>({
        queryKey: eventId ? QUERY_KEYS.EVENTS.DETAIL(eventId) : ['event', 'undefined'],
        queryFn: () => api.get(API_ENDPOINTS.EVENTS.DETAIL(eventId!)),
        enabled: !!eventId,
        ...options
    });

    return { data, isLoading, error: error as Error | null };
}


export function useManageableEvents(userId: string): {
    data: Event[] | undefined;
    isLoading: boolean;
    error: Error | null;
} {
    const { data, isLoading, error } = useQuery<Event[]>({
        queryKey: [QUERY_KEYS.EVENTS.MANAGEABLE(userId)],
        queryFn: () => api.get(API_ENDPOINTS.EVENTS.MANAGEABLE(userId)),
        enabled: !!userId,
    });

    return { data, isLoading, error: error as Error | null };
}