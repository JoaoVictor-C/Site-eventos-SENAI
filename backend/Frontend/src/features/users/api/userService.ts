import { AuthUser, LoginResponse } from '../types';
import { User } from '@/types/entities';
import { api } from '@/lib/api';

export const login = async (userId: string): Promise<LoginResponse> => {
  try {
    // Simulated API call
    return await api.post('/auth/login', { userId });
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    // Simulated API call
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    // Simulated API call
    return await api.get('/auth/me');
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const getAllUsersAdmin = async (): Promise<User[]> => {
  try {
    // Simulated API call
    return await api.get('/users');
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
};

export const updateUserPasswordAdmin = async (userId: string, newPassword: string): Promise<User> => {
  try {
    // Simulated API call
    return await api.put(`/admin/users/${userId}/password`, { newPassword });
  } catch (error) {
    console.error('Error updating user password:', error);
    throw error;
  }
};
