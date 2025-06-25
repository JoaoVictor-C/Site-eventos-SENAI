import axios from 'axios';
import { API_URL } from '../constants/constants';
import { storage, StorageKey } from './storage';

interface RequestConfig {
  _retry?: boolean;
  url: string;
  headers: Record<string, string>;
  method?: string;
  data?: any;
  params?: any;
  baseURL?: string;
}

class ApiClient {
  private axiosInstance;
  private refreshPromise: Promise<string | null> | null = null;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for adding token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = storage.get<string>(StorageKey.TOKEN);
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for token refresh
    this.axiosInstance.interceptors.response.use(
      (response) => this.transformResponse(response),
      async (error) => {
        if (!error.config) return Promise.reject(error);
        
        const originalRequest = error.config as unknown as RequestConfig;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshToken();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.axiosInstance(originalRequest as any);
            }
          } catch (refreshError) {
            storage.clearAuth();
            window.dispatchEvent(new CustomEvent('auth:expired'));
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private transformResponse<T>(response: any): T {
    const data = response.data;

    // If data is null/undefined or not an object, return as is
    if (!data || typeof data !== 'object') {
      return data;
    }

    // Handle C# array responses with $values
    if ('$values' in data) {
      return data.$values as T;
    }

    // For regular objects, if they don't have $id or $ref, return as is
    if (!('$id' in data) && !('$ref' in data)) {
      return data as T;
    }

    // Handle C# object responses with $id and $ref
    const { $id, $ref, ...rest } = data;

    // Recursively transform nested objects that might have C# style properties
    Object.keys(rest).forEach((key) => {
      if (rest[key] && typeof rest[key] === 'object') {
        rest[key] = this.transformResponse({ data: rest[key] });
      }
    });

    return rest as T;
  }

  private async refreshToken(): Promise<string | null> {
    if (!this.refreshPromise) {
      this.refreshPromise = (async () => {
        try {
          const refreshToken = storage.get<string>(StorageKey.REFRESH_TOKEN);
          if (!refreshToken) return null;

          const response = await this.axiosInstance.post<{
            accessToken: string;
            refreshToken: string;
          }>('/auth/refresh-token', { refreshToken });

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          storage.set(StorageKey.TOKEN, accessToken);
          storage.set(StorageKey.REFRESH_TOKEN, newRefreshToken);
          return accessToken;
        } catch (error) {
          storage.clearAuth();
          return null;
        } finally {
          this.refreshPromise = null;
        }
      })();
    }

    return this.refreshPromise;
  }

  private clearAuth() {
    storage.clearAuth();
    if (this.axiosInstance.defaults.headers.common) {
      delete this.axiosInstance.defaults.headers.common['Authorization'];
    }
  }

  async get<T>(endpoint: string, config?: any): Promise<T> {
    const response = await this.axiosInstance.get<T>(endpoint, config);
    return response.data as unknown as T;
  }

  async post<T>(endpoint: string, data?: any, config?: any): Promise<T> {
    const response = await this.axiosInstance.post<T>(endpoint, data, config);
    return response as unknown as T;
  }

  async put<T>(endpoint: string, data?: any, config?: any): Promise<T> {
    const response = await this.axiosInstance.put<T>(endpoint, data, config);
    return response as unknown as T;
  }

  async delete<T>(endpoint: string, config?: any): Promise<T> {
    const response = await this.axiosInstance.delete<T>(endpoint, config);
    return response.data;
  }
}

export const api = new ApiClient();
