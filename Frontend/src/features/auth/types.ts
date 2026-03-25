import { UserRole } from "@/types";

export interface LoginDto {
  email: string;
  password: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface TokenResponseDto {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiration: string;
  user: UserDto;
}

export interface UserDto {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface RefreshTokenRequestDto {
  refreshToken: string;
}

export interface RevokeTokenRequestDto {
  refreshToken: string;
}
