import { APIResponse, PaginatedResponse, FilterOptions } from "../types";

export interface ApiClientConfig {
  baseUrl: string;
  timeout?: number;
  defaultHeaders?: Record<string, string>;
}

export interface RequestOptions extends RequestInit {
  timeout?: number;
  params?: Record<string, any>;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any,
    public errorType?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.timeout = config.timeout || 30000;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...config.defaultHeaders,
    };
  }

  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    let fullUrl: string;

    // Check if baseUrl is absolute (starts with http)
    if (this.baseUrl.startsWith("http")) {
      fullUrl = `${this.baseUrl}${endpoint}`;
    } else {
      fullUrl = `${this.baseUrl}${endpoint}`;
      if (!fullUrl.startsWith("/")) {
        fullUrl = `/${fullUrl}`;
      }
    }

    // Add query parameters if present
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => searchParams.append(key, String(v)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
      const separator = fullUrl.includes("?") ? "&" : "?";
      fullUrl = `${fullUrl}${separator}${searchParams.toString()}`;
    }

    console.log(`🚀 API Request: ${fullUrl}`);
    return fullUrl;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const { params, timeout = this.timeout, ...fetchOptions } = options;

    const url = this.buildUrl(endpoint, params);
    console.log(`📡 ${fetchOptions.method || "GET"} ${url}`);

    const headers = {
      ...this.defaultHeaders,
      ...fetchOptions.headers,
    };

    // Log request details
    if (fetchOptions.body) {
      console.log(`📤 Request body:`, fetchOptions.body);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(`📡 Response status: ${response.status}`);

      // Simple, single response reading approach
      let responseText = "";
      let responseData: any = null;

      try {
        // Only read if body hasn't been consumed
        if (!response.bodyUsed) {
          responseText = await response.text();
          console.log(`📡 Response length: ${responseText.length}`);

          // Try to parse as JSON
          if (responseText.trim()) {
            try {
              responseData = JSON.parse(responseText);
              console.log(`📡 Parsed JSON response`);
            } catch {
              responseData = { message: responseText };
              console.log(`📡 Non-JSON response`);
            }
          } else {
            responseData = {};
            console.log(`📡 Empty response`);
          }
        } else {
          console.warn(`📡 Response body already consumed`);
          responseData = {};
        }
      } catch (readError) {
        console.error(`📡 Response read error:`, readError);
        responseData = {
          error: "Failed to read response",
          message: readError.message || "Unknown response reading error",
        };
      }

      // Handle HTTP errors
      if (!response.ok) {
        console.error(`❌ HTTP Error ${response.status}`);

        // Create meaningful error data for empty responses
        if (!responseData || Object.keys(responseData).length === 0) {
          responseData = {
            error: `HTTP ${response.status}`,
            message: `Server returned ${response.status}`,
            status: response.status,
          };

          // Add specific error messages for common status codes
          switch (response.status) {
            case 409:
              responseData.error =
                "Conflict: Resource already exists or conflicts with current state";
              responseData.message = "The request conflicts with existing data";
              responseData.suggestion =
                "Check for duplicate names or constraint violations";
              break;
            case 400:
              responseData.error = "Bad Request: Invalid data provided";
              break;
            case 404:
              responseData.error = "Not Found: Resource does not exist";
              break;
            case 500:
              responseData.error = "Internal Server Error";
              break;
          }
        }

        // Detailed logging for 409 conflicts
        if (response.status === 409) {
          console.error(`🔥 409 CONFLICT DEBUG INFO:`);
          console.error(`   URL: ${url}`);
          console.error(`   Method: ${fetchOptions.method}`);
          console.error(`   Body: ${fetchOptions.body}`);
          console.error(`   Response: ${responseText}`);
          console.error(`   Parsed: ${JSON.stringify(responseData, null, 2)}`);
        }

        const errorMessage =
          responseData?.error ||
          responseData?.message ||
          `HTTP ${response.status}`;
        throw new ApiError(
          `HTTP ${response.status}: ${errorMessage}`,
          response.status,
          responseData,
          responseData?.errorType || "HTTP_ERROR",
        );
      }

      console.log(`✅ Request successful`);
      return responseData;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        console.error(`❌ Request failed:`, error.message);

        if (error.name === "AbortError") {
          throw new ApiError("Request timeout", 408);
        }

        throw new ApiError(error.message, 0);
      }

      throw new ApiError("Unknown error occurred", 0);
    }
  }

  // HTTP Methods
  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.makeRequest<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {},
  ): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {},
  ): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {},
  ): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.makeRequest<T>(endpoint, { ...options, method: "DELETE" });
  }

  // Utility methods
  setDefaultHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value;
  }

  removeDefaultHeader(key: string): void {
    delete this.defaultHeaders[key];
  }
}

<<<<<<< HEAD
// Get API base URL
=======
// Create default API client instance using environment variable
>>>>>>> refs/remotes/origin/main
const getApiBaseUrl = (): string => {
  // Приоритет для переменной окружения
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  
  if (envUrl) {
    console.log("🔗 Using environment API URL:", envUrl);
    return envUrl;
  }

  // Fallback для разных сред
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const port = window.location.port;

    console.log("🌐 Current location:", window.location.href);

    // Cloud environment
    if (hostname.includes("builder.codes") || hostname.includes("fly.dev")) {
      const proxyUrl = "/api";
      console.log("🌩️ Cloud environment - using proxy URL:", proxyUrl);
      return proxyUrl;
    }

<<<<<<< HEAD
    // Local development
=======
    // Локальная разработка - прямое подключение к бэкенду
>>>>>>> refs/remotes/origin/main
    if (hostname === "localhost" && port === "8080") {
      const directUrl = "http://localhost:3000/api";
      console.log("🏠 Local development - direct connection:", directUrl);
      return directUrl;
    }
  }

  // Default fallback
  const defaultUrl = "/api";
  console.log("🔄 Using default API URL:", defaultUrl);
  return defaultUrl;
};

<<<<<<< HEAD
// Create API client instance
=======
const API_BASE_URL = getApiBaseUrl();

console.log("=== API Configuration ===");
console.log("API Base URL:", API_BASE_URL);
console.log("Environment URL:", import.meta.env.VITE_API_BASE_URL);
console.log("========================");

>>>>>>> refs/remotes/origin/main
export const apiClient = new ApiClient({
  baseUrl: getApiBaseUrl(),
  timeout: 30000,
});

// Helper functions for common API patterns
export const createPaginatedRequest = (
  page: number = 1,
  limit: number = 20,
  filters?: FilterOptions,
) => {
  return {
    page,
    limit,
    ...filters,
  };
};

export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
};

console.log("✅ API Client initialized");

export default apiClient;

// Export types for re-export in index
export type { ApiClientConfig, RequestOptions };
