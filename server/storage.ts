import { apps, type App, type InsertApp, settings, type Settings, type InsertSettings } from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // App operations
  getApps(): Promise<App[]>;
  getSelectedApps(): Promise<App[]>;
  updateAppSelection(id: number, selected: boolean): Promise<App>;
  
  // Settings operations
  getSettings(): Promise<Settings>;
  updateSettings(settings: Partial<InsertSettings>): Promise<Settings>;
  
  // Initialize with default data
  initializeDefaultData(): Promise<void>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private apps: Map<number, App>;
  private settings: Settings;
  
  constructor() {
    this.apps = new Map();
    this.settings = { id: 1, restrictedMode: false };
    
    // Initialize with default data
    this.initializeDefaultData();
  }
  
  async getApps(): Promise<App[]> {
    return Array.from(this.apps.values());
  }
  
  async getSelectedApps(): Promise<App[]> {
    return Array.from(this.apps.values()).filter(app => app.selected);
  }
  
  async updateAppSelection(id: number, selected: boolean): Promise<App> {
    const app = this.apps.get(id);
    if (!app) {
      throw new Error(`App with id ${id} not found`);
    }
    
    const updatedApp = { ...app, selected };
    this.apps.set(id, updatedApp);
    return updatedApp;
  }
  
  async getSettings(): Promise<Settings> {
    return this.settings;
  }
  
  async updateSettings(settingsData: Partial<InsertSettings>): Promise<Settings> {
    this.settings = { ...this.settings, ...settingsData };
    return this.settings;
  }
  
  async initializeDefaultData(): Promise<void> {
    // Add default apps
    const defaultApps: App[] = [
      { id: 1, name: 'Phone', icon: 'phone', color: 'green', description: 'Make calls', selected: true },
      { id: 2, name: 'Contacts', icon: 'users', color: 'blue', description: 'View your contacts', selected: true },
      { id: 3, name: 'WhatsApp', icon: 'message-circle', color: 'green', description: 'Send messages', selected: true },
      { id: 4, name: 'PhonePe', icon: 'credit-card', color: 'blue', description: 'UPI payments', selected: false },
      { id: 5, name: 'Clock', icon: 'clock', color: 'orange', description: 'Time and alarms', selected: false },
      { id: 6, name: 'Camera', icon: 'camera', color: 'purple', description: 'Take photos', selected: false },
      { id: 7, name: 'Gallery', icon: 'image', color: 'pink', description: 'View your photos', selected: false },
      { id: 8, name: 'Calendar', icon: 'calendar', color: 'blue', description: 'Manage your schedule', selected: false },
      { id: 9, name: 'Notes', icon: 'file-text', color: 'yellow', description: 'Take notes', selected: false }
    ];
    
    defaultApps.forEach(app => {
      this.apps.set(app.id, app);
    });
  }
}

// Export storage instance
export const storage = new MemStorage();
