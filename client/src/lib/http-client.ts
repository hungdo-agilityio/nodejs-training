type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestConfig {
  method?: RequestMethod;
  body?: unknown;
  headers?: Record<string, string>;
  getToken?: () => Promise<string | null>;
}

interface ApiError {
  code?: string;
  message: string;
}

class HttpClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      throw new Error('NEXT_PUBLIC_API_URL environment variable is not set');
    }

    this.baseURL = apiUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const { method = 'GET', body, headers = {}, getToken } = config;

    const url = `${this.baseURL}${endpoint}`;

    const requestHeaders: Record<string, string> = {
      ...this.defaultHeaders,
      ...headers,
    };

    // Get fresh token if getToken function is provided
    if (getToken) {
      const token = await getToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    const requestInit: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body && method !== 'GET') {
      requestInit.body = JSON.stringify(body);
    }

    const response = await fetch(url, requestInit);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: 'An unexpected error occurred',
      }));

      const error: ApiError = {
        code: errorData.error?.code || 'UNKNOWN_ERROR',
        message:
          errorData.error?.message || errorData.message || 'Request failed',
      };

      throw error;
    }

    return response.json();
  }

  async get<T>(
    endpoint: string,
    getToken?: () => Promise<string | null>
  ): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', getToken });
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    getToken?: () => Promise<string | null>
  ): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body, getToken });
  }

  async put<T>(
    endpoint: string,
    body?: unknown,
    getToken?: () => Promise<string | null>
  ): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body, getToken });
  }

  async patch<T>(
    endpoint: string,
    body?: unknown,
    getToken?: () => Promise<string | null>
  ): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body, getToken });
  }

  async delete<T>(
    endpoint: string,
    getToken?: () => Promise<string | null>
  ): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', getToken });
  }
}

export const httpClient = new HttpClient();
