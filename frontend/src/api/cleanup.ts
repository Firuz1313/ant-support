import { apiClient } from "./client";

export interface CleanupResponse {
  success: boolean;
  created: number;
}

export const cleanupAPI = {
  // Очистить TV интерфейсы и создать пользовательские
  cleanupTVInterfaces: async (): Promise<{
    success: boolean;
    data?: CleanupResponse;
    error?: string;
  }> => {
    try {
      console.log(
        "🧹 Attempting to call cleanup API: POST /v1/cleanup/tv-interfaces",
      );
      const response = await apiClient.post("/v1/cleanup/tv-interfaces");
      console.log("✅ Cleanup API response:", response);
      return {
        success: response.success,
        data: response.data,
      };
    } catch (error: any) {
      console.error("❌ Error cleaning up TV interfaces:", error);
      console.error("❌ Error details:", error);
      return {
        success: false,
        error:
          error.message ||
          "Произошла ошибка при очистке TV интерфейсов",
      };
    }
  },
};

export default cleanupAPI;
