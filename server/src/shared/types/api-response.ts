// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Default generic allows flexible API response typing when specific type is not needed
export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    total_pages?: number;
  };
}
