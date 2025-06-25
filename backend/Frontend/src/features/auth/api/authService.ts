import { api } from '@/lib/api';
import { UserRole } from '@/types';
import type {
  LoginDto,
  CreateUserDto,
  UpdateUserDto,
  TokenResponseDto,
  UserDto,
  RefreshTokenRequestDto,
} from '../types';

// Helper function to convert API role string to UserRole enum
const convertRole = (role: string): UserRole => {
  switch (role.toLowerCase()) {
    case 'admin':
      return UserRole.ADMIN;
    case 'gatekeeper':
      return UserRole.GATEKEEPER;
    case 'user':
    default:
      return UserRole.USER;
  }
};

// Helper to transform user data from API
const transformUserResponse = (user: any): UserDto => ({
  ...user,
  role: convertRole(user.role),
});

export const authService = {
  async login(credentials: LoginDto): Promise<TokenResponseDto> {
    try {
      const response = await api.post<any>('/auth/login', credentials);
      // If response is wrapped, extract .data
      const data = response.data ? response.data : response;
      return {
        ...data,
        user: transformUserResponse(data.user),
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  async register(userData: CreateUserDto): Promise<UserDto> {
    try {
      const response = await api.post<any>('/auth/register', userData);
      // Handle both wrapped and direct user response
      const user = response.data ? response.data : response;
      return transformUserResponse(user);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  async refreshToken(request: RefreshTokenRequestDto): Promise<TokenResponseDto> {
    try {
      const response = await api.post<TokenResponseDto>('/auth/refresh-token', request);
      return {
        ...response,
        user: transformUserResponse(response.user),
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Token refresh failed');
    }
  },

  async revokeToken(refreshToken: string): Promise<void> {
    try {
      await api.post('/auth/revoke-token', { refreshToken });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Token revocation failed');
    }
  },

  async getCurrentUser(): Promise<UserDto> {
    try {
      const response = await api.get<UserDto>('/auth/me');
      return transformUserResponse(response);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get current user');
    }
  },

  async updateUser(userId: string, userData: UpdateUserDto): Promise<UserDto> {
    try {
      const response = await api.put<UserDto>(`/users/${userId}`, userData);
      return transformUserResponse(response);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }
  },
};
