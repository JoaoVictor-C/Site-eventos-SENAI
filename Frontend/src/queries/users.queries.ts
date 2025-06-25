import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/config/constants/frontend/api-endpoints';
import { QUERY_KEYS } from '@/config/query-keys';
import { EventRoleType, User } from '@/types';
import { UserEventRole } from '@/types/types';

export function useUsers(): {
    data: User[] | undefined;
    isLoading: boolean;
    error: Error | null;
} {
  const { data, isLoading, error } = useQuery<User[]>({
    queryKey: [QUERY_KEYS.USERS.ADMIN.ALL],
    queryFn: () => api.get(API_ENDPOINTS.USERS.BASE),
  });

  return { data, isLoading, error };
}

export function useUserDetail(userId: string): {
  data: User | undefined;
  isLoading: boolean;
  error: Error | null;
} {
  return useQuery<User>({
    queryKey: [QUERY_KEYS.USERS.ADMIN.ALL, userId],
    queryFn: () => api.get(API_ENDPOINTS.USERS.DETAIL(userId)),
  });
}

export function useUserRolesEvents(eventId: string): {
  data: EventRoleType[] | undefined;
  isLoading: boolean;
  error: Error | null;
} {
  const { data: eventData, isLoading, error } = useQuery<UserEventRole[]>({
    queryKey: [QUERY_KEYS.USERS.ADMIN.ROLES_EVENTS, eventId],
    queryFn: () => api.get(API_ENDPOINTS.USERS.ROLES_EVENTS(eventId)),
    enabled: !!eventId,        // Only fetch if eventId is present
  });

  console.log(eventData);

  const data = eventData?.map((event: UserEventRole) => event.roleType);

  return { data, isLoading, error };
}

