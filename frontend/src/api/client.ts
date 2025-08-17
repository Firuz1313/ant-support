import { APIResponse, PaginatedResponse, FilterOptions } from "../types";

// Force recompilation - 2025-01-30

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
      // Direct connection to backend
      fullUrl = `${this.baseUrl}${endpoint}`;
      console.log(`🔗 Building direct URL: ${fullUrl}`);
    } else {
      // Relative URL for proxy
      fullUrl = `${this.baseUrl}${endpoint}`;
      if (!fullUrl.startsWith("/")) {
        fullUrl = `/${fullUrl}`;
      }
      console.log(`🔗 Building relative URL: ${fullUrl}`);
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

    console.log(`✅ Final API URL: ${fullUrl}`);
    return fullUrl;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const { params, timeout = this.timeout, ...fetchOptions } = options;

    const url = this.buildUrl(endpoint, params);
    console.log(`🚀 Making ${fetchOptions.method || "GET"} request to: ${url}`);

    const headers = {
      ...this.defaultHeaders,
      ...fetchOptions.headers,
    };

    console.log(`📤 Request headers:`, headers);
    console.log(`📤 Request method:`, fetchOptions.method || "GET");

    // Log request body content for debugging
    if (fetchOptions.body) {
      try {
        const bodyData = JSON.parse(fetchOptions.body as string);
        console.log(`📤 Request body:`, JSON.stringify(bodyData, null, 2));

        // Warn about empty update objects that might cause issues
        if (fetchOptions.method === 'PUT' && Object.keys(bodyData).length === 0) {
          console.warn(`⚠️  Empty PUT request body - this might cause validation errors`);
        }
      } catch {
        console.log(`📤 Request body (non-JSON):`, fetchOptions.body);
      }
    } else {
      console.log(`📤 Request body: No body`);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      console.log(`📡 Sending fetch request...`);
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      console.log(`📡 Fetch completed with status: ${response.status}`);
      clearTimeout(timeoutId);

      // Robust response reading with proper error handling
      let responseData: any = null;
      let responseText = "";
      let bodyConsumed = false;

      // Safely read response body with proper checks
      try {
        const contentType = response.headers.get('content-type') || '';
        const contentLength = response.headers.get('content-length');

        console.log(`📡 Response headers - Content-Type: ${contentType}, Content-Length: ${contentLength}`);
        console.log(`📡 Response body used: ${response.bodyUsed}`);

        // Check if body was already consumed
        if (response.bodyUsed) {
          console.warn(`📡 Response body already consumed`);
          responseText = "";
          bodyConsumed = true;
        } else {
          // Try to read the response body once
          responseText = await response.text();
          bodyConsumed = true;
          console.log(
            `📡 Response text (${responseText.length} chars): ${responseText.substring(0, 200)}`,
          );
        }
      } catch (textError) {
        console.error(`📡 Failed to read response text:`, textError);
        // If reading fails, it's likely already consumed or there's a network issue
        responseText = "";
        bodyConsumed = true;
      }

      // Try to parse JSON if we have text
      if (responseText.trim()) {
        try {
          responseData = JSON.parse(responseText);
          console.log(`📡 Successfully parsed JSON:`, responseData);
        } catch (parseError) {
          console.log(`📡 Not JSON, using as text`);
          responseData = { message: responseText };
        }
      } else {
        console.log(`📡 Empty response body`);
        responseData = {};
      }

      // Check for HTTP errors AFTER reading the body
      if (!response.ok) {
        // Handle empty or malformed responses
        if (!responseData || Object.keys(responseData).length === 0) {
          console.warn(`📡 Empty error response for ${response.status}`);

          // Try to create meaningful error based on status code
          let defaultError = `HTTP ${response.status}`;
          let defaultMessage = `Server returned ${response.status} without error details`;

          if (response.status === 409) {
            defaultError = "Conflict: Data already exists or violates constraints";
            defaultMessage = "The requested operation conflicts with existing data";
          } else if (response.status === 400) {
            defaultError = "Bad Request: Invalid data provided";
            defaultMessage = "The request contains invalid or missing data";
          } else if (response.status === 404) {
            defaultError = "Not Found: Resource does not exist";
            defaultMessage = "The requested resource was not found";
          } else if (response.status === 500) {
            defaultError = "Internal Server Error";
            defaultMessage = "An error occurred on the server";
          }

          responseData = {
            error: defaultError,
            errorType: 'EMPTY_RESPONSE',
            message: defaultMessage,
            suggestion: 'Check server logs for more information',
            status: response.status
          };
        }

        const errorMessage =
          responseData?.error ||
          responseData?.message ||
          `HTTP ${response.status}`;

        // Special handling for different error types
        if (response.status === 409) {
          console.error(`📡 Conflict Error 409: ${errorMessage}`);
          console.error(`📡 Full Conflict Response:`, JSON.stringify(responseData, null, 2));
          console.error(`📡 Error Type:`, responseData?.errorType || 'CONFLICT');
          console.error(`📡 Suggestion:`, responseData?.suggestion || 'Check for duplicate data or constraint violations');

          // Add context-specific conflict handling
          if (errorMessage.includes('already exists') || errorMessage.includes('duplicate')) {
            responseData.suggestion = 'Try using a different name or check for existing records';
          }

          // Ensure error type is set for 409
          if (!responseData.errorType) {
            responseData.errorType = 'CONFLICT';
          }
        } else if (response.status >= 400) {
          console.error(`📡 HTTP Error ${response.status}: ${errorMessage}`);
          console.error(`📡 Full Error Response:`, JSON.stringify(responseData, null, 2));
          console.error(`📡 Error Type:`, responseData?.errorType || 'HTTP_ERROR');
          if (responseData?.details) {
            console.error(`📡 Error Details:`, responseData.details);
          }
        }

        throw new ApiError(
          `HTTP ${response.status}: ${errorMessage}`,
          response.status,
          responseData,
          responseData?.errorType || 'HTTP_ERROR',
        );
      }

      console.log(`✅ API call successful`);
      return responseData;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        console.error(`📡 Request Error:`, error.message);

        if (error.name === "AbortError") {
          throw new ApiError("Request timeout", 408);
        }

        // Handle specific body stream errors
        if (
          error.message.includes("body stream") ||
          error.message.includes("already read")
        ) {
          throw new ApiError("Response reading error - please try again", 0);
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

  setAuthToken(token: string): void {
    this.setDefaultHeader("Authorization", `Bearer ${token}`);
  }

  clearAuth(): void {
    this.removeDefaultHeader("Authorization");
  }
}

// Create default API client instance
const getApiBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const port = window.location.port;

    console.log("🌐 Current location:", window.location.href);

    // В о��лачной среде fly.dev/builder.codes
    if (hostname.includes("builder.codes") || hostname.includes("fly.dev")) {
      // Сначала пробуем proxy
      const proxyUrl = "/api";
      console.log("🌩️ Cloud environment - trying proxy URL:", proxyUrl);
      return proxyUrl;
    }

    // Локальн��я разработка - прямое подключение к бэкенду
    if (hostname === "localhost" && port === "8080") {
      const directUrl = "http://localhost:3000/api";
      console.log("🏠 Local development - using direct connection:", directUrl);
      return directUrl;
    }
  }

  // Default fallback
  const defaultUrl = "/api";
  console.log("🔄 Using default API URL:", defaultUrl);
  return defaultUrl;
};

const API_BASE_URL = getApiBaseUrl();

console.log("=== API Configuration ===");
console.log("API Base URL:", API_BASE_URL);
console.log("========================");

export const apiClient = new ApiClient({
  baseUrl: API_BASE_URL,
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

export default apiClient;
