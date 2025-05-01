import { App } from "@shared/schema";
import { apiRequest } from "./queryClient";

// App Store functions for managing app state
export const appStore = {
  // Get all available apps
  async getAllApps(): Promise<App[]> {
    const response = await apiRequest('GET', '/api/apps', undefined);
    return await response.json();
  },
  
  // Get only selected apps
  async getSelectedApps(): Promise<App[]> {
    const response = await apiRequest('GET', '/api/apps/selected', undefined);
    return await response.json();
  },
  
  // Update app selection
  async updateAppSelection(id: number, selected: boolean): Promise<App> {
    const response = await apiRequest('PATCH', `/api/apps/${id}`, { selected });
    return await response.json();
  },
  
  // Check if restricted mode is enabled
  async isRestrictedModeEnabled(): Promise<boolean> {
    const response = await apiRequest('GET', '/api/settings', undefined);
    const settings = await response.json();
    return settings.restrictedMode;
  },
  
  // Toggle restricted mode
  async toggleRestrictedMode(enabled: boolean): Promise<void> {
    await apiRequest('PATCH', '/api/settings', { restrictedMode: enabled });
  }
};
