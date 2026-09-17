export interface ApiResponse<T> {
  data: T;
  success: boolean;
  timestamp: string;
}
