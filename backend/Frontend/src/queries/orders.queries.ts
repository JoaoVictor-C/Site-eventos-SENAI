import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/config/constants/frontend/api-endpoints';
import { QUERY_KEYS } from '@/config/query-keys';
import { Order } from '@/types';

// Query for all orders (admin)
export function useOrders(): {
  data: Order[] | undefined;
  isLoading: boolean;
  error: Error | null;
} {
  const { data, isLoading, error } = useQuery<Order[]>({
    queryKey: [QUERY_KEYS.ORDERS.ADMIN.ALL],
    queryFn: () => api.get(API_ENDPOINTS.TICKETS.ORDERS),
  });
  return { data, isLoading, error };
}

// Query for orders by event (admin)
export function useOrdersByEvent(eventId: string): {
  data: Order[] | undefined;
  isLoading: boolean;
  error: Error | null;
} {
  const { data, isLoading, error } = useQuery<Order[]>({
    queryKey: [QUERY_KEYS.ORDERS.ADMIN.ALL, eventId],
    queryFn: () => api.get(API_ENDPOINTS.TICKETS.ORDERS_BY_EVENT(eventId)),
    enabled: !!eventId,
  });
  return { data, isLoading, error };
}
