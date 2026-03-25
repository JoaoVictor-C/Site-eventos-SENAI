import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/config/constants/frontend/api-endpoints';
import { QUERY_KEYS } from '@/config/query-keys';
import { AnalyticsData } from '@/features';

export function useAnalytics(eventId?: string): {
  data: AnalyticsData | undefined;
  isLoading: boolean;
  error: string | null;
} {
  const { data, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: eventId ? QUERY_KEYS.ANALYTICS.EVENT(eventId) : [QUERY_KEYS.ANALYTICS.OVERVIEW],
    queryFn: () => api.get(eventId ? `${API_ENDPOINTS.ANALYTICS.BASE}?eventId=${eventId}` : API_ENDPOINTS.ANALYTICS.BASE),
  });

  return { data, isLoading, error: error ? (error as Error).message : null };
}
