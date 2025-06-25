import type { User } from '@/types';

// Login and registration types
export interface LoginDto {
  email: string;
  password: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface UpdateUserDto {
  name?: string;
  phone?: string;
}

export interface UserDto extends Pick<User, 'id' | 'name' | 'email' | 'phone' | 'role' | 'isActive'> {
  createdAt: string;
  updatedAt?: string;
}

// Token types
export interface TokenResponseDto {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiration: string;
  user: UserDto;
}

export interface RefreshTokenRequestDto {
  refreshToken: string;
}

export interface RevokeTokenRequestDto {
  refreshToken: string;
}

// Password reset types
export interface RequestPasswordResetDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
  confirmPassword: string;
}
