import { APIResponse, PaginatedResponse, FilterOptions } from "../types";
import { StaticApiService } from "./staticApi";

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
  private useStaticApi: boolean;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.timeout = config.timeout || 30000;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...config.defaultHeaders,
    };
    
    // Determine if we should use static API (cloud environment)
    this.useStaticApi = this.shouldUseStaticApi();
    
    if (this.useStaticApi) {
      console.log("🌩️ Using static API for cloud environment");
    }
  }

  private shouldUseStaticApi(): boolean {
    if (typeof window === "undefined") return false;
    
    const hostname = window.location.hostname;
    
    // Use static API in cloud environments
    return hostname.includes("builder.codes") || 
           hostname.includes("fly.dev") || 
           hostname.includes("vercel.app") ||
           hostname.includes("netlify.app");
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
    // If using static API, route to static service
    if (this.useStaticApi) {
      return this.handleStaticApiRequest<T>(endpoint, options);
    }

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

  // Handle static API requests for cloud environment
  private async handleStaticApiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    console.log(`🌩️ Static API Request: ${endpoint}`);
    
    try {
      // Route to appropriate static API method based on endpoint
      switch (endpoint) {
        case '/v1/devices':
          return await StaticApiService.getDevices() as T;
        case '/v1/devices/stats':
          return await StaticApiService.getDeviceStats() as T;
        case '/v1/problems':
          return await StaticApiService.getProblems() as T;
        case '/v1/problems/stats':
          return await StaticApiService.getProblemStats() as T;
        case '/v1/steps':
          return await StaticApiService.getSteps() as T;
        case '/v1/steps/stats':
          return await StaticApiService.getStepStats() as T;
        case '/v1/sessions':
          return await StaticApiService.getSessions() as T;
        case '/v1/sessions/active':
          return await StaticApiService.getActiveSessions() as T;
        case '/v1/sessions/stats':
          return await StaticApiService.getSessionStats() as T;
        default:
          console.warn(`🌩️ Unknown static API endpoint: ${endpoint}`);
          return {
            success: true,
            data: [],
            message: `Static endpoint ${endpoint} not implemented`
          } as T;
      }
    } catch (error) {
      console.error(`❌ Static API Error:`, error);
      throw new ApiError("Static API Error", 500, error);
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

// Get API base URL with improved cloud environment handling
const getApiBaseUrl = (): string => {
  // Priority for environment variable
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  
  if (envUrl) {
    console.log("🔗 Using environment API URL:", envUrl);
    return envUrl;
  }

  // Environment detection
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const port = window.location.port;

    console.log("🌐 Current location:", window.location.href);

    // Cloud environment (will use static API)
    if (hostname.includes("builder.codes") || hostname.includes("fly.dev")) {
      console.log("🌩️ Cloud environment detected - will use static API");
      return "/api"; // This won't actually be used due to static API override
    }

    // Local development
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

// Create API client instance
const API_BASE_URL = getApiBaseUrl();

console.log("=== API Configuration ===");
console.log("API Base URL:", API_BASE_URL);
console.log("Environment URL:", import.meta.env.VITE_API_BASE_URL);
console.log("========================");

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
