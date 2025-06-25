import type { User as BaseUser } from '@/types';

// Authentication types
export interface AuthUser extends Pick<BaseUser, 'id' | 'name' | 'email' | 'role'> {
  token?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
  refreshToken: string;
}

export interface TokenResponse {
  token: string;
  refreshToken: string;
}

// Profile types
export interface UserProfile extends BaseUser {
  ticketsPurchased: number;
  eventsAttended: number;
  eventsOrganized: number;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
