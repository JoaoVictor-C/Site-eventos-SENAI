export interface APIResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  metadata?: {
    page?: number;
    per_page?: number;
    total?: number;
  };
}
