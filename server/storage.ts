import { apps, type App, type InsertApp, settings, type Settings, type InsertSettings } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

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

// Database storage implementation
export class DatabaseStorage implements IStorage {
  
  async getApps(): Promise<App[]> {
    return await db.select().from(apps);
  }
  
  async getSelectedApps(): Promise<App[]> {
    return await db.select().from(apps).where(eq(apps.selected, true));
  }
  
  async updateAppSelection(id: number, selected: boolean): Promise<App> {
    const [updatedApp] = await db
      .update(apps)
      .set({ selected })
      .where(eq(apps.id, id))
      .returning();
      
    if (!updatedApp) {
      throw new Error(`App with id ${id} not found`);
    }
    
    return updatedApp;
  }
  
  async getSettings(): Promise<Settings> {
    const allSettings = await db.select().from(settings);
    if (allSettings.length === 0) {
      // Create default settings if none exist
      const [newSettings] = await db
        .insert(settings)
        .values({ restrictedMode: false })
        .returning();
      return newSettings;
    }
    return allSettings[0];
  }
  
  async updateSettings(settingsData: Partial<InsertSettings>): Promise<Settings> {
    const currentSettings = await this.getSettings();
    
    const [updatedSettings] = await db
      .update(settings)
      .set(settingsData)
      .where(eq(settings.id, currentSettings.id))
      .returning();
      
    return updatedSettings;
  }
  
  async initializeDefaultData(): Promise<void> {
    // Check if any apps exist
    const existingApps = await db.select().from(apps);
    
    if (existingApps.length === 0) {
      // Add default apps if none exist
      const defaultApps = [
        { name: 'Phone', icon: 'phone', color: 'green', description: 'Make calls', selected: true },
        { name: 'Contacts', icon: 'users', color: 'blue', description: 'View your contacts', selected: true },
        { name: 'WhatsApp', icon: 'message-circle', color: 'green', description: 'Send messages', selected: true },
        { name: 'PhonePe', icon: 'credit-card', color: 'blue', description: 'UPI payments', selected: false },
        { name: 'Clock', icon: 'clock', color: 'orange', description: 'Time and alarms', selected: false },
        { name: 'Camera', icon: 'camera', color: 'purple', description: 'Take photos', selected: false },
        { name: 'Gallery', icon: 'image', color: 'pink', description: 'View your photos', selected: false },
        { name: 'Calendar', icon: 'calendar', color: 'blue', description: 'Manage your schedule', selected: false },
        { name: 'Notes', icon: 'file-text', color: 'yellow', description: 'Take notes', selected: false }
      ];
      
      await db.insert(apps).values(defaultApps);
    }
    
    // Check if settings exist
    const existingSettings = await db.select().from(settings);
    
    if (existingSettings.length === 0) {
      // Add default settings if none exist
      await db.insert(settings).values({ restrictedMode: false });
    }
  }
}

// Export storage instance
export const storage = new DatabaseStorage();
