import { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/features/auth/api/authService';
import type { LoginDto, UserDto, TokenResponseDto } from '@/features/auth/types';
import { storage, StorageKey } from '@/lib/storage';
import { ROUTES } from '@/config/routes';
import { api } from '@/lib/api';
import { Event } from '@/types';

interface AuthContextType {
  user: UserDto | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginDto) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: { name?: string; email?: string }) => Promise<void>;
  manageableEvents: Event[];
  selectedEvent: Event | null;
  setSelectedEvent: (event: Event | null) => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [manageableEvents, setManageableEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  // Listen for auth expiration events from the API client
  useEffect(() => {
    const handleAuthExpired = () => {
      logout();
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedToken = storage.get<string>(StorageKey.TOKEN);
        const savedUser = storage.get<UserDto>(StorageKey.USER);

        if (!savedToken || !savedUser) {
          await logout();
          return;
        }

        // Verify the token by getting current user
        const currentUser = await authService.getCurrentUser();
        console.log('Current user:', currentUser);
        if (!currentUser) {
          await logout();
          return;
        }
        // Check if user is admin
        if (currentUser.role === 2) {
          setIsAdmin(true);
        }
        setUser(currentUser);
        setIsAuthenticated(true);
        storage.set(StorageKey.USER, currentUser); // Update stored user data
      } catch (error) {
        console.error('Auth check failed:', error);
        await logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Fetch manageable events when user changes
  useEffect(() => {
    const fetchManageableEvents = async () => {
      if (user?.id) {
        try {
          const events = await api.get<Event[]>(`/users/${user.id}/manageable-events`);
          setManageableEvents(events);
          const firstEvent = events[0] ?? null;
          if (firstEvent && !selectedEvent) setSelectedEvent(firstEvent);
        } catch {
          setManageableEvents([]);
          setSelectedEvent(null);
        }
      } else {
        setManageableEvents([]);
        setSelectedEvent(null);
      }
    };

    fetchManageableEvents();
  }, [user]);

  const handleAuthResponse = (response: TokenResponseDto) => {
    if (!response.accessToken || !response.user) {
      throw new Error('Invalid authentication response');
    }

    // Store auth data
    storage.set(StorageKey.TOKEN, response.accessToken);
    storage.set(StorageKey.REFRESH_TOKEN, response.refreshToken);
    storage.set(StorageKey.USER, response.user);

    // Update state
    setUser(response.user);
    setIsAuthenticated(true);
  };

  const login = async (credentials: LoginDto) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      handleAuthResponse(response);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const refreshToken = storage.get<string>(StorageKey.REFRESH_TOKEN);
      if (refreshToken) {
        await authService.revokeToken(refreshToken);
      }
    } catch (error) {
      console.error('Error revoking token:', error);
    } finally {
      // Remove all cached userRoles from localStorage
      Object.keys(localStorage)
        .filter(key => key.startsWith('userRoles_'))
        .forEach(key => localStorage.removeItem(key));

      storage.clearAuth();
      setUser(null);
      setIsAuthenticated(false);
      setManageableEvents([]);
      setSelectedEvent(null);
      setIsAdmin(false);
      // Redirect to login page
      navigate(ROUTES.AUTH.LOGIN);
    }
  };

  const updateUser = async (userData: { name?: string; email?: string }) => {
    if (!user?.id) return;

    const updatedUser = await authService.updateUser(user.id, userData);
    setUser(updatedUser);
    storage.set(StorageKey.USER, updatedUser);
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    manageableEvents,
    selectedEvent,
    setSelectedEvent,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
