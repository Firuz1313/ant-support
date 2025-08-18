import {
  TVInterface,
  CreateTVInterfaceData,
  UpdateTVInterfaceData,
  TVInterfaceFilters,
  TVInterfaceApiResponse,
  TVInterfaceListResponse,
} from "@/types/tvInterface";
import { apiClient } from "./client";

// TV Interface API service using the main API client
export const tvInterfacesAPI = {
  // Get all TV interfaces
  async getAll(filters?: TVInterfaceFilters): Promise<TVInterfaceListResponse> {
    try {
      const response = await apiClient.get("/v1/tv-interfaces", { params: filters });
      return {
        success: true,
        data: response.data || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Ошибка при загрузке TV интерфейсов",
      };
    }
  },

  // Get TV interface by ID
  async getById(id: string): Promise<TVInterfaceApiResponse> {
    try {
      if (!id) {
        return {
          success: false,
          error: "ID TV интерфейса обязателен",
        };
      }

      const response = await apiClient.get(`/v1/tv-interfaces/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      let errorMessage = "Ошибка при загрузке TV интерфейса";
      let suggestion = "";
      let availableIds: string[] = [];

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
        suggestion,
        availableIds,
      };
    }
  },

  // Get TV interfaces by device ID
  async getByDeviceId(deviceId: string): Promise<TVInterfaceListResponse> {
    try {
      if (!deviceId) {
        return {
          success: false,
          error: "ID устройства обязателен",
        };
      }

      const response = await apiClient.get(`/v1/tv-interfaces/device/${deviceId}`);
      return {
        success: true,
        data: response.data || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Ошибка при загрузке TV интерфейсов для устройства",
      };
    }
  },

  // Create new TV interface
  async create(data: CreateTVInterfaceData): Promise<TVInterfaceApiResponse> {
    try {
      // Frontend validation
      if (!data.name?.trim()) {
        return {
          success: false,
          error: "Название интерфейса обязательно",
        };
      }

      if (!data.type) {
        return {
          success: false,
          error: "Тип интерфейса обязателен",
        };
      }

      if (!data.deviceId) {
        return {
          success: false,
          error: "Выберите устройство",
        };
      }

      const requestData = {
        name: data.name.trim(),
        description: data.description?.trim() || "",
        type: data.type,
        device_id: data.deviceId,
        screenshot_data: data.screenshotData,
        clickable_areas: data.clickableAreas || [],
        highlight_areas: data.highlightAreas || [],
      };

      const response = await apiClient.post("/v1/tv-interfaces", requestData);
      return {
        success: true,
        data: response.data,
        message: response.message || "TV интерфейс успешно создан",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Ошибка при создании TV интерфейса",
      };
    }
  },

  // Update TV interface
  async update(id: string, data: UpdateTVInterfaceData): Promise<TVInterfaceApiResponse> {
    try {
      if (!id) {
        return {
          success: false,
          error: "ID TV интерфейса обязателен",
        };
      }

      const requestData: Record<string, any> = {};
      if (data.name !== undefined) requestData.name = data.name.trim();
      if (data.description !== undefined) requestData.description = data.description?.trim() || "";
      if (data.type !== undefined) requestData.type = data.type;
      if (data.deviceId !== undefined) requestData.device_id = data.deviceId;
      if (data.screenshotData !== undefined) requestData.screenshot_data = data.screenshotData;
      if (data.clickableAreas !== undefined) requestData.clickable_areas = data.clickableAreas;
      if (data.highlightAreas !== undefined) requestData.highlight_areas = data.highlightAreas;
      if (data.isActive !== undefined) requestData.is_active = data.isActive;

      const response = await apiClient.put(`/v1/tv-interfaces/${id}`, requestData);
      return {
        success: true,
        data: response.data,
        message: response.message || "TV интерфейс успешно обновлен",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Ошибка при обновлении TV интерфейса",
      };
    }
  },

  // Delete TV interface
  async delete(id: string): Promise<TVInterfaceApiResponse> {
    try {
      if (!id) {
        return {
          success: false,
          error: "ID TV интерфейса обязателен",
        };
      }

      const response = await apiClient.delete(`/v1/tv-interfaces/${id}`);
      return {
        success: true,
        message: response.message || "TV интерфейс успешно удален",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Ошибка при удалении TV интерфейса",
      };
    }
  },

  // Toggle TV interface status
  async toggleStatus(id: string): Promise<TVInterfaceApiResponse> {
    try {
      if (!id) {
        return {
          success: false,
          error: "ID TV интерфейса обязателен",
        };
      }

      const response = await apiClient.patch(`/v1/tv-interfaces/${id}/toggle`);
      return {
        success: true,
        data: response.data,
        message: response.message || "Статус TV интерфейса изменен",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Ошибка при изменении статуса TV интерфейса",
      };
    }
  },

  // Duplicate TV interface
  async duplicate(id: string, newName?: string): Promise<TVInterfaceApiResponse> {
    try {
      if (!id) {
        return {
          success: false,
          error: "ID TV интерфейса обязателен",
        };
      }

      const requestData = newName ? { name: newName } : {};
      const response = await apiClient.post(`/v1/tv-interfaces/${id}/duplicate`, requestData);
      return {
        success: true,
        data: response.data,
        message: response.message || "TV интерфейс успешно дублирован",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Ошибка при дублировании TV интерфейса",
      };
    }
  },

  // Get TV interfaces statistics
  async getStats(): Promise<TVInterfaceApiResponse> {
    try {
      const response = await apiClient.get("/v1/tv-interfaces/stats");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Ошибка при получении статистики TV интерфейсов",
      };
    }
  },

  // Export TV interface
  async export(id: string): Promise<TVInterfaceApiResponse> {
    try {
      if (!id) {
        return {
          success: false,
          error: "ID TV интерфейса обязателен",
        };
      }

      const response = await apiClient.get(`/v1/tv-interfaces/${id}/export`);
      return {
        success: true,
        data: response.data,
        message: response.message || "TV интерфейс успешно экспортирован",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Ошибка при экспорте TV интерфейса",
      };
    }
  },
};

export default tvInterfacesAPI;
