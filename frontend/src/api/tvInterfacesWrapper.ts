// Wrapper for TV Interfaces API that uses the main API client (supports static API)
import { apiClient } from "./client";

export const tvInterfacesAPIWrapper = {
  // Get all TV interfaces
  async getAll(filters?: any) {
    try {
      const response = await apiClient.get("/v1/tv-interfaces", { params: filters });
      return {
        success: true,
        data: response.data || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error loading TV interfaces",
      };
    }
  },

  // Get TV interface by ID
  async getById(id: string) {
    try {
      if (!id) {
        return {
          success: false,
          error: "TV interface ID is required",
        };
      }

      const response = await apiClient.get(`/v1/tv-interfaces/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error loading TV interface",
      };
    }
  },

  // Get TV interfaces by device ID
  async getByDeviceId(deviceId: string) {
    try {
      if (!deviceId) {
        return {
          success: false,
          error: "Device ID is required",
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
        error: error instanceof Error ? error.message : "Error loading TV interfaces for device",
      };
    }
  },

  // Create new TV interface
  async create(data: any) {
    try {
      // Frontend validation
      if (!data.name?.trim()) {
        return {
          success: false,
          error: "Interface name is required",
        };
      }

      if (!data.type) {
        return {
          success: false,
          error: "Interface type is required",
        };
      }

      if (!data.deviceId) {
        return {
          success: false,
          error: "Please select a device",
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
        message: response.message || "TV interface created successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error creating TV interface",
      };
    }
  },

  // Update TV interface
  async update(id: string, data: any) {
    try {
      if (!id) {
        return {
          success: false,
          error: "TV interface ID is required",
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
        message: response.message || "TV interface updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error updating TV interface",
      };
    }
  },

  // Delete TV interface
  async delete(id: string) {
    try {
      if (!id) {
        return {
          success: false,
          error: "TV interface ID is required",
        };
      }

      const response = await apiClient.delete(`/v1/tv-interfaces/${id}`);
      return {
        success: true,
        message: response.message || "TV interface deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error deleting TV interface",
      };
    }
  },

  // Toggle TV interface status
  async toggleStatus(id: string) {
    try {
      if (!id) {
        return {
          success: false,
          error: "TV interface ID is required",
        };
      }

      const response = await apiClient.patch(`/v1/tv-interfaces/${id}/toggle`);
      return {
        success: true,
        data: response.data,
        message: response.message || "TV interface status changed",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error changing TV interface status",
      };
    }
  },

  // Duplicate TV interface
  async duplicate(id: string, newName?: string) {
    try {
      if (!id) {
        return {
          success: false,
          error: "TV interface ID is required",
        };
      }

      const requestData = newName ? { name: newName } : {};
      const response = await apiClient.post(`/v1/tv-interfaces/${id}/duplicate`, requestData);
      return {
        success: true,
        data: response.data,
        message: response.message || "TV interface duplicated successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error duplicating TV interface",
      };
    }
  },

  // Get TV interfaces statistics
  async getStats() {
    try {
      const response = await apiClient.get("/v1/tv-interfaces/stats");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error getting TV interface statistics",
      };
    }
  },

  // Export TV interface
  async export(id: string) {
    try {
      if (!id) {
        return {
          success: false,
          error: "TV interface ID is required",
        };
      }

      const response = await apiClient.get(`/v1/tv-interfaces/${id}/export`);
      return {
        success: true,
        data: response.data,
        message: response.message || "TV interface exported successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error exporting TV interface",
      };
    }
  },
};

export default tvInterfacesAPIWrapper;
